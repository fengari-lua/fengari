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

class LuaVM {

    constructor(L) {
        this.L = L;
    }

    RA(base, i) {
       return base + i.A;
    }

    RB(base, i) {
       return base + i.B;
    }

    RC(base, i) {
       return base + i.C;
    }

    RKB(base, k, i) {
        return OC.ISK(i.B) ? k[OC.INDEXK(i.B)] : this.L.stack[base + i.B];
    }

    RKC(base, k, i) {
        return OC.ISK(i.C) ? k[OC.INDEXK(i.C)] : this.L.stack[base + i.C];
    }

    execute() {
        let L = this.L;

        let ci = L.ci;
        ci.callstatus |= lstate.CIST_FRESH;
        newframe:
        for (;;) {
            ci = L.ci;
            var cl = ci.func;
            let k = cl.p.k;
            let base = ci.u.l.base

            let i = ci.u.l.savedpc[ci.pcOff++];
            let ra = this.RA(base, i);

            switch (OC.OpCodes[i.opcode]) {
                case "OP_MOVE": {
                    L.stack[ra] = L.stack[this.RB(base, i)];
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
                    let key = this.RKC(base, k, i);

                    // if (!table.ttistable() || !table.metatable.__index(table, key)) {
                    //     // __index
                    // } else {
                        L.stack[ra] = table.metatable.__index(table, key);
                    // }
                    break;
                }
                case "OP_SETTABUP": {
                    let table = cl.upvals[i.A].val(L);
                    let key = this.RKB(base, k, i);
                    let v = this.RKC(base, k, i);

                    // if (!table.ttistable() || !table.metatable.__index(table, key)) {
                    //     // __index
                    // } else {
                        table.metatable.__newindex(table, key, v);
                    // }

                    break;
                }
                case "OP_GETTABLE": {
                    let table = this.RKB(base, k, i);
                    let key = this.RKC(base, k, i);

                    // if (!table.ttistable() || !table.metatable.__index(table, key)) {
                    //     // __index
                    // } else {
                        L.stack[ra] = table.metatable.__index(table, key);
                    // }
                    break;
                }
                case "OP_SETTABLE": {
                    let table = L.stack[ra];
                    let key = this.RKB(base, k, i);
                    let v = this.RKC(base, k, i);

                    // if (!table.ttistable() || !table.metatable.__index(table, key)) {
                    //     // __index
                    // } else {
                        table.metatable.__newindex(table, key, v);
                    // }

                    break;
                }
                case "OP_NEWTABLE": {
                    L.stack[ra] = new Table();
                    break;
                }
                case "OP_SELF": {
                    let table = L.stack[this.RB(base, i)];
                    let key = this.RKC(base, k, i);

                    L.stack[ra + 1] = table;

                    // if (!table.ttistable() || !table.metatable.__index(table, key)) {
                    //     // __index
                    // } else {
                        L.stack[ra] = table.metatable.__index(table, key);
                    // }

                    break;
                }
                case "OP_ADD": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value + op2.value)|0);
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, op1.value + op2.value);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${op1.value} and ${op2.value}`);
                    }
                    break;
                }
                case "OP_SUB": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value - op2.value)|0);
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, op1.value - op2.value);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${op1.value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_MUL": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value * op2.value)|0);
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, k[i.B].value * op2.value);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_MOD": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value % op2.value)|0);
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, k[i.B].value % op2.value);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_POW": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, Math.pow(op1.value, op2.value));
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_DIV": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, k[i.B].value / op2.value);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_IDIV": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value / op2.value)|0);
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, (op1.value / op2.value)|0);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_BAND": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value & op2.value)|0);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_BOR": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value | op2.value)|0);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_BXOR": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value ^ op2.value)|0);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_SHL": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value << op2.value)|0);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_SHR": {
                    let op1 = this.RKB(base, k, i);
                    let op2 = this.RKC(base, k, i);
                    let numberop1 = LuaVM.tonumber(op1);
                    let numberop2 = LuaVM.tonumber(op2);

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, (op1.value >> op2.value)|0);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                }
                case "OP_UNM": {
                    let op = L.stack[this.RB(base, i)];
                    let numberop = LuaVM.tonumber(op);

                    if (op.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, -op.value);
                    } else if (numberop !== false) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMFLT, -op.value);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform unary operation on ${op.value}`);
                    }
                    break;
                }
                case "OP_BNOT": {
                    let op = L.stack[this.RB(base, i)];
                    let numberop = LuaVM.tonumber(op);

                    if (op.ttisinteger()) {
                        L.stack[ra] = new TValue(CT.LUA_TNUMINT, ~op.value);
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform unary operation on ${op.value}`);
                    }
                    break;
                }
                case "OP_NOT": {
                    let op = L.stack[this.RB(base, i)];
                    L.stack[ra] = new TValue(CT.LUA_TBOOLEAN, LuaVM.l_isfalse(op));
                    break;
                }
                case "OP_LEN": {
                    break;
                }
                case "OP_CONCAT": {
                    break;
                }
                case "OP_JMP": {
                    this.dojump(ci, i, 0);
                    break;
                }
                case "OP_EQ": {
                    if (LuaVM.luaV_equalobj(this.RKB(base, k, i), this.RKC(base, k, i)) !== i.A)
                        ci.pcOff++;
                    else
                        this.donextjump(ci);
                    base = ci.u.l.base;
                    break;
                }
                case "OP_LT": {
                    if (LuaVM.luaV_lessthan(this.RKB(base, k, i), this.RKC(base, k, i)) !== i.A)
                        ci.pcOff++;
                    else
                        this.donextjump(ci);
                    base = ci.u.l.base;
                    break;
                }
                case "OP_LE": {
                    if (LuaVM.luaV_lessequal(this.RKB(base, k, i), this.RKC(base, k, i)) !== i.A)
                        ci.pcOff++;
                    else
                        this.donextjump(ci);
                    base = ci.u.l.base;
                    break;
                }
                case "OP_TEST": {
                    if (i.C ? LuaVM.l_isfalse(L.stack[ra]) : !LuaVM.l_isfalse(L.stack[ra]))
                        ci.pcOff++;
                    else
                        this.donextjump(ci);
                    break;
                }
                case "OP_TESTSET": {
                    let rb = L.stack[this.RB(base, i)];
                    if (i.C ? LuaVM.l_isfalse(rb) : !LuaVM.l_isfalse(rb))
                        ci.pcOff++;
                    else {
                        L.stack[ra] = rb;
                        this.donextjump(ci);
                    }
                    break;
                }
                case "OP_CALL": {
                    let b = i.B;
                    let nresults = i.C - 1;

                    if (b !== 0)
                        L.top = ra+b;

                    if (ldo.precall(L, ra, L.stack[ra], nresults)) {
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
                    if (ldo.precall(L, ra, L.stack[ra], LUA_MULTRET)) { // JS function
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
                        if (cl.p.p.length > 0) this.closeupvals(oci.u.l.base);
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
                    if (cl.p.p.length > 0) this.closeupvals(base);
                    let b = ldo.postcall(L, ci, ra, (i.B !== 0 ? i.B - 1 : L.top - ra));

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
                    let forlimit = LuaVM.forlimit(plimit, pstep.value);

                    if (init.ttisinteger() && pstep.ttisinteger() && forlimit.casted) { /* all values are integer */
                        let initv = forlimit.stopnow ? 0 : init.value;
                        plimit.value = forlimit.ilimit;
                        init.value = initv - pstep.value;
                    } else { /* try making all values floats */
                        let ninit = LuaVM.tonumber(init);
                        let nlimit = LuaVM.tonumber(plimit);
                        let nstep = LuaVM.tonumber(pstep);

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
                    break;
                }
                case "OP_TFORLOOP": {
                    if (!L.stack[ra + 1].ttisnil()) { /* continue loop? */
                        L.stack[ra] = L.stack[ra + 1]; /* save control variable */
                        ci.cpOff += i.sBx; /* jump back */
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

                    let table = L.stack[ra].value;
                    let last = ((c - 1) * OC.LFIELDS_PER_FLUSH) + n;

                    for (; n > 0; n--) {
                        table.array[last--] = L.stack[ra + n];
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
                            ncl.upvals[i] = this.findupval(base + uv[i].idx);
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
                        ra = this.RA(base, i); /* previous call may change the stack */

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
    }

    findupval(level) {
        let L = this.L;
        let pp = L.openupval;
        
        while(pp !== null && pp.v >= level) {
            let p = pp;

            if (p.v === level)
                return p;

            pp = p.u.open.next;
        }

        let uv = new UpVal();
        uv.refcount = 0;
        uv.u.open.next = pp;
        uv.u.open.touched = true;

        pp = uv;

        uv.v = level;

        // Thread with upvalue list business ? lfunc.c:75

        return uv;
    }

    closeupvals(level) {
        let L = this.L;
        while (L.openupval !== null && L.openupval.v >= level) {
            let uv = L.openupval;
            assert(uv.isopen());
            L.openupval = uv.u.open.next; /* remove from 'open' list */
            if (uv.refcount > 0) {
                uv.value = L.stack[uv.v];
                uv.v = null;
            }
        }
    }

    dojump(ci, i, e) {
        let a = i.A;
        if (a != 0) closeupvals(ci.u.l.base + a - 1);
        ci.pcOff += i.sBx + e;
    }

    donextjump(ci) {
        this.dojump(ci, ci.u.l.savedpc[ci.pcOff], 1);
    }

    static luaV_lessequal(l, r) {
        if (l.ttisnumber() && r.ttisnumber())
            return LuaVM.LEnum(l, r);
        else if (l.ttisstring() && r.ttisstring())
            return LuaVM.l_strcmp(l, r) <= 0;
        // TODO: metatable
        // else if  (l.metatable.__le || r.metatable.__le) {
        //     let res = l.metatable.__le ? l.metatable.__le(l, r) : r.metatable.__le(l, r);
        //     if (res >= 0)
        //         return res;
        // } else {
        //     L.ci.callstatus |= lstate.CIST_LEQ;
        //     let res = l.metatable.__lt ? l.metatable.__lt(r, l) : r.metatable.__lt(r, l);
        //     L.ci.callstatus ^= lstate.CIST_LEQ;
        //     if (res < 0)
        //         throw new Error("attempt to compare ...");
        //     return !res;
        // }
    }

    static luaV_lessthan(l, r) {
        if (l.ttisnumber() && r.ttisnumber())
            return LuaVM.LTnum(l, r);
        else if (l.ttisstring() && r.ttisstring())
            return LuaVM.l_strcmp(l, r) < 0;
        // TODO: metatable
        // else if  (l.metatable.__lt || r.metatable.__lt) {
        //     let res = l.metatable.__lt ? l.metatable.__lt(l, r) : r.metatable.__lt(l, r);
        //     if (res < 0)
        //         throw new Error("attempt to compare ...")
        //     return res;
        // }
    }

    static luaV_equalobj(t1, t2) {
        if (t1.ttype() !== t2.ttype()) { /* not the same variant? */
            if (t1.ttnov() !== t2.ttnov() || t1.ttnov() !== CT.LUA_NUMBER)
                return 0; /* only numbers can be equal with different variants */
            else { /* two numbers with different variants */
                /* compare them as integers */
                return Math.floor(t1.value) === Math.floor(t2.value) // TODO: tointeger
            }
        }

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
                // TODO: __eq
            default:
                return t1.value === t2.value ? 1 : 0;
        }
    }

    static forlimit(obj, step) {
        let stopnow = false;
        let ilimit = LuaVM.luaV_tointeger(obj, step < 0 ? 2 : 1);
        if (ilimit === false) {
            let n = LuaVM.tonumber(obj);
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
    }

    /*
    ** try to convert a value to an integer, rounding according to 'mode':
    ** mode == 0: accepts only integral values
    ** mode == 1: takes the floor of the number
    ** mode == 2: takes the ceil of the number
    */
    static luaV_tointeger(obj, mode) {
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
            return LuaVM.luaV_tointeger(parseFloat(obj.value), mode); // TODO: luaO_str2num
        }

        return false;
    }

    static tonumber(v) {
        if (v.type === CT.LUA_TNUMFLT)
            return new TValue(v.type, v.value);

        if (v.type === CT.LUA_TNUMINT)
            return new TValue(CT.LUA_TNUMFLT, v.value);

        if (v.type === CT.LUA_TSHRSTR || v.type === CT.LUA_TLNGSTR)
            return new TValue(CT.LUA_TNUMFLT, parseFloat(v.value)); // TODO: luaO_str2num

        return false;
    }

    static LTnum(l, r) {
        if (l.ttisinteger()) {
            if (r.ttisinteger())
                return l.value < r.value ? 1 : 0;
            else
                return LuaVM.LTintfloat(r.value, l.value);
        } else {
            if (r.ttisfloat())
                return l.value < r.value ? 1 : 0;
            else if (isNan(l.value))
                return 0;
            else
                return !LuaVM.LEintfloat(r.value, l.value);
        }
    }

    static LEnum(l, r) {
        if (l.ttisinteger()) {
            if (r.ttisinteger())
                return l.value <= r.value ? 1 : 0;
            else
                return LuaVM.LEintfloat(l.value, r.value);
        } else {
            if (r.ttisfloat())
                return l.value <= r.value ? 1 : 0;
            else if (isNan(l.value))
                return false;
            else
                return !LuaVM.LTintfloat(r.value, l.value);
        }
    }

    static LEintfloat(l, r) {
        // TODO: LEintfloat
        return l <= r ? 1 : 0;
    }

    static LTintfloat(l, r) {
        // TODO: LTintfloat
        return l < r ? 1 : 0;
    }

    static l_strcmp(ls, rs) {
        // TODO: lvm.c:248 static int l_strcmp (const TString *ls, const TString *rs)
        return ls.value === rs.value ? 0 : (ls.value < rs.value ? -1 : 1);
    }

    static l_isfalse(o) {
        return o.ttisnil() || (o.ttisboolean() && o.value === false)
    }

}

module.exports = {
    LuaVM: LuaVM
};