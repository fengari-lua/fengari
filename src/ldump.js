"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lstate  = require('./lstate.js');
const lobject = require('./lobject.js');
const CT      = lua.constant_types;

const LUAC_DATA    = "\x19\x93\r\n\x1a\n";
const LUAC_INT     = 0x5678;
const LUAC_NUM     = 370.5;
const LUAC_VERSION = lua.LUA_VERSION_MAJOR.charCodeAt(0) * 16 + lua.LUA_VERSION_MINOR.charCodeAt(0);
const LUAC_FORMAT  = 0;   /* this is the official format */

class DumpState {
    constructor() {
        this.L = null;
        this.write = null;
        this.data = null;
        this.strip = NaN;
        this.status = NaN;
    }
}

const DumpBlock = function(b, size, D) {
    if (D.status === 0 && size > 0)
        D.status = D.writer(D.L, b, size, D.data);
};

const DumpVector = function(v, n, D) {
    DumpBlock(v, n, D);
};

const DumpLiteral = function(s, D) {
    DumpBlock(s, s.length, D);
};

const DumpVar = function (x,D) {
    DumpVector(x, 1, D);
};

const DumpByte = function(y, D) {
    DumpVar(y, D);
};

const DumpInt = function(x, D) {
    DumpVar(x, D);
};

const DumpInteger = DumpInt;

const DumpNumber = function(x, D) {
    DumpVar(x, D);
};

const DumpString = function(s, D) {
    if (s === null)
        DumpByte(0, D);
    else {
        let size = s.value.length + 1;
        let str = s.value;
        if (size < 0xFF)
            DumpByte(size, D);
        else {
            DumpByte(0xFF, D);
            DumpVar(size, D);
        }
        DumpVector(str, size - 1, D);  /* no need to save '\0' */
    }
};

const DumpCode = function(f, D) {
    DumpInt(f.code.length, D);
    DumpVector(f.code, f.code.length, D);
};

const DumpConstants = function(f, D) {
    let n = f.k.length;
    DumpInt(n, D);
    for (let i = 0; i < n; i++) {
        let o = f.k[i];
        DumpByte(o.ttype(), D);
        switch (o.ttype()) {
            case CT.LUA_TNIL:
                break;
            case CT.LUA_TBOOLEAN:
                DumpByte(o.value ? 1 : 0, D);
                break;
            case CT.LUA_TNUMFLT:
                DumpNumber(o.value, D);
                break;
            case CT.LUA_TNUMINT:
                DumpInteger(o.value, D);
                break;
            case CT.LUA_TSHRSTR:
            case CT.LUA_TLNGSTR:
                DumpString(o.value, D);
                break;
        }
    }
};

const DumpProtos = function(f, D) {
    let n = f.p.length;
    DumpInt(n, D);
    for (let i = 0; i < n; i++)
        DumpFunction(f.p[i], f.source, D);
};

const DumpUpvalues = function(f, D) {
    let n = f.upvalues.length;
    DumpInt(n, D);
    for (let i = 0; i < n; i++) {
        DumpByte(f.upvalues[i].instack ? 1 : 0, D);
        DumpByte(f.upvalues[i].idx, D);
    }
};

const DumpDebug = function(f, D) {
    let n = D.strip ? 0 : f.lineinfo.length;
    DumpInt(n, D);
    DumpVector(f.lineinfo, n, D);
    n = D.strip ? 0 : f.locvars.length;
    DumpInt(n, D);
    for (let i = 0; i < n; i++) {
        DumpString(f.locvars[i].varname, D);
        DumpInt(f.locvars[i].startpc, D);
        DumpInt(f.locvars[i].endpc, D);
    }
    n = D.strip ? 0 : f.upvalues.length;
    DumpInt(n, D);
    for (let i = 0; i < n; i++)
        DumpString(f.upvalues[i].name, D);
};

const DumpFunction = function(f, psource, D) {
    if (D.strip || f.source === psource)
        DumpString(null, D);  /* no debug info or same source as its parent */
    else
        DumpString(f.source, D);
    DumpInt(f.linedefined, D);
    DumpInt(f.lastlinedefined, D);
    DumpByte(f.numparams, D);
    DumpByte(f.is_vararg, D);
    DumpByte(f.maxstacksize, D);
    DumpCode(f, D);
    DumpConstants(f, D);
    DumpUpvalues(f, D);
    DumpProtos(f, D);
    DumpDebug(f, D);
};

const DumpHeader = function(D) {
  DumpLiteral(lua.LUA_SIGNATURE, D);
  DumpByte(LUAC_VERSION, D);
  DumpByte(LUAC_FORMAT, D);
  DumpLiteral(LUAC_DATA, D);
  DumpByte(4, D); // intSize
  DumpByte(8, D); // size_tSize
  DumpByte(4, D); // instructionSize
  DumpByte(8, D); // integerSize
  DumpByte(8, D); // numberSize
  DumpInteger(LUAC_INT, D);
  DumpNumber(LUAC_NUM, D);
};

/*
** dump Lua function as precompiled chunk
*/
const luaU_dump = function(L, f, w, data, strip) {
    let D = new DumpState();
    D.L = L;
    D.writer = w;
    D.data = data;
    D.strip = strip;
    D.status = 0;
    DumpHeader(D);
    DumpByte(f.upvalues.length, D);
    DumpFunction(f, null, D);
    return D.status;
};

module.exports.luaU_dump = luaU_dump;