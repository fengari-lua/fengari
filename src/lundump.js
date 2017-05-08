/*jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const defs     = require('./defs.js');
const lfunc    = require('./lfunc.js');
const lobject  = require('./lobject.js');
const lopcodes = require('./lopcodes.js');
const lstring  = require('./lstring.js');
const llex     = require('./llex.js');

let LUAC_DATA = [0x19, 0x93, defs.char["\r"], defs.char["\n"], 0x1a, defs.char["\n"]];

class BytecodeParser {

    constructor(L, buffer, name) {
        assert(buffer instanceof llex.MBuffer, "BytecodeParser only operates on a MBuffer");

        this.L = L;
        this.intSize = 4;
        this.size_tSize = 8;
        this.instructionSize = 4;
        this.integerSize = 4;
        this.numberSize = 8;

        // Used to do buffer to number conversions
        this.dv = new DataView(
            new ArrayBuffer(
                Math.max(this.intSize, this.size_tSize, this.instructionSize, this.integerSize, this.numberSize)
            )
        );

        this.buffer = buffer;
        this.name = name;
    }

    read(size) {
        let buffer = this.buffer.read(size);
        assert(Array.isArray(buffer));
        if (buffer.length < size) this.error("truncated");
        return buffer;
    }

    readByte() {
        return this.read(1)[0];
    }

    readInteger() {
        let buffer = this.read(this.integerSize);
        for (let i = 0; i < buffer.length; i++)
            this.dv.setUint8(i, buffer[i]);

        return this.dv.getInt32(0, true);
    }

    readSize_t() {
        return this.readInteger();
    }

    readInt() {
        let buffer = this.read(this.intSize);

        for (let i = 0; i < buffer.length; i++)
            this.dv.setUint8(i, buffer[i]);

        return this.dv.getInt32(0, true);
    }

    readNumber() {
        let buffer = this.read(this.numberSize);

        for (let i = 0; i < buffer.length; i++)
            this.dv.setUint8(i, buffer[i]);

        return this.dv.getFloat64(0, true);
    }

    readString() {
        let size = Math.max(this.readByte() - 1, 0);

        if (size + 1 === 0xFF)
            size = this.readSize_t() - 1;

        if (size === 0) {
            return null;
        }

        return lstring.luaS_new(this.L, this.read(size));
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
        let o = lopcodes;
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
            case defs.CT.LUA_TNIL:
                f.k.push(new lobject.TValue(defs.CT.LUA_TNIL, null));
                break;
            case defs.CT.LUA_TBOOLEAN:
                f.k.push(new lobject.TValue(defs.CT.LUA_TBOOLEAN, this.readByte()));
                break;
            case defs.CT.LUA_TNUMFLT:
                f.k.push(new lobject.TValue(defs.CT.LUA_TNUMFLT, this.readNumber()));
                break;
            case defs.CT.LUA_TNUMINT:
                f.k.push(new lobject.TValue(defs.CT.LUA_TNUMINT, this.readInteger()));
                break;
            case defs.CT.LUA_TSHRSTR:
            case defs.CT.LUA_TLNGSTR:
                f.k.push(new lobject.TValue(defs.CT.LUA_TLNGSTR, this.readString()));
                break;
            default:
                this.error(`unrecognized constant '${t}'`);
            }
        }
    }

    readProtos(f) {
        let n = this.readInt();

        for (let i = 0; i < n; i++) {
            f.p[i] = new lfunc.Proto(this.L);
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
        if (f.source === null)  /* no source in dump? */
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

    checkliteral(s, msg) {
        let buff = this.read(s.length);
        if (buff.join() !== s.join())
            this.error(msg);
    }

    checkHeader() {
        this.checkliteral(defs.to_luastring(defs.LUA_SIGNATURE.substring(1)), "bad LUA_SIGNATURE, expected '<esc>Lua'"); /* 1st char already checked */

        if (this.readByte() !== 0x53)
            this.error("bad Lua version, expected 5.3");

        if (this.readByte() !== 0)
            this.error("supports only official PUC-Rio implementation");

        this.checkliteral(LUAC_DATA, "bytecode corrupted");

        this.intSize         = this.readByte();
        this.size_tSize      = this.readByte();
        this.instructionSize = this.readByte();
        this.integerSize     = this.readByte();
        this.numberSize      = this.readByte();

        this.checksize(this.intSize, 4, "int");
        this.checksize(this.size_tSize, 8, "size_t");
        this.checksize(this.instructionSize, 4, "instruction");
        this.checksize(this.integerSize, 4, "integer");
        this.checksize(this.numberSize, 8, "number");

        if (this.readInteger() !== 0x5678)
            this.error("endianness mismatch");

        if (this.readNumber() !== 370.5)
            this.error("float format mismatch");

    }

    error(why) {
        const lapi = require('./lapi.js');
        const ldo  = require('./ldo.js');
        lapi.lua_pushstring(this.L, defs.to_luastring(`${this.name}: ${why} precompiled chunk`, true));
        ldo.luaD_throw(this.L, defs.thread_status.LUA_ERRSYNTAX);
    }

    checksize(byte, size, tname) {
        if (byte !== size)
            this.error(`${tname} size mismatch in`);
    }

    luaU_undump() {
        this.checkHeader();

        let cl = lfunc.luaF_newLclosure(this.L, this.readByte());

        this.L.stack[this.L.top] = new lobject.TValue(defs.CT.LUA_TLCL, cl);
        this.L.top++;

        cl.p = new lfunc.Proto(this.L);

        this.readFunction(cl.p);

        assert(cl.nupvalues === cl.p.upvalues.length);

        return cl;
    }

}

module.exports = BytecodeParser;
