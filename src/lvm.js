/*jshint esversion: 6 */
"use strict";

const assert         = require('assert');

const defs        = require('./defs.js');
const lopcodes    = require('./lopcodes.js');
const luaconf     = require('./luaconf.js');
const lobject     = require('./lobject.js');
const lfunc       = require('./lfunc.js');
const lstate      = require('./lstate.js');
const lstring     = require('./lstring.js');
const llimit      = require('./llimit.js');
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
    let inst = ci.l_savedpc[ci.pcOff - 1];  /* interrupted instruction */
    let op = inst.opcode;

    switch (op) {  /* finish its execution */
        case OCi.OP_ADD: case OCi.OP_SUB: case OCi.OP_MUL: case OCi.OP_DIV: case OCi.OP_IDIV:
        case OCi.OP_BAND: case OCi.OP_BOR: case OCi.OP_BXOR: case OCi.OP_SHL: case OCi.OP_SHR:
        case OCi.OP_MOD: case OCi.OP_POW:
        case OCi.OP_UNM: case OCi.OP_BNOT: case OCi.OP_LEN:
        case OCi.OP_GETTABUP: case OCi.OP_GETTABLE: case OCi.OP_SELF: {
            L.stack[base + inst.A] = L.stack[--L.top];
            break;
        }
        case OCi.OP_LE: case OCi.OP_LT: case OCi.OP_EQ: {
            let res = !L.stack[L.top - 1].l_isfalse();
            L.top--;
            if (ci.callstatus & lstate.CIST_LEQ) {  /* "<=" using "<" instead? */
                assert(op === OCi.OP_LE);
                ci.callstatus ^= lstate.CIST_LEQ;  /* clear mark */
                res = res !== 1 ? 1 : 0;  /* negate result */
            }
            assert(ci.l_savedpc[ci.pcOff] === OCi.OP_JMP);
            if (res !== inst.A)  /* condition failed? */
                ci.pcOff++;  /* skip jump instruction */
            break;
        }
        case OCi.OP_CONCAT: {
            let top = L.top - 1;  /* top when 'luaT_trybinTM' was called */
            let b = inst.B;  /* first element to concatenate */
            let total = top - 1 - (base + b);  /* yet to concatenate */
            L.stack[L.top - 2] = L.stack[top];  /* put TM result in proper position */
            if (total > 1) {  /* are there elements to concat? */
                L.top = top - 1;  /* top is one after last element (at top-2) */
                luaV_concat(L, total);  /* concat them (may yield again) */
            }

            /* move final result to final position */
            L.stack[ci.l_base + inst.A] = L.stack[L.top - 1];
            L.top = ci.top;  /* restore top */
            break;
        }
        case OCi.OP_TFORCALL: {
            assert(ci.l_savedpc[ci.pcOff] === OCi.OP_TFORLOOP);
            L.top = ci.top;  /* correct top */
            break;
        }
        case OCi.OP_CALL: {
            if (inst.C - 1 >= 0)  /* nresults >= 0? */
                L.top = ci.top;  /* adjust results */
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

const RC = function(L, base, i) {
   return base + i.C;
};

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

        let i = ci.l_savedpc[ci.pcOff++];

        if (L.hookmask & (defs.LUA_MASKLINE | defs.LUA_MASKCOUNT)) {
            ldebug.luaG_traceexec(L);
            base = ci.l_base;
        }

        let ra = RA(L, base, i);
        let opcode = i.opcode;

        switch (opcode) {
            case OCi.OP_MOVE: {
                L.stack[ra] = L.stack[RB(L, base, i)];
                break;
            }
            case OCi.OP_LOADK: {
                let konst = k[i.Bx];
                L.stack[ra] = new lobject.TValue(konst.type, konst.value);
                break;
            }
            case OCi.OP_LOADKX: {
                assert(ci.l_savedpc[ci.pcOff].opcode === OCi.OP_EXTRAARG);
                let konst = k[ci.l_savedpc[ci.pcOff++].Ax];
                L.stack[ra] = new lobject.TValue(konst.type, konst.value);
                break;
            }
            case OCi.OP_LOADBOOL: {
                L.stack[ra] = new lobject.TValue(CT.LUA_TBOOLEAN, i.B !== 0);

                if (i.C !== 0)
                    ci.pcOff++; /* skip next instruction (if C) */

                break;
            }
            case OCi.OP_LOADNIL: {
                for (let j = 0; j <= i.B; j++)
                    L.stack[ra + j] = new lobject.TValue(CT.LUA_TNIL, null);
                break;
            }
            case OCi.OP_GETUPVAL: {
                let o = cl.upvals[i.B].val();
                L.stack[ra] = new lobject.TValue(o.type, o.value);
                break;
            }
            case OCi.OP_SETUPVAL: {
                let uv = cl.upvals[i.B];
                if (uv.v !== null) {
                    uv.L.stack[uv.v] = L.stack[ra];
                } else {
                    uv.value.setfrom(L.stack[ra]);
                }
                break;
            }
            case OCi.OP_GETTABUP: {
                let table = cl.upvals[i.B].val();
                let key = RKC(L, base, k, i);

                gettable(L, table, key, ra);
                base = ci.l_base;
                break;
            }
            case OCi.OP_SETTABUP: {
                let table = cl.upvals[i.A].val();
                let key = RKB(L, base, k, i);
                let v = RKC(L, base, k, i);

                settable(L, table, key, v);
                base = ci.l_base;

                break;
            }
            case OCi.OP_GETTABLE: {
                let table = RKB(L, base, k, i);
                let key = RKC(L, base, k, i);

                gettable(L, table, key, ra);
                base = ci.l_base;
                break;
            }
            case OCi.OP_SETTABLE: {
                let table = L.stack[ra];
                let key = RKB(L, base, k, i);
                let v = RKC(L, base, k, i);

                settable(L, table, key, v);
                base = ci.l_base;

                break;
            }
            case OCi.OP_NEWTABLE: {
                L.stack[ra] = new lobject.TValue(CT.LUA_TTABLE, ltable.luaH_new(L));
                break;
            }
            case OCi.OP_SELF: {
                let table = L.stack[RB(L, base, i)];
                let key = RKC(L, base, k, i);

                L.stack[ra + 1] = table;

                gettable(L, table, key, ra);
                base = ci.l_base;

                break;
            }
            case OCi.OP_ADD: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (op1.value + op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, numberop1 + numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_ADD);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_SUB: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (op1.value - op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, numberop1 - numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_SUB);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_MUL: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (op1.value * op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, numberop1 * numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_MUL);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_MOD: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (op1.value - Math.floor(op1.value / op2.value) * op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, (numberop1 - Math.floor(numberop1 / numberop2) * numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_MOD);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_POW: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, Math.pow(numberop1, numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_POW);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_DIV: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, numberop1 / numberop2);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_DIV);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_IDIV: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, Math.floor(op1.value / op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, Math.floor(numberop1 / numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_IDIV);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_BAND: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tointeger(op1);
                let numberop2 = tointeger(op2);

                if (numberop1 !== false && numberop2) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (numberop1 & numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_BAND);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_BOR: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tointeger(op1);
                let numberop2 = tointeger(op2);

                if (numberop1 !== false && numberop2) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (numberop1 | numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_BOR);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_BXOR: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tointeger(op1);
                let numberop2 = tointeger(op2);

                if (numberop1 !== false && numberop2) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (numberop1 ^ numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_BXOR);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_SHL: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tointeger(op1);
                let numberop2 = tointeger(op2);

                if (numberop1 !== false && numberop2) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (numberop1 << numberop2)); // TODO: luaV_shiftl ?
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_SHL);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_SHR: {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tointeger(op1);
                let numberop2 = tointeger(op2);

                if (numberop1 !== false && numberop2) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, (numberop1 >> numberop2));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_SHR);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_UNM: {
                let op = L.stack[RB(L, base, i)];
                let numberop = tonumber(op);

                if (op.ttisinteger()) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, -op.value);
                } else if (numberop !== false) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMFLT, -numberop);
                } else {
                    ltm.luaT_trybinTM(L, op, op, ra, ltm.TMS.TM_UNM);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_BNOT: {
                let op = L.stack[RB(L, base, i)];
                let numberop = tonumber(op);

                if (op.ttisinteger()) {
                    L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, ~op.value);
                } else {
                    ltm.luaT_trybinTM(L, op, op, ra, ltm.TMS.TM_BNOT);
                    base = ci.l_base;
                }
                break;
            }
            case OCi.OP_NOT: {
                let op = L.stack[RB(L, base, i)];
                L.stack[ra] = new lobject.TValue(CT.LUA_TBOOLEAN, op.l_isfalse());
                break;
            }
            case OCi.OP_LEN: {
                luaV_objlen(L, ra, L.stack[RB(L, base, i)]);
                base = ci.l_base;
                break;
            }
            case OCi.OP_CONCAT: {
                let b = i.B;
                let c = i.C;
                let rb;
                L.top = base + c + 1; /* mark the end of concat operands */
                luaV_concat(L, c - b + 1);
                base = ci.l_base;
                ra = RA(L, base, i); /* 'luaV_concat' may invoke TMs and move the stack */
                rb = base + b;
                L.stack[ra] = L.stack[rb];
                L.top = ci.top; /* restore top */
                break;
            }
            case OCi.OP_JMP: {
                dojump(L, ci, i, 0);
                break;
            }
            case OCi.OP_EQ: {
                if (luaV_equalobj(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.l_base;
                break;
            }
            case OCi.OP_LT: {
                if (luaV_lessthan(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.l_base;
                break;
            }
            case OCi.OP_LE: {
                if (luaV_lessequal(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.l_base;
                break;
            }
            case OCi.OP_TEST: {
                if (i.C ? L.stack[ra].l_isfalse() : !L.stack[ra].l_isfalse())
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                break;
            }
            case OCi.OP_TESTSET: {
                let rb = L.stack[RB(L, base, i)];
                if (i.C ? rb.l_isfalse() : !rb.l_isfalse())
                    ci.pcOff++;
                else {
                    L.stack[ra] = rb;
                    donextjump(L, ci);
                }
                break;
            }
            case OCi.OP_CALL: {
                let b = i.B;
                let nresults = i.C - 1;

                if (b !== 0)
                    L.top = ra+b;

                if (ldo.luaD_precall(L, ra, nresults)) {
                    if (nresults >= 0)
                        L.top = ci.top;
                    base = ci.l_base;
                } else {
                    ci = L.ci;
                    continue newframe;
                }

                break;
            }
            case OCi.OP_TAILCALL: {
                if (i.B !== 0) L.top = ra + i.B;
                if (ldo.luaD_precall(L, ra, LUA_MULTRET)) { // JS function
                    base = ci.l_base;
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
                        L.stack[ofuncOff + aux] = L.stack[nfuncOff + aux];
                    oci.func = nci.func;
                    oci.l_base = ofuncOff + (nci.l_base - nfuncOff);
                    L.top = ofuncOff + (L.top - nfuncOff);
                    oci.top = L.top;
                    oci.l_savedpc = nci.l_savedpc;
                    oci.pcOff = nci.pcOff;
                    oci.callstatus |= lstate.CIST_TAIL;
                    L.ci = oci;
                    ci = L.ci;
                    L.ciOff--;

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

                ci = L.ci;
                if (b) L.top = ci.top;

                continue newframe;
            }
            case OCi.OP_FORLOOP: {
                if (L.stack[ra].ttisinteger()) { /* integer loop? */
                    let step = L.stack[ra + 2].value;
                    let idx = L.stack[ra].value + step;
                    let limit = L.stack[ra + 1].value;

                    if (0 < step ? idx <= limit : limit <= idx) {
                        ci.pcOff += i.sBx;
                        L.stack[ra].value = idx;
                        L.stack[ra + 3] = new lobject.TValue(CT.LUA_TNUMINT, idx); // TODO: if tvalue already there, just update it
                    }
                } else { /* floating loop */
                    let step = L.stack[ra + 2].value;
                    let idx = L.stack[ra].value + step;
                    let limit = L.stack[ra + 1].value;

                    // TODO: luai_numlt, luai_numle
                    if (0 < step ? idx <= limit : limit <= idx) {
                        ci.pcOff += i.sBx;
                        L.stack[ra].value = idx;
                        L.stack[ra + 3] = new lobject.TValue(CT.LUA_TNUMFLT, idx); // TODO: if tvalue already there, just update it
                    }
                }
                break;
            }
            case OCi.OP_FORPREP: {
                let init = L.stack[ra];
                let plimit = L.stack[ra + 1];
                let pstep = L.stack[ra + 2];
                let forlim = forlimit(plimit, pstep.value);

                if (init.ttisinteger() && pstep.ttisinteger() && forlim.casted) { /* all values are integer */
                    let initv = forlim.stopnow ? 0 : init.value;
                    plimit.value = forlim.ilimit;
                    init.value = initv - pstep.value;
                } else { /* try making all values floats */
                    let ninit = tonumber(init);
                    let nlimit = tonumber(plimit);
                    let nstep = tonumber(pstep);

                    if (nlimit === false)
                        ldebug.luaG_runerror(L, defs.to_luastring("'for' limit must be a number", true));

                    plimit.type = CT.LUA_TNUMFLT;
                    plimit.value = nlimit;

                    if (nstep === false)
                        ldebug.luaG_runerror(L, defs.to_luastring("'for' step must be a number", true));

                    pstep.type = CT.LUA_TNUMFLT;
                    pstep.value = nstep;

                    if (ninit === false)
                        ldebug.luaG_runerror(L, defs.to_luastring("'for' initial value must be a number", true));

                    init.type = CT.LUA_TNUMFLT;
                    init.value = ninit - nstep;
                }

                ci.pcOff += i.sBx;
                break;
            }
            case OCi.OP_TFORCALL: {
                let cb = ra + 3; /* call base */
                L.stack[cb + 2] = L.stack[ra + 2];
                L.stack[cb + 1] = L.stack[ra + 1];
                L.stack[cb]     = L.stack[ra];
                L.top = cb + 3; /* func. + 2 args (state and index) */
                ldo.luaD_call(L, cb, i.C);
                /* go straight to OP_TFORLOOP */
                base = ci.l_base;
                L.top = ci.top;
                i = ci.l_savedpc[ci.pcOff++];
                ra = RA(L, base, i);
                assert(i.opcode === OCi.OP_TFORLOOP);
                /* fall through */
            }
            case OCi.OP_TFORLOOP: {
                if (!L.stack[ra + 1].ttisnil()) { /* continue loop? */
                    L.stack[ra] = L.stack[ra + 1]; /* save control variable */
                    ci.pcOff += i.sBx; /* jump back */
                }
                break;
            }
            case OCi.OP_SETLIST: {
                let n = i.B;
                let c = i.C;

                if (n === 0) n = L.top - ra - 1;

                if (c === 0) {
                    assert(ci.l_savedpc[ci.pcOff].opcode === OCi.OP_EXTRAARG);
                    c = ci.l_savedpc[ci.pcOff++].Ax;
                }

                let h = L.stack[ra].value;
                let last = ((c - 1) * lopcodes.LFIELDS_PER_FLUSH) + n;

                for (; n > 0; n--) {
                    ltable.luaH_setint(h, last--, L.stack[ra + n]);
                }

                L.top = ci.top; /* correct top (in case of previous open call) */
                break;
            }
            case OCi.OP_CLOSURE: {
                let p = cl.p.p[i.Bx];
                let nup = p.upvalues.length;
                let uv = p.upvalues;
                let ncl = new lobject.LClosure(L, nup);
                ncl.p = p;

                L.stack[ra] = new lobject.TValue(CT.LUA_TLCL, ncl);

                for (let i = 0; i < nup; i++) {
                    if (uv[i].instack)
                        ncl.upvals[i] = lfunc.luaF_findupval(L, base + uv[i].idx);
                    else
                        ncl.upvals[i] = cl.upvals[uv[i].idx];
                    ncl.upvals[i].refcount++;
                }
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
                    base = ci.l_base;
                    ra = RA(L, base, i); /* previous call may change the stack */

                    L.top = ra + n;
                }

                for (j = 0; j < b && j < n; j++)
                    L.stack[ra + j] = L.stack[base - n + j];

                for (; j < b; j++) /* complete required results with nil */
                    L.stack[ra + j] = new lobject.TValue(CT.LUA_TNIL, null);
                break;
            }
            case OCi.OP_EXTRAARG: {
                break;
            }
        }
    }
};

const dojump = function(L, ci, i, e) {
    let a = i.A;
    if (a !== 0) lfunc.luaF_close(L, ci.l_base + a - 1);
    ci.pcOff += i.sBx + e;
};

const donextjump = function(L, ci) {
    dojump(L, ci, ci.l_savedpc[ci.pcOff], 1);
};


const luaV_lessthan = function(L, l, r) {
    if (l.ttisnumber() && r.ttisnumber())
        return LTnum(l, r) ? 1 : 0;
    else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l.tsvalue(), r.tsvalue()) < 0 ? 1 : 0;
    else {
        let res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LT);
        if (res < 0)
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
        if (res >= 0)
            return res ? 1 : 0;
    }

    L.ci.callstatus |= lstate.CIST_LEQ; /* mark it is doing 'lt' for 'le' */
    res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LT);
    L.ci.callstatus ^= lstate.CIST_LEQ; /* clear mark */
    if (res < 0)
        ldebug.luaG_ordererror(L, l, r);
    return res !== 1 ? 1 : 0; /* result is negated */
};

const luaV_equalobj = function(L, t1, t2) {
    if (t1.ttype() !== t2.ttype()) { /* not the same variant? */
        if (t1.ttnov() !== t2.ttnov() || t1.ttnov() !== CT.LUA_TNUMBER)
            return 0; /* only numbers can be equal with different variants */
        else { /* two numbers with different variants */
            /* compare them as integers */
            return Math.floor(t1.value) === Math.floor(t2.value) ? 1 : 0; // TODO: tointeger
        }
    }

    let tm;

    /* values have same type and same variant */
    switch(t1.ttype()) {
        case CT.LUA_TNIL:
            return 1;
        case CT.LUA_TBOOLEAN:
            return t1.value == t2.value ? 1 : 0; // Might be 1 or true
        case CT.LUA_TNUMINT:
        case CT.LUA_TNUMFLT:
        case CT.LUA_TLCF:
            return t1.value === t2.value ? 1 : 0;
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR: {
            return lstring.luaS_eqlngstr(t1.tsvalue(), t2.tsvalue()) ? 1 : 0;
        }
        case CT.LUA_TLIGHTUSERDATA:
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE:
            if (t1.value === t2.value) return 1;
            else if (L === null) return 0;

            // TODO: fasttm ?
            tm = ltm.luaT_gettmbyobj(L, t1, ltm.TMS.TM_EQ);
            if (tm.ttisnil())
                tm = ltm.luaT_gettmbyobj(L, t2, ltm.TMS.TM_EQ);
            break;
        default:
            return t1.value === t2.value ? 1 : 0;
    }

    if (!tm || tm.ttisnil())
        return 0;

    ltm.luaT_callTM(L, tm, t1, t2, L.top, 1);
    return L.stack[L.top].l_isfalse() ? 0 : 1;
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
            ilimit = llimit.LUA_MAXINTEGER;
            if (step < 0) stopnow = true;
        } else {
            ilimit = llimit.LUA_MININTEGER;
            if (step >= 0) stopnow = true;
        }
    }

    return {
        casted: true,
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

        let res = luaconf.lua_numbertointeger(f);
        return res !== 0 ? res : (n === 0 ? 0 : false);
    } else if (obj.ttisinteger()) {
        return obj.value;
    } else if (obj.ttisstring()) {
        return luaV_tointeger(lobject.luaO_str2num(obj.svalue()), mode);
    }

    return false;
};

const tointeger = function(o) {
    return o.ttisinteger() ? o.value : luaV_tointeger(o, 0);
};

const tonumber = function(v) {
    if (v.ttnov() === CT.LUA_TNUMBER)
        return v.value;

    if (v.ttnov() === CT.LUA_TSTRING)
        return lobject.luaO_str2num(v.svalue());

    return false;
};

const LTnum = function(l, r) {
    if (l.ttisinteger()) {
        if (r.ttisinteger())
            return l.value < r.value ? 1 : 0;
        else
            return LTintfloat(r.value, l.value);
    } else {
        if (r.ttisfloat())
            return l.value < r.value ? 1 : 0;
        else if (isNaN(l.value))
            return 0;
        else
            return !LEintfloat(r.value, l.value);
    }
};

const LEnum = function(l, r) {
    if (l.ttisinteger()) {
        if (r.ttisinteger())
            return l.value <= r.value ? 1 : 0;
        else
            return LEintfloat(l.value, r.value);
    } else {
        if (r.ttisfloat())
            return l.value <= r.value ? 1 : 0;
        else if (isNaN(l.value))
            return false;
        else
            return !LTintfloat(r.value, l.value);
    }
};

const LEintfloat = function(l, r) {
    // TODO: LEintfloat
    return l <= r ? 1 : 0;
};

const LTintfloat = function(l, r) {
    // TODO: LTintfloat
    return l < r ? 1 : 0;
};

/*
** Compare two strings 'ls' x 'rs', returning an integer smaller-equal-
** -larger than zero if 'ls' is smaller-equal-larger than 'rs'.
** The code is a little tricky because it allows '\0' in the strings.
*/
const l_strcmp = function(ls, rs) {
    let l = ls.getstr();
    let ll = ls.tsslen();
    let jl = defs.to_jsstring(l);
    let r = rs.getstr();
    let lr = rs.tsslen();
    let jr = defs.to_jsstring(r);
    for (;;) {
        let temp = jl === jr; // TODO: strcoll ?
        if (!temp)  /* not equal? */
            return jl < jr ? -1 : 1;  /* done */
        else {  /* strings are equal up to a '\0' */
            let len = jl.length;  /* index of first '\0' in both strings */
            if (len === lr)  /* 'rs' is finished? */
                return len === ll ? 0 : 1;  /* check 'ls' */
            else if (len === ll)  /* 'ls' is finished? */
                return -1;  /* 'ls' is smaller than 'rs' ('rs' is not finished) */
            /* both strings longer than 'len'; go on comparing after the '\0' */
            len++;
            l = l.slice(len);
            ll -= len;
            r = r.slice(len);
            lr -= len;
            jl = defs.to_jsstring(l);
            jr = defs.to_jsstring(r);
        }
    }
};

/*
** Main operation 'ra' = #rb'.
*/
const luaV_objlen = function(L, ra, rb) {
    let tm;
    switch(rb.ttype()) {
        case CT.LUA_TTABLE: {
            tm = ltm.luaT_gettmbyobj(L, rb, ltm.TMS.TM_LEN);
            if (!tm.ttisnil()) break;
            L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, ltable.luaH_getn(rb.value));
            return;
        }
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            L.stack[ra] = new lobject.TValue(CT.LUA_TNUMINT, rb.vslen());
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

const tostring = function(L, i) {
    let o = L.stack[i];

    if (o.ttisstring()) return true;

    if (o.ttisnumber() && !isNaN(o.value)) {
        L.stack[i] = new lobject.TValue(CT.LUA_TLNGSTR, lstring.luaS_bless(L, defs.to_luastring(`${o.value}`)));
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

        if (!(L.stack[top-2].ttisstring() || L.stack[top-2].ttisnumber()) || !tostring(L, top - 1))
            ltm.luaT_trybinTM(L, L.stack[top-2], L.stack[top-1], top-2, ltm.TMS.TM_CONCAT);
        else if (isemptystr(L.stack[top-1])) {
            tostring(L, top - 2);
        } else if (isemptystr(L.stack[top-2])) {
            L.stack[top - 2] = L.stack[top - 1];
        } else {
            /* at least two non-empty string values; get as many as possible */
            let toconcat = new Array(total);
            toconcat[total-1] = L.stack[top-1].svalue();
            for (n = 1; n < total && tostring(L, top - n - 1); n++) {
                toconcat[total-n-1] = L.stack[top - n - 1].svalue();
            }
            let ts = lstring.luaS_bless(L, Array.prototype.concat.apply([], toconcat));
            L.stack[top - total] = new lobject.TValue(CT.LUA_TLNGSTR, ts);
        }
        total -= n - 1; /* got 'n' strings to create 1 new */
        L.top -= n - 1; /* popped 'n' strings and pushed one */
    } while (total > 1); /* repeat until only 1 result left */
};

const MAXTAGRECUR = 2000;

const gettable = function(L, table, key, ra, recur) {
    recur = recur ? recur : 0;

    if (recur >= MAXTAGRECUR)
        ldebug.luaG_runerror(L, defs.to_luastring("'__index' chain too long; possible loop", true));

    if (table.ttistable()) {
        let element = ltable.luaH_get(table.value, key);

        if (!element.ttisnil()) {
            L.stack[ra] = new lobject.TValue(element.type, element.value);
        } else {
            luaV_finishget(L, table, key, ra, element, recur);
        }
    } else {
        luaV_finishget(L, table, key, ra, null, recur);
    }
};

const luaV_finishget = function(L, t, key, val, slot, recur) {
    let tm;
    if (slot === null) { /* 't' is not a table? */
        assert(!t.ttistable());
        tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_INDEX);
        if (tm.ttisnil())
            ldebug.luaG_typeerror(L, t, defs.to_luastring('index', true));
    } else { /* 't' is a table */
        assert(slot.ttisnil());
        tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_INDEX); // TODO: fasttm
        if (tm.ttisnil()) {
            L.stack[val] = new lobject.TValue(CT.LUA_TNIL, null);
            return;
        }
    }

    if (tm.ttisfunction()) {
        ltm.luaT_callTM(L, tm, t, key, val, 1);
        return;
    }

    gettable(L, tm, key, val, recur + 1);
};

const settable = function(L, table, key, v, recur) {
    recur = recur ? recur : 0;

    if (recur >= MAXTAGRECUR)
        ldebug.luaG_runerror(L, defs.to_luastring("'__newindex' chain too long; possible loop", true));

    if (table.ttistable()) {
        let element = ltable.luaH_set(table.value, key);

        if (!element.ttisnil()) {
            element.setfrom(v);
        } else {
            luaV_finishset(L, table, key, v, element, recur);
        }
    } else {
        luaV_finishset(L, table, key, v, null, recur);
    }
};

const luaV_finishset = function(L, t, key, val, slot, recur) {
    let tm;
    if (slot !== null) { /* is 't' a table? */
        assert(slot.ttisnil());
        tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_NEWINDEX); // TODO: fasttm
        if (tm.ttisnil()) {
            slot.setfrom(val);
            return;
        }
    } else { /* not a table; check metamethod */
        tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_NEWINDEX);
        if (tm.ttisnil())
            ldebug.luaG_typeerror(L, t, defs.to_luastring('index', true));
    }

    if (tm.ttisfunction()) {
        ltm.luaT_callTM(L, tm, t, key, val, 0);
        return;
    }

    settable(L, tm, key, val, recur + 1);
};


module.exports.LEintfloat        = LEintfloat;
module.exports.LEnum             = LEnum;
module.exports.LTintfloat        = LTintfloat;
module.exports.LTnum             = LTnum;
module.exports.RA                = RA;
module.exports.RB                = RB;
module.exports.RC                = RC;
module.exports.RKB               = RKB;
module.exports.RKC               = RKC;
module.exports.dojump            = dojump;
module.exports.donextjump        = donextjump;
module.exports.forlimit          = forlimit;
module.exports.gettable          = gettable;
module.exports.l_strcmp          = l_strcmp;
module.exports.luaV_concat       = luaV_concat;
module.exports.luaV_equalobj     = luaV_equalobj;
module.exports.luaV_execute      = luaV_execute;
module.exports.luaV_finishOp     = luaV_finishOp;
module.exports.luaV_finishset    = luaV_finishset;
module.exports.luaV_lessequal    = luaV_lessequal;
module.exports.luaV_lessthan     = luaV_lessthan;
module.exports.luaV_objlen       = luaV_objlen;
module.exports.luaV_rawequalobj = luaV_rawequalobj;
module.exports.luaV_tointeger    = luaV_tointeger;
module.exports.settable          = settable;
module.exports.tointeger         = tointeger;
module.exports.tonumber          = tonumber;
