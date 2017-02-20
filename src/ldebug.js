/*jshint esversion: 6 */
"use strict";

const assert = require('assert');

const lua     = require('./lua.js');
const ldo     = require('./ldo.js');
const lobject = require('./lobject.js');
const lstate  = require('./lstate.js');
const luaconf = require('./luaconf.js');
const OC      = require('./lopcodes.js');
const ltm     = require('./ltm.js');
const lfunc   = require('./lfunc.js');
const TMS     = ltm.TMS;
const TValue  = lobject.TValue;
const Table   = lobject.Table;
const CT      = lua.constant_types;
const TS      = lua.thread_status;

const currentline = function(ci) {
    return ci.func.p.lineinfo ? ci.func.p.lineinfo[ci.pcOff] : -1;
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
    if (s === null) return "?";
    return s;
};

const funcinfo = function(ar, cl) {
    if (cl === null || cl.type == CT.LUA_TCCL) {
        ar.source = "=[JS]";
        ar.linedefined = -1;
        ar.lastlinedefined = -1;
        ar.what = "J";
    } else {
        let p = cl.p;
        ar.source = p.source ? p.source : "=?";
        ar.linedefined = p.linedefined;
        ar.lastlinedefined = p.lastlinedefined;
        ar.what = ar.linedefined === 0 ? "main" : "Lua";
    }

    ar.short_src = lobject.luaO_chunkid(ar.source, luaconf.LUA_IDSIZE);
};

const collectvalidlines = function(L, f) {
    if (f === null || f.c.type == CT.LUA_TCCL) {
        L.stack[L.top++] = ldo.nil;
        assert(L.top <= L.ci.top, "stack overflow");
    } else {
        let lineinfo = f.l.p.lineinfo;
        let t = new Table();
        L.stack[L.top++] = t;
        assert(L.top <= L.ci.top, "stack overflow");
        let v = new TValue(true, CT.LUA_TBOOLEAN);
        for (let i = 0; i < f.l.p.length; i++)
            t.__newindex(t, lineinfo[i], v);
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
        r.name = "__gc";
        r.funcname = "metamethod";  /* report it as such */
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
        switch (what[0]) {
            case 'S': {
                funcinfo(ar, f);
                break;
            }
            case 'l': {
                ar.currentline = ci && ci.callstatus & lstate.CIST_LUA ? currentline(ci) : -1;
                break;
            }
            case 'u': {
                ar.nups = f === null ? 0 : f.c.nupvalues;
                if (f === null || f.c.type == CT.LUA_TCCL) {
                    ar.isvararg = true;
                    ar.nparams = 0;
                } else {
                    ar.isvararg = f.l.p.is_vararg;
                    ar.nparams = f.l.p.numparams;
                }
                break;
            }
            case 't': {
                ar.istailcall = ci ? ci.callstatus & lstate.CIST_TAIL : 0;
                break;
            }
            case 'n': {
                ar.namewhat = getfuncname(L, ci, ar.name);
                if (ar.namewhat === null) {
                    ar.namewhat = "";
                    ar.name = null;
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
    if (what[0] === '>') {
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

    cl = func.ttisclosure() ? func : null;
    status = auxgetinfo(L, what, ar, cl, ci);
    if (what.indexOf('f') >= 0) {
        L.stack[L.top++] = func;
        assert(L.top <= L.ci.top, "stack overflow");
    }

    swapextra(L);
    if (what.indexOf('L') >= 0)
        collectvalidlines(L, cl);

    return status;
};

const kname = function(p, pc, c) {
    let r = {
        name: null,
        funcname: null
    };

    if (OC.ISK(c)) {  /* is 'c' a constant? */
        let kvalue = p.k[OC.INDEXK(c)];
        if (kvalue.ttisstring()) {  /* literal constant? */
            r.name = kvalue.value;  /* it is its own name */
            return r;
        }
        /* else no reasonable name found */
    } else {  /* 'c' is a register */
        let what = getobjname(p, pc, c); /* search for 'c' */
        if (what && what.name[0] === 'c') {
            return what;
        }
        /* else no reasonable name found */
    }
    r.name = "?";
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
        let op = OC.OpCodes[i.opcode];
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
                if (OC.testAMode(i.opcode) && reg === a)
                    setreg= filterpc(pc, jmptarget);
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
        r.funcname = "local";
        return r;
    }

    /* else try symbolic execution */
    let pc = findsetreg(p, lastpc, reg);
    if (pc !== -1) {  /* could find instruction? */
        let i = p.code[pc];
        let op = OC.OpCodes[i.opcode];
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
                r.name = kname(p, pc, k);
                r.funcname = vn && vn === "_ENV" ? "global" : "field";
                return r;
            }
            case 'OP_GETUPVAL': {
                r.name = upvalname(p, i.B);
                r.funcname = "upvalue";
                return r;
            }
            case 'OP_LOADK':
            case 'OP_LOADKX': {
                let b = op === 'OP_LOADK' ? i.Bx : p.code[pc + 1].Ax;
                if (p.k[b].ttisstring()) {
                    r.name = p.k[b].value;
                    r.funcname = "constant";
                    return r;
                }
                break;
            }
            case 'OP_SELF': {
                let k = i.C;
                r.name = kname(p, pc, k);
                r.funcname = "method";
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
    let p = ci.func.p;  /* calling function */
    let pc = ci.pcOff;  /* calling instruction index */
    let i = p.code[pc];  /* calling instruction */

    if (ci.callstatus & lstate.CIST_HOOKED) {
        r.name = "?";
        r.funcname = "hook";
        return r;
    }

    switch (OC.OpCodes[i.opcode]) {
        case 'OP_CALL':
        case 'OP_TAILCALL':
            return getobjname(p, pc, i.A);  /* get function name */
        case 'OP_TFORCALL':
            r.name = "for iterator";
            r.funcname = "for iterator";
            return r;
        /* other instructions can do calls through metamethods */
        case 'OP_SELF':
        case 'OP_GETTABUP':
        case 'OP_GETTABLE':
            tm = TMS.TM_INDEX;
            break;
        case 'OP_SETTABUP':
        case 'OP_SETTABLE':
            tm = TMS.TM_NEWINDEX;
            break;
        case 'OP_ADD':    tm = TMS.OP_ADD;    break;
        case 'OP_SUB':    tm = TMS.OP_SUB;    break;
        case 'OP_MUL':    tm = TMS.OP_MUL;    break;
        case 'OP_MOD':    tm = TMS.OP_MOD;    break;
        case 'OP_POW':    tm = TMS.OP_POW;    break;
        case 'OP_DIV':    tm = TMS.OP_DIV;    break;
        case 'OP_IDIV':   tm = TMS.OP_IDI;    break;
        case 'OP_BAND':   tm = TMS.OP_BAN;    break;
        case 'OP_BOR':    tm = TMS.OP_BOR;    break;
        case 'OP_BXOR':   tm = TMS.OP_BXO;    break;
        case 'OP_SHL':    tm = TMS.OP_SHL;    break;
        case 'OP_SHR':    tm = TMS.OP_SHR;    break;
        case 'OP_UNM':    tm = TMS.TM_UNM;    break;
        case 'OP_BNOT':   tm = TMS.TM_BNOT;   break;
        case 'OP_LEN':    tm = TMS.TM_LEN;    break;
        case 'OP_CONCAT': tm = TMS.TM_CONCAT; break;
        case 'OP_EQ':     tm = TMS.TM_EQ;     break;
        case 'OP_LT':     tm = TMS.TM_LT;     break;
        case 'OP_LE':     tm = TMS.TM_LE;     break;
        default:
            return null;  /* cannot find a reasonable name */
    }

    r.name = L.l_G.tmname[tm];
    r.funcname = "metamethod";
    return r;
};

const luaG_errormsg = function(L) {
    if (L.errfunc !== 0) {  /* is there an error handling function? */
        let errfunc = L.errfunc;
        L.stack[L.top] = L.stack[L.top - 1];
        L.stack[L.top - 1] = errfunc;
        L.top++;
        ldo.luaD_callnoyield(L, L.top - 2, 1);
    }

    ldo.luaD_throw(L, TS.LUA_ERRRUN);
};

module.exports.lua_getstack   = lua_getstack;
module.exports.lua_getinfo    = lua_getinfo;
module.exports.luaG_errormsg  = luaG_errormsg;