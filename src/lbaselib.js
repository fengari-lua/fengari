/* jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const CT      = lua.constant_types;

const luaB_print = function(L) {
    let n = lapi.lua_gettop(L); /* number of arguments */
    let str = "";

    lapi.lua_getglobal(L, "tostring");
    for (let i = 1; i <= n; i++) {
        lapi.lua_pushvalue(L, -1);  /* function to be called */
        lapi.lua_pushvalue(L, i);  /* value to print */
        lapi.lua_call(L, 1, 1);
        let s = lapi.lua_tolstring(L, -1, null);
        if (s === null)
            throw new Error("'tostring' must return a string to 'print");
        if (i > 1) s = `\t${s}`;
        str = `${str}${s}`;
        lapi.lua_pop(L, 1);
    }

    console.log(str);
    return 0;
};

const luaB_tostring = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_tolstring(L, 1, null);

    return true;
};

const luaB_getmetatable = function(L) {
    lauxlib.luaL_checkany(L, 1);
    if (!lapi.lua_getmetatable(L, 1)) {
        lapi.lua_pushnil(L);
        return true;  /* no metatable */
    }
    lauxlib.luaL_getmetafield(L, 1, "__metatable");
    return true;  /* returns either __metatable field (if present) or metatable */
};

const luaB_setmetatable = function(L) {
    let t = lapi.lua_type(L, 2);
    lauxlib.luaL_checktype(L, 1, CT.LUA_TTABLE);
    lauxlib.luaL_argcheck(L, t === CT.LUA_TNIL || t === CT.LUA_TTABLE, 2, "nil or table expected");
    if (lauxlib.luaL_getmetafield(L, 1, "__metatable") !== CT.LUA_TNIL)
        throw new Error("cannot change a protected metatable");
    lapi.lua_settop(L, 2);
    lapi.lua_setmetatable(L, 1);
    return true;
};

const base_funcs = {
    "print":        luaB_print,
    "tostring":     luaB_tostring,
    "getmetatable": luaB_getmetatable,
    "setmetatable": luaB_setmetatable,
};

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
    return true;
};

module.exports.luaB_tostring     = luaB_tostring;
module.exports.luaB_print        = luaB_print;
module.exports.luaB_getmetatable = luaB_getmetatable;
module.exports.luaB_setmetatable = luaB_setmetatable;
module.exports.luaopen_base      = luaopen_base;
