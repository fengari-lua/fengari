/* jshint esversion: 6 */
"use strict";

const assert    = require('assert');

const ldo       = require('./ldo.js');
const lobject   = require('./lobject.js');
const ltm       = require('./ltm.js');
const lfunc     = require('./lfunc.js');
const lua       = require('./lua.js');
const luaconf   = require('./luaconf.js');
const lstate    = require('./lstate.js');
const lvm       = require('./lvm.js');
const lundump   = require('./lundump.js');
const MAXUPVAL  = lfunc.MAXUPVAL;
const CT        = lua.constant_types;
const TS        = lua.thread_status;
const TValue    = lobject.TValue;
const CClosure  = lobject.CClosure;

const lua_version = function(L) {
    if (L === null) return lua.LUA_VERSION_NUM;
    else return L.l_G.version;
};

const lua_atpanic = function(L, panicf) {
    let old = L.l_G.panic;
    L.l_G.panic = panicf;
    return old;
};

// Return real index on stack
const index2addr = function(L, idx) {
    let ci = L.ci;
    if (idx > 0) {
        let o = ci.funcOff + idx;
        assert(idx <= ci.top - (ci.funcOff + 1), "unacceptable index");
        if (o >= L.top) return ldo.nil;
        else return L.stack[o];
    } else if (idx > lua.LUA_REGISTRYINDEX) {
        assert(idx !== 0 && -idx <= L.top, "invalid index");
        return L.stack[L.top + idx];
    } else if (idx === lua.LUA_REGISTRYINDEX) {
        return L.l_G.l_registry;
    } else { /* upvalues */
        idx = lua.LUA_REGISTRYINDEX - idx;
        assert(idx <= MAXUPVAL + 1, "upvalue index too large");
        if (ci.func.ttislcf()) /* light C function? */
            return ldo.nil; /* it has no upvalues */
        else {
            return idx <= ci.func.nupvalues ? ci.func.upvalue[idx - 1] : ldo.nil;
        }
    }
};

const lua_checkstack = function(L, n) {
    return L.stack.length < luaconf.LUAI_MAXSTACK;
};

/*
** basic stack manipulation
*/

/*
** convert an acceptable stack index into an absolute index
*/
const lua_absindex = function(L, idx) {
    return (idx > 0 || idx <= lua.LUA_REGISTRYINDEX)
         ? idx
         : (L.top - L.ci.funcOff) + idx;
};

const lua_gettop = function(L) {
    return L.top - (L.ci.funcOff + 1);
};

const lua_pushvalue = function(L, idx) {
    L.stack[L.top] = index2addr(L, idx);

    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_settop = function(L, idx) {
    let func = L.ci.funcOff;
    if (idx >= 0) {
        while (L.top < func + 1 + idx)
            L.stack[L.top++] = ldo.nil;
        L.top = func + 1 + idx;
    } else {
        assert(-(idx + 1) <= L.top - (func + 1), "invalid new top");
        L.top += idx + 1; /* 'subtract' index (index is negative) */
    }
};

const lua_pop = function(L, n) {
    lua_settop(L, -n - 1);
}

const reverse = function(L, from, to) {
    for (; from < to; from++, to --) {
        let temp = L.stack[from];
        L.stack[from] = L.stack[to];
        L.stack[to] = temp;
    }
};

/*
** Let x = AB, where A is a prefix of length 'n'. Then,
** rotate x n == BA. But BA == (A^r . B^r)^r.
*/
const lua_rotate = function(L, idx, n) {
    let t = L.stack[L.top - 1];
    let p = index2addr(L, idx);

    assert(!p.ttisnil() && idx > lua.LUA_REGISTRYINDEX, "index not in the stack");
    assert((n >= 0 ? n : -n) <= (L.top - idx), "invalid 'n'");

    let m = n >= 0 ? L.top - 1 - n : L.top + idx - n - 1;  /* end of prefix */

    reverse(L, L.top + idx, m);
    reverse(L, m + 1, L.top - 1);
    reverse(L, L.top + idx, L.top - 1);
};

const lua_remove = function(L, idx) {
    lua_rotate(L, idx, -1);
    lua_pop(L, 1);
};

/*
** push functions (JS -> stack)
*/

const lua_pushnil = function(L) {
    L.stack[L.top++] = ldo.nil;

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushnumber = function(L, n) {
    assert(typeof n === "number");

    L.stack[L.top++] = new TValue(CT.LUA_TNUMFLT, n);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushinteger = function(L, n) {
    assert(typeof n === "number");

    L.stack[L.top++] = new TValue(CT.LUA_TNUMINT, n|0);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushlstring = function(L, s, len) { // TODO: embedded \0
    assert(typeof s === "string");
    assert(typeof n === "number");

    let ts = len === 0 ? new TValue(CT.LUA_TLNGSTR, "") : new TValue(CT.LUA_TLNGSTR, s.substr(0, len));
    L.stack[L.top++] = ts;

    assert(L.top <= L.ci.top, "stack overflow");

    return ts.value;
};

const lua_pushstring = function (L, s) {
    assert(typeof s === "string");
    if (!s)
        L.stack[L.top] = ldo.nil;
    else {
        let ts = new TValue(CT.LUA_TLNGSTR, s);
        L.stack[L.top] = ts;
        s = ts.value;
    }

    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");

    return s;
};

const lua_pushliteral = lua_pushstring;

const lua_pushcclosure = function(L, fn, n) {
    assert(typeof fn === "function");
    assert(typeof n === "number");

    if (n === 0)
        L.stack[L.top] = new TValue(CT.LUA_TLCF, fn);
    else {
        assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
        assert(n <= MAXUPVAL, "upvalue index too large");

        let cl = new CClosure(fn, n);

        L.top -= n;
        while (n--) {
            cl.upvalue[n] = L.stack[L.top + n];
        }

        L.stack[L.top] = cl;
    }

    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushjsclosure = lua_pushcclosure;

const lua_pushcfunction = function(L, fn) {
    lua_pushcclosure(L, fn, 0);
};

const lua_pushjsfunction = lua_pushcfunction;

const lua_pushboolean = function(L, b) {
    L.stack[L.top++] = new TValue(CT.LUA_TBOOLEAN, b ? true : false);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushlightuserdata = function(L, p) {
    assert(typeof p === "object");

    L.stack[L.top++] = new TValue(CT.LUA_TLIGHTUSERDATA, p);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushglobaltable = function(L) {
    lua_rawgeti(L, lua.LUA_REGISTRYINDEX, lua.LUA_RIDX_GLOBALS);
};

/*
** set functions (stack -> Lua)
*/

/*
** t[k] = value at the top of the stack (where 'k' is a string)
*/
const auxsetstr = function(L, t, k) {
    let str = new TValue(CT.LUA_TLNGSTR, k);

    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");

    if (t.ttistable() && !t.__index(t, k).ttisnil()) {
        t.__newindex(t, k, L.stack[L.top - 1]);
        L.top--; /* pop value */
    } else {
        L.stack[L.top++] = str;
        lvm.settable(L, t, L.stack[L.top - 1], L.stack[L.top - 2]);
        L.top -= 2; /* pop value and key */
    }
};

const lua_setglobal = function(L, name) {
    auxsetstr(L, L.l_G.l_registry.value.array[lua.LUA_RIDX_GLOBALS - 1], name);
};

const lua_setmetatable = function(L, objindex) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let mt;
    let obj = index2addr(L, objindex);
    if (L.stack[L.top - 1].ttisnil())
        mt = null;
    else {
        assert(L.stack[L.top - 1].ttistable(), "table expected");
        mt = L.stack[L.top - 1];
    }

    switch (obj.ttnov()) {
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE: {
            obj.metatable = mt;
            break;
        }
        default: {
            L.l_G.mt[obj.ttnov()] = mt;
            break;
        }
    }

    L.top--;
    return true;
};

const lua_settable = function(L, idx) {
    assert(2 < L.top - L.ci.funcOff, "not enough elements in the stack");

    let t = index2addr(L, idx);
    lvm.settable(L, t, L.stack[L.top - 2], L.stack[L.top - 1]);
    L.top -= 2;
};

const lua_setfield = function(L, idx, k) {
    auxsetstr(L, index2addr(L, idx), k)
};

/*
** get functions (Lua -> stack)
*/

const auxgetstr = function(L, t, k) {
    let str = new TValue(CT.LUA_TLNGSTR, k);
    let slot = t.__index(t, k);
    if (t.ttistable() && !slot.ttisnil()) {
        L.stack[L.top++] = slot;
        assert(L.top <= L.ci.top, "stack overflow");
    } else {
        L.stack[L.top++] = str;
        assert(L.top <= L.ci.top, "stack overflow");
        lvm.gettable(L, t, L.stack[L.top - 1], L.top - 1);
    }

    return L.stack[L.top - 1].ttnov();
};

const lua_rawgeti = function(L, idx, n) {
    let t = index2addr(L, idx);

    assert(t.ttistable(), "table expected");

    L.stack[L.top++] = t.__index(t, n);

    assert(L.top <= L.ci.top, "stack overflow");

    return L.stack[L.top - 1].ttnov();
};

const lua_rawget = function(L, idx) {
    let t = index2addr(L, idx);

    assert(t.ttistable(t), "table expected");

    L.stack[L.top - 1] = t.__index(t, L.stack[L.top - 1]);

    return L.stack[L.top - 1].ttnov();
};

// narray and nrec are mostly useless for this implementation
const lua_createtable = function(L, narray, nrec) {
    let t = new lobject.Table();
    L.stack[L.top++] = t;

    assert(L.top <= L.ci.top, "stack overflow");

    if (narray > 0)
        t.value.array = new Array(narray);
};

const lua_newtable = function(L) {
    lua_createtable(L, 0, 0);
};

const lua_getmetatable = function(L, objindex) {
    let obj = index2addr(L, objindex);
    let mt;
    let res = false;
    switch (obj.ttnov()) {
        case CT.LUA_TTABLE:
        case CT.LUA_TUSERDATA:
            mt = obj.metatable;
            break;
        default:
            mt = L.l_G.mt[obj.ttnov];
            break;
    }

    if (mt !== null && mt !== undefined) {
        L.stack[L.top++] = mt;
        assert(L.top <= L.ci.top, "stack overflow");
        res = true;
    }

    return res;
};

const lua_gettable = function(L, idx) {
    let t = index2addr(L, idx);
    lvm.gettable(L, t, L.stack[L.top - 1], L.top - 1);
    return L.stack[L.top - 1].ttnov();
};

const lua_getfield = function(L, idx, k) {
    return auxgetstr(L, index2addr(L, idx), k);
};

const lua_getglobal = function(L, name) {
    return auxgetstr(L, L.l_G.l_registry.value.array[lua.LUA_RIDX_GLOBALS - 1], name);
};

/*
** access functions (stack -> JS)
*/

const lua_toboolean = function(L, idx) {
    let o = index2addr(L, idx);
    return !o.l_isfalse();
};

const lua_tolstring = function(L, idx, len) {
    let o = index2addr(L, idx);

    if (!o.ttisstring() && !o.ttisnumber())
        return null;

    return len !== null ? `${o.value}`.substr(0, len) : `${o.value}`;
};

const lua_tostring = function(L, idx) {
    return lua_tolstring(L, idx, null);
};

const lua_tointeger = function(L, idx) {
    return lvm.tointeger(index2addr(L, idx))
};

const lua_tonumber = function(L, idx) {
    return lvm.tonumber(index2addr(L, idx))
};

const f_call = function(L, ud) {
    ldo.luaD_callnoyield(L, ud.funcOff, ud.nresults);
};

const lua_type = function(L, idx) {
    let o = index2addr(L, idx);
    return o.ttnov(); // TODO: isvalid ? luaO_nilobject != nil tvalue ?
};

const lua_typename = function(L, t) {
    assert(CT.LUA_TNONE <= t && t < CT.LUA_NUMTAGS, "invalid tag");
    return ltm.ttypename(t);
};

const lua_istable = function(L, idx) {
    return index2addr(L, idx).ttistable();
};

const lua_isstring = function(L, idx) {
    let o = index2addr(L, idx);
    return o.ttisstring() || o.ttisnumber();
}

/*
** 'load' and 'call' functions (run Lua code)
*/

const lua_load = function(L, data, chunckname) {
    if (!chunckname) chunckname = "?";
    
    let status = ldo.luaD_protectedparser(L, data, chunckname);
    if (status === TS.LUA_OK) {
        let f = L.stack[L.top - 1]; /* get newly created function */
        if (f.nupvalues >= 1) { /* does it have an upvalue? */
            /* get global table from registry */
            let reg = L.l_G.l_registry;
            let gt = reg.value.array[lua.LUA_RIDX_GLOBALS - 1];
            /* set global table as 1st upvalue of 'f' (may be LUA_ENV) */
            f.upvals[0].u.value = gt;
        }
    }

    return status;
};

const lua_callk = function(L, nargs, nresults, ctx, k) {
    assert(k === null || !(L.ci.callstatus & CIST_LUA), "cannot use continuations inside hooks");
    assert(nargs + 1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    assert(L.status === TS.LUA_OK, "cannot do calls on non-normal thread");
    assert(nargs === lua.LUA_MULTRET || (L.ci.top - L.top >= nargs - nresults, "results from function overflow current stack size"));

    let func = L.top - (nargs + 1);
    if (k !== null && L.nny === 0) { /* need to prepare continuation? */
        L.ci.u.c.k = k;
        L.ci.u.c.ctx = ctx;
        ldo.luaD_call(L, func, nresults);
    } else { /* no continuation or no yieldable */
        ldo.luaD_callnoyield(L, func, nresults);
    }

    if (nresults == lua.LUA_MULTRET && L.ci.top < L.top)
        L.ci.top = L.top;
};

const lua_call = function(L, n, r) {
    lua_callk(L, n, r, 0, null);
};

const lua_pcallk = function(L, nargs, nresults, errfunc, ctx, k) {
    assert(nargs + 1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    assert(L.status === TS.LUA_OK, "cannot do calls on non-normal thread");
    assert(nargs === lua.LUA_MULTRET || (L.ci.top - L.top >= nargs - nresults, "results from function overflow current stack size"));

    let c = {
        func: null,
        funcOff: NaN,
        nresults: NaN
    };
    let status;
    let func;

    if (errfunc === 0)
        func = 0;
    else {
        let o = index2addr(L, errfunc);
        // TODO: api_checkstackindex(L, errfunc, o);
        func = errfunc;
    }

    c.funcOff = L.top - (nargs + 1); /* function to be called */
    c.func = L.stack[c.funcOff];

    if (k === null || L.nny > 0) { /* no continuation or no yieldable? */
        c.nresults = nresults; /* do a 'conventional' protected call */
        status = ldo.luaD_pcall(L, f_call, c, c.funcOff, c.func);
    } else { /* prepare continuation (call is already protected by 'resume') */
        let ci = L.ci;
        ci.u.c.k = k;  /* prepare continuation (call is already protected by 'resume') */
        ci.u.c.ctx = ctx;  /* prepare continuation (call is already protected by 'resume') */
        /* save information for error recovery */
        ci.extra = c.funcOff;
        ci.u.c.old_errfunc = L.errfunc;
        L.errfunc = c.func;
        // TODO: setoah(ci->callstatus, L->allowhook);
        ci.callstatus |= lstate.CIST_YPCALL;  /* function can do error recovery */
        ldo.luaD_call(L, c.funcOff, nresults);  /* do the call */
        ci.callstatus &= ~lstate.CIST_YPCALL;
        L.errfunc = ci.u.c.old_errfunc;
        status = TS.LUA_OK;
    }

    if (nresults == lua.LUA_MULTRET && L.ci.top < L.top)
        L.ci.top = L.top;

    return status;
};

const lua_pcall = function(L, n, r, f) {
    return lua_pcallk(L, n, r, f, 0, null);
}

module.exports.lua_pushvalue       = lua_pushvalue;
module.exports.lua_pushnil         = lua_pushnil;
module.exports.lua_pushnumber      = lua_pushnumber;
module.exports.lua_pushinteger     = lua_pushinteger;
module.exports.lua_pushlstring     = lua_pushlstring;
module.exports.lua_pushstring      = lua_pushstring;
module.exports.lua_pushliteral     = lua_pushliteral;
module.exports.lua_pushboolean     = lua_pushboolean;
module.exports.lua_pushcclosure    = lua_pushcclosure;
module.exports.lua_pushcfunction   = lua_pushcfunction;
module.exports.lua_pushjsclosure   = lua_pushjsclosure;
module.exports.lua_pushjsfunction  = lua_pushjsfunction;
module.exports.lua_version         = lua_version;
module.exports.lua_atpanic         = lua_atpanic;
module.exports.lua_gettop          = lua_gettop;
module.exports.lua_typename        = lua_typename;
module.exports.lua_type            = lua_type;
module.exports.lua_tonumber        = lua_tonumber;
module.exports.lua_tointeger       = lua_tointeger;
module.exports.lua_toboolean       = lua_toboolean;
module.exports.lua_tolstring       = lua_tolstring;
module.exports.lua_tostring        = lua_tostring;
module.exports.lua_load            = lua_load;
module.exports.lua_callk           = lua_callk;
module.exports.lua_call            = lua_call;
module.exports.lua_pcallk          = lua_pcallk;
module.exports.lua_pcall           = lua_pcall;
module.exports.lua_pop             = lua_pop;
module.exports.lua_setglobal       = lua_setglobal;
module.exports.lua_istable         = lua_istable;
module.exports.lua_createtable     = lua_createtable;
module.exports.lua_newtable        = lua_newtable;
module.exports.lua_settable        = lua_settable;
module.exports.lua_gettable        = lua_gettable;
module.exports.lua_absindex        = lua_absindex;
module.exports.index2addr          = index2addr;
module.exports.lua_rawget          = lua_rawget;
module.exports.lua_isstring        = lua_isstring;
module.exports.lua_rotate          = lua_rotate;
module.exports.lua_remove          = lua_remove;
module.exports.lua_checkstack      = lua_checkstack;
module.exports.lua_rawgeti         = lua_rawgeti;
module.exports.lua_pushglobaltable = lua_pushglobaltable;
module.exports.lua_setfield        = lua_setfield;
module.exports.lua_getfield        = lua_getfield;
module.exports.lua_getglobal       = lua_getglobal;
module.exports.lua_getmetatable    = lua_getmetatable;
module.exports.lua_setmetatable    = lua_setmetatable;
module.exports.lua_settop          = lua_settop;