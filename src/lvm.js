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
const TMS            = ltm.TMS;

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
            base = ci.u.l.base

            i = ci.u.l.savedpc[ci.pcOff++];
            ra = RA(L, base, i);

            opcode = OC.OpCodes[i.opcode];
        }

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

                // if (!table.ttistable() || !table.__index(table, key)) {
                //     // __index
                // } else {
                    L.stack[ra] = table.__index(table, key);
                // }
                break;
            }
            case "OP_SETTABUP": {
                let table = cl.upvals[i.A].val(L);
                let key = RKB(L, base, k, i);
                let v = RKC(L, base, k, i);

                // if (!table.ttistable() || !table.__index(table, key)) {
                //     // __index
                // } else {
                    table.__newindex(table, key, v);
                // }

                break;
            }
            case "OP_GETTABLE": {
                let table = RKB(L, base, k, i);
                let key = RKC(L, base, k, i);

                // if (!table.ttistable() || !table.__index(table, key)) {
                //     // __index
                // } else {
                    L.stack[ra] = table.__index(table, key);
                // }
                break;
            }
            case "OP_SETTABLE": {
                let table = L.stack[ra];
                let key = RKB(L, base, k, i);
                let v = RKC(L, base, k, i);

                // if (!table.ttistable() || !table.__index(table, key)) {
                //     // __index
                // } else {
                    table.__newindex(table, key, v);
                // }

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

                // if (!table.ttistable() || !table.__index(table, key)) {
                //     // __index
                // } else {
                    L.stack[ra] = table.__index(table, key);
                // }

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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_ADD);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_SUB);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_MUL);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_MOD);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_POW);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_DIV);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_IDIV);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_BAND);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_BOR);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_BXOR);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_SHL);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_SHR);
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
                    ltm.luaT_trybinTM(L, op1, op2, ra, TMS.TM_UNM);
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
                    ltm.luaT_trybinTM(L, op, op, ra, TMS.TM_BNOT);
                    base = ci.u.l.base;
                }
                break;
            }
            case "OP_NOT": {
                let op = L.stack[RB(L, base, i)];
                L.stack[ra] = new TValue(CT.LUA_TBOOLEAN, l_isfalse(op));
                break;
            }
            case "OP_LEN": {
                luaV_objlen(L, ra, L.stack[RB(L, base, i)]);
                base = ci.u.l.base;
                break;
            }
            case "OP_CONCAT": {
                break;
            }
            case "OP_JMP": {
                dojump(L, ci, i, 0);
                break;
            }
            case "OP_EQ": {
                if (luaV_equalobj(RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.u.l.base;
                break;
            }
            case "OP_LT": {
                if (luaV_lessthan(RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.u.l.base;
                break;
            }
            case "OP_LE": {
                if (luaV_lessequal(RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                base = ci.u.l.base;
                break;
            }
            case "OP_TEST": {
                if (i.C ? l_isfalse(L.stack[ra]) : !l_isfalse(L.stack[ra]))
                    ci.pcOff++;
                else
                    donextjump(L, ci);
                break;
            }
            case "OP_TESTSET": {
                let rb = L.stack[RB(L, base, i)];
                if (i.C ? l_isfalse(rb) : !l_isfalse(rb))
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
                break;
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
                        throw new Error("'for' limit must be a number");

                    plimit.type = CT.LUA_TNUMFLT;
                    plimit.value = nlimit.value;

                    if (nstep === false)
                        throw new Error("'for' step must be a number");

                    pstep.type = CT.LUA_TNUMFLT;
                    pstep.value = nstep.value;

                    if (ninit === false)
                        throw new Error("'for' initial value must be a number");

                    init.type = CT.LUA_TNUMFLT;
                    init.value = ninit.value - nstep.value;
                }

                ci.pcOff += i.sBx;
                break;
            }
            case "OP_TFORCALL": {
                let cb = ra + 3 /* call base */
                L.stack[cb + 2] = L.stack[ra + 2];
                L.stack[cb + 1] = L.stack[ra + 1];
                L.stack[cb]     = L.stack[ra];
                L.top = cb + 3; /* func. + 2 args (state and index) */
                luaD_call(L, cb, i.C);
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
    if (a != 0) lfunc.luaF_close(L, ci.u.l.base + a - 1);
    ci.pcOff += i.sBx + e;
};

const donextjump = function(L, ci) {
    dojump(L, ci, ci.u.l.savedpc[ci.pcOff], 1);
};


const luaV_lessthan = function(l, r) {
    if (l.ttisnumber() && r.ttisnumber())
        return LTnum(l, r);
    else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l, r) < 0;
    else {
        res = ltm.luatT_callorderTM(L, l, r, TMS.TM_LT);
        if (res < 0)
            throw new Error("TM order error"); // TODO: luaG_ordererror
        return res;
    }
};

const luaV_lessequal = function(l, r) {
    let res;

    if (l.ttisnumber() && r.ttisnumber())
        return LEnum(l, r);
    else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l, r) <= 0;
    else {
        res = ltm.luatT_callorderTM(L, l, r, TMS.TM_LE);
        if (res >= 0)
            return res;
    }

    L.ci.callstatus |= CIST_LEQ; /* mark it is doing 'lt' for 'le' */
    res = ltm.luatT_callorderTM(L, l, r, TMS.TM_LT);
    L.ci.callstatus ^= CIST_LEQ; /* clear mark */
    if (res < 0)
        throw new Error("TM order error"); // TODO: luaG_ordererror
    return res === 1;
};

const luaV_equalobj = function(t1, t2) {
    if (t1.ttype() !== t2.ttype()) { /* not the same variant? */
        if (t1.ttnov() !== t2.ttnov() || t1.ttnov() !== CT.LUA_NUMBER)
            return 0; /* only numbers can be equal with different variants */
        else { /* two numbers with different variants */
            /* compare them as integers */
            return Math.floor(t1.value) === Math.floor(t2.value) // TODO: tointeger
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
        case CT.LUA_TLIGHTUSERDATA:
        case CT.LUA_TLCF:
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            return t1.value === t2.value ? 1 : 0;
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE:
            if (t1 === t2) return 1;
            else if (L === null) return 1;

            // TODO: fasttm ?
            tm = ltm.luaT_gettmbyobj(L, t1, TMS.TM_EQ);
            if (tm.ttisnil())
                tm = ltm.luaT_gettmbyobj(L, t2, TMS.TM_EQ);
            break
        default:
            return t1.value === t2.value ? 1 : 0;
    }

    if (!tm || tm.ttisnil())
        return 0;

    ltm.luaT_callTM(L, tm, t1, t2, L.top, 1);
    return !l_isfalse(L.stack[L.top]);
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
    }
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

const tonumber = function(v) {
    if (v.type === CT.LUA_TNUMFLT)
        return new TValue(v.type, v.value);

    if (v.type === CT.LUA_TNUMINT)
        return new TValue(CT.LUA_TNUMFLT, v.value);

    if (v.type === CT.LUA_TSHRSTR || v.type === CT.LUA_TLNGSTR)
        return new TValue(CT.LUA_TNUMFLT, parseFloat(v.value)); // TODO: luaO_str2num

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

const l_isfalse = function(o) {
    return o.ttisnil() || (o.ttisboolean() && o.value === false)
};

/*
** Main operation 'ra' = #rb'.
*/
const luaV_objlen = function(L, ra, rb) {
    let tm;
    switch(rb.ttype()) {
        case CT.LUA_TTABLE: {
            tm = rb.value.metatable;
            if (tm) break;
            L.stack[ra] = rb.luaH_getn();
            return;
        }
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            L.stack[ra] = rb.value.length; // TODO: 8-byte clean string
            return;
        default: {
            tm = ltm.luaT_gettmbyobj(L, rb, TMS.TM_LEN);
            if (tm.ttisnil())
                throw new Error("attempt to get length"); // TODO: luaG_typeerror
            break;
        }
    }

    ltm.luaT_callTM(L, tm, rb, rb, ra, 1);
};

/*
** Main operation for concatenation: concat 'total' values in the stack,
** from 'L->top - total' up to 'L->top - 1'.
*/
const luaV_concat = function(L, total) {
    assert(total >= 2);
}

/*
** Check appropriate error for stack overflow ("regular" overflow or
** overflow while handling stack overflow). If 'nCalls' is larger than
** LUAI_MAXCCALLS (which means it is handling a "regular" overflow) but
** smaller than 9/8 of LUAI_MAXCCALLS, does not report an error (to
** allow overflow handling to work)
*/
const stackerror = function(L) {
    if (L.nCcalls === llimit.LUAI_MAXCCALLS)
        throw new Error("JS stack overflow");
    else if (L.nCcalls >= llimit.LUAI_MAXCCALLS + (llimit.LUAI_MAXCCALLS >> 3)) /* error while handing stack error */
        throw new Error("stack overflow") // TODO: luaD_throw(L, LUA_ERRERR);
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
    if (!ldo.luaD_precall(L, off, nResults))
        luaV_execute(L);
    L.nCcalls--;
};

/*
** Similar to 'luaD_call', but does not allow yields during the call
*/
const luaD_callnoyield = function(L, off, nResults) {
  L.nny++;
  luaD_call(L, off, nResults);
  L.nny--;
};

module.exports = {
    RA:               RA,
    RB:               RB,
    RC:               RC,
    RKB:              RKB,
    RKC:              RKC,
    luaV_execute:     luaV_execute,
    dojump:           dojump,
    donextjump:       donextjump,
    luaV_lessequal:   luaV_lessequal,
    luaV_lessthan:    luaV_lessthan,
    luaV_equalobj:    luaV_equalobj,
    forlimit:         forlimit,
    luaV_tointeger:   luaV_tointeger,
    tonumber:         tonumber,
    LTnum:            LTnum,
    LEnum:            LEnum,
    LEintfloat:       LEintfloat,
    LTintfloat:       LTintfloat,
    l_strcmp:         l_strcmp,
    l_isfalse:        l_isfalse,
    luaV_objlen:      luaV_objlen,
    stackerror:       stackerror,
    luaD_call:        luaD_call,
    luaD_callnoyield: luaD_callnoyield,
};