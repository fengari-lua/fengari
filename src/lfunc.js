/*jshint esversion: 6 */
"use strict";

class Proto {

    constructor(L) {
        this.k = [];              // constants used by the function
        this.p = [];              // functions defined inside the function
        this.code = [];           // opcodes
        this.cache = null;        // last-created closure with this prototype
        this.lineinfo = [];       // map from opcodes to source lines (debug information)
        this.upvalues = [];       // upvalue information
        this.numparams = 0;       // number of fixed parameters
        this.is_vararg = 0;
        this.maxstacksize = 0;    // number of registers needed by this function
        this.locvars = [];        // information about local variables (debug information)
        this.linedefined = 0;     // debug information
        this.lastlinedefined = 0; // debug information
        this.source = null;       // used for debug information
        this.nresults = 0;        // expected number of results from this function
    }

}

class UpVal {

    constructor() {
        this.v = null;
        this.u = {
            open: {
                next: null,
                touched: false
            },
            value: null
        };
    }

}

module.exports = {
    Proto: Proto,
    UpVal: UpVal
};