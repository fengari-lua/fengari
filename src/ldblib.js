"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');

/*
** If L1 != L, L1 can be in any state, and therefore there are no
** guarantees about its stack space; any push in L1 must be
** checked.
*/
const checkstack = function(L, L1, n) {
    if (L !== L1 && !lua.lua_checkstack(L1, n))
        lauxlib.luaL_error(L, lua.to_luastring("stack overflow", true));
};

const db_getregistry = function(L) {
    lua.lua_pushvalue(L, lua.LUA_REGISTRYINDEX);
    return 1;
};

const db_getmetatable = function(L) {
    lauxlib.luaL_checkany(L, 1);
    if (!lua.lua_getmetatable(L, 1)) {
        lua.lua_pushnil(L);  /* no metatable */
    }
    return 1;
};

const db_setmetatable = function(L) {
    const t = lua.lua_type(L, 2);
    lauxlib.luaL_argcheck(L, t == lua.LUA_TNIL || t == lua.LUA_TTABLE, 2, lua.to_luastring("nil or table expected", true));
    lua.lua_settop(L, 2);
    lua.lua_setmetatable(L, 1);
    return 1;  /* return 1st argument */
};

const db_getuservalue = function(L) {
    if (lua.lua_type(L, 1) !== lua.LUA_TUSERDATA)
        lua.lua_pushnil(L);
    else
        lua.lua_getuservalue(L, 1);
    return 1;
};


const db_setuservalue = function(L) {
   lauxlib.luaL_checktype(L, 1, lua.LUA_TUSERDATA);
   lauxlib.luaL_checkany(L, 2);
   lua.lua_settop(L, 2);
   lua.lua_setuservalue(L, 1);
   return 1;
};

/*
** Auxiliary function used by several library functions: check for
** an optional thread as function's first argument and set 'arg' with
** 1 if this argument is present (so that functions can skip it to
** access their other arguments)
*/
const getthread = function(L) {
    if (lua.lua_isthread(L, 1)) {
        return {
            arg: 1,
            thread: lua.lua_tothread(L, 1)
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
    lua.lua_pushstring(L, v);
    lua.lua_setfield(L, -2, k);
};

const settabsi = function(L, k, v) {
    lua.lua_pushinteger(L, v);
    lua.lua_setfield(L, -2, k);
};

const settabsb = function(L, k, v) {
    lua.lua_pushboolean(L, v);
    lua.lua_setfield(L, -2, k);
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
        lua.lua_rotate(L, -2, 1);  /* exchange object and table */
    else
        lua.lua_xmove(L1, L, 1);  /* move object to the "main" stack */
    lua.lua_setfield(L, -2, fname);  /* put object into table */
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
    let options = lauxlib.luaL_optstring(L, arg + 2, lua.to_luastring("flnStu", true));
    checkstack(L, L1, 3);
    if (lua.lua_isfunction(L, arg + 1)) {  /* info about a function? */
        options = ['>'.charCodeAt(0)].concat(options);  /* add '>' to 'options' */
        lua.lua_pushvalue(L, arg + 1);  /* move function to 'L1' stack */
        lua.lua_xmove(L, L1, 1);
    } else {  /* stack level */
        if (!lua.lua_getstack(L1, lauxlib.luaL_checkinteger(L, arg + 1), ar)) {
            lua.lua_pushnil(L);  /* level out of range */
            return 1;
        }
    }

    if (!lua.lua_getinfo(L1, options, ar))
        lauxlib.luaL_argerror(L, arg + 2, lua.to_luastring("invalid option", true));
    lua.lua_newtable(L);  /* table to collect results */
    if (options.indexOf('S'.charCodeAt(0)) > -1) {
        settabss(L, lua.to_luastring("source", true), ar.source.value);
        settabss(L, lua.to_luastring("short_src", true), ar.short_src);
        settabss(L, lua.to_luastring("linedefined", true), lua.to_luastring(`${ar.linedefined}`));
        settabss(L, lua.to_luastring("lastlinedefined", true), lua.to_luastring(`${ar.lastlinedefined}`));
        settabss(L, lua.to_luastring("what", true), ar.what);
    }
    if (options.indexOf('l'.charCodeAt(0)) > -1)
        settabsi(L, lua.to_luastring("currentline", true), ar.currentline);
    if (options.indexOf('u'.charCodeAt(0)) > -1)
        settabsi(L, lua.to_luastring("nups", true), ar.nups);
        settabsi(L, lua.to_luastring("nparams", true), ar.nparams);
        settabsb(L, lua.to_luastring("isvararg", true), ar.isvararg);
    if (options.indexOf('n'.charCodeAt(0)) > - 1) {
        settabss(L, lua.to_luastring("name", true), ar.name ? ar.name : null);
        settabss(L, lua.to_luastring("namewhat", true), ar.namewhat ? ar.namewhat : null);
    }
    if (options.indexOf('t'.charCodeAt(0)) > - 1)
        settabsb(L, lua.to_luastring("istailcall", true), ar.istailcall);
    if (options.indexOf('L'.charCodeAt(0)) > - 1)
        treatstackoption(L, L1, lua.to_luastring("activelines", true));
    if (options.indexOf('f'.charCodeAt(0)) > - 1)
        treatstackoption(L, L1, lua.to_luastring("func", true));
    return 1;  /* return table */
};

const db_getlocal = function(L) {
    let thread = getthread(L);
    let L1 = thread.thread;
    let arg = thread.arg;
    let ar = new lua.lua_Debug();
    let nvar = lauxlib.luaL_checkinteger(L, arg + 2);  /* local-variable index */
    if (lua.lua_isfunction(L, arg + 1)) {
        lua.lua_pushvalue(L, arg + 1);  /* push function */
        lua.lua_pushstring(L, lua.lua_getlocal(L, null, nvar));  /* push local name */
        return 1;  /* return only name (there is no value) */
    } else {  /* stack-level argument */
        let level = lauxlib.luaL_checkinteger(L, arg + 1);
        if (!lua.lua_getstack(L1, level, ar))  /* out of range? */
            return lauxlib.luaL_argerror(L, arg+1, lua.to_luastring("level out of range", true));
        checkstack(L, L1, 1);
        let name = lua.lua_getlocal(L1, ar, nvar);
        if (name) {
            lua.lua_xmove(L1, L, 1);  /* move local value */
            lua.lua_pushstring(L, name.value);  /* push name */
            lua.lua_rotate(L, -2, 1);  /* re-order */
            return 2;
        }
        else {
            lua.lua_pushnil(L);  /* no name (nor value) */
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
    if (!lua.lua_getstack(L1, level, ar))  /* out of range? */
        return lauxlib.luaL_argerror(L, arg + 1, "level out of range");
    lauxlib.luaL_checkany(L, arg + 3);
    lua.lua_settop(L, arg + 3);
    checkstack(L, L1, 1);
    lua.lua_xmove(L, L1, 1);
    let name = lua.lua_setlocal(L1, ar, nvar);
    if (name === null)
        lua.lua_pop(L1, 1);  /* pop value (if not popped by 'lua_setlocal') */
    lua.lua_pushstring(L, name.value);
    return 1;
};

/*
** get (if 'get' is true) or set an upvalue from a closure
*/
const auxupvalue = function(L, get) {
    let n = lauxlib.luaL_checkinteger(L, 2);  /* upvalue index */
    lauxlib.luaL_checktype(L, 1, lua.LUA_TFUNCTION);  /* closure */
    let name = get ? lua.lua_getupvalue(L, 1, n) : lua.lua_setupvalue(L, 1, n);
    if (name === null) return 0;
    lua.lua_pushstring(L, name);
    lua.lua_insert(L, -(get+1));  /* no-op if get is false */
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
    lauxlib.luaL_checktype(L, argf, lua.LUA_TFUNCTION);  /* closure */
    lauxlib.luaL_argcheck(L, (lua.lua_getupvalue(L, argf, nup) !== null), argnup, lua.to_luastring("invalid upvalue index", true));
    return nup;
};

const db_upvalueid = function(L) {
   let n = checkupval(L, 1, 2);
   lua.lua_pushlightuserdata(L, lua.lua_upvalueid(L, 1, n));
   return 1;
};

const db_upvaluejoin = function(L) {
    let n1 = checkupval(L, 1, 2);
    let n2 = checkupval(L, 3, 4);
    lauxlib.luaL_argcheck(L, !lua.lua_iscfunction(L, 1), 1, lua.to_luastring("Lua function expected", true));
    lauxlib.luaL_argcheck(L, !lua.lua_iscfunction(L, 3), 3, lua.to_luastring("Lua function expected", true));
    lua.lua_upvaluejoin(L, 1, n1, 3, n2);
    return 0;
};

/*
** The hook table at registry[HOOKKEY] maps threads to their current
** hook function. (We only need the unique address of 'HOOKKEY'.)
*/
const HOOKKEY = lua.to_luastring("__hooks__", true);

const hooknames = ["call", "return", "line", "count", "tail call"].map(e => lua.to_luastring(e));

/*
** Call hook function registered at hook table for the current
** thread (if there is one)
*/
const hookf = function(L, ar) {
    lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY);
    lua.lua_pushthread(L);
    if (lua.lua_rawget(L, -2) === lua.LUA_TFUNCTION) {  /* is there a hook function? */
        lua.lua_pushstring(L, hooknames[ar.event]);  /* push event name */
        if (ar.currentline >= 0)
            lua.lua_pushinteger(L, ar.currentline);  /* push current line */
        else lua.lua_pushnil(L);
        assert(lua.lua_getinfo(L, ["l".charCodeAt(0), "S".charCodeAt(0)], ar));
        lua.lua_call(L, 2, 0);  /* call hook function */
    }
};

/*
** Convert a string mask (for 'sethook') into a bit mask
*/
const makemask = function(smask, count) {
    let mask = 0;
    if (smask.indexOf("c".charCodeAt(0)) > -1) mask |= lua.LUA_MASKCALL;
    if (smask.indexOf("r".charCodeAt(0)) > -1) mask |= lua.LUA_MASKRET;
    if (smask.indexOf("l".charCodeAt(0)) > -1) mask |= lua.LUA_MASKLINE;
    if (count > 0) mask |= lua.LUA_MASKCOUNT;
    return mask;
};

/*
** Convert a bit mask (for 'gethook') into a string mask
*/
const unmakemask = function(mask, smask) {
    let i = 0;
    if (mask & lua.LUA_MASKCALL) smask[i++] = "c".charCodeAt(0);
    if (mask & lua.LUA_MASKRET) smask[i++] = "r".charCodeAt(0);
    if (mask & lua.LUA_MASKLINE) smask[i++] = "l".charCodeAt(0);
    return smask;
};

const db_sethook = function(L) {
    let mask, count, func;
    let thread = getthread(L);
    let L1 = thread.thread;
    let arg = thread.arg;
    if (lua.lua_isnoneornil(L, arg+1)) {  /* no hook? */
        lua.lua_settop(L, arg+1);
        func = null; mask = 0; count = 0;  /* turn off hooks */
    }
    else {
        const smask = lauxlib.luaL_checkstring(L, arg + 2);
        lauxlib.luaL_checktype(L, arg+1, lua.LUA_TFUNCTION);
        count = lauxlib.luaL_optinteger(L, arg + 3, 0);
        func = hookf; mask = makemask(smask, count);
    }
    if (lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY) === lua.LUA_TNIL) {
        lua.lua_createtable(L, 0, 2);  /* create a hook table */
        lua.lua_pushvalue(L, -1);
        lua.lua_rawsetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY);  /* set it in position */
        lua.lua_pushstring(L, ["k".charCodeAt(0)]);
        lua.lua_setfield(L, -2, lua.to_luastring("__mode", true));  /** hooktable.__mode = "k" */
        lua.lua_pushvalue(L, -1);
        lua.lua_setmetatable(L, -2);  /* setmetatable(hooktable) = hooktable */
    }
    checkstack(L, L1, 1);
    lua.lua_pushthread(L1); lua.lua_xmove(L1, L, 1);  /* key (thread) */
    lua.lua_pushvalue(L, arg + 1);  /* value (hook function) */
    lua.lua_rawset(L, -3);  /* hooktable[L1] = new Lua hook */
    lua.lua_sethook(L1, func, mask, count);
    return 0;
};

const db_gethook = function(L) {
    let thread = getthread(L);
    let L1 = thread.thread;
    let arg = thread.arg;
    let buff = [];
    let mask = lua.lua_gethookmask(L1);
    let hook = lua.lua_gethook(L1);
    if (hook === null)  /* no hook? */
        lua.lua_pushnil(L);
    else if (hook !== hookf)  /* external hook? */
        lua.lua_pushliteral(L, "external hook");
    else {  /* hook table must exist */
        lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY);
        checkstack(L, L1, 1);
        lua.lua_pushthread(L1); lua.lua_xmove(L1, L, 1);
        lua.lua_rawget(L, -2);   /* 1st result = hooktable[L1] */
        lua.lua_remove(L, -2);  /* remove hook table */
    }
    lua.lua_pushstring(L, unmakemask(mask, buff));  /* 2nd result = mask */
    lua.lua_pushinteger(L, lua.lua_gethookcount(L1));  /* 3rd result = count */
    return 3;
};

const db_traceback = function(L) {
    let thread = getthread(L);
    let L1 = thread.thread;
    let arg = thread.arg;
    let msg = lua.lua_tostring(L, arg + 1);
    if (msg === null && !lua.lua_isnoneornil(L, arg + 1))  /* non-string 'msg'? */
        lua.lua_pushvalue(L, arg + 1);  /* return it untouched */
    else {
        let level = lauxlib.luaL_optinteger(L, arg + 2, L === L1 ? 1 : 0);
        lauxlib.luaL_traceback(L, L1, msg, level);
    }
    return 1;
};

const dblib = {
    "gethook":      db_gethook,
    "getinfo":      db_getinfo,
    "getlocal":     db_getlocal,
    "getmetatable": db_getmetatable,
    "getregistry":  db_getregistry,
    "getupvalue":   db_getupvalue,
    "getuservalue": db_getuservalue,
    "sethook":      db_sethook,
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
                if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, lua.to_luastring("=(debug command)", true))
                    || lua.lua_pcall(L, 0, 0, 0)) {
                    lauxlib.lua_writestringerror(`${lua.lua_tojsstring(L, -1)}\n`);
                }
                lua.lua_settop(L, 0);  /* remove eventual returns */
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
