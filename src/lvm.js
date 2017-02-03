/*jshint esversion: 6 */
"use strict";

const BytecodeParser = require("./lundump.js");
const OC             = require('./lopcodes.js');
const CT             = require('./lua.js').constant_types;

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
        return OC.ISK(b) ? k[OC.INDEXK(b)] : base + i.B;
    }

    RKC(base, k, i) {
        return OC.ISK(c) ? k[OC.INDEXK(c)] : base + i.C;
    }

    static tonumber(v) {
        if (v.type === CT.LUA_TNUMFLT)
            return {
                type: v.type,
                value: v.value
            };

        if (v.type === CT.LUA_TNUMINT)
            return {
                type: CT.LUA_TNUMFLT,
                value: v.value
            };

        if (v.type === CT.LUA_TSHRSTR || v.type === CT.LUA_TLNGSTR)
            return {
                type: CT.LUA_TNUMFLT,
                value: parseFloat(v.value) // TODO 0x or other exotic form
            };

        return false;
    }

    execute() {
        let L = this.L;
        let ci = L.ci[this.L.ciOff];

        newframe:
        for (;;) {
            var cl = L.stack[ci.func];
            let k = cl.p.k;
            let base = ci.base;

            let i = ci.savedpc[ci.pcOff++];
            let ra = this.RA(base, i);

            var op1, op2, numberop1, numberop2, op, numberop;
            switch (OC.OpCodes[i.opcode]) {
                case "OP_MOVE":
                    L.stack[ra] = L.stack[this.RB(base, i)];
                    break;
                case "OP_LOADK":
                    L.stack[ra] = k[i.Bx];
                    break;
                case "OP_LOADKX":
                    assert(OC.OpCodes[ci.savedpc[ci.pcOff].opcode] === "OP_EXTRAARG");
                    L.stack[ra] = k[ci.savedpc[ci.pcOff++].Ax];
                    break;
                case "OP_LOADBOOL":
                    L.stack[ra] = {
                        type: CT.LUA_TBOOLEAN,
                        value: i.B !== 0
                    };

                    if (i.C !== 0)
                        ci.pcOff++; /* skip next instruction (if C) */

                    break;
                case "OP_LOADNIL":
                    for (let j = 0; j <= i.B; j++)
                        L.stack[ra + j] = {
                            type: CT.LUA_TNIL,
                            value: null
                        }
                    break;
                case "OP_GETUPVAL":
                    break;
                case "OP_GETTABUP":
                    break;
                case "OP_GETTABLE":
                    break;
                case "OP_SETTABUP":
                    break;
                case "OP_SETUPVAL":
                    break;
                case "OP_SETTABLE":
                    break;
                case "OP_NEWTABLE":
                    break;
                case "OP_SELF":
                    break;
                case "OP_ADD":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value + k[i.C].value
                        };
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: k[i.B].value + k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_SUB":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value - k[i.C].value
                        };
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: k[i.B].value - k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_MUL":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value * k[i.C].value
                        };
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: k[i.B].value * k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_MOD":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value % k[i.C].value
                        };
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: k[i.B].value % k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_POW":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: Math.pow(k[i.B].value, k[i.C].value)
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_DIV":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: k[i.B].value / k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_IDIV":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: Math.floor(k[i.B].value / k[i.C].value)
                        };
                    } else if (numberop1 !== false && numberop2 !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: Math.floor(k[i.B].value / k[i.C].value)
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_BAND":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value & k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_BOR":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value | k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_BXOR":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value ^ k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_SHL":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value << k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_SHR":
                    op1 = k[i.B];
                    op2 = k[i.C];
                    numberop1 = LuaVM.tonumber(op1);
                    numberop2 = LuaVM.tonumber(op2);

                    if (op1.type === CT.LUA_TNUMINT && op2.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: k[i.B].value >> k[i.C].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform binary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_UNM":
                    op = L.stack[this.RB(base, i)];
                    numberop = LuaVM.tonumber(op);

                    if (op.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: -L.stack[this.RB(base, i)].value
                        };
                    } else if (numberop !== false) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMFLT,
                            value: -L.stack[this.RB(base, i)].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform unary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_BNOT":
                    op = L.stack[this.RB(base, i)];
                    numberop = LuaVM.tonumber(op);

                    if (op.type === CT.LUA_TNUMINT) {
                        L.stack[ra] = {
                            type: CT.LUA_TNUMINT,
                            value: ~L.stack[this.RB(base, i)].value
                        };
                    } else {
                        // Metamethod
                        throw new Error(`Can't perform unary operation on ${k[i.B].value} and ${k[i.C].value}`);
                    }
                    break;
                case "OP_NOT":
                    op = L.stack[this.RB(base, i)];
                    L.stack[ra] = {
                        type: CT.LUA_TBOOLEAN,
                        value: !!((op.type === CT.LUA_TBOOLEAN && !op.value) || op.type === CT.LUA_TNIL)
                    }
                    break;
                case "OP_LEN":
                    break;
                case "OP_CONCAT":
                    break;
                case "OP_JMP":
                    break;
                case "OP_EQ":
                    break;
                case "OP_LT":
                    break;
                case "OP_LE":
                    break;
                case "OP_TEST":
                    break;
                case "OP_TESTSET":
                    break;
                case "OP_CALL":
                    break;
                case "OP_TAILCALL":
                    break;
                case "OP_RETURN":
                    if (i.B >= 2) {
                        for (let j = 0; j <= i.B-2; j++) {
                            L.stack[L.ciOff + j] = L.stack[ra + j];
                        }
                    }
                    L.ci = ci.previous;

                    // TODO what to return when end of program ?
                    console.log(L.stack);
                    if (L.ci === null) return;

                    if (i.B !== 0) L.top = ci.top;

                    continue newframe;
                    break;
                case "OP_FORLOOP":
                    break;
                case "OP_FORPREP":
                    break;
                case "OP_TFORCALL":
                    break;
                case "OP_TFORLOOP":
                    break;
                case "OP_SETLIST":
                    break;
                case "OP_CLOSURE":
                    break;
                case "OP_VARARG":
                    break;
                case "OP_EXTRAARG":
                    break;
            }
        }
    }

}

module.exports = {
    LuaVM: LuaVM
};