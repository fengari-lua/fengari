"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const char    = lua.char;
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

const db_getregistry = function(L) {
    lapi.lua_pushvalue(L, lua.LUA_REGISTRYINDEX);
    return 1;
};

const db_getmetatable = function(L) {
    lauxlib.luaL_checkany(L, 1);
    if (!lapi.lua_getmetatable(L, 1)) {
        lapi.lua_pushnil(L);  /* no metatable */
    }
    return 1;
};

const db_setmetatable = function(L) {
    const t = lapi.lua_type(L, 2);
    lauxlib.luaL_argcheck(L, t == lua.CT.LUA_TNIL || t == lua.CT.LUA_TTABLE, 2, lua.to_luastring("nil or table expected"));
    lapi.lua_settop(L, 2);
    lapi.lua_setmetatable(L, 1);
    return 1;  /* return 1st argument */
};

const db_getuservalue = function(L) {
    if (lapi.lua_type(L, 1) !== lua.CT.LUA_TUSERDATA)
        lapi.lua_pushnil(L);
    else
        lapi.lua_getuservalue(L, 1);
    return 1;
};


const db_setuservalue = function(L) {
   lauxlib.luaL_checktype(L, 1, lua.CT.LUA_TUSERDATA);
   lauxlib.luaL_checkany(L, 2);
   lapi.lua_settop(L, 2);
   lapi.lua_setuservalue(L, 1);
   return 1;
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

/*
** Variations of 'lua_settable', used by 'db_getinfo' to put results
** from 'lua_getinfo' into result table. Key is always a string;
** value can be a string, an int, or a boolean.
*/
const settabss = function(L, k, v) {
    lapi.lua_pushstring(L, v);
    lapi.lua_setfield(L, -2, k);
};

const settabsi = function(L, k, v) {
    lapi.lua_pushinteger(L, v);
    lapi.lua_setfield(L, -2, k);
};

const settabsb = function(L, k, v) {
    lapi.lua_pushboolean(L, v);
    lapi.lua_setfield(L, -2, k);
};


/*
** In function 'db_getinfo', the call to 'lua_getinfo' may push
** results on the stack; later it creates the result table to put
** these objects. Function 'treatstackoption' puts the result from
** 'lua_getinfo' on top of the result table so that it can call
** 'lua_setfield'.
*/
const treatstackoption = function(L, L1, fname) {
    if (L == L1)
        lapi.lua_rotate(L, -2, 1);  /* exchange object and table */
    else
        lapi.lua_xmove(L1, L, 1);  /* move object to the "main" stack */
    lapi.lua_setfield(L, -2, fname);  /* put object into table */
};

/*
** Calls 'lua_getinfo' and collects all results in a new table.
** L1 needs stack space for an optional input (function) plus
** two optional outputs (function and line table) from function
** 'lua_getinfo'.
*/
const db_getinfo = function(L) {
    let ar = new lua.lua_Debug();
    let thread = getthread(L);
    let arg = thread.arg;
    let L1 = thread.thread;
    let options = lauxlib.luaL_optstring(L, arg + 2, lua.to_luastring("flnStu"));
    checkstack(L, L1, 3);
    if (lapi.lua_isfunction(L, arg + 1)) {  /* info about a function? */
        options = [char['>']].concat(options);  /* add '>' to 'options' */
        lapi.lua_pushvalue(L, arg + 1);  /* move function to 'L1' stack */
        lapi.lua_xmove(L, L1, 1);
    } else {  /* stack level */
        if (!ldebug.lua_getstack(L1, lauxlib.luaL_checkinteger(L, arg + 1), ar)) {
            lapi.lua_pushnil(L);  /* level out of range */
            return 1;
        }
    }

    if (!ldebug.lua_getinfo(L1, options, ar))
        lauxlib.luaL_argerror(L, arg + 2, lua.to_luastring("invalid option"));
    lapi.lua_newtable(L);  /* table to collect results */
    if (options.indexOf(char['S']) > -1) {
        settabss(L, lua.to_luastring("source"), ar.source.value);
        settabss(L, lua.to_luastring("short_src"), ar.short_src);
        settabss(L, lua.to_luastring("linedefined"), lua.to_luastring(`${ar.linedefined}`));
        settabss(L, lua.to_luastring("lastlinedefined"), lua.to_luastring(`${ar.lastlinedefined}`));
        settabss(L, lua.to_luastring("what"), ar.what);
    }
    if (options.indexOf(char['l']) > -1)
        settabsi(L, lua.to_luastring("currentline"), ar.currentline);
    if (options.indexOf(char['u']) > -1)
        settabsi(L, lua.to_luastring("nups"), ar.nups);
        settabsi(L, lua.to_luastring("nparams"), ar.nparams);
        settabsb(L, lua.to_luastring("isvararg"), ar.isvararg);
    if (options.indexOf(char['n']) > - 1) {
        settabss(L, lua.to_luastring("name"), ar.name ? ar.name.value : null);
        settabss(L, lua.to_luastring("namewhat"), ar.namewhat ? ar.namewhat : null);
    }
    if (options.indexOf(char['t']) > - 1)
        settabsb(L, lua.to_luastring("istailcall"), ar.istailcall);
    if (options.indexOf(char['L']) > - 1)
        treatstackoption(L, L1, lua.to_luastring("activelines"));
    if (options.indexOf(char['f']) > - 1)
        treatstackoption(L, L1, lua.to_luastring("func"));
    return 1;  /* return table */
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

const db_setlocal = function(L) {
    let thread = getthread(L);
    let L1 = thread.thread;
    let arg = thread.arg;
    let ar = new lua.lua_Debug();
    let level = lauxlib.luaL_checkinteger(L, arg + 1);
    let nvar = lauxlib.luaL_checkinteger(L, arg + 2);
    if (!ldebug.lua_getstack(L1, level, ar))  /* out of range? */
        return lauxlib.luaL_argerror(L, arg + 1, "level out of range");
    lauxlib.luaL_checkany(L, arg + 3);
    lapi.lua_settop(L, arg + 3);
    checkstack(L, L1, 1);
    lapi.lua_xmove(L, L1, 1);
    let name = ldebug.lua_setlocal(L1, ar, nvar);
    if (name === null)
        lapi.lua_pop(L1, 1);  /* pop value (if not popped by 'lua_setlocal') */
    lapi.lua_pushstring(L, name.value);
    return 1;
};

/*
** get (if 'get' is true) or set an upvalue from a closure
*/
const auxupvalue = function(L, get) {
    let n = lauxlib.luaL_checkinteger(L, 2);  /* upvalue index */
    lauxlib.luaL_checktype(L, 1, lua.CT.LUA_TFUNCTION);  /* closure */
    let name = get ? lapi.lua_getupvalue(L, 1, n) : lapi.lua_setupvalue(L, 1, n);
    if (name === null) return 0;
    lapi.lua_pushstring(L, name);
    lapi.lua_insert(L, -(get+1));  /* no-op if get is false */
    return get + 1;
};


const db_getupvalue = function(L) {
    return auxupvalue(L, 1);
};

const db_setupvalue = function(L) {
    lauxlib.luaL_checkany(L, 3);
    return auxupvalue(L, 0);
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

const db_upvaluejoin = function(L) {
    let n1 = checkupval(L, 1, 2);
    let n2 = checkupval(L, 3, 4);
    lauxlib.luaL_argcheck(L, !lapi.lua_iscfunction(L, 1), 1, lua.to_luastring("Lua function expected"));
    lauxlib.luaL_argcheck(L, !lapi.lua_iscfunction(L, 3), 3, lua.to_luastring("Lua function expected"));
    lapi.lua_upvaluejoin(L, 1, n1, 3, n2);
    return 0;
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
    "getinfo":      db_getinfo,
    "getlocal":     db_getlocal,
    "getmetatable": db_getmetatable,
    "getregistry":  db_getregistry,
    "getupvalue":   db_getupvalue,
    "getuservalue": db_getuservalue,
    "setlocal":     db_setlocal,
    "setmetatable": db_setmetatable,
    "setupvalue":   db_setupvalue,
    "setuservalue": db_setuservalue,
    "traceback":    db_traceback,
    "upvalueid":    db_upvalueid,
    "upvaluejoin":  db_upvaluejoin
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
