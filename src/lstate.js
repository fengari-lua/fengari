/*jshint esversion: 6 */
"use strict";

const thread_status = require('./lua.js').thread_status;

class lua_State {

    constructor() {
        this.next = null;
        this.stack = null;
        this.ci = null;
        this.nci = 0;
        this.stacksize = 0;
        this.twups = [this];
        this.errorJmp = null;
        this.hook = null;
        this.allowhook = true;
        this.openupval = null;
        this.nny = 1;
        this.status = thread_status.LUA_OK;
        this.errfunc = 0;
    }

}

module.exports = {
    lua_State: lua_State
};