/*jshint esversion: 6 */
"use strict";

const lua                  = require('./lua.js');
const Table                = require('./lobject.js').Table;
const ldo                  = require('./ldo.js');
const lapi                 = require('./lapi.js');
const nil                  = ldo.nil;
const luaD_rawrunprotected = ldo.luaD_rawrunprotected;
const luaT_init            = require('./ltm.js').luaT_init;
const CT                   = lua.constant_types;
const LUA_MULTRET          = lua.LUA_MULTRET;
const TS                   = lua.thread_status;
const LUA_NUMTAGS          = lua.LUA_NUMTAGS;

const BASIC_STACK_SIZE = 2 * lua.LUA_MINSTACK;

class CallInfo {

    constructor(funcOff, func, top, base, previous, next) {
        this.func = func;
        this.funcOff = funcOff;
        this.top = top;
        this.previous = previous;
        this.next = next;
        this.pcOff = 0;
        this.u = {
            l: {  /* only for Lua functions */
                base: base,  /* base for this function */
                savedpc: []
            },
            c: {  /* only for JS functions */
                k: null,  /* continuation in case of yields */
                old_errfunc: null,
                ctx: null  /* context info. in case of yields */
            }
        };
        this.nresults = 0;
        this.callstatus = 0;
    }

}

class lua_State {

    constructor(cl) {
        if (cl) { // TODO: remove
            this.top = 1;
            this.ci = new CallInfo(0, cl, 1, 1, null, null);
            this.ci.u.l.savedpc = cl.p.code;
            this.ci.nresults = LUA_MULTRET;
            this.ciOff = 0;
            this.stack = [
                cl
            ];
        } else {
            this.base_ci = new CallInfo(); // Will be populated later
            this.top = 0;
            this.ci = null;
            this.ciOff = null;
            this.stack = [];
        }
        this.openupval = [];
        this.status = TS.LUA_OK;
        this.next = null;
        this.tt = CT.LUA_TTHREAD;
        this.twups = [this];
        this.errorJmp = null;
        // TODO: hooks
        this.nny = 1;
        this.errfunc = 0;
    }

}

class global_State {

    constructor(L) {
        this.mainthread = L;
        this.strt = null // TODO: string hash table
        this.l_registry = nil;
        this.panic = null;
        this.version = null;
        this.twups = [];
        this.mt = new Array(LUA_NUMTAGS);
    }

}


const stack_init = function(L1, L) {
    L1.stack = new Array(BASIC_STACK_SIZE); // TODO: for now we don't care about the stack size
    L1.top = 0;
    let ci = L1.base_ci;
    ci.next = ci.previous = null;
    ci.callstatus = 0;
    ci.func = L1.stack[L1.top];
    ci.funcOff = L1.top;
    L1.stack[L1.top++] = nil;
    ci.top = L1.top + lua.LUA_MINSTACK;
    L1.ci = ci;
};

/*
** Create registry table and its predefined values
*/
const init_registry = function(L, g) {
    let registry = new Table();
    g.l_registry = registry;
    registry.value.array[lua.LUA_RIDX_MAINTHREAD] = L;
    registry.value.array[lua.LUA_RIDX_GLOBALS] = new Table();
};

/*
** open parts of the state that may cause memory-allocation errors.
** ('g->version' != NULL flags that the state was completely build)
*/
const f_luaopen = function(L) {
    let g = L.l_G;
    stack_init(L, L);
    init_registry(L, g);
    // TODO: luaS_init(L);
    luaT_init(L);
    g.version = lapi.lua_version(null);
};

const lua_newstate = function() {
    let L = new lua_State();
    let g = new global_State(L);

    L.l_G = g;

    if (luaD_rawrunprotected(L, f_luaopen, null) !== TS.LUA_OK) {
        L = null;
    }

    return L;
};

module.exports.lua_State      = lua_State;
module.exports.CallInfo       = CallInfo;
module.exports.CIST_OAH       = (1<<0);  /* original value of 'allowhook' */
module.exports.CIST_LUA       = (1<<1);  /* call is running a Lua function */
module.exports.CIST_HOOKED    = (1<<2);  /* call is running a debug hook */
module.exports.CIST_FRESH     = (1<<3);  /* call is running on a fresh invocation of luaV_execute */
module.exports.CIST_YPCALL    = (1<<4);  /* call is a yieldable protected call */
module.exports.CIST_TAIL      = (1<<5);  /* call was tail called */
module.exports.CIST_HOOKYIELD = (1<<6);  /* last hook called yielded */
module.exports.CIST_LEQ       = (1<<7);  /* using __lt for __le */
module.exports.CIST_FIN       = (1<<8);   /* call is running a finalizer */
module.exports.lua_newstate   = lua_newstate;