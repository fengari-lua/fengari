"use strict";

const assert  = require('assert');

const defs    = require('./defs.js');
const lobject = require('./lobject.js');
const CT      = defs.constant_types;

class Proto {

    constructor(L) {
        this.id = L.l_G.id_counter++;
        this.k = [];              // constants used by the function
        this.p = [];              // functions defined inside the function
        this.code = [];           // opcodes
        this.cache = null;        // last-created closure with this prototype
        this.lineinfo = [];       // map from opcodes to source lines (debug information)
        this.upvalues = [];       // upvalue information
        this.numparams = 0;       // number of fixed parameters
        this.is_vararg = false;
        this.maxstacksize = 0;    // number of registers needed by this function
        this.locvars = [];        // information about local variables (debug information)
        this.linedefined = 0;     // debug information
        this.lastlinedefined = 0; // debug information
        this.source = null;       // used for debug information
    }

}

class UpVal {

    constructor(L) {
        this.id = L.l_G.id_counter++;
        this.v = void 0; /* if open: reference to TValue on stack. if closed: TValue */
        this.vOff = void 0; /* if open: index on stack. if closed: undefined */
        this.refcount = 0;
        this.open_next = null; /* linked list (when open) */
    }

    isopen() {
        return this.vOff !== void 0;
    }

}

const luaF_newLclosure = function(L, n) {
    let c = new lobject.LClosure(L, n);
    return c;
};


const luaF_findupval = function(L, level) {
    let prevp;
    let p = L.openupval;
    while (p !== null && p.vOff >= level) {
        assert(p.isopen());
        if (p.vOff === level) /* found a corresponding upvalue? */
            return p; /* return it */
        prevp = p;
        p = p.open_next;
    }
    /* not found: create a new upvalue */
    let uv = new UpVal(L);
    /* link it to list of open upvalues */
    uv.open_next = p;
    if (prevp)
        prevp.open_next = uv;
    else
        L.openupval = uv;
    uv.v = L.stack[level]; /* current value lives in the stack */
    uv.vOff = level;
    return uv;
};

const luaF_close = function(L, level) {
    while (L.openupval !== null && L.openupval.vOff >= level) {
        let uv = L.openupval;
        assert(uv.isopen());
        L.openupval = uv.open_next; /* remove from 'open' list */
        if (uv.refcount === 0) { /* no references? */
            /* free upvalue */
            uv.v = void 0;
            uv.open_next = null;
        } else {
            let from = uv.v;
            uv.v = new lobject.TValue(from.type, from.value);
        }
        uv.vOff = void 0;
    }
};

/*
** fill a closure with new closed upvalues
*/
const luaF_initupvals = function(L, cl) {
    for (let i = 0; i < cl.nupvalues; i++) {
        let uv = new UpVal(L);
        uv.refcount = 1;
        uv.v = new lobject.TValue(CT.LUA_TNIL, null);
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
                return f.locvars[i].varname.getstr();
        }
    }
    return null;  /* not found */
};


module.exports.MAXUPVAL          = 255;
module.exports.Proto             = Proto;
module.exports.UpVal             = UpVal;
module.exports.luaF_findupval    = luaF_findupval;
module.exports.luaF_close        = luaF_close;
module.exports.luaF_getlocalname = luaF_getlocalname;
module.exports.luaF_initupvals   = luaF_initupvals;
module.exports.luaF_newLclosure  = luaF_newLclosure;
