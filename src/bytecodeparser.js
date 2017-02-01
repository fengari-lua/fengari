"use strict";

const DataView = require('buffer-dataview');

/**
 * Parse Lua 5.3 bytecode
 */
class BytecodeParser {

    constructor(dataView) {
        this.dataView = dataView;
        this.offset = 0;
    }

    _read(offset, nbytes) {
        let bytes = new Uint8Array(nbytes);

        for (let i = 0; i < nbytes; i++)
            bytes[i] = this.dataView.getUint8(offset, true);

        return bytes.length === 1 ? bytes[0] : bytes;
    }

    readByte() {
        return read(this.offset++, 1);
    }

}