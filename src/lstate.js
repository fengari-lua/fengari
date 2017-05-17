/*jshint esversion: 6 */
"use strict";

const defs                 = require('./defs.js');
const lobject              = require('./lobject.js');
const ldo                  = require('./ldo.js');
const lapi                 = require('./lapi.js');
const ltable               = require('./ltable.js');
const lfunc                = require('./lfunc.js');
const ltm                  = require('./ltm.js');
const CT                   = defs.constant_types;
const TS                   = defs.thread_status;
const LUA_NUMTAGS          = defs.LUA_NUMTAGS;

const BASIC_STACK_SIZE = 2 * defs.LUA_MINSTACK;

class CallInfo {

    constructor() {
        this.func = null;
        this.funcOff = NaN;
        this.top = NaN;
        this.previous = null;
        this.next = null;

        /* only for Lua functions */
        this.l_base = NaN; /* base for this function */
        this.l_code = null; /* reference to this.func.p.code */
        this.l_savedpc = NaN; /* offset into l_code */
        /* only for JS functions */
        this.c_k = null;  /* continuation in case of yields */
        this.c_old_errfunc = null;
        this.c_ctx = null;  /* context info. in case of yields */

        this.nresults = NaN;
        this.callstatus = NaN;
    }

}

class lua_State {

    constructor() {
        this.id = null;
        this.base_ci = new CallInfo(); // Will be populated later
        this.top = 0;
        this.ci = null;
        this.stack = [];
        this.openupval = null;
        this.status = TS.LUA_OK;
        this.next = null;
        this.errorJmp = null;
        this.nny = 1;
        this.errfunc = 0;
    }

}

class global_State {

    constructor(L) {
        this.id_counter = 0; /* used to give objects unique ids */

        this.mainthread = L;
        this.l_registry = new lobject.TValue(CT.LUA_TNIL, null);
        this.panic = null;
        this.atnativeerror = null;
        this.version = null;
        this.tmname = new Array(ltm.TMS.TM_N);
        this.mt = new Array(LUA_NUMTAGS);
    }

}

const luaE_extendCI = function(L) {
    let ci = new CallInfo();
    L.ci.next = ci;
    ci.previous = L.ci;
    ci.next = null;
    L.ci = ci;
    return ci;
};

const luaE_freeCI = function(L) {
    let ci = L.ci;
    ci.next = null;
};

const stack_init = function(L1, L) {
    L1.stack = new Array(BASIC_STACK_SIZE); // TODO: for now we don't care about the stack size
    L1.top = 0;
    let ci = L1.base_ci;
    ci.next = ci.previous = null;
    ci.callstatus = 0;
    ci.func = L1.stack[L1.top];
    ci.funcOff = L1.top;
    L1.stack[L1.top++] = new lobject.TValue(CT.LUA_TNIL, null);
    ci.top = L1.top + defs.LUA_MINSTACK;
    L1.ci = ci;
};

const freestack = function(L) {
    L.ci = L.base_ci;
    luaE_freeCI(L);
    L.stack = null;
};

/*
** Create registry table and its predefined values
*/
const init_registry = function(L, g) {
    let registry = ltable.luaH_new(L);
    g.l_registry.sethvalue(registry);
    ltable.luaH_setint(registry, defs.LUA_RIDX_MAINTHREAD, new lobject.TValue(CT.LUA_TTHREAD, L));
    ltable.luaH_setint(registry, defs.LUA_RIDX_GLOBALS, new lobject.TValue(CT.LUA_TTABLE, ltable.luaH_new(L)));
};

/*
** open parts of the state that may cause memory-allocation errors.
** ('g->version' !== NULL flags that the state was completely build)
*/
const f_luaopen = function(L) {
    let g = L.l_G;
    stack_init(L, L);
    init_registry(L, g);
    ltm.luaT_init(L);
    g.version = lapi.lua_version(null);
};

const preinit_thread = function(L, g) {
    L.id = g.id_counter++;
    L.l_G = g;
    L.stack = null;
    L.ci = null;
    L.errorJmp = null;
    L.nCcalls = 0;
    L.hook = null;
    L.hookmask = 0;
    L.basehookcount = 0;
    L.allowhook = 1;
    L.hookcount = L.basehookcount;
    L.openupval = null;
    L.nny = 1;
    L.status = TS.LUA_OK;
    L.errfunc = 0;
};

const lua_newthread = function(L) {
    let g = L.l_G;
    let L1 = new lua_State();
    L.stack[L.top++] = new lobject.TValue(CT.LUA_TTHREAD, L1);
    if (process.env.LUA_USE_APICHECK && !(L.top <= L.ci.top)) throw Error("stack overflow");
    preinit_thread(L1, g);
    L1.hookmask = L.hookmask;
    L1.basehookcount = L.basehookcount;
    L1.hook = L.hook;
    L1.hookcount = L1.basehookcount;
    stack_init(L1, L);
    return L1;
};

const luaE_freethread = function(L, L1) {
    lfunc.luaF_close(L1, L1.stack);
    freestack(L1);
};

const lua_newstate = function() {
    let L = new lua_State();
    let g = new global_State(L);

    preinit_thread(L, g);

    if (ldo.luaD_rawrunprotected(L, f_luaopen, null) !== TS.LUA_OK) {
        L = null;
    }

    return L;
};

const close_state = function(L) {
    lfunc.luaF_close(L, L.stack);  /* close all upvalues for this thread */
    freestack(L);
};

const lua_close = function(L) {
    L = L.l_G.mainthread;  /* only the main thread can be closed */
    close_state(L);
};

module.exports.lua_State       = lua_State;
module.exports.CallInfo        = CallInfo;
module.exports.CIST_OAH        = (1<<0);  /* original value of 'allowhook' */
module.exports.CIST_LUA        = (1<<1);  /* call is running a Lua function */
module.exports.CIST_HOOKED     = (1<<2);  /* call is running a debug hook */
module.exports.CIST_FRESH      = (1<<3);  /* call is running on a fresh invocation of luaV_execute */
module.exports.CIST_YPCALL     = (1<<4);  /* call is a yieldable protected call */
module.exports.CIST_TAIL       = (1<<5);  /* call was tail called */
module.exports.CIST_HOOKYIELD  = (1<<6);  /* last hook called yielded */
module.exports.CIST_LEQ        = (1<<7);  /* using __lt for __le */
module.exports.CIST_FIN        = (1<<8);   /* call is running a finalizer */
module.exports.lua_close       = lua_close;
module.exports.lua_newstate    = lua_newstate;
module.exports.lua_newthread   = lua_newthread;
module.exports.luaE_extendCI   = luaE_extendCI;
module.exports.luaE_freeCI     = luaE_freeCI;
module.exports.luaE_freethread = luaE_freethread;
