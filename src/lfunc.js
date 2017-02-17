/*jshint esversion: 6 */
"use strict";
const assert = require('assert');

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

    isopen() {
        return this.v !== null;
    }

}

const findupval = function(L, level) {
    let pp = L.openupval;
    
    while(pp !== null && pp.v >= level) {
        let p = pp;

        if (p.v === level)
            return p;

        pp = p.u.open.next;
    }

    let uv = new UpVal();
    uv.refcount = 0;
    uv.u.open.next = pp;
    uv.u.open.touched = true;

    pp = uv;

    uv.v = level;

    // Thread with upvalue list business ? lfunc.c:75

    return uv;
};

const luaF_close = function(L, level) {
    while (L.openupval !== null && L.openupval.v >= level) {
        let uv = L.openupval;
        assert(uv.isopen());
        L.openupval = uv.u.open.next; /* remove from 'open' list */
        if (uv.refcount > 0) {
            uv.value = L.stack[uv.v];
            uv.v = null;
        }
    }
};

const luaF_initupvals = function(L, cl) {
    for (let i = 0; i < cl.nupvalues; i++) {
        let uv = new UpVal();
        uv.refcount = 1;
        uv.u.value = null;
        uv.v = uv.u.value;
    }
};

module.exports.Proto            = Proto;
module.exports.UpVal            = UpVal;
module.exports.findupval        = findupval;
module.exports.luaF_close       = luaF_close;
module.exports.MAXUPVAL         = 255;
module.exports.luaF_initupvals  = luaF_initupvals;