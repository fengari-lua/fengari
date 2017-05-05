/*jshint esversion: 6 */
"use strict";
const assert  = require('assert');

const defs    = require('./defs.js');
const lobject = require('./lobject.js');
const CT      = defs.constant_types;

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

    constructor(L) {
        this.L = L; // Keep track of the thread it comes from
        this.v = null; /* if open: stack index. if closed: null (find value in this.u.value) */
        this.refcount = 0;
        this.u = {
            open: { /* (when open) */
                next: null, /* linked list */
                touched: false /* mark to avoid cycles with dead threads */
            },
            value: null /* the value (when closed) */
        };
    }

    val() {
        return this.v !== null ? this.L.stack[this.v] : this.u.value;
    }

    setval(L, ra) {
        if (this.v !== null) {
            this.L.stack[this.v] = L.stack[ra];
        } else {
            this.u.value.setfrom(L.stack[ra]);
        }
    }

    isopen() {
        return this.v !== null;
    }

}

const luaF_newLclosure = function(L, n) {
    let c = new lobject.LClosure(L, n);
    return c;
};


const findupval = function(L, level) {
    let pp = L.openupval;
    
    while(pp !== null && pp.v >= level) {
        let p = pp;

        if (p.v === level)
            return p;

        pp = p.u.open.next;
    }

    let uv = new UpVal(L);
    uv.u.open.next = pp;
    uv.u.open.touched = true;

    L.openupval = uv;

    uv.v = level;

    return uv;
};

const luaF_close = function(L, level) {
    while (L.openupval !== null && L.openupval.v >= level) {
        let uv = L.openupval;
        assert(uv.isopen());
        L.openupval = uv.u.open.next; /* remove from 'open' list */
        if (uv.refcount > 0) {
            let from = uv.L.stack[uv.v];
            uv.u.value = new lobject.TValue(from.type, from.value);
            uv.v = null;
        }
    }
};

/*
** fill a closure with new closed upvalues
*/
const luaF_initupvals = function(L, cl) {
    for (let i = 0; i < cl.nupvalues; i++) {
        let uv = new UpVal(L);
        uv.refcount = 1;
        uv.u.value = new lobject.TValue(CT.LUA_TNIL, null);
        uv.v = null;
        cl.upvals[i] = uv;
    }
};

/*
** Look for n-th local variable at line 'line' in function 'func'.
** Returns null if not found.
*/
const luaF_getlocalname = function(f, local_number, pc) {
    for (let i = 0; i < f.locvars.length && f.locvars[i].startpc <= pc; i++) {
        if (pc < f.locvars[i].endpc) {  /* is variable active? */
            local_number--;
            if (local_number === 0)
                return f.locvars[i].varname;
        }
    }
    return null;  /* not found */
};


module.exports.MAXUPVAL          = 255;
module.exports.Proto             = Proto;
module.exports.UpVal             = UpVal;
module.exports.findupval         = findupval;
module.exports.luaF_close        = luaF_close;
module.exports.luaF_getlocalname = luaF_getlocalname;
module.exports.luaF_initupvals   = luaF_initupvals;
module.exports.luaF_newLclosure  = luaF_newLclosure;
