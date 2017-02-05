/*jshint esversion: 6 */
"use strict";


class CallInfo {

    constructor(func, top, base, previous, next) {
        this.func = func;
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
    }

}

class lua_State {

    constructor(cl) {
        this.top = 1;
        this.ci = new CallInfo(cl, 1, 1, null, null);
        this.ci.u.l.savedpc = cl.p.code;
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