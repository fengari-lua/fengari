/*jshint esversion: 6 */
"use strict";

const CT = require('./lua.js').constant_types;

class LClosure {

    constructor(n) {
        this.p = null;
        this.nupvalues = n;
    }

}


class TValue {

    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

}

module.exports = {
    LClosure: LClosure,
    TValue: TValue
};