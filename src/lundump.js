/*jshint esversion: 6 */
"use strict";

const fs             = require('fs');
const assert         = require('assert');

const lua            = require('./lua.js');
const LClosure       = require('./lobject.js').LClosure;
const TValue         = require('./lobject.js').TValue;
const Proto          = require('./lfunc.js').Proto;
const constant_types = require('./lua.js').constant_types;
const OpCodes        = require('./lopcodes.js');

const LUAI_MAXSHORTLEN = 40;

class BytecodeParser {

    constructor(L, dataView) {
        this.L = L;
        this.intSize = 4;
        this.size_tSize = 8;
        this.instructionSize = 4;
        this.integerSize = 8;
        this.numberSize = 8;

        this.dataView = dataView;
        this.offset = 0;
    }

    peekByte() {
        return this.dataView.getUint8(this.offset, true);
    }

    readByte() {
        let byte = this.peekByte();
        this.offset++;
        return byte;
    }

    peekInteger() {
        return this.dataView.getInt32(this.offset, true);
    }

    readInteger() {
        let integer = this.peekInteger();
        this.offset += this.integerSize;

        return integer;
    }

    peekInt() {
        return this.dataView.getInt32(this.offset, true);
    }

    readInt() {
        let integer = this.peekInt();
        this.offset += 4;

        return integer;
    }

    peekNumber() {
        return this.dataView.getFloat64(this.offset, true);
    }

    readNumber() {
        let number = this.peekNumber();
        this.offset += this.numberSize;

        return number;
    }

    read8bitString(n) {
        let size = typeof n !== 'undefined' ? n : this.readByte() - 1;

        if (size === 0xFF) // TODO: test
            this.offset += this.size_tSize;

        if (size === 0) {
            return null;
        }

        let string = [];

        for (let i = 0; i < size; i++)
            string.push(this.readByte());

        return string;
    }

    readString(n) {
        let size = typeof n !== 'undefined' ? n : this.readByte() - 1;

        if (size === 0xFF) // TODO: test
            this.offset += this.size_tSize;

        if (size === 0) {
            return null;
        }

        let string = "";

        for (let i = 0; i < size; i++)
            string += String.fromCharCode(this.readByte());

        return string;
    }

    /* creates a mask with 'n' 1 bits at position 'p' */
    static MASK1(n, p) {
        return ((~((~0)<<(n)))<<(p));
    }

    /* creates a mask with 'n' 0 bits at position 'p' */
    static MASK0(n, p) {
        return (~BytecodeParser.MASK1(n,p));
    }

    readInstruction() {
        let ins = new DataView(new ArrayBuffer(this.instructionSize));
        for (let i = 0; i < this.instructionSize; i++)
            ins.setUint8(i, this.readByte());

        return ins.getUint32(0, true);
    }

    readCode(f) {
        let n = this.readInt();
        let o = OpCodes;
        let p = BytecodeParser;

        for (let i = 0; i < n; i++) {
            let ins = this.readInstruction();
            f.code[i] = {
                code:   ins,
                opcode: (ins >> o.POS_OP) & p.MASK1(o.SIZE_OP, 0),
                A:      (ins >> o.POS_A)  & p.MASK1(o.SIZE_A,  0),
                B:      (ins >> o.POS_B)  & p.MASK1(o.SIZE_B,  0),
                C:      (ins >> o.POS_C)  & p.MASK1(o.SIZE_C,  0),
                Bx:     (ins >> o.POS_Bx) & p.MASK1(o.SIZE_Bx, 0),
                Ax:     (ins >> o.POS_Ax) & p.MASK1(o.SIZE_Ax, 0),
                sBx:    ((ins >> o.POS_Bx) & p.MASK1(o.SIZE_Bx, 0)) - o.MAXARG_sBx
            };
        }
    }

    readUpvalues(f) {
        let n = this.readInt();

        for (let i = 0; i < n; i++) {
            f.upvalues[i] = {
                name:    null,
                instack: this.readByte(),
                idx:     this.readByte()
            };
        }
    }

    readConstants(f) {
        let n = this.readInt();
        
        for (let i = 0; i < n; i++) {
            let t = this.readByte();

            switch (t) {
            case constant_types.LUA_TNIL:
                f.k.push(new TValue(constant_types.LUA_TNIL, null));
                break;
            case constant_types.LUA_TBOOLEAN:
                f.k.push(new TValue(constant_types.LUA_TBOOLEAN, this.readByte()));
                break;
            case constant_types.LUA_TNUMFLT:
                f.k.push(new TValue(constant_types.LUA_TNUMFLT, this.readNumber()));
                break;
            case constant_types.LUA_TNUMINT:
                f.k.push(new TValue(constant_types.LUA_TNUMINT, this.readInteger()));
                break;
            case constant_types.LUA_TSHRSTR:
            case constant_types.LUA_TLNGSTR:
                f.k.push(this.L.l_G.intern(this.read8bitString()));
                break;
            default:
                throw new Error(`unrecognized constant '${t}'`);
            }
        }
    }

    readProtos(f) {
        let n = this.readInt();

        for (let i = 0; i < n; i++) {
            f.p[i] = new Proto(this.L);
            this.readFunction(f.p[i], f.source);
        }
    }

    readDebug(f) {
        let n = this.readInt();
        for (let i = 0; i < n; i++)
            f.lineinfo[i] = this.readInt();

        n = this.readInt();
        for (let i = 0; i < n; i++) {
            f.locvars[i] = {
                varname: this.readString(),
                startpc: this.readInt(),
                endpc:   this.readInt()
            };
        }

        n = this.readInt();
        for (let i = 0; i < n; i++) {
            f.upvalues[i].name = this.readString();
        }
    }

    readFunction(f, psource) {
        f.source = this.readString();
        if (f.source === null || f.source === undefined || f.source.length === 0)  /* no source in dump? */
            f.source = psource;  /* reuse parent's source */
        f.linedefined = this.readInt();
        f.lastlinedefined = this.readInt();
        f.numparams = this.readByte();
        f.is_vararg = this.readByte();
        f.maxstacksize = this.readByte();
        this.readCode(f);
        this.readConstants(f);
        this.readUpvalues(f);
        this.readProtos(f);
        this.readDebug(f);
    }

    checkHeader() {
        if (this.readString(4) !== lua.LUA_SIGNATURE)
            throw new Error("bad LUA_SIGNATURE, expected '<esc>Lua'");

        if (this.readByte() !== 0x53)
            throw new Error("bad Lua version, expected 5.3");

        if (this.readByte() !== 0)
            throw new Error("supports only official PUC-Rio implementation");

        if (this.readString(6) !== "\x19\x93\r\n\x1a\n")
            throw new Error("bytecode corrupted");

        this.intSize         = this.readByte();
        this.size_tSize      = this.readByte();
        this.instructionSize = this.readByte();
        this.integerSize     = this.readByte();
        this.numberSize      = this.readByte();

        if (this.readInteger() !== 0x5678)
            throw new Error("endianness mismatch");

        if (this.readNumber() !== 370.5)
            throw new Error("float format mismatch");

    }

    luaU_undump() {
        this.checkHeader();

        let cl = new LClosure(this.L, this.readByte());

        this.L.stack[this.L.top] = cl;
        this.L.top++;

        cl.p = new Proto();

        this.readFunction(cl.p);

        assert(cl.nupvalues === cl.p.upvalues.length);

        return cl;
    }

}

module.exports = BytecodeParser;