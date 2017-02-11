/*jshint esversion: 6 */
"use strict";

const OC             = require('./lopcodes.js');
const lua            = require('./lua.js');
const CT             = lua.constant_types;
const LUA_MULTRET    = lua.LUA_MULTRET;
const lobject        = require('./lobject.js');
const TValue         = lobject.TValue;
const Table          = lobject.Table;
const LClosure       = lobject.LClosure;
const lfunc          = require('./lfunc.js');
const UpVal          = lfunc.UpVal;
const lstate         = require('./lstate.js');
const CallInfo       = lstate.CallInfo;
const llimit         = require('./llimit.js');

const nil            = new TValue(CT.LUA_TNIL, null);

const precall = function(L, off, func, nresults) {
    let ci;

    switch(func.type) {
        case CT.LUA_TCCL: // JS function ?
            throw new Error("LUA_TCCL not implemeted yet");
            break;
        case CT.LUA_TLCF: // still JS function ?
            throw new Error("LUA_TLCF not implemeted yet");
            break;
        case CT.LUA_TLCL: {
            let p = func.p;
            let n = L.top - off - 1;
            let fsize = p.maxstacksize;
            let base;

            if (p.is_vararg) {
                base = adjust_varargs(L, p, n);
            } else {
                for (; n < p.numparams; n++)
                    L.stack[L.top++] = nil; // complete missing arguments
                base = off + 1;
            }

            // next_ci
            if (L.ci.next) {
                L.ci = L.ci.next;
                ci = L.ci;
            } else {
                ci = new CallInfo(off);
                L.ci.next = ci;
                ci.previous = L.ci;
                ci.next = null;

                L.ci = ci;
                L.ciOff++;
            }
            ci.nresults = nresults;
            ci.func = func;
            ci.u.l.base = base;
            ci.top = base + fsize;
            L.top = ci.top;
            ci.u.l.savedpc = p.code;
            ci.callstatus = lstate.CIST_LUA;

            return false;
            break;
        }
        default:
            // __call
            return false;
    }
}

const postcall = function(L, ci, firstResult, nres) {
    let wanted = ci.nresults;
    let res = ci.funcOff;
    L.ci = ci.previous;
    L.ciOff--;
    return moveresults(L, firstResult, res, nres, wanted);
}

const moveresults = function(L, firstResult, res, nres, wanted) {
    switch (wanted) {
        case 0:
            break;
        case 1: {
            if (nres == 0)
                firstResult = nil;
            L.stack[res] = L.stack[firstResult];
            break;
        }
        case LUA_MULTRET: {
            for (let i = 0; i < nres; i++)
                L.stack[res + i] = L.stack[firstResult + i];
            L.top = res + nres;
            return false;
        }
        default: {
            let i;
            if (wanted <= nres) {
                for (i = 0; i < wanted; i++)
                    L.stack[res + i] = L.stack[firstResult + i];
                for (; i < wanted; i++)
                    L.stack[res + i] = nil;
            }
            break;
        }
    }

    return true;
}

const adjust_varargs = function(L, p, actual) {
    let nfixargs = p.numparams;
    /* move fixed parameters to final position */
    let fixed = L.top - actual; /* first fixed argument */
    let base = L.top; /* final position of first argument */

    let i;
    for (i = 0; i < nfixargs && i < actual; i++) {
        L.stack[L.top++] = L.stack[fixed + i];
        L.stack[fixed + i] = nil;
    }

    for (; i < nfixargs; i++)
        L.stack[L.top++] = nil;

    return base;
}


/*
** Check appropriate error for stack overflow ("regular" overflow or
** overflow while handling stack overflow). If 'nCalls' is larger than
** LUAI_MAXCCALLS (which means it is handling a "regular" overflow) but
** smaller than 9/8 of LUAI_MAXCCALLS, does not report an error (to
** allow overflow handling to work)
*/
const stackerror = function(L) {
    if (L.nCcalls === LUAI_MAXCCALLS)
        throw new Error("JS stack overflow");
    else if (L.nCcalls >= (LUAI_MAXCCALLS + (LUAI_MAXCCALLS>>3))) /* error while handing stack error */
        throw new Error("stack overflow") // TODO: luaD_throw(L, LUA_ERRERR);
}

/*
** Call a function (JS or Lua). The function to be called is at func.
** The arguments are on the stack, right after the function.
** When returns, all the results are on the stack, starting at the original
** function position.
*/
// const luaD_call = function(L, func, nResults) {
//     if (++L->nCcalls >= LUAI_MAXCCALLS)
//         stackerror(L);
//     if ()
// }

module.exports = {
    precall:        precall,
    postcall:       postcall,
    moveresults:    moveresults,
    adjust_varargs: adjust_varargs
}