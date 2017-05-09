/*jshint esversion: 6 */
"use strict";

const assert = require('assert');

const defs     = require('./defs.js');
const ldo      = require('./ldo.js');
const lfunc    = require('./lfunc.js');
const lobject  = require('./lobject.js');
const lopcodes = require('./lopcodes.js');
const lstate   = require('./lstate.js');
const ltable   = require('./ltable.js');
const ltm      = require('./ltm.js');
const luaconf  = require('./luaconf.js');
const lvm      = require('./lvm.js');

const TValue = lobject.TValue;
const CT     = defs.constant_types;
const TS     = defs.thread_status;

const currentline = function(ci) {
    return ci.func.value.p.lineinfo ? ci.func.value.p.lineinfo[ci.pcOff-1] : -1;
};

/*
** If function yielded, its 'func' can be in the 'extra' field. The
** next function restores 'func' to its correct value for debugging
** purposes. (It exchanges 'func' and 'extra'; so, when called again,
** after debugging, it also "re-restores" ** 'func' to its altered value.
*/
const swapextra = function(L) {
    if (L.status === TS.LUA_YIELD) {
        let ci = L.ci;  /* get function that yielded */
        let temp = ci.funcOff;  /* exchange its 'func' and 'extra' values */
        ci.func = L.stack[ci.extra];
        ci.funcOff = ci.extra;
        ci.extra = temp;
    }
};

const lua_sethook = function(L, func, mask, count) {
    if (func === null || mask === 0) {  /* turn off hooks? */
        mask = 0;
        func = null;
    }
    if (L.ci.callstatus & lstate.CIST_LUA)
        L.oldpc = L.ci.pcOff;
    L.hook = func;
    L.basehookcount = count;
    L.hookcount = L.basehookcount;
    L.hookmask = mask;
};

const lua_gethook = function(L) {
    return L.hook;
};


const lua_gethookmask = function(L) {
    return L.hookmask;
};


const lua_gethookcount = function(L) {
    return L.basehookcount;
};

const lua_getstack = function(L, level, ar) {
    let ci;
    let status;
    if (level < 0) return 0;  /* invalid (negative) level */
    for (ci = L.ci; level > 0 && ci !== L.base_ci; ci = ci.previous)
        level--;
    if (level === 0 && ci !== L.base_ci) {  /* level found? */
        status = 1;
        ar.i_ci = ci;
    } else
        status = 0;  /* no such level */
    return status;
};

const upvalname = function(p, uv) {
    assert(uv < p.upvalues.length);
    let s = p.upvalues[uv].name;
    if (s === null) return ["?".charCodeAt(0)];
    return s.getstr();
};

const findvararg = function(ci, n) {
    let nparams = ci.func.value.p.numparams;
    if (n >= ci.l_base - ci.funcOff - nparams)
        return null;  /* no such vararg */
    else {
        return {
            pos: ci.funcOff + nparams + n,
            name: defs.to_luastring("(*vararg)", true)  /* generic name for any vararg */
        };
    }
};

const findlocal = function(L, ci, n) {
    let base, name = null;

    if (ci.callstatus & lstate.CIST_LUA) {
        if (n < 0)  /* access to vararg values? */
            return findvararg(ci, -n);
        else {
            base = ci.l_base;
            name = lfunc.luaF_getlocalname(ci.func.value.p, n, ci.pcOff);
        }
    } else
        base = ci.funcOff + 1;

    if (name === null) {  /* no 'standard' name? */
        let limit = ci === L.ci ? L.top : ci.next.func;
        if (limit - base >= n && n > 0)  /* is 'n' inside 'ci' stack? */
            name = defs.to_luastring("(*temporary)", true);  /* generic name for any valid slot */
        else
            return null;  /* no name */
    }
    return {
        pos: base + (n - 1),
        name: name
    };
};

const lua_getlocal = function(L, ar, n) {
    let name;
    swapextra(L);
    if (ar === null) {  /* information about non-active function? */
        if (!L.stack[L.top - 1].ttisLclosure())  /* not a Lua function? */
            name = null;
        else  /* consider live variables at function start (parameters) */
            name = lfunc.luaF_getlocalname(L.stack[L.top - 1].value.p, n, 0);
    } else {  /* active function; get information through 'ar' */
        let local = findlocal(L, ar.i_ci, n);
        if (local) {
            name = local.name;
            let pos = L.stack[local.pos];
            L.stack[L.top++] = new TValue(pos.type, pos.value);
        } else {
            name = null;
        }
    }
    swapextra(L);
    return name;
};

const lua_setlocal = function(L, ar, n) {
    swapextra(L);
    let local = findlocal(L, ar.i_ci, n);
    let name = local.name;
    let pos = local.pos;
    if (name) {
        L.stack[pos].type = L.stack[L.top - 1].type;
        L.stack[pos].value = L.stack[L.top - 1].value;
        L.top--;  /* pop value */
    }
    swapextra(L);
    return name;
};

const funcinfo = function(ar, cl) {
    if (cl === null || cl.type === CT.LUA_TCCL) {
        ar.source = defs.to_luastring("=[JS]", true);
        ar.linedefined = -1;
        ar.lastlinedefined = -1;
        ar.what = "J";
    } else {
        let p = cl.p;
        ar.source = p.source ? p.source.getstr() : defs.to_luastring("=?", true);
        ar.linedefined = p.linedefined;
        ar.lastlinedefined = p.lastlinedefined;
        ar.what = ar.linedefined === 0 ? defs.to_luastring("main", true) : defs.to_luastring("Lua", true);
    }

    ar.short_src = lobject.luaO_chunkid(ar.source, luaconf.LUA_IDSIZE);
};

const collectvalidlines = function(L, f) {
    if (f === null || f.c.type === CT.LUA_TCCL) {
        L.stack[L.top++] = new TValue(CT.LUA_TNIL, null);
        assert(L.top <= L.ci.top, "stack overflow");
    } else {
        let lineinfo = f.l.p.lineinfo;
        let t = ltable.luaH_new(L);
        L.stack[L.top++] = new TValue(CT.LUA_TTABLE, t);
        assert(L.top <= L.ci.top, "stack overflow");
        let v = new TValue(CT.LUA_TBOOLEAN, true);
        for (let i = 0; i < f.l.p.length; i++)
            ltable.luaH_setint(t, lineinfo[i], v);
    }
};

const getfuncname = function(L, ci) {
    let r = {
        name: null,
        funcname: null
    };
    if (ci === null)
        return null;
    else if (ci.callstatus & lstate.CIST_FIN) {  /* is this a finalizer? */
        r.name = defs.to_luastring("__gc", true);
        r.funcname = defs.to_luastring("metamethod", true);  /* report it as such */
        return r;
    }
    /* calling function is a known Lua function? */
    else if (!(ci.callstatus & lstate.CIST_TAIL) && ci.previous.callstatus & lstate.CIST_LUA)
        return funcnamefromcode(L, ci.previous);
    else return null;  /* no way to find a name */
};

const auxgetinfo = function(L, what, ar, f, ci) {
    let status = 1;
    for (; what.length > 0; what = what.slice(1)) {
        switch (String.fromCharCode(what[0])) {
            case 'S': {
                funcinfo(ar, f);
                break;
            }
            case 'l': {
                ar.currentline = ci && ci.callstatus & lstate.CIST_LUA ? currentline(ci) : -1;
                break;
            }
            case 'u': {
                ar.nups = f === null ? 0 : f.nupvalues;
                if (f === null || f.type === CT.LUA_TCCL) {
                    ar.isvararg = true;
                    ar.nparams = 0;
                } else {
                    ar.isvararg = f.p.is_vararg;
                    ar.nparams = f.p.numparams;
                }
                break;
            }
            case 't': {
                ar.istailcall = ci ? ci.callstatus & lstate.CIST_TAIL : 0;
                break;
            }
            case 'n': {
                let r = getfuncname(L, ci);
                if (r === null) {
                    ar.namewhat = null;
                    ar.name = null;
                } else {
                    ar.namewhat = r.funcname;
                    ar.name = r.name;
                }
                break;
            }
            case 'L':
            case 'f':  /* handled by lua_getinfo */
                break;
            default: status = 0;  /* invalid option */
        }
    }

    return status;
};

const lua_getinfo = function(L, what, ar) {
    let status, cl, ci, func, funcOff;
    swapextra(L);
    if (what[0] === '>'.charCodeAt(0)) {
        ci = null;
        funcOff = L.top - 1;
        func = L.stack[funcOff];
        assert(L, func.ttisfunction(), "function expected");
        what = what.slice(1);  /* skip the '>' */
        L.top--;  /* pop function */
    } else {
        ci = ar.i_ci;
        func = ci.func;
        funcOff = ci.funcOff;
        assert(ci.func.ttisfunction());
    }

    cl = func.ttisclosure() ? func.value : null;
    status = auxgetinfo(L, what, ar, cl, ci);
    if (what.indexOf('f'.charCodeAt(0)) >= 0) {
        L.stack[L.top++] = func;
        assert(L.top <= L.ci.top, "stack overflow");
    }

    swapextra(L);
    if (what.indexOf('L'.charCodeAt(0)) >= 0)
        collectvalidlines(L, cl);

    return status;
};

const kname = function(p, pc, c) {
    let r = {
        name: null,
        funcname: null
    };

    if (lopcodes.ISK(c)) {  /* is 'c' a constant? */
        let kvalue = p.k[lopcodes.INDEXK(c)];
        if (kvalue.ttisstring()) {  /* literal constant? */
            r.name = kvalue.svalue();  /* it is its own name */
            return r;
        }
        /* else no reasonable name found */
    } else {  /* 'c' is a register */
        let what = getobjname(p, pc, c); /* search for 'c' */
        if (what && what.funcname[0] === 'c'.charCodeAt(0)) {  /* found a constant name? */
            return what;  /* 'name' already filled */
        }
        /* else no reasonable name found */
    }
    r.name = [defs.char["?"]];
    return r;  /* no reasonable name found */
};

const filterpc = function(pc, jmptarget) {
    if (pc < jmptarget)  /* is code conditional (inside a jump)? */
        return -1;  /* cannot know who sets that register */
    else return pc;  /* current position sets that register */
};

/*
** try to find last instruction before 'lastpc' that modified register 'reg'
*/
const findsetreg = function(p, lastpc, reg) {
    let setreg = -1;  /* keep last instruction that changed 'reg' */
    let jmptarget = 0;  /* any code before this address is conditional */
    for (let pc = 0; pc < lastpc; pc++) {
        let i = p.code[pc];
        let op = lopcodes.OpCodes[i.opcode];
        let a = i.A;
        switch (op) {
            case 'OP_LOADNIL': {
                let b = i.B;
                if (a <= reg && reg <= a + b)  /* set registers from 'a' to 'a+b' */
                    setreg = filterpc(pc, jmptarget);
                break;
            }
            case 'OP_TFORCALL': {
                if (reg >= a + 2)  /* affect all regs above its base */
                    setreg = filterpc(pc, jmptarget);
                break;
            }
            case 'OP_CALL':
            case 'OP_TAILCALL': {
                if (reg >= a)  /* affect all registers above base */
                    setreg = filterpc(pc, jmptarget);
                break;
            }
            case 'OP_JMP': {
                let b = i.sBx;
                let dest = pc + 1 + b;
                /* jump is forward and do not skip 'lastpc'? */
                if (pc < dest && dest <= lastpc) {
                    if (dest > jmptarget)
                        jmptarget = dest;  /* update 'jmptarget' */
                }
                break;
            }
            default:
                if (lopcodes.testAMode(i.opcode) && reg === a)
                    setreg = filterpc(pc, jmptarget);
                break;
        }
    }

    return setreg;
};


const getobjname = function(p, lastpc, reg) {
    let r = {
        name: lfunc.luaF_getlocalname(p, reg + 1, lastpc),
        funcname: null
    };

    if (r.name) {  /* is a local? */
        r.funcname = defs.to_luastring("local", true);
        return r;
    }

    /* else try symbolic execution */
    let pc = findsetreg(p, lastpc, reg);
    if (pc !== -1) {  /* could find instruction? */
        let i = p.code[pc];
        let op = lopcodes.OpCodes[i.opcode];
        switch (op) {
            case 'OP_MOVE': {
                let b = i.B;  /* move from 'b' to 'a' */
                if (b < i.A)
                    return getobjname(p, pc, b);  /* get name for 'b' */
                break;
            }
            case 'OP_GETTABUP':
            case 'OP_GETTABLE': {
                let k = i.C;  /* key index */
                let t = i.B;  /* table index */
                let vn = op === 'OP_GETTABLE' ? lfunc.luaF_getlocalname(p, t + 1, pc) : upvalname(p, t);
                r.name = kname(p, pc, k).name;
                r.funcname = vn && vn === "_ENV" ? defs.to_luastring("global", true) : defs.to_luastring("field", true);
                return r;
            }
            case 'OP_GETUPVAL': {
                r.name = upvalname(p, i.B);
                r.funcname = defs.to_luastring("upvalue", true);
                return r;
            }
            case 'OP_LOADK':
            case 'OP_LOADKX': {
                let b = op === 'OP_LOADK' ? i.Bx : p.code[pc + 1].Ax;
                if (p.k[b].ttisstring()) {
                    r.name = p.k[b].tsvalue();
                    r.funcname = defs.to_luastring("constant", true);
                    return r;
                }
                break;
            }
            case 'OP_SELF': {
                let k = i.C;
                r.name = kname(p, pc, k).name;
                r.funcname = defs.to_luastring("method", true);
                return r;
            }
            default: break;
        }
    }

    return null;
};

/*
** Try to find a name for a function based on the code that called it.
** (Only works when function was called by a Lua function.)
** Returns what the name is (e.g., "for iterator", "method",
** "metamethod") and sets '*name' to point to the name.
*/
const funcnamefromcode = function(L, ci) {
    let r = {
        name: null,
        funcname: null
    };

    let tm = 0;  /* (initial value avoids warnings) */
    let p = ci.func.value.p;  /* calling function */
    let pc = ci.pcOff - 1;  /* calling instruction index */
    let i = p.code[pc];  /* calling instruction */

    if (ci.callstatus & lstate.CIST_HOOKED) {
        r.name = [defs.char["?"]];
        r.funcname = defs.to_luastring("hook", true);
        return r;
    }

    switch (lopcodes.OpCodes[i.opcode]) {
        case 'OP_CALL':
        case 'OP_TAILCALL':
            return getobjname(p, pc, i.A);  /* get function name */
        case 'OP_TFORCALL':
            r.name = defs.to_luastring("for iterator", true);
            r.funcname = defs.to_luastring("for iterator", true);
            return r;
        /* other instructions can do calls through metamethods */
        case 'OP_SELF':
        case 'OP_GETTABUP':
        case 'OP_GETTABLE':
            tm = ltm.TMS.TM_INDEX;
            break;
        case 'OP_SETTABUP':
        case 'OP_SETTABLE':
            tm = ltm.TMS.TM_NEWINDEX;
            break;
        case 'OP_ADD':    tm = ltm.TMS.OP_ADD;    break;
        case 'OP_SUB':    tm = ltm.TMS.OP_SUB;    break;
        case 'OP_MUL':    tm = ltm.TMS.OP_MUL;    break;
        case 'OP_MOD':    tm = ltm.TMS.OP_MOD;    break;
        case 'OP_POW':    tm = ltm.TMS.OP_POW;    break;
        case 'OP_DIV':    tm = ltm.TMS.OP_DIV;    break;
        case 'OP_IDIV':   tm = ltm.TMS.OP_IDI;    break;
        case 'OP_BAND':   tm = ltm.TMS.OP_BAN;    break;
        case 'OP_BOR':    tm = ltm.TMS.OP_BOR;    break;
        case 'OP_BXOR':   tm = ltm.TMS.OP_BXO;    break;
        case 'OP_SHL':    tm = ltm.TMS.OP_SHL;    break;
        case 'OP_SHR':    tm = ltm.TMS.OP_SHR;    break;
        case 'OP_UNM':    tm = ltm.TMS.TM_UNM;    break;
        case 'OP_BNOT':   tm = ltm.TMS.TM_BNOT;   break;
        case 'OP_LEN':    tm = ltm.TMS.TM_LEN;    break;
        case 'OP_CONCAT': tm = ltm.TMS.TM_CONCAT; break;
        case 'OP_EQ':     tm = ltm.TMS.TM_EQ;     break;
        case 'OP_LT':     tm = ltm.TMS.TM_LT;     break;
        case 'OP_LE':     tm = ltm.TMS.TM_LE;     break;
        default:
            return null;  /* cannot find a reasonable name */
    }

    r.name = L.l_G.tmname[tm].getstr();
    r.funcname = defs.to_luastring("metamethod", true);
    return r;
};

const isinstack = function(L, ci, o) {
    for (let i = ci.l_base; i < ci.top; i++) {
        if (L.stack[i] === o)
            return i;
    }

    return false;
};

/*
** Checks whether value 'o' came from an upvalue. (That can only happen
** with instructions OP_GETTABUP/OP_SETTABUP, which operate directly on
** upvalues.)
*/
const getupvalname = function(L, ci, o) {
    let c = ci.func;
    for (let i = 0; i < c.nupvalues; i++) {
        if (c.upvals[i].val() === o) {
            return {
                name: upvalname(c.p, i),
                funcname: defs.to_luastring('upvalue', true)
            };
        }
    }

    return null;
};

const varinfo = function(L, o) {
    let ci = L.ci;
    let kind = null;
    if (ci.callstatus & lstate.CIST_LUA) {
        kind = getupvalname(L, ci, o);  /* check whether 'o' is an upvalue */
        let stkid = isinstack(L, ci, o);
        if (!kind && stkid)  /* no? try a register */
            kind = getobjname(ci.func.value.p, ci.pcOff, stkid - ci.l_base);
    }

    return kind ? lobject.luaO_pushfstring(L, defs.to_luastring(" (%s '%s')", true), kind.funcname, kind.name) : defs.to_luastring("", true);
};

const luaG_typeerror = function(L, o, op) {
    let t = ltm.luaT_objtypename(L, o);
    luaG_runerror(L, defs.to_luastring(`attempt to ${defs.to_jsstring(op)} a ${defs.to_jsstring(t)} value${defs.to_jsstring(varinfo(L, o))}`));
};

const luaG_concaterror = function(L, p1, p2) {
    if (p1.ttisstring() || p1.ttisnumber()) p1 = p2;
    luaG_typeerror(L, p1, defs.to_luastring('concatenate', true));
};

/*
** Error when both values are convertible to numbers, but not to integers
*/
const luaG_opinterror = function(L, p1, p2, msg) {
    if (lvm.tonumber(p1) === false)
        p2 = p1;
    luaG_typeerror(L, p2, msg);
};

const luaG_ordererror = function(L, p1, p2) {
    let t1 = ltm.luaT_objtypename(L, p1);
    let t2 = ltm.luaT_objtypename(L, p2);
    if (t1.join() === t2.join())
        luaG_runerror(L, defs.to_luastring(`attempt to compare two ${defs.to_jsstring(t1)} values`));
    else
        luaG_runerror(L, defs.to_luastring(`attempt to compare ${defs.to_jsstring(t1)} with ${defs.to_jsstring(t2)}`));
};

/* add src:line information to 'msg' */
const luaG_addinfo = function(L, msg, src, line) {
    let buff;
    if (src)
        buff = lobject.luaO_chunkid(src.getstr(), luaconf.LUA_IDSIZE);
    else
        buff = ['?'.charCodeAt(0)];

    return lobject.luaO_pushfstring(L, defs.to_luastring("%s:%d: %s", true), buff, line, msg);
};

const luaG_runerror = function(L, fmt, ...argp) {
    let ci = L.ci;
    let msg = lobject.luaO_pushvfstring(L, fmt, argp);
    if (ci.callstatus & lstate.CIST_LUA)  /* if Lua function, add source:line information */
        luaG_addinfo(L, msg, ci.func.value.p.source, currentline(ci));
    luaG_errormsg(L);
};

const luaG_errormsg = function(L) {
    if (L.errfunc !== 0) {  /* is there an error handling function? */
        let errfunc = L.errfunc;
        L.stack[L.top] = L.stack[L.top - 1];
        L.stack[L.top - 1] = L.stack[errfunc];
        L.top++;
        ldo.luaD_callnoyield(L, L.top - 2, 1);
    }

    ldo.luaD_throw(L, TS.LUA_ERRRUN);
};

/*
** Error when both values are convertible to numbers, but not to integers
*/
const luaG_tointerror = function(L, p1, p2) {
    let temp = lvm.tointeger(p1);
    if (temp === false)
        p2 = p1;
    luaG_runerror(L, defs.to_luastring(`number${defs.to_jsstring(varinfo(L, p2))} has no integer representation`));
};

const luaG_traceexec = function(L) {
    let ci = L.ci;
    let mask = L.hookmask;
    let counthook = (--L.hookcount === 0 && (mask & defs.LUA_MASKCOUNT));
    if (counthook)
        L.hookcount = L.basehookcount;  /* reset count */
    else if (!(mask & defs.LUA_MASKLINE))
        return;  /* no line hook and count != 0; nothing to be done */
    if (ci.callstatus & lstate.CIST_HOOKYIELD) {  /* called hook last time? */
        ci.callstatus &= ~lstate.CIST_HOOKYIELD;  /* erase mark */
        return;  /* do not call hook again (VM yielded, so it did not move) */
    }
    if (counthook)
        ldo.luaD_hook(L, defs.LUA_HOOKCOUNT, -1);  /* call count hook */
    if (mask & defs.LUA_MASKLINE) {
        let p = ci.func.value.p;
        let npc = ci.pcOff; // pcRel(ci.u.l.savedpc, p);
        let newline = p.lineinfo ? p.lineinfo[npc] : -1;
        if (npc === 0 ||  /* call linehook when enter a new function, */
            ci.pcOff <= L.oldpc ||  /* when jump back (loop), or when */
            newline !== p.lineinfo ? p.lineinfo[L.oldpc] : -1)  /* enter a new line */
            ldo.luaD_hook(L, defs.LUA_HOOKLINE, newline);  /* call line hook */
    }
    L.oldpc = ci.pcOff;
    if (L.status === TS.LUA_YIELD) {  /* did hook yield? */
        if (counthook)
            L.hookcount = 1;  /* undo decrement to zero */
        ci.l_savedpc--;  /* undo increment (resume will increment it again) */
        ci.callstatus |= lstate.CIST_HOOKYIELD;  /* mark that it yielded */
        ci.func = L.top - 1;  /* protect stack below results */
        ldo.luaD_throw(L, TS.LUA_YIELD);
    }
};

module.exports.luaG_addinfo     = luaG_addinfo;
module.exports.luaG_concaterror = luaG_concaterror;
module.exports.luaG_errormsg    = luaG_errormsg;
module.exports.luaG_opinterror  = luaG_opinterror;
module.exports.luaG_ordererror  = luaG_ordererror;
module.exports.luaG_runerror    = luaG_runerror;
module.exports.luaG_tointerror  = luaG_tointerror;
module.exports.luaG_traceexec   = luaG_traceexec;
module.exports.luaG_typeerror   = luaG_typeerror;
module.exports.lua_gethook      = lua_gethook;
module.exports.lua_gethookcount = lua_gethookcount;
module.exports.lua_gethookmask  = lua_gethookmask;
module.exports.lua_getinfo      = lua_getinfo;
module.exports.lua_getlocal     = lua_getlocal;
module.exports.lua_getstack     = lua_getstack;
module.exports.lua_sethook      = lua_sethook;
module.exports.lua_setlocal     = lua_setlocal;
