/*jshint esversion: 6 */
"use strict";

class LClosure {

    constructor(n) {
        this.p = null;
        this.nupvalues = n;
    }

}

module.exports = {
    LClosure: LClosure
};