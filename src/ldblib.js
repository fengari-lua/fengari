"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const ldebug  = require('./ldebug.js');

/*
** If L1 != L, L1 can be in any state, and therefore there are no
** guarantees about its stack space; any push in L1 must be
** checked.
*/
const checkstack = function(L, L1, n) {
    if (L !== L1 && !lapi.lua_checkstack(L1, n))
        lauxlib.luaL_error(L, "stack overflow");
};

/*
** Auxiliary function used by several library functions: check for
** an optional thread as function's first argument and set 'arg' with
** 1 if this argument is present (so that functions can skip it to
** access their other arguments)
*/
const getthread = function(L) {
    if (lapi.lua_isthread(L, 1)) {
        return {
            arg: 1,
            thread: lapi.lua_tothread(L, 1)
        };
    } else {
        return {
            arg: 0,
            thread: L
        };  /* function will operate over current thread */
    }
};

const db_getlocal = function(L) {
    let thread = getthread(L);
    let L1 = thread.thread;
    let arg = thread.arg;
    let ar = new lua.lua_Debug();
    let nvar = lauxlib.luaL_checkinteger(L, arg + 2);  /* local-variable index */
    if (lapi.lua_isfunction(L, arg + 1)) {
        lapi.lua_pushvalue(L, arg + 1);  /* push function */
        lapi.lua_pushstring(L, ldebug.lua_getlocal(L, null, nvar));  /* push local name */
        return 1;  /* return only name (there is no value) */
    } else {  /* stack-level argument */
        let level = lauxlib.luaL_checkinteger(L, arg + 1);
        if (!ldebug.lua_getstack(L1, level, ar))  /* out of range? */
            return lauxlib.luaL_argerror(L, arg+1, lapi.to_luastring("level out of range"));
        checkstack(L, L1, 1);
        let name = ldebug.lua_getlocal(L1, ar, nvar);
        if (name) {
            lapi.lua_xmove(L1, L, 1);  /* move local value */
            lapi.lua_pushstring(L, name.value);  /* push name */
            lapi.lua_rotate(L, -2, 1);  /* re-order */
            return 2;
        }
        else {
            lapi.lua_pushnil(L);  /* no name (nor value) */
            return 1;
        }
    }
};

/*
** Check whether a given upvalue from a given closure exists and
** returns its index
*/
const checkupval = function(L, argf, argnup) {
    let nup = lauxlib.luaL_checkinteger(L, argnup);  /* upvalue index */
    lauxlib.luaL_checktype(L, argf, lua.CT.LUA_TFUNCTION);  /* closure */
    lauxlib.luaL_argcheck(L, (lapi.lua_getupvalue(L, argf, nup) !== null), argnup, lua.to_luastring("invalid upvalue index"));
    return nup;
};


const db_upvalueid = function(L) {
   let n = checkupval(L, 1, 2);
   lapi.lua_pushlightuserdata(L, lapi.lua_upvalueid(L, 1, n));
   return 1;
};

const db_traceback = function(L) {
    let thread = getthread(L);
    let L1 = thread.thread;
    let arg = thread.arg;
    let msg = lapi.lua_tostring(L, arg + 1);
    if (msg === null && !lapi.lua_isnoneornil(L, arg + 1))  /* non-string 'msg'? */
        lapi.lua_pushvalue(L, arg + 1);  /* return it untouched */
    else {
        let level = lauxlib.luaL_optinteger(L, arg + 2, L === L1 ? 1 : 0);
        lauxlib.luaL_traceback(L, L1, msg, level);
    }
    return 1;
};

const dblib = {
    "getlocal":  db_getlocal,
    "traceback": db_traceback,
    "upvalueid": db_upvalueid
};

// Only with Node
if (typeof require === "function") {
    let fs = false;
    try {
        fs = require('fs');
    } catch (e) {}

    if (fs) {
        const readlineSync = require('readline-sync');
        readlineSync.setDefaultOptions({
            prompt: 'lua_debug> '
        });

        // TODO: if in browser, use a designated input in the DOM ?  
        const db_debug = function(L) {
            for (;;) {
                let input = readlineSync.prompt();

                if (input === "cont")
                    return 0;

                if (input.length === 0)
                    continue;

                let buffer = lua.to_luastring(input);
                if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, lua.to_luastring("=(debug command)"))
                    || lapi.lua_pcall(L, 0, 0, 0)) {
                    lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
                }
                lapi.lua_settop(L, 0);  /* remove eventual returns */
            }
        };

        dblib.debug = db_debug;
    }
}

const luaopen_debug = function(L) {
    lauxlib.luaL_newlib(L, dblib);
    return 1;
};

module.exports.luaopen_debug = luaopen_debug;
