/*jshint esversion: 6 */
"use strict";

const assert         = require('assert');

const BytecodeParser = require('./lundump.js');
const lapi           = require('./lapi.js');
const ldebug         = require('./ldebug.js');
const lfunc          = require('./lfunc.js');
const llex           = require('./llex.js');
const llimit         = require('./llimit.js');
const lobject        = require('./lobject.js');
const lparser        = require('./lparser.js');
const lstate         = require('./lstate.js');
const ltm            = require('./ltm.js');
const lua            = require('./lua.js');
const lvm            = require('./lvm.js');
const CT             = lua.constant_types;
const TS             = lua.thread_status;
const LUA_MULTRET    = lua.LUA_MULTRET;
const TValue         = lobject.TValue;

const nil            = new TValue(CT.LUA_TNIL, null);

const seterrorobj = function(L, errcode, oldtop) {
    switch (errcode) {
        case TS.LUA_ERRMEM: {
            L.stack[oldtop] = new TValue(CT.LUA_TLNGSTR, "not enough memory");
            break;
        }
        case TS.LUA_ERRERR: {
            L.stack[oldtop] = new TValue(CT.LUA_TLNGSTR, "error in error handling");
            break;
        }
        default: {
            L.stack[oldtop] = L.stack[L.top - 1];
        }
    }

    L.top = oldtop + 1;
};

/*
** Prepares a function call: checks the stack, creates a new CallInfo
** entry, fills in the relevant information, calls hook if needed.
** If function is a JS function, does the call, too. (Otherwise, leave
** the execution ('luaV_execute') to the caller, to allow stackless
** calls.) Returns true iff function has been executed (JS function).
*/
const luaD_precall = function(L, off, nresults) {
    let func = L.stack[off];
    let ci;

    switch(func.type) {
        case CT.LUA_TCCL:
        case CT.LUA_TLCF: {
            let f = func.type === CT.LUA_TCCL ? func.f : func.value;

            // next_ci
            if (L.ci.next) {
                L.ci = L.ci.next;
                ci = L.ci;
            } else {
                ci = new lstate.CallInfo(off);
                L.ci.next = ci;
                ci.previous = L.ci;
                ci.next = null;

                L.ci = ci;
                L.ciOff++;
            }

            ci.nresults = nresults;
            ci.func = func;
            ci.funcOff = off;
            ci.top = L.top + lua.LUA_MINSTACK;
            ci.callstatus = 0;
            // TODO: hook
            let n = f(L); /* do the actual call */

            assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
            
            luaD_poscall(L, ci, L.top - n, n);

            return true;
        }
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
                ci = new lstate.CallInfo(off);
                L.ci.next = ci;
                ci.previous = L.ci;
                ci.next = null;

                L.ci = ci;
                L.ciOff++;
            }
            ci.nresults = nresults;
            ci.func = func;
            ci.funcOff = off;
            ci.u.l.base = base;
            ci.top = base + fsize;
            L.top = ci.top;
            ci.u.l.savedpc = p.code;
            ci.pcOff = 0;
            ci.callstatus = lstate.CIST_LUA;

            return false;
        }
        default:
            tryfuncTM(L, off, func);
            return luaD_precall(L, off, nresults);
    }
};

const luaD_poscall = function(L, ci, firstResult, nres) {
    let wanted = ci.nresults;
    let res = ci.funcOff;
    L.ci = ci.previous;
    L.ciOff--;
    return moveresults(L, firstResult, res, nres, wanted);
};

const moveresults = function(L, firstResult, res, nres, wanted) {
    switch (wanted) {
        case 0:
            break;
        case 1: {
            if (nres === 0)
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
                for (i = 0; i < wanted; i++) {
                    L.stack[res + i] = L.stack[firstResult + i];
                }
            } else {
                for (i = 0; i < nres; i++)
                    L.stack[res + i] = L.stack[firstResult + i];
                for (; i < wanted; i++)
                    L.stack[res + i] = nil;
            }
            break;
        }
    }

    L.top = res + wanted; /* top points after the last result */
    return true;
};

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
};

const tryfuncTM = function(L, off, func) {
    let tm = ltm.luaT_gettmbyobj(L, func, ltm.TMS.TM_CALL);
    if (!tm.ttisfunction(tm))
        ldebug.luaG_typeerror(L, func, "call");
    /* Open a hole inside the stack at 'func' */
    for (let p = L.top; p > off; p--)
        L.stack[p] = L.stack[p-1];
    L.top++; /* slot ensured by caller */
    L.stack[off] = tm; /* tag method is the new function to be called */       
};

/*
** Check appropriate error for stack overflow ("regular" overflow or
** overflow while handling stack overflow). If 'nCalls' is larger than
** LUAI_MAXCCALLS (which means it is handling a "regular" overflow) but
** smaller than 9/8 of LUAI_MAXCCALLS, does not report an error (to
** allow overflow handling to work)
*/
const stackerror = function(L) {
    if (L.nCcalls === llimit.LUAI_MAXCCALLS)
        ldebug.luaG_runerror(L, "JS stack overflow");
    else if (L.nCcalls >= llimit.LUAI_MAXCCALLS + (llimit.LUAI_MAXCCALLS >> 3))
        luaD_throw(L, TS.LUA_ERRERR);  /* error while handing stack error */
};

/*
** Call a function (JS or Lua). The function to be called is at func.
** The arguments are on the stack, right after the function.
** When returns, all the results are on the stack, starting at the original
** function position.
*/
const luaD_call = function(L, off, nResults) {
    if (++L.nCcalls >= llimit.LUAI_MAXCCALLS)
        stackerror(L);
    if (!luaD_precall(L, off, nResults))
        lvm.luaV_execute(L);
    L.nCcalls--;
};

const luaD_throw = function(L, errcode) {
    if (L.errorJmp) {  /* thread has an error handler? */
        L.errorJmp.status = errcode;  /* set status */
        throw L.errorJmp;
    } else {  /* thread has no error handler */
        let g = L.l_G;
        L.status = errcode;  /* mark it as dead */
        if (g.mainthread.errorJmp) {  /* main thread has a handler? */
            g.mainthread.stack[g.mainthread.top++] = L.stack[L.top - 1];  /* copy error obj. */
            luaD_throw(g.mainthread, errcode);  /* re-throw in main thread */
        } else {  /* no handler at all; abort */
            if (g.panic) {  /* panic function? */
                seterrorobj(L, errcode, L.top);  /* assume EXTRA_STACK */
                if (L.ci.top < L.top)
                    L.ci.top = L.top;  /* pushing msg. can break this invariant */
                g.panic(L);  /* call panic function (last chance to jump out) */
            }
            throw new Error(`Aborted ${errcode}`);
        }
    }
};

const luaD_rawrunprotected = function(L, f, ud) {
    let oldnCcalls = L.nCcalls;
    let lj = { // TODO: necessary when using try/catch ? (ldo.c:47-52)
        status: TS.LUA_OK,
        previous: L.errorJmp /* chain new error handler */
    };
    L.errorJmp = lj;

    try {
        f(L, ud);
    } catch (e) {
        if (lj.status === 0) lj.status = -1;
    }

    L.errorJmp = lj.previous;
    L.nCcalls = oldnCcalls;

    return lj.status;

};

/*
** Completes the execution of an interrupted C function, calling its
** continuation function.
*/
const finishCcall = function(L, status) {
    let ci = L.ci;

    /* must have a continuation and must be able to call it */
    assert(ci.u.c.k !== null && L.nny === 0);
    /* error status can only happen in a protected call */
    assert(ci.callstatus & lstate.CIST_YPCALL || status === TS.LUA_YIELD);

    if (ci.callstatus & TS.CIST_YPCALL) {  /* was inside a pcall? */
        ci.callstatus &= ~TS.CIST_YPCALL;  /* continuation is also inside it */
        L.errfunc = ci.u.c.old_errfunc;  /* with the same error function */
    }

    /* finish 'lua_callk'/'lua_pcall'; CIST_YPCALL and 'errfunc' already
       handled */
    if (ci.nresults === LUA_MULTRET && L.ci.top < L.top) L.ci.top = L.top;
    let n = ci.u.c.k(L, status, ci.u.c.ctx);  /* call continuation function */
    assert(n < (L.top - L.ci.funcOff), "not enough elements in the stack");
    luaD_poscall(L, ci, L.top - n, n);  /* finish 'luaD_precall' */
};

/*
** Executes "full continuation" (everything in the stack) of a
** previously interrupted coroutine until the stack is empty (or another
** interruption long-jumps out of the loop). If the coroutine is
** recovering from an error, 'ud' points to the error status, which must
** be passed to the first continuation function (otherwise the default
** status is LUA_YIELD).
*/
const unroll = function(L, ud) {
    if (ud !== null)  /* error status? */
        finishCcall(L, ud);  /* finish 'lua_pcallk' callee */

    while (L.ci !== L.base_ci) {  /* something in the stack */
        if (!(L.ci.callstatus & lstate.CIST_LUA))  /* C function? */
            finishCcall(L, lstate.LUA_YIELD);  /* complete its execution */
        else {  /* Lua function */
            lvm.luaV_finishOp(L);  /* finish interrupted instruction */
            lvm.luaV_execute(L);  /* execute down to higher C 'boundary' */
        }
    }
};

/*
** Try to find a suspended protected call (a "recover point") for the
** given thread.
*/
const findpcall = function(L) {
    for (let ci = L.ci; ci !== null; ci = ci.previous) {  /* search for a pcall */
        if (ci.callstatus & lstate.CIST_YPCALL)
            return ci;
    }

    return null;  /* no pending pcall */
};

/*
** Recovers from an error in a coroutine. Finds a recover point (if
** there is one) and completes the execution of the interrupted
** 'luaD_pcall'. If there is no recover point, returns zero.
*/
const recover = function(L, status) {
    let ci = findpcall(L);
    if (ci === null) return 0;  /* no recovery point */
    /* "finish" luaD_pcall */
    let oldtop = L.stack[ci.extra];
    lfunc.luaF_close(L, oldtop);
    seterrorobj(L, status, oldtop);
    L.ci = ci;
    L.allowhook = ci.callstatus & lstate.CIST_OAH;  /* restore original 'allowhook' */
    L.nny = 0;  /* should be zero to be yieldable */
    L.errfunc = ci.u.c.old_errfunc;
    return 1;  /* continue running the coroutine */
};

/*
** Signal an error in the call to 'lua_resume', not in the execution
** of the coroutine itself. (Such errors should not be handled by any
** coroutine error handler and should not kill the coroutine.)
*/
const resume_error = function(L, msg, narg) {
    L.top -= narg;  /* remove args from the stack */
    L.stack[L.top++] = new TValue(CT.LUA_TLNGSTR, msg);  /* push error message */
    assert(L.top <= L.ci.top, "stack overflow");
    return TS.LUA_ERRRUN;
};

/*
** Do the work for 'lua_resume' in protected mode. Most of the work
** depends on the status of the coroutine: initial state, suspended
** inside a hook, or regularly suspended (optionally with a continuation
** function), plus erroneous cases: non-suspended coroutine or dead
** coroutine.
*/
const resume = function(L, n) {
    let firstArg = L.top - n;  /* first argument */
    let ci = L.ci;
    if (L.status === TS.LUA_OK) {  /* starting a coroutine? */
        if (!luaD_precall(L, firstArg - 1, lua.LUA_MULTRET))  /* Lua function? */
            lvm.luaV_execute(L);  /* call it */
    } else {  /* resuming from previous yield */
        assert(L.status === TS.LUA_YIELD);
        L.status = TS.LUA_OK;  /* mark that it is running (again) */
        ci.funcOff = ci.extra;
        ci.func = L.stack[ci.funcOff];

        if (ci.callstatus & lstate.CIST_LUA)  /* yielded inside a hook? */
            lvm.luaV_execute(L);  /* just continue running Lua code */
        else {  /* 'common' yield */
            if (ci.u.c.k !== null) {  /* does it have a continuation function? */
                n = ci.u.c.k(L, TS.LUA_YIELD, ci.u.c.ctx); /* call continuation */
                assert(n < (L.top - L.ci.funcOff), "not enough elements in the stack");
                firstArg = L.top - n;  /* yield results come from continuation */
            }

            luaD_poscall(L, ci, firstArg, n);  /* finish 'luaD_precall' */
        }

        unroll(L, null);  /* run continuation */
    }
};

const lua_resume = function(L, from, nargs) {
    let oldnny = L.nny;  /* save "number of non-yieldable" calls */

    if (L.status === TS.LUA_OK) {  /* may be starting a coroutine */
        if (L.ci !== L.base_ci)  /* not in base level? */
            return resume_error(L, "cannot resume non-suspended coroutine", nargs);
    } else if (L.status !== TS.LUA_YIELD)
        return resume_error(L, "cannot resume dead coroutine", nargs);

    L.nCcalls = from ? from.nCcalls + 1 : 1;
    if (L.nCcalls >= llimit.LUAI_MAXCCALLS)
        return resume_error(L, "JS stack overflow", nargs);

    L.nny = 0;  /* allow yields */

    assert((L.status === TS.LUA_OK ? nargs + 1: nargs) < (L.top - L.ci.funcOff),
        "not enough elements in the stack");

    let status = luaD_rawrunprotected(L, resume, nargs);
    if (status === -1)  /* error calling 'lua_resume'? */
        status = TS.LUA_ERRRUN;
    else {  /* continue running after recoverable errors */
        while (status > TS.LUA_YIELD && recover(L, status)) {
            /* unroll continuation */
            status = luaD_rawrunprotected(L, unroll, status);
        }

        if (status > TS.LUA_YIELD) {  /* unrecoverable error? */
            L.status = status;  /* mark thread as 'dead' */
            seterrorobj(L, status, L.top);  /* push error message */
            L.ci.top = L.top;
        } else
            assert(status === L.status);  /* normal end or yield */
    }

    L.nny = oldnny;  /* restore 'nny' */
    L.nCcalls--;
    assert(L.nCcalls === (from ? from.nCcalls : 0));
    return status;
};

const lua_isyieldable = function(L) {
    return L.nny === 0;
};

const lua_yieldk = function(L, nresults, ctx, k) {
    let ci = L.ci;
    assert(nresults < (L.top - L.ci.funcOff), "not enough elements in the stack");

    if (L.nny > 0) {
        if (L !== L.l_G.mainthread)
            ldebug.luaG_runerror(L, "attempt to yield across a JS-call boundary");
        else
            ldebug.luaG_runerror(L, "attempt to yield from outside a coroutine");
    }

    L.status = TS.LUA_YIELD;
    ci.extra = ci.funcOff;  /* save current 'func' */
    if (ci.callstatus & lstate.CIST_LUA)  /* inside a hook? */
        assert(k === null, "hooks cannot continue after yielding");
    else {
        ci.u.c.k = k;
        if (k !== null)  /* is there a continuation? */
            ci.u.c.ctx = ctx;  /* save context */
        ci.funcOff = L.top - nresults - 1;  /* protect stack below results */
        ci.func = L.stack[ci.funcOff];
        luaD_throw(L, TS.LUA_YIELD);
    }

    assert(ci.callstatus & lstate.CIST_HOOKED);  /* must be inside a hook */
    return 0;  /* return to 'luaD_hook' */
};

const lua_yield = function(L, n) {
    lua_yieldk(L, n, 0, null);
};

const luaD_pcall = function(L, func, u, old_top, ef) {
    let old_ci = L.ci;
    let old_allowhooks = L.allowhook;
    let old_nny = L.nny;
    let old_errfunc = L.errfunc;
    L.errfunc = ef;

    let status = luaD_rawrunprotected(L, func, u);

    if (status !== TS.LUA_OK) {
        lfunc.luaF_close(L, old_top);
        seterrorobj(L, status, old_top);
        L.ci = old_ci;
        L.allowhook = old_allowhooks;
        L.nny = old_nny;
    }

    L.errfunc = old_errfunc;

    return status;
};

/*
** Similar to 'luaD_call', but does not allow yields during the call
*/
const luaD_callnoyield = function(L, off, nResults) {
  L.nny++;
  luaD_call(L, off, nResults);
  L.nny--;
};

/*
** Execute a protected parser.
*/
class SParser {
    constructor() {  /* data to 'f_parser' */
        this.z = new llex.MBuffer();
        this.buff = new llex.MBuffer();  /* dynamic structure used by the scanner */
        this.dyd = new lparser.Dyndata();  /* dynamic structures used by the parser */
        this.mode = null;
        this.name = null;
    }
}

const checkmode = function(L, mode, x) {
    if (mode && mode !== x) {
        lapi.lua_pushstring(L, `attempt to load a ${x} chunk (mode is '${mode}')`);
        luaD_throw(L, TS.LUA_ERRSYNTAX);
    }
};

const f_parser = function(L, p) {
    let cl;
    let c = p.z.getc();  /* read first character */
    if (String.fromCharCode(c) === lua.LUA_SIGNATURE.charAt(0)) {
        checkmode(L, p.mode, "binary");
        cl = new BytecodeParser(p.z.buffer).luaU_undump(L);
    } else {
        checkmode(L, p.mode, "text");
        cl = lparser.luaY_parser(L, p.z, p.buff, p.dyd, p.name, c);
    }

    assert(cl.nupvalues === cl.p.upvalues.length);
    lfunc.luaF_initupvals(L, cl);
};

const luaD_protectedparser = function(L, z, name, mode) {
    let p = new SParser();
    L.nny++;  /* cannot yield during parsing */

    p.z = z;
    p.buff.L = L;
    p.name = name;
    p.mode = mode;
    p.dyd.actvar.arr = [];
    p.dyd.actvar.size = 0;
    p.dyd.gt.arr = [];
    p.dyd.gt.size = 0;
    p.dyd.label.arr = [];
    p.dyd.label.size = 0;

    let status = luaD_pcall(L, f_parser, p, L.top, L.errfunc);

    L.nny--;

    return status;
};

module.exports.SParser              = SParser;
module.exports.adjust_varargs       = adjust_varargs;
module.exports.luaD_call            = luaD_call;
module.exports.luaD_callnoyield     = luaD_callnoyield;
module.exports.luaD_pcall           = luaD_pcall;
module.exports.luaD_poscall         = luaD_poscall;
module.exports.luaD_precall         = luaD_precall;
module.exports.luaD_protectedparser = luaD_protectedparser;
module.exports.luaD_rawrunprotected = luaD_rawrunprotected;
module.exports.luaD_throw           = luaD_throw;
module.exports.lua_isyieldable      = lua_isyieldable;
module.exports.lua_resume           = lua_resume;
module.exports.lua_yield            = lua_yield;
module.exports.lua_yieldk           = lua_yieldk;
module.exports.moveresults          = moveresults;
module.exports.nil                  = nil;
module.exports.stackerror           = stackerror;
module.exports.tryfuncTM            = tryfuncTM;