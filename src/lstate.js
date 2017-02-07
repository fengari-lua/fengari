/*jshint esversion: 6 */
"use strict";

const LUA_MULTRET = require('./lua.js').LUA_MULTRET;

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
    }

}

class lua_State {

    constructor(cl) {
        this.top = 1;
        this.ci = new CallInfo(0, cl, 1, 1, null, null);
        this.ci.u.l.savedpc = cl.p.code;
        this.ci.nresults = LUA_MULTRET;
        this.ciOff = 0;
        this.stack = [
            cl
        ];
        this.openupval = [];
    }

}

module.exports = {
    lua_State: lua_State,
    CallInfo: CallInfo
};