/*jshint esversion: 6 */
"use strict";

const LUA_MULTRET = require('./lua.js').LUA_MULTRET;
const Table       = require('./lobject.js').Table;

class CallInfo {

    constructor(funcOff, func, top, base, previous, next) {
        this.func = func;
        this.funcOff = funcOff;
        this.top = top;
        this.previous = previous;
        this.next = next;
        this.pcOff = 0;
        this.u = {
            l: {
                base: base,
                savedpc: []
            }
        };
        this.nresults = 0;
        this.callstatus = 0;
    }

}

class lua_State {

    constructor(cl) {
        this.top = 2;
        this.ci = new CallInfo(0, cl, 1, 1, null, null);
        this.ci.u.l.savedpc = cl.p.code;
        this.ci.nresults = LUA_MULTRET;
        this.ciOff = 0;
        this.stack = [
            new Table(), // _ENV
            cl
        ];
        this.openupval = [];
    }

}

module.exports = {
    lua_State:       lua_State,
    CallInfo:        CallInfo,
    CIST_OAH:        (1<<0),  /* original value of 'allowhook' */
    CIST_LUA:        (1<<1),  /* call is running a Lua function */
    CIST_HOOKED:     (1<<2),  /* call is running a debug hook */
    CIST_FRESH:      (1<<3),  /* call is running on a fresh invocation of luaV_execute */
    CIST_YPCALL:     (1<<4),  /* call is a yieldable protected call */
    CIST_TAIL:       (1<<5),  /* call was tail called */
    CIST_HOOKYIELD:  (1<<6),  /* last hook called yielded */
    CIST_LEQ:        (1<<7),  /* using __lt for __le */
    CIST_FIN:        (1<<8)   /* call is running a finalizer */
};