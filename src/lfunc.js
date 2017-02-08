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
    }

}

class UpVal {

    constructor() {
        this.v = null; /* if null, upval is closed, value is in u.value */
        this.u = {
            open: { /* (when open) */
                next: null, /* linked list */
                touched: false /* mark to avoid cycles with dead threads */
            },
            value: null /* the value (when closed) */
        };
    }

    val(L) {
        return this.v !== null ? L.stack[this.v] : this.u.value;
    }

    setval(L, ra) {
        if (this.v !== null) this.v = ra;
        else this.u.value = L.stack[ra];
    }

}

module.exports = {
    Proto: Proto,
    UpVal: UpVal
};