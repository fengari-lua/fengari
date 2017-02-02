/*jshint esversion: 6 */
"use strict";

class LClosure {

    constructor(L, n) {
        this.p = [];
        this.nupvalues = n;
    }

}

module.exports = {
    LClosure: LClosure
};