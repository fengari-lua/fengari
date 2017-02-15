/*jshint esversion: 6 */
"use strict";

const lua         = require('./lua.js');
const LUA_MULTRET = lua.LUA_MULTRET;
const TS          = lua.thread_status;
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
        this.top = 1;
        this.ci = new CallInfo(0, cl, 1, 1, null, null);
        this.ci.u.l.savedpc = cl.p.code;
        this.ci.nresults = LUA_MULTRET;
        this.ciOff = 0;
        this.stack = [
            cl
        ];
        this.openupval = [];
        this.status = TS.LUA_OK;
    }

}

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