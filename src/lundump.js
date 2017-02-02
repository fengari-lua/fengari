/*jshint esversion: 6 */
"use strict";

const DataView  = require('buffer-dataview');
const fs        = require('fs');
const lua_State = require('./lstate.js').lua_State;
const LClosure  = require('./lobject.js').LClosure;

/**
 * Parse Lua 5.3 bytecode
 * @see {@link http://www.lua.org/source/5.3/lundump.c.html|lundump.c}
 */
class BytecodeParser {

    /**
     * Initilialize bytecode parser
     * @constructor
     * @param {DataView} dataView Contains the binary data
     */
    constructor(dataView) {
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

    peekWord() {
        return this.dataView.getUint32(this.offset, true);
    }

    readWord() {
        let word = this.peekWord();
        this.offset += 4;

        return word;
    }

    checkHeader() {
        if (this.readByte() !== 0x1b
            || this.readByte() !== 0x4c
            || this.readByte() !== 0x75
            || this.readByte() !== 0x61)
            throw new Error("Bad LUA_SIGNATURE, expected [1b 4c 75 61]");

        if (this.readByte() !== 0x53)
            throw new Error("Bad Lua version, expected 5.3");

        if (this.readByte() !== 0)
            throw new Error("Supports only official PUC-Rio implementation")
    }

    luaU_undump() {
        checkHeader();
        let cl = new LClosure(L, this.readByte());

        return cl;
    }

}