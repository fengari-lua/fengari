"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const CT      = lua.constant_types;
const TS      = lua.thread_status;

const luaB_print = function(L) {
    let n = lapi.lua_gettop(L); /* number of arguments */
    let str = "";

    lapi.lua_getglobal(L, "tostring");
    for (let i = 1; i <= n; i++) {
        lapi.lua_pushvalue(L, -1);  /* function to be called */
        lapi.lua_pushvalue(L, i);  /* value to print */
        lapi.lua_call(L, 1, 1);
        let s = lapi.lua_tolstring(L, -1);
        if (s === null)
            return lauxlib.luaL_error(L, "'tostring' must return a string to 'print'");
        if (i > 1) s = `\t${s}`;
        str = `${str}${s}`;
        lapi.lua_pop(L, 1);
    }

    console.log(str);
    return 0;
};

const luaB_tostring = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_tolstring(L, 1);

    return 1;
};

const luaB_getmetatable = function(L) {
    lauxlib.luaL_checkany(L, 1);
    if (!lapi.lua_getmetatable(L, 1)) {
        lapi.lua_pushnil(L);
        return 1;  /* no metatable */
    }
    lauxlib.luaL_getmetafield(L, 1, "__metatable");
    return 1;  /* returns either __metatable field (if present) or metatable */
};

const luaB_setmetatable = function(L) {
    let t = lapi.lua_type(L, 2);
    lauxlib.luaL_checktype(L, 1, CT.LUA_TTABLE);
    lauxlib.luaL_argcheck(L, t === CT.LUA_TNIL || t === CT.LUA_TTABLE, 2, "nil or table expected");
    if (lauxlib.luaL_getmetafield(L, 1, "__metatable") !== CT.LUA_TNIL)
        return lauxlib.luaL_error(L, "cannot change a protected metatable");
    lapi.lua_settop(L, 2);
    lapi.lua_setmetatable(L, 1);
    return 1;
};

const luaB_rawequal = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_checkany(L, 2);
    lapi.lua_pushboolean(L, lapi.lua_rawequal(L, 1, 2));
    return 1;
};

const luaB_rawlen = function(L) {
    let t = lapi.lua_type(L, 1);
    lauxlib.luaL_argcheck(L, t === CT.LUA_TTABLE || t === CT.LUA_TSTRING, 1, "table or string expected");
    lapi.lua_pushinteger(L, lapi.lua_rawlen(L, 1));
    return 1;
};

const luaB_rawget = function(L) {
    lauxlib.luaL_checktype(L, 1, CT.LUA_TTABLE);
    lauxlib.luaL_checkany(L, 2);
    lapi.lua_settop(L, 2);
    lapi.lua_rawget(L, 1);
    return 1;
};

const luaB_rawset = function(L) {
    lauxlib.luaL_checktype(L, 1, CT.LUA_TTABLE);
    lauxlib.luaL_checkany(L, 2);
    lauxlib.luaL_checkany(L, 3);
    lapi.lua_settop(L, 3);
    lapi.lua_rawset(L, 1);
    return 1;
};

const luaB_type = function(L) {
    let t = lapi.lua_type(L, 1);
    lauxlib.luaL_argcheck(L, t !== CT.LUA_TNONE, 1, "value expected");
    lapi.lua_pushstring(L, lapi.lua_typename(L, t));
    return 1;
};

const pairsmeta = function(L, method, iszero, iter) {
    lauxlib.luaL_checkany(L, 1);
    if (lauxlib.luaL_getmetafield(L, 1, method) === CT.LUA_TNIL) {  /* no metamethod? */
        lapi.lua_pushcfunction(L, iter);  /* will return generator, */
        lapi.lua_pushvalue(L, 1);  /* state, */
        if (iszero) lapi.lua_pushinteger(L, 0);  /* and initial value */
        else lapi.lua_pushnil(L);
    } else {
        lapi.lua_pushvalue(L, 1);  /* argument 'self' to metamethod */
        lapi.lua_call(L, 1, 3);  /* get 3 values from metamethod */
    }
    return 3;
};

const luaB_next = function(L) {
    lauxlib.luaL_checktype(L, 1, CT.LUA_TTABLE);
    lapi.lua_settop(L, 2);  /* create a 2nd argument if there isn't one */
    if (lapi.lua_next(L, 1))
        return 2;
    else {
        lapi.lua_pushnil(L);
        return 1;
    }
};

const luaB_pairs = function(L) {
    return pairsmeta(L, "__pairs", 0, luaB_next);
};

/*
** Traversal function for 'ipairs'
*/
const ipairsaux = function(L) {
    let i = lauxlib.luaL_checkinteger(L, 2) + 1;
    lapi.lua_pushinteger(L, i);
    return lapi.lua_geti(L, 1, i) === CT.LUA_TNIL ? 1 : 2;
};

/*
** 'ipairs' function. Returns 'ipairsaux', given "table", 0.
** (The given "table" may not be a table.)
*/
const luaB_ipairs = function(L) {
    // Lua 5.2
    // return pairsmeta(L, "__ipairs", 1, ipairsaux);

    lauxlib.luaL_checkany(L, 1);
    lapi.lua_pushcfunction(L, ipairsaux);  /* iteration function */
    lapi.lua_pushvalue(L, 1);  /* state */
    lapi.lua_pushinteger(L, 0);  /* initial value */
    return 3;
};

const luaB_tonumber = function(L) {
    if (lapi.lua_type(L, 2) <= 0) {  /* standard conversion? */
        lauxlib.luaL_checkany(L, 1);
        if (lapi.lua_type(L, 1) === CT.LUA_TNUMBER) {  /* already a number? */
            lapi.lua_settop(L, 1);
            return 1;
        } else {
            let s = lapi.lua_tostring(L, 1);
            if (s !== null && lapi.lua_stringtonumber(L, s) === s.length)
                return 1;  /* successful conversion to number */
        }
    } else {
        let base = lauxlib.luaL_checkinteger(L, 2);
        lauxlib.luaL_checktype(L, 1, CT.LUA_TSTRING);  /* no numbers as strings */
        let s = lapi.lua_tostring(L, 1);
        lauxlib.luaL_argcheck(L, 2 <= base && base <= 36, 2, "base out of range");
        let n = parseInt(s, base);
        if (!isNaN(n)) {
            lapi.lua_pushinteger(L, n);
            return 1;
        }
    }

    lapi.lua_pushnil(L);
    return 1;
};

const luaB_error = function(L) {
    let level = lauxlib.luaL_optinteger(L, 2, 1);
    lapi.lua_settop(L, 1);
    if (lapi.lua_type(L, 1) === CT.LUA_TSTRING && level > 0) {
        lauxlib.luaL_where(L, level);  /* add extra information */
        lapi.lua_pushvalue(L, 1);
        lapi.lua_concat(L, 2);
    }
    return lapi.lua_error(L);
};

const luaB_assert = function(L) {
    if (lapi.lua_toboolean(L, 1))  /* condition is true? */
        return lapi.lua_gettop(L);  /* return all arguments */
    else {
        lauxlib.luaL_checkany(L, 1);  /* there must be a condition */
        lapi.lua_remove(L, 1);  /* remove it */
        lapi.lua_pushliteral(L, "assertion failed!");  /* default message */
        lapi.lua_settop(L, 1);  /* leave only message (default if no other one) */
        return luaB_error(L);  /* call 'error' */
    }
};

const luaB_select = function(L) {
    let n = lapi.lua_gettop(L);
    if (lapi.lua_type(L, 1) === CT.LUA_TSTRING && lapi.lua_tostring(L, 1) === "#") {
        lapi.lua_pushinteger(L, n - 1);
        return 1;
    } else {
        let i = lauxlib.luaL_checkinteger(L, 1);
        if (i < 0) i = n + i;
        else if (i > n) i = n;
        lauxlib.luaL_argcheck(L, 1 <= i, 1, "index out of range");
        return n - i;
    }
};

/*
** Continuation function for 'pcall' and 'xpcall'. Both functions
** already pushed a 'true' before doing the call, so in case of success
** 'finishpcall' only has to return everything in the stack minus
** 'extra' values (where 'extra' is exactly the number of items to be
** ignored).
*/
const finishpcall = function(L, status, extra) {
    if (status !== TS.LUA_OK && status !== TS.LUA_YIELD) {  /* error? */
        lapi.lua_pushboolean(L, 0);  /* first result (false) */
        lapi.lua_pushvalue(L, -2);  /* error message */
        return 2;  /* return false, msg */
    } else
        return lapi.lua_gettop(L) - extra;
};

const luaB_pcall = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lapi.lua_pushboolean(L, 1);  /* first result if no errors */
    lapi.lua_insert(L, 1);  /* put it in place */
    let status = lapi.lua_pcallk(L, lapi.lua_gettop(L) - 2, lua.LUA_MULTRET, 0, 0, finishpcall);
    return finishpcall(L, status, 0);
};

/*
** Do a protected call with error handling. After 'lua_rotate', the
** stack will have <f, err, true, f, [args...]>; so, the function passes
** 2 to 'finishpcall' to skip the 2 first values when returning results.
*/
const luaB_xpcall = function(L) {
    let n = lapi.lua_gettop(L);
    lauxlib.luaL_checktype(L, 2, CT.LUA_TFUNCTION);  /* check error function */
    lapi.lua_pushboolean(L, 1);  /* first result */
    lapi.lua_pushvalue(L, 1);  /* function */
    lapi.lua_rotate(L, 3, 2);  /* move them below function's arguments */
    let status = lapi.lua_pcallk(L, n - 2, lua.LUA_MULTRET, 2, 2, finishpcall);
    return finishpcall(L, status, 2);
};

const load_aux = function(L, status, envidx) {
    if (status === TS.LUA_OK) {
        if (envidx !== 0) {  /* 'env' parameter? */
            lapi.lua_pushvalue(L, envidx);  /* environment for loaded function */
            if (!lapi.lua_setupvalue(L, -2, 1))  /* set it as 1st upvalue */
                lapi.lua_pop(L, 1);  /* remove 'env' if not used by previous call */
        }
        return 1;
    } else {  /* error (message is on top of the stack) */
        lapi.lua_pushnil(L);
        lapi.lua_insert(L, -2);  /* put before error message */
        return 2;  /* return nil plus error message */
    }
};

/*
** reserved slot, above all arguments, to hold a copy of the returned
** string to avoid it being collected while parsed. 'load' has four
** optional arguments (chunk, source name, mode, and environment).
*/
const RESERVEDSLOT = 5;

/*
** Reader for generic 'load' function: 'lua_load' uses the
** stack for internal stuff, so the reader cannot change the
** stack top. Instead, it keeps its resulting string in a
** reserved slot inside the stack.
*/
const generic_reader = function(L, ud) {
    lauxlib.luaL_checkstack(L, 2, "too many nested functions");
    lapi.lua_pushvalue(L, 1);  /* get function */
    lapi.lua_call(L, 0, 1);  /* call it */
    if (lapi.lua_isnil(L, -1)) {
        lapi.lua_pop(L, 1);  /* pop result */
        return null;
    } else if (!lapi.lua_isstring(L, -1))
        lauxlib.luaL_error(L, "reader function must return a string");
    lapi.lua_replace(L, RESERVEDSLOT);  /* save string in reserved slot */
    return lapi.lua_tostring(L, RESERVEDSLOT);
};

const luaB_load = function(L) {
    let s = lapi.lua_tostring(L, 1);
    let mode = lauxlib.luaL_optstring(L, 3, "bt");
    let env = !lapi.lua_isnone(L, 4) ? 4 : 0;  /* 'env' index or 0 if no 'env' */
    let status;
    if (s !== null) {  /* loading a string? */
        let chunkname = lauxlib.luaL_optstring(L, 2, s);
        status = lauxlib.luaL_loadbufferx(L, s, chunkname, mode);
    } else {  /* loading from a reader function */
        let chunkname = lauxlib.luaL_optstring(L, 2, "=(load)");
        lauxlib.luaL_checktype(L, 1, CT.LUA_TFUNCTION);
        lapi.lua_settop(L, RESERVEDSLOT);  /* create reserved slot */
        status = lapi.lua_load(L, generic_reader, null, chunkname, mode);
    }
    return load_aux(L, status, env);
};

const base_funcs = {
    "collectgarbage": function () {},
    "assert":         luaB_assert,
    "error":          luaB_error,
    "getmetatable":   luaB_getmetatable,
    "ipairs":         luaB_ipairs,
    "load":           luaB_load,
    "next":           luaB_next,
    "pairs":          luaB_pairs,
    "pcall":          luaB_pcall,
    "print":          luaB_print,
    "rawequal":       luaB_rawequal,
    "rawget":         luaB_rawget,
    "rawlen":         luaB_rawlen,
    "rawset":         luaB_rawset,
    "select":         luaB_select,
    "setmetatable":   luaB_setmetatable,
    "tonumber":       luaB_tonumber,
    "tostring":       luaB_tostring,
    "type":           luaB_type,
    "xpcall":         luaB_xpcall
};

// Only with Node
if (typeof require === "function") {

    let fs = false;
    try {
        fs = require('fs');
    } catch (e) {}

    if (fs) {
        const luaB_loadfile = function(L) {
            let fname = lauxlib.luaL_optstring(L, 1, null);
            let mode = lauxlib.luaL_optstring(L, 2, null);
            let env = !lapi.lua_isnone(L, 3) ? 3 : 0;  /* 'env' index or 0 if no 'env' */
            let status = lauxlib.luaL_loadfilex(L, fname, mode);
            return load_aux(L, status, env);
        };

        const dofilecont = function(L, d1, d2) {
            return lapi.lua_gettop(L) - 1;
        };

        const luaB_dofile = function(L) {
            let fname = lauxlib.luaL_optstring(L, 1, null);
            lapi.lua_settop(L, 1);
            if (lauxlib.luaL_loadfile(L, fname) !== TS.LUA_OK)
                return lapi.lua_error(L);
            lapi.lua_callk(L, 0, lua.LUA_MULTRET, 0, dofilecont);
            return dofilecont(L, 0, 0);
        };

        base_funcs.loadfile = luaB_loadfile;
        base_funcs.dofile   = luaB_dofile;
    }
    
}

const luaopen_base = function(L) {
    /* open lib into global table */
    lapi.lua_pushglobaltable(L);
    lauxlib.luaL_setfuncs(L, base_funcs, 0);
    /* set global _G */
    lapi.lua_pushvalue(L, -1);
    lapi.lua_setfield(L, -2, "_G");
    /* set global _VERSION */
    lapi.lua_pushliteral(L, lua.LUA_VERSION);
    lapi.lua_setfield(L, -2, "_VERSION");
    return 1;
};

module.exports.luaopen_base = luaopen_base;
