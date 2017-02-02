/*jshint esversion: 6 */
"use strict";

const BytecodeParser = require("./lundump.js");

class LuaVM {

    constructor(cl) {
        this.cl = cl
    }

    execute() {
        newframe:
        for (;;) {

        }
    }

}

module.exports = {
    LuaVM: LuaVM,
    OpCodes: OpCodes
};