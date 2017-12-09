"use strict";

const assert = require('assert');

const defs        = require('./defs.js');
const lopcodes    = require('./lopcodes.js');
const luaconf     = require('./luaconf.js');
const lobject     = require('./lobject.js');
const lfunc       = require('./lfunc.js');
const lstate      = require('./lstate.js');
const lstring     = require('./lstring.js');
const llimits     = require('./llimits.js');
const ldo         = require('./ldo.js');
const ltm         = require('./ltm.js');
const ltable      = require('./ltable.js');
const ldebug      = require('./ldebug.js');
const CT          = defs.constant_types;
const LUA_MULTRET = defs.LUA_MULTRET;

/*
** finish execution of an opcode interrupted by an yield
*/
const luaV_finishOp = function(L) {
    let ci = L.ci;
    let OCi = lopcodes.OpCodesI;
    let base = ci.l_base;
    let inst = ci.l_code[ci.l_savedpc - 1];  /* interrupted instruction */
    let op = inst.opcode;

    switch (op) {  /* finish its execution */
        case OCi.OP_ADD: case OCi.OP_SUB: case OCi.OP_MUL: case OCi.OP_DIV: case OCi.OP_IDIV:
        case OCi.OP_BAND: case OCi.OP_BOR: case OCi.OP_BXOR: case OCi.OP_SHL: case OCi.OP_SHR:
        case OCi.OP_MOD: case OCi.OP_POW:
        case OCi.OP_UNM: case OCi.OP_BNOT: case OCi.OP_LEN:
        case OCi.OP_GETTABUP: case OCi.OP_GETTABLE: case OCi.OP_SELF: {
            lobject.setobjs2s(L, base + inst.A, L.top-1);
            delete L.stack[--L.top];
            break;
        }
        case OCi.OP_LE: case OCi.OP_LT: case OCi.OP_EQ: {
            let res = !L.stack[L.top - 1].l_isfalse();
            delete L.stack[--L.top];
            if (ci.callstatus & lstate.CIST_LEQ) {  /* "<=" using "<" instead? */
                assert(op === OCi.OP_LE);
                ci.callstatus ^= lstate.CIST_LEQ;  /* clear mark */
                res = !res;  /* negate result */
            }
            assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_JMP);
            if (res !== (inst.A ? true : false))  /* condition failed? */
                ci.l_savedpc++;  /* skip jump instruction */
            break;
        }
        case OCi.OP_CONCAT: {
            let top = L.top - 1;  /* top when 'luaT_trybinTM' was called */
            let b = inst.B;  /* first element to concatenate */
            let total = top - 1 - (base + b);  /* yet to concatenate */
            lobject.setobjs2s(L, top - 2, top);  /* put TM result in proper position */
            if (total > 1) {  /* are there elements to concat? */
                L.top = top - 1;  /* top is one after last element (at top-2) */
                luaV_concat(L, total);  /* concat them (may yield again) */
            }
            /* move final result to final position */
            lobject.setobjs2s(L, ci.l_base + inst.A, L.top - 1);
            ldo.adjust_top(L, ci.top);  /* restore top */
            break;
        }
        case OCi.OP_TFORCALL: {
            assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_TFORLOOP);
            ldo.adjust_top(L, ci.top);  /* correct top */
            break;
        }
        case OCi.OP_CALL: {
            if (inst.C - 1 >= 0)  /* nresults >= 0? */
                ldo.adjust_top(L, ci.top);  /* adjust results */
            break;
        }
    }
};

const RA = function(L, base, i) {
    return base + i.A;
};

const RB = function(L, base, i) {
    return base + i.B;
};

// const RC = function(L, base, i) {
//     return base + i.C;
// };

const RKB = function(L, base, k, i) {
    return lopcodes.ISK(i.B) ? k[lopcodes.INDEXK(i.B)] : L.stack[base + i.B];
};

const RKC = function(L, base, k, i) {
    return lopcodes.ISK(i.C) ? k[lopcodes.INDEXK(i.C)] : L.stack[base + i.C];
};

const luaV_execute = function(L) {
    const OCi = lopcodes.OpCodesI;
    let ci = L.ci;

    ci.callstatus |= lstate.CIST_FRESH;
    newframe:
    for (;;) {
        assert(ci === L.ci);
        let cl = ci.func.value;
        let k = cl.p.k;
        let base = ci.l_base;

        let i = ci.l_code[ci.l_savedpc++];

        if (L.hookmask & (defs.LUA_MASKLINE | defs.LUA_MASKCOUNT)) {
            ldebug.luaG_traceexec(L);
        }

        let ra = RA(L, base, i);
        let opcode = i.opcode;

        switch (opcode) {
            case OCi.OP_MOVE: {
                lobject.setobjs2s(L, ra, RB(L, base, i));
                break;
            }
            case OCi.OP_LOADK: {
                let konst = k[i.Bx];
                lobject.setobj2s(L, ra, konst);
                break;
            }
            case OCi.OP_LOADKX: {
                assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_EXTRAARG);
                let konst = k[ci.l_code[ci.l_savedpc++].Ax];
                lobject.setobj2s(L, ra, konst);
                break;
            }
            case OCi.OP_LOADBOOL: {
                L.stack[ra].setbvalue(i.B !== 0);

                if (i.C !== 0)
                    ci.l_savedpc++; /* skip next instruction (if C) */

                break;
            }
            case OCi.OP_LOADNIL: {
                for (let j = 0; j <= i.B; j++)
                    L.stack[ra + j].setnilvalue();
                break;
            }
            case OCi.OP_GETUPVAL: {
                let b = i.B;
                lobject.setobj2s(L, ra, cl.upvals[b].v);
                break;
            }
            case OCi.OP_GETTABUP: {
                let upval = cl.upvals[i.B].v;
                let rc = RKC(L, base, k, i);
                luaV_gettable(L, upval, rc, ra);
                break;
            }
            case OCi.OP_GETTABLE: {
                let rb = L.stack[RB(L, base, i)];
                let rc = RKC(L, base, k, i);
                luaV_gettable(L, rb, rc, ra);
                break;
            }
            case OCi.OP_SETTABUP: {
                let upval = cl.upvals[i.A].v;
                let rb = RKB(L, base, k, i);
                let rc = RKC(L, base, k, i);
                settable(L, upval, rb, rc);
                break;
            }
            case OCi.OP_SETUPVAL: {
                let uv = cl.upvals[i.B];
                uv.v.setfrom(L.stack[ra]);
                break;
            }
            case OCi.OP_SETTABLE: {
                let table = L.stack[ra];
                let key = RKB(L, base, k, i);
                let v = RKC(L, base, k, i);

                settable(L, table, key, v);
                break;
            }
            case OCi.OP_NEWTABLE: {
                L.stack[ra].sethvalue(ltable.luaH_new(L));
                break;
            }
            case OCi.OP_SELF: {
                let rb = RB(L, base, i);
                let rc = RKC(L, base, k, i);
                lobject.setobjs2s(L, ra + 1, rb);
                luaV_gettable(L, L.stack[rb], rc, ra);
                break;
            }
            case OCi.OP_ADD: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra].setivalue((op1.value + op2.value)|0);
                } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                    L.stack[ra].setfltvalue(numberop1 + numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_ADD);
                }
                break;
            }
            case OCi.OP_SUB: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra].setivalue((op1.value - op2.value)|0);
                } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                    L.stack[ra].setfltvalue(numberop1 - numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_SUB);
                }
                break;
            }
            case OCi.OP_MUL: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra].setivalue(Math.imul(op1.value, op2.value));
                } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                    L.stack[ra].setfltvalue(numberop1 * numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_MUL);
                }
                break;
            }
            case OCi.OP_MOD: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra].setivalue(luaV_mod(L, op1.value, op2.value));
                } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                    L.stack[ra].setfltvalue(llimits.luai_nummod(L, numberop1, numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_MOD);
                }
                break;
            }
            case OCi.OP_POW: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                    L.stack[ra].setfltvalue(Math.pow(numberop1, numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_POW);
                }
                break;
            }
            case OCi.OP_DIV: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                    L.stack[ra].setfltvalue(numberop1 / numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_DIV);
                }
                break;
            }
            case OCi.OP_IDIV: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra].setivalue(luaV_div(L, op1.value, op2.value));
                } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                    L.stack[ra].setfltvalue(Math.floor(numberop1 / numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_IDIV);
                }
                break;
            }
            case OCi.OP_BAND: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                    L.stack[ra].setivalue(numberop1 & numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_BAND);
                }
                break;
            }
            case OCi.OP_BOR: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                    L.stack[ra].setivalue(numberop1 | numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_BOR);
                }
                break;
            }
            case OCi.OP_BXOR: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                    L.stack[ra].setivalue(numberop1 ^ numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_BXOR);
                }
                break;
            }
            case OCi.OP_SHL: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                    L.stack[ra].setivalue(luaV_shiftl(numberop1, numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_SHL);
                }
                break;
            }
            case OCi.OP_SHR: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1, numberop2;

                if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                    L.stack[ra].setivalue(luaV_shiftl(numberop1, -numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_SHR);
                }
                break;
            }
            case OCi.OP_UNM: {
                let op = L.stack[RB(L, base, i)];
                let numberop;

                if (op.ttisinteger()) {
                    L.stack[ra].setivalue((-op.value)|0);
                } else if ((numberop = tonumber(op)) !== false) {
                    L.stack[ra].setfltvalue(-numberop);
                } else {
                    ltm.luaT_trybinTM(L, op, op, L.stack[ra], ltm.TMS.TM_UNM);
                }
                break;
            }
            case OCi.OP_BNOT: {
                let op = L.stack[RB(L, base, i)];

                if (op.ttisinteger()) {
                    L.stack[ra].setivalue(~op.value);
                } else {
                    ltm.luaT_trybinTM(L, op, op, L.stack[ra], ltm.TMS.TM_BNOT);
                }
                break;
            }
            case OCi.OP_NOT: {
                let op = L.stack[RB(L, base, i)];
                L.stack[ra].setbvalue(op.l_isfalse());
                break;
            }
            case OCi.OP_LEN: {
                luaV_objlen(L, L.stack[ra], L.stack[RB(L, base, i)]);
                break;
            }
            case OCi.OP_CONCAT: {
                let b = i.B;
                let c = i.C;
                L.top = base + c + 1; /* mark the end of concat operands */
                luaV_concat(L, c - b + 1);
                let rb = base + b;
                lobject.setobjs2s(L, ra, rb);
                ldo.adjust_top(L, ci.top); /* restore top */
                break;
            }
            case OCi.OP_JMP: {
                dojump(L, ci, i, 0);
                break;
            }
            case OCi.OP_EQ: {
                if (luaV_equalobj(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.l_savedpc++;
                else
                    donextjump(L, ci);
                break;
            }
            case OCi.OP_LT: {
                if (luaV_lessthan(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.l_savedpc++;
                else
                    donextjump(L, ci);
                break;
            }
            case OCi.OP_LE: {
                if (luaV_lessequal(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.l_savedpc++;
                else
                    donextjump(L, ci);
                break;
            }
            case OCi.OP_TEST: {
                if (i.C ? L.stack[ra].l_isfalse() : !L.stack[ra].l_isfalse())
                    ci.l_savedpc++;
                else
                    donextjump(L, ci);
                break;
            }
            case OCi.OP_TESTSET: {
                let rbIdx = RB(L, base, i);
                let rb = L.stack[rbIdx];
                if (i.C ? rb.l_isfalse() : !rb.l_isfalse())
                    ci.l_savedpc++;
                else {
                    lobject.setobjs2s(L, ra, rbIdx);
                    donextjump(L, ci);
                }
                break;
            }
            case OCi.OP_CALL: {
                let b = i.B;
                let nresults = i.C - 1;
                if (b !== 0) ldo.adjust_top(L, ra+b);  /* else previous instruction set top */
                if (ldo.luaD_precall(L, ra, nresults)) {
                    if (nresults >= 0)
                        ldo.adjust_top(L, ci.top);  /* adjust results */
                } else {
                    ci = L.ci;
                    continue newframe;
                }

                break;
            }
            case OCi.OP_TAILCALL: {
                let b = i.B;
                if (b !== 0) ldo.adjust_top(L, ra+b);  /* else previous instruction set top */
                if (ldo.luaD_precall(L, ra, LUA_MULTRET)) { // JS function
                } else {
                    /* tail call: put called frame (n) in place of caller one (o) */
                    let nci = L.ci;
                    let oci = nci.previous;
                    let nfunc = nci.func;
                    let nfuncOff = nci.funcOff;
                    let ofuncOff = oci.funcOff;
                    let lim = nci.l_base + nfunc.value.p.numparams;
                    if (cl.p.p.length > 0) lfunc.luaF_close(L, oci.l_base);
                    for (let aux = 0; nfuncOff + aux < lim; aux++)
                        lobject.setobjs2s(L, ofuncOff + aux, nfuncOff + aux);
                    oci.l_base = ofuncOff + (nci.l_base - nfuncOff);
                    oci.top = ofuncOff + (L.top - nfuncOff);
                    ldo.adjust_top(L, oci.top);  /* correct top */
                    oci.l_code = nci.l_code;
                    oci.l_savedpc = nci.l_savedpc;
                    oci.callstatus |= lstate.CIST_TAIL;
                    oci.next = null;
                    ci = L.ci = oci;

                    assert(L.top === oci.l_base + L.stack[ofuncOff].value.p.maxstacksize);

                    continue newframe;
                }
                break;
            }
            case OCi.OP_RETURN: {
                if (cl.p.p.length > 0) lfunc.luaF_close(L, base);
                let b = ldo.luaD_poscall(L, ci, ra, (i.B !== 0 ? i.B - 1 : L.top - ra));

                if (ci.callstatus & lstate.CIST_FRESH)
                    return; /* external invocation: return */
                /* invocation via reentry: continue execution */
                ci = L.ci;
                if (b) ldo.adjust_top(L, ci.top);
                assert(ci.callstatus & lstate.CIST_LUA);
                assert(ci.l_code[ci.l_savedpc - 1].opcode === OCi.OP_CALL);
                continue newframe;
            }
            case OCi.OP_FORLOOP: {
                if (L.stack[ra].ttisinteger()) { /* integer loop? */
                    let step = L.stack[ra + 2].value;
                    let idx = (L.stack[ra].value + step)|0;
                    let limit = L.stack[ra + 1].value;

                    if (0 < step ? idx <= limit : limit <= idx) {
                        ci.l_savedpc += i.sBx;
                        L.stack[ra].chgivalue(idx);  /* update internal index... */
                        L.stack[ra + 3].setivalue(idx);
                    }
                } else { /* floating loop */
                    let step = L.stack[ra + 2].value;
                    let idx = L.stack[ra].value + step;
                    let limit = L.stack[ra + 1].value;

                    if (0 < step ? idx <= limit : limit <= idx) {
                        ci.l_savedpc += i.sBx;
                        L.stack[ra].chgfltvalue(idx);  /* update internal index... */
                        L.stack[ra + 3].setfltvalue(idx);
                    }
                }
                break;
            }
            case OCi.OP_FORPREP: {
                let init = L.stack[ra];
                let plimit = L.stack[ra + 1];
                let pstep = L.stack[ra + 2];
                let forlim;

                if (init.ttisinteger() && pstep.ttisinteger() && (forlim = forlimit(plimit, pstep.value))) {
                    /* all values are integer */
                    let initv = forlim.stopnow ? 0 : init.value;
                    plimit.value = forlim.ilimit;
                    init.value = (initv - pstep.value)|0;
                } else { /* try making all values floats */
                    let nlimit, nstep, ninit;
                    if ((nlimit = tonumber(plimit)) === false)
                        ldebug.luaG_runerror(L, defs.to_luastring("'for' limit must be a number", true));
                    L.stack[ra + 1].setfltvalue(nlimit);
                    if ((nstep = tonumber(pstep)) === false)
                        ldebug.luaG_runerror(L, defs.to_luastring("'for' step must be a number", true));
                    L.stack[ra + 2].setfltvalue(nstep);
                    if ((ninit = tonumber(init)) === false)
                        ldebug.luaG_runerror(L, defs.to_luastring("'for' initial value must be a number", true));
                    L.stack[ra].setfltvalue(ninit - nstep);
                }

                ci.l_savedpc += i.sBx;
                break;
            }
            case OCi.OP_TFORCALL: {
                let cb = ra + 3; /* call base */
                lobject.setobjs2s(L, cb+2, ra+2);
                lobject.setobjs2s(L, cb+1, ra+1);
                lobject.setobjs2s(L, cb, ra);
                ldo.adjust_top(L, cb+3);  /* func. + 2 args (state and index) */
                ldo.luaD_call(L, cb, i.C);
                ldo.adjust_top(L, ci.top);
                /* go straight to OP_TFORLOOP */
                i = ci.l_code[ci.l_savedpc++];
                ra = RA(L, base, i);
                assert(i.opcode === OCi.OP_TFORLOOP);
            }
            /* fall through */
            case OCi.OP_TFORLOOP: {
                if (!L.stack[ra + 1].ttisnil()) { /* continue loop? */
                    lobject.setobjs2s(L, ra, ra + 1); /* save control variable */
                    ci.l_savedpc += i.sBx; /* jump back */
                }
                break;
            }
            case OCi.OP_SETLIST: {
                let n = i.B;
                let c = i.C;

                if (n === 0) n = L.top - ra - 1;

                if (c === 0) {
                    assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_EXTRAARG);
                    c = ci.l_code[ci.l_savedpc++].Ax;
                }

                let h = L.stack[ra].value;
                let last = ((c - 1) * lopcodes.LFIELDS_PER_FLUSH) + n;

                for (; n > 0; n--) {
                    ltable.luaH_setint(h, last--, L.stack[ra + n]);
                }
                ldo.adjust_top(L, ci.top);  /* correct top (in case of previous open call) */
                break;
            }
            case OCi.OP_CLOSURE: {
                let p = cl.p.p[i.Bx];
                let ncl = getcached(p, cl.upvals, L.stack, base);  /* cached closure */
                if (ncl === null)  /* no match? */
                    pushclosure(L, p, cl.upvals, base, ra);  /* create a new one */
                else
                    L.stack[ra].setclLvalue(ncl);
                break;
            }
            case OCi.OP_VARARG: {
                let b = i.B - 1;
                let n = base - ci.funcOff - cl.p.numparams - 1;
                let j;

                if (n < 0) /* less arguments than parameters? */
                    n = 0; /* no vararg arguments */

                if (b < 0) {
                    b = n;  /* get all var. arguments */
                    ldo.luaD_checkstack(L, n);
                    ldo.adjust_top(L, ra + n);
                }

                for (j = 0; j < b && j < n; j++)
                    lobject.setobjs2s(L, ra + j, base - n + j);

                for (; j < b; j++) /* complete required results with nil */
                    L.stack[ra + j].setnilvalue();
                break;
            }
            case OCi.OP_EXTRAARG: {
                throw Error("invalid opcode");
            }
        }
    }
};

const dojump = function(L, ci, i, e) {
    let a = i.A;
    if (a !== 0) lfunc.luaF_close(L, ci.l_base + a - 1);
    ci.l_savedpc += i.sBx + e;
};

const donextjump = function(L, ci) {
    dojump(L, ci, ci.l_code[ci.l_savedpc], 1);
};


const luaV_lessthan = function(L, l, r) {
    if (l.ttisnumber() && r.ttisnumber())
        return LTnum(l, r) ? 1 : 0;
    else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l.tsvalue(), r.tsvalue()) < 0 ? 1 : 0;
    else {
        let res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LT);
        if (res === null)
            ldebug.luaG_ordererror(L, l, r);
        return res ? 1 : 0;
    }
};

const luaV_lessequal = function(L, l, r) {
    let res;

    if (l.ttisnumber() && r.ttisnumber())
        return LEnum(l, r) ? 1 : 0;
    else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l.tsvalue(), r.tsvalue()) <= 0 ? 1 : 0;
    else {
        res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LE);
        if (res !== null)
            return res ? 1 : 0;
    }
    /* try 'lt': */
    L.ci.callstatus |= lstate.CIST_LEQ; /* mark it is doing 'lt' for 'le' */
    res = ltm.luaT_callorderTM(L, r, l, ltm.TMS.TM_LT);
    L.ci.callstatus ^= lstate.CIST_LEQ; /* clear mark */
    if (res === null)
        ldebug.luaG_ordererror(L, l, r);
    return res ? 0 : 1; /* result is negated */
};

const luaV_equalobj = function(L, t1, t2) {
    if (t1.ttype() !== t2.ttype()) { /* not the same variant? */
        if (t1.ttnov() !== t2.ttnov() || t1.ttnov() !== CT.LUA_TNUMBER)
            return 0; /* only numbers can be equal with different variants */
        else { /* two numbers with different variants */
            /* OPTIMIZATION: instead of calling luaV_tointeger we can just let JS do the comparison */
            return (t1.value === t2.value) ? 1 : 0;
        }
    }

    let tm;

    /* values have same type and same variant */
    switch(t1.ttype()) {
        case CT.LUA_TNIL:
            return 1;
        case CT.LUA_TBOOLEAN:
            return t1.value == t2.value ? 1 : 0; // Might be 1 or true
        case CT.LUA_TLIGHTUSERDATA:
        case CT.LUA_TNUMINT:
        case CT.LUA_TNUMFLT:
        case CT.LUA_TLCF:
            return t1.value === t2.value ? 1 : 0;
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR: {
            return lstring.luaS_eqlngstr(t1.tsvalue(), t2.tsvalue()) ? 1 : 0;
        }
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE:
            if (t1.value === t2.value) return 1;
            else if (L === null) return 0;

            tm = ltm.fasttm(L, t1.value.metatable, ltm.TMS.TM_EQ);
            if (tm === null)
                tm = ltm.fasttm(L, t2.value.metatable, ltm.TMS.TM_EQ);
            break;
        default:
            return t1.value === t2.value ? 1 : 0;
    }

    if (tm === null) /* no TM? */
        return 0;

    let tv = new lobject.TValue(); /* doesn't use the stack */
    ltm.luaT_callTM(L, tm, t1, t2, tv, 1);
    return tv.l_isfalse() ? 0 : 1;
};

const luaV_rawequalobj = function(t1, t2) {
    return luaV_equalobj(null, t1, t2);
};

const forlimit = function(obj, step) {
    let stopnow = false;
    let ilimit = luaV_tointeger(obj, step < 0 ? 2 : 1);
    if (ilimit === false) {
        let n = tonumber(obj);
        if (n === false)
            return false;

        if (0 < n) {
            ilimit = luaconf.LUA_MAXINTEGER;
            if (step < 0) stopnow = true;
        } else {
            ilimit = luaconf.LUA_MININTEGER;
            if (step >= 0) stopnow = true;
        }
    }

    return {
        stopnow: stopnow,
        ilimit: ilimit
    };
};

/*
** try to convert a value to an integer, rounding according to 'mode':
** mode === 0: accepts only integral values
** mode === 1: takes the floor of the number
** mode === 2: takes the ceil of the number
*/
const luaV_tointeger = function(obj, mode) {
    if (obj.ttisfloat()) {
        let n = obj.value;
        let f = Math.floor(n);

        if (n !== f) { /* not an integral value? */
            if (mode === 0)
                return false;  /* fails if mode demands integral value */
            else if (mode > 1)  /* needs ceil? */
                f += 1;  /* convert floor to ceil (remember: n !== f) */
        }

        return luaconf.lua_numbertointeger(f);
    } else if (obj.ttisinteger()) {
        return obj.value;
    } else if (cvt2num(obj)) {
        let v = lobject.luaO_str2num(obj.svalue());
        if (v !== false)
            return luaV_tointeger(v, mode);
    }

    return false;
};

const tointeger = function(o) {
    return o.ttisinteger() ? o.value : luaV_tointeger(o, 0);
};

const tonumber = function(o) {
    if (o.ttnov() === CT.LUA_TNUMBER)
        return o.value;

    if (cvt2num(o)) { /* string convertible to number? */
        let v = lobject.luaO_str2num(o.svalue());
        if (v !== false)
            return v.value;
    }

    return false;
};

/*
** Return 'l < r', for numbers.
** As fengari uses javascript numbers for both floats and integers and has
** correct semantics, we can just compare values.
*/
const LTnum = function(l, r) {
    return l.value < r.value;
};

/*
** Return 'l <= r', for numbers.
*/
const LEnum = function(l, r) {
    return l.value <= r.value;
};

/*
** Compare two strings 'ls' x 'rs', returning an integer smaller-equal-
** -larger than zero if 'ls' is smaller-equal-larger than 'rs'.
*/
const l_strcmp = function(ls, rs) {
    let l = lstring.luaS_hashlongstr(ls);
    let r = lstring.luaS_hashlongstr(rs);
    /* In fengari we assume string hash has same collation as byte values */
    if (l === r)
        return 0;
    else if (l < r)
        return -1;
    else
        return 1;
};

/*
** Main operation 'ra' = #rb'.
*/
const luaV_objlen = function(L, ra, rb) {
    let tm;
    switch(rb.ttype()) {
        case CT.LUA_TTABLE: {
            let h = rb.value;
            tm = ltm.fasttm(L, h.metatable, ltm.TMS.TM_LEN);
            if (tm !== null) break; /* metamethod? break switch to call it */
            ra.setivalue(ltable.luaH_getn(h)); /* else primitive len */
            return;
        }
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            ra.setivalue(rb.vslen());
            return;
        default: {
            tm = ltm.luaT_gettmbyobj(L, rb, ltm.TMS.TM_LEN);
            if (tm.ttisnil())
                ldebug.luaG_typeerror(L, rb, defs.to_luastring("get length of", true));
            break;
        }
    }

    ltm.luaT_callTM(L, tm, rb, rb, ra, 1);
};

const luaV_div = function(L, m, n) {
    if (n === 0)
        ldebug.luaG_runerror(L, defs.to_luastring("attempt to divide by zero"));
    return Math.floor(m / n)|0;
};

// % semantic on negative numbers is different in js
const luaV_mod = function(L, m, n) {
    if (n === 0)
        ldebug.luaG_runerror(L, defs.to_luastring("attempt to perform 'n%%0'"));
    return (m - Math.floor(m / n) * n)|0;
};

const NBITS = 32;

const luaV_shiftl = function(x, y) {
    if (y < 0) {  /* shift right? */
        if (y <= -NBITS) return 0;
        else return x >>> -y;
    }
    else {  /* shift left */
        if (y >= NBITS) return 0;
        else return x << y;
    }
};

/*
** check whether cached closure in prototype 'p' may be reused, that is,
** whether there is a cached closure with the same upvalues needed by
** new closure to be created.
*/
const getcached = function(p, encup, stack, base) {
    let c = p.cache;
    if (c !== null) {  /* is there a cached closure? */
        let uv = p.upvalues;
        let nup = uv.length;
        for (let i = 0; i < nup; i++) {  /* check whether it has right upvalues */
            let v = uv[i].instack ? stack[base + uv[i].idx] : encup[uv[i].idx].v;
            if (c.upvals[i].v !== v)
                return null;  /* wrong upvalue; cannot reuse closure */
        }
    }
    return c;  /* return cached closure (or NULL if no cached closure) */
};

/*
** create a new Lua closure, push it in the stack, and initialize
** its upvalues.
*/
const pushclosure = function(L, p, encup, base, ra) {
    let nup = p.upvalues.length;
    let uv = p.upvalues;
    let ncl = new lobject.LClosure(L, nup);
    ncl.p = p;
    L.stack[ra].setclLvalue(ncl);
    for (let i = 0; i < nup; i++) {
        if (uv[i].instack)
            ncl.upvals[i] = lfunc.luaF_findupval(L, base + uv[i].idx);
        else
            ncl.upvals[i] = encup[uv[i].idx];
        ncl.upvals[i].refcount++;
    }
    p.cache = ncl;  /* save it on cache for reuse */
};

const cvt2str = function(o) {
    return o.ttisnumber();
};

const cvt2num = function(o) {
    return o.ttisstring();
};

const tostring = function(L, i) {
    let o = L.stack[i];

    if (o.ttisstring()) return true;

    if (cvt2str(o)) {
        lobject.luaO_tostring(L, o);
        return true;
    }

    return false;
};

const isemptystr = function(o) {
    return o.ttisstring() && o.vslen() === 0;
};

/*
** Main operation for concatenation: concat 'total' values in the stack,
** from 'L->top - total' up to 'L->top - 1'.
*/
const luaV_concat = function(L, total) {
    assert(total >= 2);
    do {
        let top = L.top;
        let n = 2; /* number of elements handled in this pass (at least 2) */

        if (!(L.stack[top-2].ttisstring() || cvt2str(L.stack[top-2])) || !tostring(L, top - 1)) {
            ltm.luaT_trybinTM(L, L.stack[top-2], L.stack[top-1], L.stack[top-2], ltm.TMS.TM_CONCAT);
        } else if (isemptystr(L.stack[top-1])) {
            tostring(L, top - 2);
        } else if (isemptystr(L.stack[top-2])) {
            lobject.setobjs2s(L, top - 2, top - 1);
        } else {
            /* at least two non-empty string values; get as many as possible */
            let toconcat = new Array(total);
            toconcat[total-1] = L.stack[top-1].svalue();
            for (n = 1; n < total; n++) {
                if (!tostring(L, top - n - 1)) {
                    toconcat = toconcat.slice(total-n);
                    break;
                }
                toconcat[total-n-1] = L.stack[top - n - 1].svalue();
            }
            let ts = lstring.luaS_bless(L, Array.prototype.concat.apply([], toconcat));
            lobject.setsvalue2s(L, top - n, ts);
        }
        total -= n - 1; /* got 'n' strings to create 1 new */
        /* popped 'n' strings and pushed one */
        for (; L.top > top-(n-1);)
            delete L.stack[--L.top];
    } while (total > 1); /* repeat until only 1 result left */
};

const MAXTAGLOOP = 2000;

const luaV_gettable = function(L, t, key, ra) {
    for (let loop = 0; loop < MAXTAGLOOP; loop++) {
        let tm;

        if (!t.ttistable()) {
            tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_INDEX);
            if (tm.ttisnil())
                ldebug.luaG_typeerror(L, t, defs.to_luastring('index', true)); /* no metamethod */
            /* else will try the metamethod */
        } else {
            let slot = ltable.luaH_get(L, t.value, key);
            if (!slot.ttisnil()) {
                lobject.setobj2s(L, ra, slot);
                return;
            } else { /* 't' is a table */
                tm = ltm.fasttm(L, t.value.metatable, ltm.TMS.TM_INDEX);  /* table's metamethod */
                if (tm === null) { /* no metamethod? */
                    L.stack[ra].setnilvalue(); /* result is nil */
                    return;
                }
            }
            /* else will try the metamethod */
        }
        if (tm.ttisfunction()) { /* is metamethod a function? */
            ltm.luaT_callTM(L, tm, t, key, L.stack[ra], 1); /* call it */
            return;
        }
        t = tm;  /* else try to access 'tm[key]' */
    }

    ldebug.luaG_runerror(L, defs.to_luastring("'__index' chain too long; possible loop", true));
};

const settable = function(L, t, key, val) {
    for (let loop = 0; loop < MAXTAGLOOP; loop++) {
        let tm;
        if (t.ttistable()) {
            let h = t.value; /* save 't' table */
            let slot = ltable.luaH_set(L, h, key);
            if (!slot.ttisnil() || (tm = ltm.fasttm(L, h.metatable, ltm.TMS.TM_NEWINDEX)) === null) {
                if (val.ttisnil())
                    ltable.luaH_delete(L, h, key);
                else
                    slot.setfrom(val);
                ltable.invalidateTMcache(h);
                return;
            }
            /* else will try the metamethod */
        } else { /* not a table; check metamethod */
            if ((tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_NEWINDEX)).ttisnil())
                ldebug.luaG_typeerror(L, t, defs.to_luastring('index', true));
        }
        /* try the metamethod */
        if (tm.ttisfunction()) {
            ltm.luaT_callTM(L, tm, t, key, val, 0);
            return;
        }
        t = tm;  /* else repeat assignment over 'tm' */
    }

    ldebug.luaG_runerror(L, defs.to_luastring("'__newindex' chain too long; possible loop", true));
};


module.exports.cvt2str          = cvt2str;
module.exports.cvt2num          = cvt2num;
module.exports.luaV_gettable    = luaV_gettable;
module.exports.luaV_concat      = luaV_concat;
module.exports.luaV_div         = luaV_div;
module.exports.luaV_equalobj    = luaV_equalobj;
module.exports.luaV_execute     = luaV_execute;
module.exports.luaV_finishOp    = luaV_finishOp;
module.exports.luaV_lessequal   = luaV_lessequal;
module.exports.luaV_lessthan    = luaV_lessthan;
module.exports.luaV_mod         = luaV_mod;
module.exports.luaV_objlen      = luaV_objlen;
module.exports.luaV_rawequalobj = luaV_rawequalobj;
module.exports.luaV_shiftl      = luaV_shiftl;
module.exports.luaV_tointeger   = luaV_tointeger;
module.exports.settable         = settable;
module.exports.tointeger        = tointeger;
module.exports.tonumber         = tonumber;
