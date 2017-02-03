/*jshint esversion: 6 */
"use strict";


class CallInfo {

    constructor(func, top, base, previous, next) {
        this.func = func;
        this.top = top;
        this.base = base;
        this.previous = previous;
        this.next = next;
        this.savedpc = [];
        this.pcOff = 0;
    }

}

class lua_State {

    constructor(cl) {
        this.top = 1;
        this.ci = [
            new CallInfo(0, 1, 1, null, null);
        ];
        this.ci[0].savedpc = cl.p.code;
        this.ciOff = 0;
        this.stack = [
            closure
        ];
        this.openupval = [];
    }

}