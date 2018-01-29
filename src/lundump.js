"use strict";

const {
    LUA_SIGNATURE,
    constant_types: {
        LUA_TBOOLEAN,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TSHRSTR
    },
    thread_status: { LUA_ERRSYNTAX },
    is_luastring,
    luastring_eq,
    to_luastring
} = require('./defs.js');
const ldo      = require('./ldo.js');
const lfunc    = require('./lfunc.js');
const lobject  = require('./lobject.js');
const {
    MAXARG_sBx,
    POS_A,
    POS_Ax,
    POS_B,
    POS_Bx,
    POS_C,
    POS_OP,
    SIZE_A,
    SIZE_Ax,
    SIZE_B,
    SIZE_Bx,
    SIZE_C,
    SIZE_OP
} = require('./lopcodes.js');
const { lua_assert } = require("./llimits.js");
const { luaS_bless } = require('./lstring.js');
const {
    luaZ_read,
    ZIO
} = require('./lzio.js');

let LUAC_DATA = [0x19, 0x93, 13, 10, 0x1a, 10];

class BytecodeParser {

    constructor(L, Z, name) {
        this.intSize = 4;
        this.size_tSize = 4;
        this.instructionSize = 4;
        this.integerSize = 4;
        this.numberSize = 8;

        lua_assert(Z instanceof ZIO, "BytecodeParser only operates on a ZIO");
        lua_assert(is_luastring(name));

        if (name[0] === 64 /* ('@').charCodeAt(0) */ || name[0] === 61 /* ('=').charCodeAt(0) */)
            this.name = name.subarray(1);
        else if (name[0] == LUA_SIGNATURE.charCodeAt(0))
            this.name = to_luastring("binary string", true);
        else
            this.name = name;

        this.L = L;
        this.Z = Z;

        // Used to do buffer to number conversions
        this.arraybuffer = new ArrayBuffer(
            Math.max(this.intSize, this.size_tSize, this.instructionSize, this.integerSize, this.numberSize)
        );
        this.dv = new DataView(this.arraybuffer);
        this.u8 = new Uint8Array(this.arraybuffer);
    }

    read(size) {
        let u8 = new Uint8Array(size);
        if(luaZ_read(this.Z, u8, 0, size) !== 0)
            this.error("truncated");
        return u8;
    }

    readByte() {
        if (luaZ_read(this.Z, this.u8, 0, 1) !== 0)
            this.error("truncated");
        return this.u8[0];
    }

    readInteger() {
        if (luaZ_read(this.Z, this.u8, 0, this.integerSize) !== 0)
            this.error("truncated");
        return this.dv.getInt32(0, true);
    }

    readSize_t() {
        return this.readInteger();
    }

    readInt() {
        if (luaZ_read(this.Z, this.u8, 0, this.intSize) !== 0)
            this.error("truncated");
        return this.dv.getInt32(0, true);
    }

    readNumber() {
        if (luaZ_read(this.Z, this.u8, 0, this.numberSize) !== 0)
            this.error("truncated");
        return this.dv.getFloat64(0, true);
    }

    readString() {
        let size = Math.max(this.readByte() - 1, 0);

        if (size + 1 === 0xFF)
            size = this.readSize_t() - 1;

        if (size === 0) {
            return null;
        }

        return luaS_bless(this.L, this.read(size));
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
        if (luaZ_read(this.Z, this.u8, 0, this.instructionSize) !== 0)
            this.error("truncated");
        return this.dv.getUint32(0, true);
    }

    readCode(f) {
        let n = this.readInt();
        let p = BytecodeParser;

        for (let i = 0; i < n; i++) {
            let ins = this.readInstruction();
            f.code[i] = {
                code:   ins,
                opcode: (ins >> POS_OP) & p.MASK1(SIZE_OP, 0),
                A:      (ins >> POS_A)  & p.MASK1(SIZE_A,  0),
                B:      (ins >> POS_B)  & p.MASK1(SIZE_B,  0),
                C:      (ins >> POS_C)  & p.MASK1(SIZE_C,  0),
                Bx:     (ins >> POS_Bx) & p.MASK1(SIZE_Bx, 0),
                Ax:     (ins >> POS_Ax) & p.MASK1(SIZE_Ax, 0),
                sBx:    ((ins >> POS_Bx) & p.MASK1(SIZE_Bx, 0)) - MAXARG_sBx
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
                case LUA_TNIL:
                    f.k.push(new lobject.TValue(LUA_TNIL, null));
                    break;
                case LUA_TBOOLEAN:
                    f.k.push(new lobject.TValue(LUA_TBOOLEAN, this.readByte() !== 0));
                    break;
                case LUA_TNUMFLT:
                    f.k.push(new lobject.TValue(LUA_TNUMFLT, this.readNumber()));
                    break;
                case LUA_TNUMINT:
                    f.k.push(new lobject.TValue(LUA_TNUMINT, this.readInteger()));
                    break;
                case LUA_TSHRSTR:
                case LUA_TLNGSTR:
                    f.k.push(new lobject.TValue(LUA_TLNGSTR, this.readString()));
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
        f.is_vararg = this.readByte() !== 0;
        f.maxstacksize = this.readByte();
        this.readCode(f);
        this.readConstants(f);
        this.readUpvalues(f);
        this.readProtos(f);
        this.readDebug(f);
    }

    checkliteral(s, msg) {
        let buff = this.read(s.length);
        if (!luastring_eq(buff, s))
            this.error(msg);
    }

    checkHeader() {
        this.checkliteral(to_luastring(LUA_SIGNATURE.substring(1)), "not a"); /* 1st char already checked */

        if (this.readByte() !== 0x53)
            this.error("version mismatch in");

        if (this.readByte() !== 0)
            this.error("format mismatch in");

        this.checkliteral(LUAC_DATA, "corrupted");

        this.intSize         = this.readByte();
        this.size_tSize      = this.readByte();
        this.instructionSize = this.readByte();
        this.integerSize     = this.readByte();
        this.numberSize      = this.readByte();

        this.checksize(this.intSize, 4, "int");
        this.checksize(this.size_tSize, 4, "size_t");
        this.checksize(this.instructionSize, 4, "instruction");
        this.checksize(this.integerSize, 4, "integer");
        this.checksize(this.numberSize, 8, "number");

        if (this.readInteger() !== 0x5678)
            this.error("endianness mismatch in");

        if (this.readNumber() !== 370.5)
            this.error("float format mismatch in");

    }

    error(why) {
        lobject.luaO_pushfstring(this.L, to_luastring("%s: %s precompiled chunk"), this.name, to_luastring(why));
        ldo.luaD_throw(this.L, LUA_ERRSYNTAX);
    }

    checksize(byte, size, tname) {
        if (byte !== size)
            this.error(`${tname} size mismatch in`);
    }
}

const luaU_undump = function(L, Z, name) {
    let S = new BytecodeParser(L, Z, name);
    S.checkHeader();
    let cl = lfunc.luaF_newLclosure(L, S.readByte());
    ldo.luaD_inctop(L);
    L.stack[L.top-1].setclLvalue(cl);
    cl.p = new lfunc.Proto(L);
    S.readFunction(cl.p, null);
    lua_assert(cl.nupvalues === cl.p.upvalues.length);
    /* luai_verifycode */
    return cl;
};

module.exports.luaU_undump = luaU_undump;
