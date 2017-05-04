"use strict";

const assert    = require('assert');

const defs      = require('./defs.js');
const ldebug    = require('./ldebug.js');
const ldo       = require('./ldo.js');
const ldump     = require('./ldump.js');
const lfunc     = require('./lfunc.js');
const llex      = require('./llex.js');
const lobject   = require('./lobject.js');
const lstate    = require('./lstate.js');
const ltm       = require('./ltm.js');
const luaconf   = require('./luaconf.js');
const lvm       = require('./lvm.js');
const ltable    = require('./ltable.js');
const MAXUPVAL  = lfunc.MAXUPVAL;
const CT        = defs.constant_types;
const TS        = defs.thread_status;
const TValue    = lobject.TValue;
const CClosure  = lobject.CClosure;

const isvalid = function(o) {
    return o !== lobject.luaO_nilobject;
};

const lua_version = function(L) {
    if (L === null) return defs.LUA_VERSION_NUM;
    else return L.l_G.version;
};

const lua_atpanic = function(L, panicf) {
    let old = L.l_G.panic;
    L.l_G.panic = panicf;
    return old;
};

// Return value for idx on stack
const index2addr = function(L, idx) {
    let ci = L.ci;
    if (idx > 0) {
        let o = ci.funcOff + idx;
        assert(idx <= ci.top - (ci.funcOff + 1), "unacceptable index");
        if (o >= L.top) return lobject.luaO_nilobject;
        else return L.stack[o];
    } else if (idx > defs.LUA_REGISTRYINDEX) {
        assert(idx !== 0 && -idx <= L.top, "invalid index");
        return L.stack[L.top + idx];
    } else if (idx === defs.LUA_REGISTRYINDEX) {
        return L.l_G.l_registry;
    } else { /* upvalues */
        idx = defs.LUA_REGISTRYINDEX - idx;
        assert(idx <= MAXUPVAL + 1, "upvalue index too large");
        if (ci.func.ttislcf()) /* light C function? */
            return lobject.luaO_nilobject; /* it has no upvalues */
        else {
            return idx <= ci.func.value.nupvalues ? ci.func.value.upvalue[idx - 1] : lobject.luaO_nilobject;
        }
    }
};

// Like index2addr but returns the index on stack
const index2addr_ = function(L, idx) {
    let ci = L.ci;
    if (idx > 0) {
        let o = ci.funcOff + idx;
        assert(idx <= ci.top - (ci.funcOff + 1), "unacceptable index");
        if (o >= L.top) return null;
        else return o;
    } else if (idx > defs.LUA_REGISTRYINDEX) {
        assert(idx !== 0 && -idx <= L.top, "invalid index");
        return L.top + idx;
    } else if (idx === defs.LUA_REGISTRYINDEX) {
        return null;
    } else { /* upvalues */
        idx = defs.LUA_REGISTRYINDEX - idx;
        assert(idx <= MAXUPVAL + 1, "upvalue index too large");
        if (ci.func.ttislcf()) /* light C function? */
            return null; /* it has no upvalues */
        else {
            return idx <= ci.func.nupvalues ? idx - 1 : null;
        }
    }
};

const lua_checkstack = function(L, n) {
    return L.stack.length < luaconf.LUAI_MAXSTACK;
};

const lua_xmove = function(from, to, n) {
    if (from === to) return;
    assert(n < (from.top - from.ci.funcOff), "not enough elements in the stack");
    assert(from.l_G === to.l_G, "moving among independent states");
    assert(to.ci.top - to.top >= n, "stack overflow");

    from.top -= n;
    for (let i = 0; i < n; i++) {
        to.stack[to.top] = from.stack[from.top + i];
        to.top++;
    }
};

/*
** basic stack manipulation
*/

/*
** convert an acceptable stack index into an absolute index
*/
const lua_absindex = function(L, idx) {
    return (idx > 0 || idx <= defs.LUA_REGISTRYINDEX)
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
            L.stack[L.top++] = new TValue(CT.LUA_TNIL, null);
        L.top = func + 1 + idx;
    } else {
        assert(-(idx + 1) <= L.top - (func + 1), "invalid new top");
        L.top += idx + 1; /* 'subtract' index (index is negative) */
    }
};

const lua_pop = function(L, n) {
    lua_settop(L, -n - 1);
};

const reverse = function(L, from, to) {
    for (; from < to; from++, to--) {
        let temp = L.stack[from];
        L.stack[from] = L.stack[to];
        L.stack[to] = temp;
    }
};

/*
** Let x = AB, where A is a prefix of length 'n'. Then,
** rotate x n === BA. But BA === (A^r . B^r)^r.
*/
const lua_rotate = function(L, idx, n) {
    let t = L.stack[L.top - 1];
    let p = index2addr(L, idx);
    let pIdx = index2addr_(L, idx);

    assert(p !== lobject.luaO_nilobject && idx > defs.LUA_REGISTRYINDEX, "index not in the stack");
    assert((n >= 0 ? n : -n) <= (L.top - idx), "invalid 'n'");

    let m = n >= 0 ? L.top - 1 - n : pIdx - n - 1;  /* end of prefix */

    reverse(L, pIdx, m);
    reverse(L, m + 1, L.top - 1);
    reverse(L, pIdx, L.top - 1);
};

const lua_copy = function(L, fromidx, toidx) {
    let from = index2addr(L, fromidx);
    L.stack[index2addr_(L, toidx)] = new TValue(from.type, from.value);
};

const lua_remove = function(L, idx) {
    lua_rotate(L, idx, -1);
    lua_pop(L, 1);
};

const lua_insert = function(L, idx) {
    lua_rotate(L, idx, 1);
};

const lua_replace = function(L, idx) {
    lua_copy(L, -1, idx);
    lua_pop(L, 1);
};

/*
** push functions (JS -> stack)
*/

const lua_pushnil = function(L) {
    L.stack[L.top++] = new TValue(CT.LUA_TNIL, null);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushnumber = function(L, n) {
    assert(typeof n === "number");

    L.stack[L.top++] = new TValue(CT.LUA_TNUMFLT, n);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushinteger = function(L, n) {
    assert(typeof n === "number" && (n|0) === n);

    L.stack[L.top++] = new TValue(CT.LUA_TNUMINT, n);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushlstring = function(L, s, len) {
    assert(Array.isArray(s), "lua_pushlstring expects array of byte");
    assert(typeof len === "number");

    let ts = len === 0 ? L.l_G.intern(defs.to_luastring("", true)) : new TValue(CT.LUA_TLNGSTR, s.slice(0, len));
    L.stack[L.top++] = ts;

    assert(L.top <= L.ci.top, "stack overflow");

    return ts.value;
};

const lua_pushstring = function (L, s) {
    assert(Array.isArray(s) || s === undefined || s === null, "lua_pushstring expects array of byte");

    if (s === undefined || s === null)
        L.stack[L.top] = new TValue(CT.LUA_TNIL, null);
    else {
        L.stack[L.top] = new TValue(CT.LUA_TLNGSTR, s);
    }

    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");

    return s;
};

const lua_pushvfstring = function (L, fmt, argp) {
    assert(Array.isArray(fmt));
    return lobject.luaO_pushvfstring(L, fmt, argp);
};

const lua_pushfstring = function (L, fmt, ...argp) {
    assert(Array.isArray(fmt));
    return lobject.luaO_pushvfstring(L, fmt, argp);
};

const lua_pushliteral = function (L, s) {
    assert(typeof s === "string" || s === undefined || s === null, "lua_pushliteral expects a JS string");

    if (s === undefined || s === null)
        L.stack[L.top] = new TValue(CT.LUA_TNIL, null);
    else {
        let ts = L.l_G.intern(defs.to_luastring(s));
        L.stack[L.top] = ts;
    }

    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");

    return s;
};

const lua_pushcclosure = function(L, fn, n) {
    assert(typeof fn === "function");
    assert(typeof n === "number");

    if (n === 0)
        L.stack[L.top] = new TValue(CT.LUA_TLCF, fn);
    else {
        assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
        assert(n <= MAXUPVAL, "upvalue index too large");

        let cl = new CClosure(L, fn, n);

        L.top -= n;
        while (n--) {
            cl.upvalue[n] = L.stack[L.top + n];
        }

        L.stack[L.top] = new TValue(CT.LUA_TCCL, cl);
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
    L.stack[L.top++] = new TValue(CT.LUA_TLIGHTUSERDATA, p);

    assert(L.top <= L.ci.top, "stack overflow");
};

const lua_pushthread = function(L) {
    L.stack[L.top++] = new TValue(CT.LUA_TTHREAD, L);
    assert(L.top <= L.ci.top, "stack overflow");

    return L.l_G.mainthread === L;
};

const lua_pushglobaltable = function(L) {
    lua_rawgeti(L, defs.LUA_REGISTRYINDEX, defs.LUA_RIDX_GLOBALS);
};

/*
** set functions (stack -> Lua)
*/

/*
** t[k] = value at the top of the stack (where 'k' is a string)
*/
const auxsetstr = function(L, t, k) {
    assert(Array.isArray(k), "key must be an array of bytes");

    let str = L.l_G.intern(k);

    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");

    L.stack[L.top++] = str;
    lvm.settable(L, t, L.stack[L.top - 1], L.stack[L.top - 2]);
    /* pop value and key */
    L.top -= 2;
};

const lua_setglobal = function(L, name) {
    auxsetstr(L, ltable.luaH_getint(L.l_G.l_registry.value, defs.LUA_RIDX_GLOBALS), name);
};

const lua_setmetatable = function(L, objindex) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let mt;
    let obj = index2addr(L, objindex);
    if (L.stack[L.top - 1].ttisnil())
        mt = null;
    else {
        assert(L.stack[L.top - 1].ttistable(), "table expected");
        mt = L.stack[L.top - 1].value;
    }

    switch (obj.ttnov()) {
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE: {
            obj.value.metatable = mt;
            break;
        }
        default: {
            L.l_G.mt[obj.ttnov()] = mt;
            break;
        }
    }

    L.stack[--L.top] = void 0;
    return true;
};

const lua_settable = function(L, idx) {
    assert(2 < L.top - L.ci.funcOff, "not enough elements in the stack");

    let t = index2addr(L, idx);
    lvm.settable(L, t, L.stack[L.top - 2], L.stack[L.top - 1]);
    L.top -= 2;
};

const lua_setfield = function(L, idx, k) {
    auxsetstr(L, index2addr(L, idx), k);
};

const lua_seti = function(L, idx, n) {
    assert(typeof n === "number" && (n|0) === n);
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let t = index2addr(L, idx);
    L.stack[L.top++] = new TValue(CT.LUA_TNUMINT, n);
    assert(L.top <= L.ci.top, "stack overflow");
    lvm.settable(L, t, L.stack[L.top - 1], L.stack[L.top - 2]);
    /* pop value and key */
    L.stack[--L.top] = void 0;
    L.stack[--L.top] = void 0;
};

const lua_rawset = function(L, idx) {
    assert(2 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let o = index2addr(L, idx);
    assert(o.ttistable(), "table expected");
    let slot = ltable.luaH_set(o.value, L.stack[L.top - 2]);
    slot.setfrom(L.stack[L.top - 1]);
    L.top -= 2;
};

const lua_rawseti = function(L, idx, n) {
    assert(2 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let o = index2addr(L, idx);
    assert(o.ttistable(), "table expected");
    ltable.luaH_setint(o.value, n, L.stack[L.top - 1]);
    L.stack[--L.top] = void 0;
};

const lua_rawsetp = function(L, idx, p) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let o = index2addr(L, idx);
    assert(L, o.ttistable(), "table expected");
    let k = new TValue(CT.LUA_TLIGHTUSERDATA, p);
    let slot = ltable.luaH_set(o.value, k);
    slot.setfrom(L.stack[L.top - 1]);
    L.top--;
};

/*
** get functions (Lua -> stack)
*/

const auxgetstr = function(L, t, k) {
    assert(Array.isArray(k), "key must be an array of bytes");

    let str = L.l_G.intern(k);

    L.stack[L.top++] = str;
    assert(L.top <= L.ci.top, "stack overflow");
    lvm.gettable(L, t, L.stack[L.top - 1], L.top - 1);

    return L.stack[L.top - 1].ttnov();
};

const lua_rawgeti = function(L, idx, n) {
    let t = index2addr(L, idx);

    assert(t.ttistable(), "table expected");

    L.stack[L.top++] = ltable.luaH_getint(t.value, n);
    assert(L.top <= L.ci.top, "stack overflow");

    return L.stack[L.top - 1].ttnov();
};

const lua_rawgetp = function(L, idx, p) {
    let t = index2addr(L, idx);
    assert(t.ttistable(), "table expected");
    let k = new TValue(CT.LUA_TLIGHTUSERDATA, p);
    L.stack[L.top++] = ltable.luaH_get(t.value, k);
    assert(L.top <= L.ci.top, "stack overflow");
    return L.stack[L.top - 1].ttnov();
};

const lua_rawget = function(L, idx) {
    let t = index2addr(L, idx);

    assert(t.ttistable(t), "table expected");

    L.stack[L.top - 1] = ltable.luaH_get(t.value, L.stack[L.top - 1]);

    return L.stack[L.top - 1].ttnov();
};

// narray and nrec are mostly useless for this implementation
const lua_createtable = function(L, narray, nrec) {
    let t = new lobject.TValue(CT.LUA_TTABLE, ltable.luaH_new(L));
    L.stack[L.top++] = t;

    assert(L.top <= L.ci.top, "stack overflow");
};

const luaS_newudata = function(L, size) {
    return {
        id: L.l_G.id_counter++,
        metatable: null,
        uservalue: null,
        len: size,
        data: Object.create(null) // ignores size argument
    };
};

const lua_newuserdata = function(L, size) {
    let u = luaS_newudata(L, size);
    L.stack[L.top++] = new lobject.TValue(CT.LUA_TUSERDATA, u);

    assert(L.top <= L.ci.top, "stack overflow");

    return u.data;
};

const aux_upvalue = function(L, fi, n) {
    switch(fi.ttype()) {
        case CT.LUA_TCCL: {  /* C closure */
            let f = fi.value;
            if (!(1 <= n && n <= f.nupvalues)) return null;
            return {
                name: "",
                val: f.upvalue[n-1]
            };
        }
        case CT.LUA_TLCL: {  /* Lua closure */
            let f = fi.value;
            let p = f.p;
            if (!(1 <= n && n <= p.upvalues.length)) return null;
            let name = p.upvalues[n-1].name;
            return {
                name: name ? name : "(*no name)",
                val: f.upvals[n-1].val(L)
            };
        }
        default: return null;  /* not a closure */
    }
};

const lua_getupvalue = function(L, funcindex, n) {
    let up = aux_upvalue(L, index2addr(L, funcindex), n);
    if (up) {
        let name = up.name;
        let val = up.val;

        L.stack[L.top++] = new TValue(val.type, val.value);

        return name.value;
    }
    return null;
};

const lua_setupvalue = function(L, funcindex, n) {
    let fi = index2addr(L, funcindex);
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let aux = aux_upvalue(L, fi, n);
    if (aux) {
        let name = aux.name;
        let val = aux.val;

        L.top--;
        // TODO: what if it's not a pure TValue (closure, table)
        val.type = L.stack[L.top].type;
        val.value = L.stack[L.top].value;

        return name.value;
    }
    return null;
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
            mt = obj.value.metatable;
            break;
        default:
            mt = L.l_G.mt[obj.ttnov()];
            break;
    }

    if (mt !== null && mt !== undefined) {
        L.stack[L.top++] = new TValue(CT.LUA_TTABLE, mt);
        assert(L.top <= L.ci.top, "stack overflow");
        res = true;
    }

    return res;
};

const lua_getuservalue = function(L, idx) {
    let o = index2addr(L, idx);
    assert(L, o.ttisfulluserdata(), "full userdata expected");
    let uv = o.uservalue;
    L.stack[L.top++] = new TValue(uv.type, uv.value);
    assert(L.top <= L.ci.top, "stack overflow");
    return L.stack[L.top - 1].ttnov();
};

const lua_gettable = function(L, idx) {
    let t = index2addr(L, idx);
    lvm.gettable(L, t, L.stack[L.top - 1], L.top - 1);
    return L.stack[L.top - 1].ttnov();
};

const lua_getfield = function(L, idx, k) {
    return auxgetstr(L, index2addr(L, idx), k);
};

const lua_geti = function(L, idx, n) {
    assert(typeof n === "number" && (n|0) === n);
    let t = index2addr(L, idx);
    L.stack[L.top++] = new TValue(CT.LUA_TNUMINT, n);
    assert(L.top <= L.ci.top, "stack overflow");
    lvm.gettable(L, t, L.stack[L.top - 1], L.top - 1);
    return L.stack[L.top - 1].ttnov();
};

const lua_getglobal = function(L, name) {
    return auxgetstr(L, ltable.luaH_getint(L.l_G.l_registry.value, defs.LUA_RIDX_GLOBALS), name);
};

/*
** access functions (stack -> JS)
*/

const lua_toboolean = function(L, idx) {
    let o = index2addr(L, idx);
    return !o.l_isfalse();
};

const lua_tolstring = function(L, idx) {
    let o = index2addr(L, idx);

    if ((!o.ttisstring() && !o.ttisnumber()))
        return null;

    return o.ttisstring() ? o.value : defs.to_luastring(`${o.value}`);
};

const lua_tostring =  lua_tolstring;

const lua_toljsstring = function(L, idx) {
    let o = index2addr(L, idx);

    if ((!o.ttisstring() && !o.ttisnumber()))
        return null;

    return o.ttisstring() ? o.jsstring() : `${o.value}`;
};

const lua_tojsstring =  lua_toljsstring;

// Convert a string on the stack to a dataview, because lua_tostring will perform utf-8 to utf-16 conversion
const lua_todataview = function(L, idx) {
    let o = index2addr(L, idx);

    if (!o.ttisstring() && !o.ttisnumber())
        return null;

    let dv = new DataView(new ArrayBuffer(o.value.length));
    o.value.forEach((e, i) => dv.setUint8(i, e, true));

    return dv;
};

const lua_rawlen = function(L, idx) {
    let o = index2addr(L, idx);
    switch (o.ttype()) {
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            return o.value.length;
        case CT.LUA_TUSERDATA:
            return o.len;
        case CT.LUA_TTABLE:
            return ltable.luaH_getn(o.value);
        default:
            return 0;
    }
};

const lua_tointeger = function(L, idx) {
    return lvm.tointeger(index2addr(L, idx));
};

const lua_tonumber = function(L, idx) {
    return lvm.tonumber(index2addr(L, idx));
};

const lua_touserdata = function(L, idx) {
    let o = index2addr(L, idx);
    switch (o.ttnov()) {
        case CT.LUA_TUSERDATA:
            return o.value.data;
        case CT.LUA_TLIGHTUSERDATA:
            return o.value;
        default: return null;
    }
};

const lua_tothread = function(L, idx) {
    let o = index2addr(L, idx);
    return o.ttisthread() ? o.value : null;
};

const lua_topointer = function(L, idx) {
    let o = index2addr(L, idx);
    switch (o.ttype()) {
        case CT.LUA_TTABLE:
        case CT.LUA_TLCL:
        case CT.LUA_TCCL:
        case CT.LUA_TLCF:
        case CT.LUA_TTHREAD:
        case CT.LUA_TUSERDATA: /* note: this differs in behaviour to reference lua implementation */
        case CT.LUA_TLIGHTUSERDATA:
            return o.value;
        default:
            return null;
    }
};

const lua_compare = function(L, index1, index2, op) {
    let o1 = index2addr(L, index1);
    let o2 = index2addr(L, index2);

    let i = 0;

    if (isvalid(o1) && isvalid(o2)) {
        switch (op) {
            case defs.LUA_OPEQ: i = lvm.luaV_equalobj(L, o1, o2); break;
            case defs.LUA_OPLT: i = lvm.luaV_lessthan(L, o1, o2); break;
            case defs.LUA_OPLE: i = lvm.luaV_lessequal(L, o1, o2); break;
            default: assert(false, "invalid option");
        }
    }

    return i;
};

const lua_stringtonumber = function(L, s) {
    L.stack[L.top++] = lobject.luaO_str2num(s);
    assert(L.top <= L.ci.top, "stack overflow");
    return s.length;
};

const lua_tointegerx = function(L, idx) {
    return lvm.tointeger(index2addr(L, idx));
};

const f_call = function(L, ud) {
    ldo.luaD_callnoyield(L, ud.funcOff, ud.nresults);
};

const lua_type = function(L, idx) {
    let o = index2addr(L, idx);
    return isvalid(o) ?  o.ttnov() : CT.LUA_TNONE;
};

const lua_typename = function(L, t) {
    assert(CT.LUA_TNONE <= t && t < CT.LUA_NUMTAGS, "invalid tag");
    return ltm.ttypename(t);
};

const lua_iscfunction = function(L, idx) {
    let o = index2addr(L, idx);
    return o.ttislcf(o) || o.ttisCclosure();
};

const lua_isnil = function(L, n) {
    return lua_type(L, n) === CT.LUA_TNIL;
};

const lua_isboolean = function(L, n) {
    return lua_type(L, n) === CT.LUA_TBOOLEAN;
};

const lua_isnone = function(L, n) {
    return lua_type(L, n) === CT.LUA_TNONE;
};

const lua_isnoneornil = function(L, n) {
    return lua_type(L, n) <= 0;
};

const lua_istable = function(L, idx) {
    return index2addr(L, idx).ttistable();
};

const lua_isinteger = function(L, idx) {
    return index2addr(L, idx).ttisinteger();
};

const lua_isnumber = function(L, idx) {
    return lvm.tonumber(index2addr(L, idx)) !== false;
};

const lua_isstring = function(L, idx) {
    let o = index2addr(L, idx);
    return o.ttisstring() || o.ttisnumber();
};

const lua_isuserdata = function(L, idx) {
    let o = index2addr(L, idx);
    return o.ttisfulluserdata(o) || o.ttislightuserdata();
};

const lua_isthread = function(L, idx) {
    return lua_type(L, idx) === CT.LUA_TTHREAD;
};

const lua_isfunction = function(L, idx) {
    return lua_type(L, idx) === CT.LUA_TFUNCTION;
};

const lua_rawequal = function(L, index1, index2) {
    let o1 = index2addr(L, index1);
    let o2 = index2addr(L, index2);
    return isvalid(o1) && isvalid(o2) ? lvm.luaV_equalobj(null, o1, o2) : 0; // TODO: isvalid ?
};

/*
** 'load' and 'call' functions (run Lua code)
*/

const lua_load = function(L, reader, data, chunckname, mode) {
    assert(Array.isArray(chunckname), "lua_load expect an array of byte as chunckname");
    assert(mode ? Array.isArray(mode) : true, "lua_load expect an array of byte as mode");
    let z = new llex.MBuffer(L, data, reader);
    if (!chunckname) chunckname = [defs.char["?"]];
    let status = ldo.luaD_protectedparser(L, z, chunckname, mode);
    if (status === TS.LUA_OK) {  /* no errors? */
        let f = L.stack[L.top - 1].value; /* get newly created function */
        if (f.nupvalues >= 1) {  /* does it have an upvalue? */
            /* get global table from registry */
            let gt = ltable.luaH_getint(L.l_G.l_registry.value, defs.LUA_RIDX_GLOBALS);
            /* set global table as 1st upvalue of 'f' (may be LUA_ENV) */
            f.upvals[0].u.value = new TValue(gt.type, gt.value);
        }
    }
    return status;
};

const lua_dump = function(L, writer, data, strip) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let o = L.stack[L.top -1];
    if (o.ttisLclosure())
        return ldump.luaU_dump(L, o.value.p, writer, data, strip);
    return 1;
};

const lua_status = function(L) {
    return L.status;
};

const lua_setuservalue = function(L, idx) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    let o = index2addr(L, idx);
    assert(L, o.ttisfulluserdata(), "full userdata expected");
    o.uservalue.setfrom(L.stack[L.top - 1]);
    L.stack[--L.top] = void 0;
};

const lua_callk = function(L, nargs, nresults, ctx, k) {
    assert(k === null || !(L.ci.callstatus & lstate.CIST_LUA), "cannot use continuations inside hooks");
    assert(nargs + 1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    assert(L.status === TS.LUA_OK, "cannot do calls on non-normal thread");
    assert(nargs === defs.LUA_MULTRET || (L.ci.top - L.top >= nargs - nresults, "results from function overflow current stack size"));

    let func = L.top - (nargs + 1);
    if (k !== null && L.nny === 0) { /* need to prepare continuation? */
        L.ci.u.c.k = k;
        L.ci.u.c.ctx = ctx;
        ldo.luaD_call(L, func, nresults);
    } else { /* no continuation or no yieldable */
        ldo.luaD_callnoyield(L, func, nresults);
    }

    if (nresults === defs.LUA_MULTRET && L.ci.top < L.top)
        L.ci.top = L.top;
};

const lua_call = function(L, n, r) {
    lua_callk(L, n, r, 0, null);
};

const lua_pcallk = function(L, nargs, nresults, errfunc, ctx, k) {
    assert(nargs + 1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    assert(L.status === TS.LUA_OK, "cannot do calls on non-normal thread");
    assert(nargs === defs.LUA_MULTRET || (L.ci.top - L.top >= nargs - nresults, "results from function overflow current stack size"));

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
        // let o = index2addr(L, errfunc);
        // TODO: api_checkstackindex(L, errfunc, o);
        func = index2addr_(L, errfunc);
    }

    c.funcOff = L.top - (nargs + 1); /* function to be called */
    c.func = L.stack[c.funcOff];

    if (k === null || L.nny > 0) { /* no continuation or no yieldable? */
        c.nresults = nresults; /* do a 'conventional' protected call */
        status = ldo.luaD_pcall(L, f_call, c, c.funcOff, func);
    } else { /* prepare continuation (call is already protected by 'resume') */
        let ci = L.ci;
        ci.u.c.k = k;  /* prepare continuation (call is already protected by 'resume') */
        ci.u.c.ctx = ctx;  /* prepare continuation (call is already protected by 'resume') */
        /* save information for error recovery */
        ci.extra = c.funcOff;
        ci.u.c.old_errfunc = L.errfunc;
        L.errfunc = func;
        ci.callstatus &= ~lstate.CIST_OAH | L.allowhook;
        ci.callstatus |= lstate.CIST_YPCALL;  /* function can do error recovery */
        ldo.luaD_call(L, c.funcOff, nresults);  /* do the call */
        ci.callstatus &= ~lstate.CIST_YPCALL;
        L.errfunc = ci.u.c.old_errfunc;
        status = TS.LUA_OK;
    }

    if (nresults === defs.LUA_MULTRET && L.ci.top < L.top)
        L.ci.top = L.top;

    return status;
};

const lua_pcall = function(L, n, r, f) {
    return lua_pcallk(L, n, r, f, 0, null);
};

/*
** miscellaneous functions
*/

const lua_error = function(L) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    ldebug.luaG_errormsg(L);
};

const lua_next = function(L, idx) {
    let t = index2addr(L, idx);
    assert(t.ttistable(), "table expected");
    let more = ltable.luaH_next(L, t.value, L.top - 1);
    if (more) {
        L.top++;
        assert(L.top <= L.ci.top, "stack overflow");
        return 1;
    } else {
        L.top--;
        return 0;
    }
};

const lua_concat = function(L, n) {
    assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
    if (n >= 2)
        lvm.luaV_concat(L, n);
    else if (n === 0) {
        L.stack[L.top++] = L.l_G.intern(defs.to_luastring("", true));
        assert(L.top <= L.ci.top, "stack overflow");
    }
};

const lua_len = function(L, idx) {
    let t = index2addr(L, idx);
    lvm.luaV_objlen(L, L.top++, t);
    assert(L.top <= L.ci.top, "stack overflow");
};

const getupvalref = function(L, fidx, n, pf) {
    let fi = index2addr(L, fidx);
    assert(fi.ttisLclosure(), "Lua function expected");
    let f = fi.value;
    assert(1 <= n && n <= f.p.upvalues.length, "invalid upvalue index");
    return {
        closure: f,
        upval: f.upvals[n - 1],
        upvalOff: n - 1
    };
};

const lua_upvalueid = function(L, fidx, n) {
    let fi = index2addr(L, fidx);
    switch (fi.ttype()) {
        case CT.LUA_TLCL: {  /* lua closure */
            return getupvalref(L, fidx, n, null).upval;
        }
        case CT.LUA_TCCL: {  /* C closure */
            let f = fi.value;
            assert(1 <= n && n <= f.nupvalues, "invalid upvalue index");
            return f.upvalue[n - 1];
        }
        default: {
            assert(false, "closure expected");
            return null;
        }
    }
};

const lua_upvaluejoin = function(L, fidx1, n1, fidx2, n2) {
    let ref1 = getupvalref(L, fidx1, n1);
    let ref2 = getupvalref(L, fidx2, n2);
    let up1 = ref1.upvalOff;
    let up2 = ref2.upval;
    let f1 = ref1.closure;

    f1.upvals[up1] = up2;
    up2.u.open.touched = true; // TODO: useful
};

// This functions are only there for compatibility purposes
const lua_gc = function () {};

const lua_getallocf = function () {
    console.warn("lua_getallocf is not available and will always return null");
    return null;
};
const lua_getextraspace = function () {
    console.warn("lua_getextraspace is not available and will always return null");
    return null;
};

module.exports.index2addr            = index2addr;
module.exports.index2addr_           = index2addr_;
module.exports.lua_absindex          = lua_absindex;
module.exports.lua_atpanic           = lua_atpanic;
module.exports.lua_call              = lua_call;
module.exports.lua_callk             = lua_callk;
module.exports.lua_checkstack        = lua_checkstack;
module.exports.lua_compare           = lua_compare;
module.exports.lua_concat            = lua_concat;
module.exports.lua_copy              = lua_copy;
module.exports.lua_createtable       = lua_createtable;
module.exports.lua_dump              = lua_dump;
module.exports.lua_error             = lua_error;
module.exports.lua_gc                = lua_gc;
module.exports.lua_getallocf         = lua_getallocf;
module.exports.lua_getextraspace     = lua_getextraspace;
module.exports.lua_getfield          = lua_getfield;
module.exports.lua_getglobal         = lua_getglobal;
module.exports.lua_geti              = lua_geti;
module.exports.lua_getmetatable      = lua_getmetatable;
module.exports.lua_gettable          = lua_gettable;
module.exports.lua_gettop            = lua_gettop;
module.exports.lua_getupvalue        = lua_getupvalue;
module.exports.lua_getuservalue      = lua_getuservalue;
module.exports.lua_insert            = lua_insert;
module.exports.lua_isboolean         = lua_isboolean;
module.exports.lua_iscfunction       = lua_iscfunction;
module.exports.lua_isfunction        = lua_isfunction;
module.exports.lua_isinteger         = lua_isinteger;
module.exports.lua_isnil             = lua_isnil;
module.exports.lua_isnone            = lua_isnone;
module.exports.lua_isnoneornil       = lua_isnoneornil;
module.exports.lua_isnumber          = lua_isnumber;
module.exports.lua_isstring          = lua_isstring;
module.exports.lua_istable           = lua_istable;
module.exports.lua_isthread          = lua_isthread;
module.exports.lua_isuserdata        = lua_isuserdata;
module.exports.lua_len               = lua_len;
module.exports.lua_load              = lua_load;
module.exports.lua_newtable          = lua_newtable;
module.exports.lua_newuserdata       = lua_newuserdata;
module.exports.lua_next              = lua_next;
module.exports.lua_pcall             = lua_pcall;
module.exports.lua_pcallk            = lua_pcallk;
module.exports.lua_pop               = lua_pop;
module.exports.lua_pushboolean       = lua_pushboolean;
module.exports.lua_pushcclosure      = lua_pushcclosure;
module.exports.lua_pushcfunction     = lua_pushcfunction;
module.exports.lua_pushglobaltable   = lua_pushglobaltable;
module.exports.lua_pushinteger       = lua_pushinteger;
module.exports.lua_pushjsclosure     = lua_pushjsclosure;
module.exports.lua_pushjsfunction    = lua_pushjsfunction;
module.exports.lua_pushlightuserdata = lua_pushlightuserdata;
module.exports.lua_pushliteral       = lua_pushliteral;
module.exports.lua_pushlstring       = lua_pushlstring;
module.exports.lua_pushnil           = lua_pushnil;
module.exports.lua_pushnumber        = lua_pushnumber;
module.exports.lua_pushstring        = lua_pushstring;
module.exports.lua_pushfstring       = lua_pushfstring;
module.exports.lua_pushvfstring      = lua_pushvfstring;
module.exports.lua_pushthread        = lua_pushthread;
module.exports.lua_pushvalue         = lua_pushvalue;
module.exports.lua_rawequal          = lua_rawequal;
module.exports.lua_rawget            = lua_rawget;
module.exports.lua_rawgeti           = lua_rawgeti;
module.exports.lua_rawgetp           = lua_rawgetp;
module.exports.lua_rawlen            = lua_rawlen;
module.exports.lua_rawset            = lua_rawset;
module.exports.lua_rawseti           = lua_rawseti;
module.exports.lua_rawsetp           = lua_rawsetp;
module.exports.lua_remove            = lua_remove;
module.exports.lua_replace           = lua_replace;
module.exports.lua_rotate            = lua_rotate;
module.exports.lua_setfield          = lua_setfield;
module.exports.lua_setglobal         = lua_setglobal;
module.exports.lua_seti              = lua_seti;
module.exports.lua_setmetatable      = lua_setmetatable;
module.exports.lua_settable          = lua_settable;
module.exports.lua_settop            = lua_settop;
module.exports.lua_setupvalue        = lua_setupvalue;
module.exports.lua_setuservalue      = lua_setuservalue;
module.exports.lua_status            = lua_status;
module.exports.lua_stringtonumber    = lua_stringtonumber;
module.exports.lua_toboolean         = lua_toboolean;
module.exports.lua_todataview        = lua_todataview;
module.exports.lua_tointeger         = lua_tointeger;
module.exports.lua_tointegerx        = lua_tointegerx;
module.exports.lua_tojsstring        = lua_tojsstring;
module.exports.lua_toljsstring       = lua_toljsstring;
module.exports.lua_tolstring         = lua_tolstring;
module.exports.lua_tonumber          = lua_tonumber;
module.exports.lua_topointer         = lua_topointer;
module.exports.lua_tostring          = lua_tostring;
module.exports.lua_tothread          = lua_tothread;
module.exports.lua_touserdata        = lua_touserdata;
module.exports.lua_type              = lua_type;
module.exports.lua_typename          = lua_typename;
module.exports.lua_upvalueid         = lua_upvalueid;
module.exports.lua_upvaluejoin       = lua_upvaluejoin;
module.exports.lua_version           = lua_version;
module.exports.lua_xmove             = lua_xmove;
