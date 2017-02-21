/*jshint esversion: 6 */
"use strict";

const assert         = require('assert');

const BytecodeParser = require('./lundump.js');
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
const ldo            = require('./ldo.js');
const ltm            = require('./ltm.js');
const ltable         = require('./ltable.js');
const ldebug         = require('./ldebug.js');

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
    return OC.ISK(i.B) ? k[OC.INDEXK(i.B)] : L.stack[base + i.B];
};

const RKC = function(L, base, k, i) {
    return OC.ISK(i.C) ? k[OC.INDEXK(i.C)] : L.stack[base + i.C];
};

const luaV_execute = function(L) {
    let ci = L.ci;
    let specialCase = null; // To enable jump to specific opcode without reading current op/ra
    let opcode, k, base, i, ra;
    var cl;
    
    ci.callstatus |= lstate.CIST_FRESH;
    newframe:
    for (;;) {
        if (specialCase) {
            opcode = specialCase;
            specialCase = null;
        } else {
            ci = L.ci;
            cl = ci.func;
            k = cl.p.k;
            base = ci.u.l.base;

            i = ci.u.l.savedpc[ci.pcOff++];
            ra = RA(L, base, i);

            opcode = OC.OpCodes[i.opcode];
        }

        if (i.breakpoint) // TODO: remove, used until lapi
            return;

        switch (opcode) {
            case "OP_MOVE": {
                L.stack[ra] = L.stack[RB(L, base, i)];
                break;
            }
            case "OP_LOADK": {
                L.stack[ra] = k[i.Bx];
                break;
            }
            case "OP_LOADKX": {
                assert(OC.OpCodes[ci.u.l.savedpc[ci.pcOff].opcode] === "OP_EXTRAARG");
                L.stack[ra] = k[ci.u.l.savedpc[ci.pcOff++].Ax];
                break;
            }
            case "OP_LOADBOOL": {
                L.stack[ra] = new TValue(CT.LUA_TBOOLEAN, i.B !== 0);

                if (i.C !== 0)
                    ci.pcOff++; /* skip next instruction (if C) */

                break;
            }
            case "OP_LOADNIL": {
                for (let j = 0; j <= i.B; j++)
                    L.stack[ra + j] = ldo.nil;
                break;
            }
            case "OP_GETUPVAL": {
                L.stack[ra] = cl.upvals[i.B].val(L);
                break;
            }
            case "OP_SETUPVAL": {
                cl.upvals[i.B].setval(L, ra);
                break;
            }
            case "OP_GETTABUP": {
                let table = cl.upvals[i.B].val(L);
                let key = RKC(L, base, k, i);

                gettable(L, table, key, ra);
                base = ci.u.l.base;
                break;
            }
            case "OP_SETTABUP": {
                let table = cl.upvals[i.A].val(L);
                let key = RKB(L, base, k, i);
                let v = RKC(L, base, k, i);

                settable(L, table, key, v);
                base = ci.u.l.base;

                break;
            }
            case "OP_GETTABLE": {
                let table = RKB(L, base, k, i);
                let key = RKC(L, base, k, i);

                gettable(L, table, key, ra);
                base = ci.u.l.base;
                break;
            }
            case "OP_SETTABLE": {
                let table = L.stack[ra];
                let key = RKB(L, base, k, i);
                let v = RKC(L, base, k, i);

                settable(L, table, key, v);
                base = ci.u.l.base;

                break;
            }
            case "OP_NEWTABLE": {
                L.stack[ra] = new Table();
                break;
            }
            case "OP_SELF": {
                let table = L.stack[RB(L, base, i)];
                let key = RKC(L, base, k, i);

                L.stack[ra + 1] = table;

                gettable(L, table, key, ra);
                base = ci.u.l.base;

                break;
            }
            case "OP_ADD": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value + op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, op1.value + op2.value);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_ADD);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_SUB": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value - op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, op1.value - op2.value);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_SUB);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_MUL": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value * op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, k[i.B].value * op2.value);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_MUL);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_MOD": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value % op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, k[i.B].value % op2.value);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_MOD);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_POW": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, Math.pow(op1.value, op2.value));
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_POW);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_DIV": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, k[i.B].value / op2.value);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_DIV);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_IDIV": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value / op2.value)|0);
                } else if (numberop1 !== false && numberop2 !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, (op1.value / op2.value)|0);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_IDIV);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_BAND": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value & op2.value)|0);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_BAND);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_BOR": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value | op2.value)|0);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_BOR);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_BXOR": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value ^ op2.value)|0);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_BXOR);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_SHL": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value << op2.value)|0);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_SHL);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_SHR": {
                let op1 = RKB(L, base, k, i);
                let op2 = RKC(L, base, k, i);
                let numberop1 = tonumber(op1);
                let numberop2 = tonumber(op2);

                if (op1.ttisinteger() && op2.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value >> op2.value)|0);
                } else {
                    ltm.luaT_trybinTM(L, op1, op2, ra, ltm.TMS.TM_SHR);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_UNM": {
                let op = L.stack[RB(L, base, i)];
                let numberop = tonumber(op);

                if (op.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, -op.value);
                } else if (numberop !== false) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMFLT, -op.value);
                } else {
                    ltm.luaT_trybinTM(L, op, op, ra, ltm.TMS.TM_UNM);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_BNOT": {
                let op = L.stack[RB(L, base, i)];
                let numberop = tonumber(op);

                if (op.ttisinteger()) {
                    L.stack[ra] = new TValue(CT.LUA_TNUMINT, ~op.value);
                } else {
                    ltm.luaT_trybinTM(L, op, op, ra, ltm.TMS.TM_BNOT);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_NOT": {
                let op = L.stack[RB(L, base, i)];
                L.stack[ra] = new TValue(CT.LUA_TBOOLEAN, op.l_isfalse());
                break;
            }
            case "OP_LEN": {
                luaV_objlen(L, ra, L.stack[RB(L, base, i)]);
                base = ci.u.l.base;
                break;
            }
            case "OP_CONCAT": {
                let b = i.B;
                let c = i.C;
                let rb;
                L.top = base + c + 1; /* mark the end of concat operands */
                luaV_concat(L, c - b + 1);
                base = ci.u.l.base;
                ra = RA(L, base, i); /* 'luaV_concat' may invoke TMs and move the stack */
                rb = base + b;
                L.stack[ra] = L.stack[rb];
                L.top = ci.top; /* restore top */
                break;
            }
            case "OP_JMP": {
                dojump(L, ci, i, 0);
                break;
            }
            case "OP_EQ": {
                if (luaV_equalobj(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.u.l.base;
                break;
            }
            case "OP_LT": {
                if (luaV_lessthan(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.u.l.base;
                break;
            }
            case "OP_LE": {
                if (luaV_lessequal(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.u.l.base;
                break;
            }
            case "OP_TEST": {
                if (i.C ? L.stack[ra].l_isfalse() : !L.stack[ra].l_isfalse())
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                break;
            }
            case "OP_TESTSET": {
                let rb = L.stack[RB(L, base, i)];
                if (i.C ? rb.l_isfalse() : !rb.l_isfalse())
                    ci.pcOff++;
                else {
                    L.stack[ra] = rb;
                    donextjump(L, ci);
                }
                break;
            }
            case "OP_CALL": {
                let b = i.B;
                let nresults = i.C - 1;

                if (b !== 0)
                    L.top = ra+b;

                if (ldo.luaD_precall(L, ra, nresults)) {
                    if (nresults >= 0)
                        L.top = ci.top;
                    base = ci.u.l.base;
                } else {
                    ci = L.ci;
                    continue newframe;
                }

                break;
            }
            case "OP_TAILCALL": {
                if (i.B !== 0) L.top = ra + i.B;
                if (ldo.luaD_precall(L, ra, LUA_MULTRET)) { // JS function
                    base = ci.u.l.base;
                } else {
                    /* tail call: put called frame (n) in place of caller one (o) */
                    let nci = L.ci;
                    let oci = nci.previous;
                    let nfunc = nci.func;
                    let nfuncOff = nci.funcOff;
                    let ofunc = oci.func;
                    let ofuncOff = oci.funcOff;
                    let lim = nci.u.l.base + nfunc.p.numparams;
                    if (cl.p.p.length > 0) lfunc.luaF_close(L, oci.u.l.base);
                    for (let aux = 0; nfuncOff + aux < lim; aux++)
                        L.stack[ofuncOff + aux] = L.stack[nfuncOff + aux];
                    oci.func = nci.func;
                    oci.u.l.base = ofuncOff + (nci.u.l.base - nfuncOff);
                    L.top = ofuncOff + (L.top - nfuncOff);
                    oci.top = L.top;
                    oci.u.l.savedpc = nci.u.l.savedpc;
                    oci.pcOff = nci.pcOff;
                    oci.callstatus |= lstate.CIST_TAIL;
                    L.ci = oci;
                    ci = L.ci;
                    L.ciOff--;

                    assert(L.top === oci.u.l.base + L.stack[ofuncOff].p.maxstacksize);

                    continue newframe;
                }
                break;
            }
            case "OP_RETURN": {
                if (cl.p.p.length > 0) lfunc.luaF_close(L, base);
                let b = ldo.luaD_poscall(L, ci, ra, (i.B !== 0 ? i.B - 1 : L.top - ra));

                if (ci.callstatus & lstate.CIST_FRESH)
                    return; /* external invocation: return */
                
                ci = L.ci;
                if (b) L.top = ci.top;

                continue newframe;
            }
            case "OP_FORLOOP": {
                if (L.stack[ra].ttisinteger()) { /* integer loop? */
                    let step = L.stack[ra + 2].value;
                    let idx = L.stack[ra].value + step;
                    let limit = L.stack[ra + 1].value;

                    if (0 < step ? idx <= limit : limit <= idx) {
                        ci.pcOff += i.sBx;
                        L.stack[ra].value = idx;
                        L.stack[ra + 3] = new TValue(CT.LUA_TNUMINT, idx); // TODO: if tvalue already there, just update it
                    }
                } else { /* floating loop */
                    let step = L.stack[ra + 2].value;
                    let idx = L.stack[ra].value + step;
                    let limit = L.stack[ra + 1].value;

                    // TODO: luai_numlt, luai_numle
                    if (0 < step ? idx <= limit : limit <= idx) {
                        ci.pcOff += i.sBx;
                        L.stack[ra].value = idx;
                        L.stack[ra + 3] = new TValue(CT.LUA_TNUMFLT, idx); // TODO: if tvalue already there, just update it
                    }
                }
                break;
            }
            case "OP_FORPREP": {
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
                        ldebug.luaG_runerror(L, "'for' limit must be a number");

                    plimit.type = CT.LUA_TNUMFLT;
                    plimit.value = nlimit

                    if (nstep === false)
                        ldebug.luaG_runerror(L, "'for' step must be a number");

                    pstep.type = CT.LUA_TNUMFLT;
                    pstep.value = nstep

                    if (ninit === false)
                        ldebug.luaG_runerror(L, "'for' initial value must be a number");

                    init.type = CT.LUA_TNUMFLT;
                    init.value = ninit - nstep;
                }

                ci.pcOff += i.sBx;
                break;
            }
            case "OP_TFORCALL": {
                let cb = ra + 3; /* call base */
                L.stack[cb + 2] = L.stack[ra + 2];
                L.stack[cb + 1] = L.stack[ra + 1];
                L.stack[cb]     = L.stack[ra];
                L.top = cb + 3; /* func. + 2 args (state and index) */
                ldo.luaD_call(L, cb, i.C);
                base = ci.u.l.base;
                L.top = ci.top;
                i = ci.u.l.savedpc[ci.pcOff++];
                ra = RA(L, base, i);
                assert(OC.OpCodes[i.opcode] === "OP_TFORLOOP");
                specialCase = "OP_TFORLOOP";
                break;
            }
            case "OP_TFORLOOP": {
                if (!L.stack[ra + 1].ttisnil()) { /* continue loop? */
                    L.stack[ra] = L.stack[ra + 1]; /* save control variable */
                    ci.pcOff += i.sBx; /* jump back */
                }
                break;
            }
            case "OP_SETLIST": {
                let n = i.B;
                let c = i.C;

                if (n === 0) n = L.top - ra - 1;

                if (c === 0) {
                    assert(OC.OpCodes[ci.u.l.savedpc[ci.pcOff].opcode] === "OP_EXTRAARG");
                    c = ci.u.l.savedpc[ci.pcOff++].Ax;
                }

                let table = L.stack[ra];
                let last = ((c - 1) * OC.LFIELDS_PER_FLUSH) + n;

                for (; n > 0; n--) {
                    table.__newindex(table, last--, L.stack[ra + n]);
                }

                L.top = ci.top; /* correct top (in case of previous open call) */
                break;
            }
            case "OP_CLOSURE": {
                let p = cl.p.p[i.Bx];
                let nup = p.upvalues.length;
                let uv = p.upvalues;
                let ncl = new LClosure(nup);
                ncl.p = p;

                L.stack[ra] = ncl;

                for (let i = 0; i < nup; i++) {
                    if (uv[i].instack)
                        ncl.upvals[i] = lfunc.findupval(L, base + uv[i].idx);
                    else
                        ncl.upvals[i] = cl.upvals[uv[i].idx];
                    ncl.upvals[i].refcount++;
                }
                break;
            }
            case "OP_VARARG": {
                let b = i.B - 1;
                let n = base - ci.funcOff - cl.p.numparams - 1;
                let j;

                if (n < 0) /* less arguments than parameters? */
                    n = 0; /* no vararg arguments */

                if (b < 0) {
                    b = n;  /* get all var. arguments */
                    base = ci.u.l.base;
                    ra = RA(L, base, i); /* previous call may change the stack */

                    L.top = ra + n;
                }

                for (j = 0; j < b && j < n; j++)
                    L.stack[ra + j] = L.stack[base - n + j];

                for (; j < b; j++) /* complete required results with nil */
                    L.stack[ra + j] = ldo.nil;
                break;
            }
            case "OP_EXTRAARG": {
                break;
            }
        }
    }
};

const dojump = function(L, ci, i, e) {
    let a = i.A;
    if (a !== 0) lfunc.luaF_close(L, ci.u.l.base + a - 1);
    ci.pcOff += i.sBx + e;
};

const donextjump = function(L, ci) {
    dojump(L, ci, ci.u.l.savedpc[ci.pcOff], 1);
};


const luaV_lessthan = function(L, l, r) {
    if (l.ttisnumber() && r.ttisnumber())
        return LTnum(l, r);
    else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l, r) < 0;
    else {
        let res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LT);
        if (res < 0)
            ldebug.luaG_ordererror(L, l, r);
        return res;
    }
};

const luaV_lessequal = function(L, l, r) {
    let res;

    if (l.ttisnumber() && r.ttisnumber())
        return LEnum(l, r);
    else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l, r) <= 0;
    else {
        res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LE);
        if (res >= 0)
            return res;
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
        if (t1.ttnov() !== t2.ttnov() || t1.ttnov() !== CT.LUA_NUMBER)
            return 0; /* only numbers can be equal with different variants */
        else { /* two numbers with different variants */
            /* compare them as integers */
            return Math.floor(t1.value) === Math.floor(t2.value); // TODO: tointeger
        }
    }

    let tm;

    /* values have same type and same variant */
    switch(t1.ttype()) {
        case CT.LUA_TNIL:
            return 1;
        case CT.LUA_TNUMINT:
        case CT.LUA_TNUMFLT:
        case CT.LUA_TBOOLEAN:
        case CT.LUA_TLCF:
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            return t1.value === t2.value ? 1 : 0;
        case CT.LUA_TLIGHTUSERDATA:
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE:
            if (t1 === t2) return 1;
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
** mode == 0: accepts only integral values
** mode == 1: takes the floor of the number
** mode == 2: takes the ceil of the number
*/
const luaV_tointeger = function(obj, mode) {
    if (obj.ttisfloat()) {
        let n = obj.value;
        let f = n|0;

        if (n !== f) { /* not an integral value? */
            if (mode === 0)
                return false;  /* fails if mode demands integral value */
            else if (mode > 1)  /* needs ceil? */
                f += 1;  /* convert floor to ceil (remember: n != f) */
        }

        return f|0;
    } else if (obj.ttisinteger()) {
        return obj.value|0;
    } else if (obj.ttisstring()) {
        return luaV_tointeger(parseFloat(obj.value), mode); // TODO: luaO_str2num
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
        return parseFloat(v.value); // TODO: luaO_str2num

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
        else if (isNan(l.value))
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
        else if (isNan(l.value))
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

const l_strcmp = function(ls, rs) {
    // TODO: lvm.c:248 static int l_strcmp (const TString *ls, const TString *rs)
    return ls.value === rs.value ? 0 : (ls.value < rs.value ? -1 : 1);
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
            L.stack[ra] = rb.luaH_getn();
            return;
        }
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            L.stack[ra] = rb.value.length; // TODO: 8-byte clean string
            return;
        default: {
            tm = ltm.luaT_gettmbyobj(L, rb, ltm.TMS.TM_LEN);
            if (tm.ttisnil())
                ldebug.luaG_typeerror(L, rb, "get length of");
            break;
        }
    }

    ltm.luaT_callTM(L, tm, rb, rb, ra, 1);
};

const tostring = function(L, i) {
    let o = L.stack[i];
    let str = `${o.value}`;

    if (o.ttisstring() || (o.ttisnumber() && !isNaN(str))) {
        L.stack[i] = new TValue(CT.LUA_TLNGSTR, str);
        return true;
    }

    return false;
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
        let v = L.stack[top-2];
        let v2 = L.stack[top-1];

        if (!(v.ttisstring() || v.ttisnumber()) || !tostring(L, top - 2)) // TODO: tostring
            ltm.luaT_trybinTM(L, v, v2, top-2, ltm.TMS.TM_CONCAT);
        else if (v2.ttisstring() && v2.value.length === 0)
            tostring(L, top - 2)
        else if (v.ttisstring() && v.value.length === 0)
            L.stack[top - 2] = L.stack[top - 1];
        else {
            /* at least two non-empty string values; get as many as possible */
            let tl = v.value.length;
            /* collect total length and number of strings */
            for (n = 1; n < total && tostring(L, top - n - 1); n++) {
                let l = L.stack[top - n - 1].value.length;
                // TODO: string length overflow ?
                tl += l;
            }

            let ts = new TValue(CT.LUA_TLNGSTR, "");
            for (let i = n; i > 0; i--) {
                ts.value = `${ts.value}${L.stack[top - i].value}`;
            }

            L.stack[top - n] = ts;
        }
        total -= n - 1; /* got 'n' strings to create 1 new */
        L.top -= n - 1; /* popped 'n' strings and pushed one */
    } while (total > 1); /* repeat until only 1 result left */
};

const MAXTAGRECUR = 2000;

const gettable = function(L, table, key, ra, recur) {
    recur = recur ? recur : 0;

    if (recur >= MAXTAGRECUR)
        ldebug.luaG_runerror(L, "'__index' chain too long; possible loop");

    if (table.ttistable()) {
        let element = table.__index(table, key);

        if (!element.ttisnil()) {
            L.stack[ra] = table.__index(table, key);
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
            ldebug.luaG_typeerror(L, t, 'index');
    } else { /* 't' is a table */
        assert(slot.ttisnil());
        tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_INDEX); // TODO: fasttm
        if (tm.ttisnil()) {
            L.stack[val] = ldo.nil;
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
        ldebug.luaG_runerror(L, "'__newindex' chain too long; possible loop");

    if (table.ttistable()) {
        let element = table.__index(table, key);

        if (!element.ttisnil()) {
            table.__newindex(table, key, v);
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
            t.__newindex(t, key, val);
            return;
        }
    } else { /* not a table; check metamethod */
        tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_NEWINDEX);
        if (tm.ttisnil())
            ldebug.luaG_typeerror(L, t, 'index');
    }

    if (tm.ttisfunction()) {
        ltm.luaT_callTM(L, tm, t, key, val, 0);
        return;
    }

    settable(L, tm, key, val, recur + 1);
}


module.exports.RA             = RA;
module.exports.RB             = RB;
module.exports.RC             = RC;
module.exports.RKB            = RKB;
module.exports.RKC            = RKC;
module.exports.luaV_execute   = luaV_execute;
module.exports.dojump         = dojump;
module.exports.donextjump     = donextjump;
module.exports.luaV_lessequal = luaV_lessequal;
module.exports.luaV_lessthan  = luaV_lessthan;
module.exports.luaV_equalobj  = luaV_equalobj;
module.exports.forlimit       = forlimit;
module.exports.luaV_tointeger = luaV_tointeger;
module.exports.tonumber       = tonumber;
module.exports.tointeger      = tointeger;
module.exports.LTnum          = LTnum;
module.exports.LEnum          = LEnum;
module.exports.LEintfloat     = LEintfloat;
module.exports.LTintfloat     = LTintfloat;
module.exports.l_strcmp       = l_strcmp;
module.exports.luaV_objlen    = luaV_objlen;
module.exports.luaV_finishset = luaV_finishset;
module.exports.gettable       = gettable;
module.exports.settable       = settable;
module.exports.luaV_concat    = luaV_concat;