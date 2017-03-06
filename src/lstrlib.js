"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const CT      = lua.constant_types;
const TS      = lua.thread_status;

const str_len = function(L) {
    lapi.lua_pushinteger(L, lauxlib.luaL_checkstring(L, 1).length);
    return 1;
};

const str_char = function(L) {
    let n = lapi.lua_gettop(L);  /* number of arguments */
    let p = "";
    for (let i = 1; i <= n; i++) {
        let c = lauxlib.luaL_checkinteger(L, i);
        lauxlib.luaL_argcheck(L, c >= 0 && c <= 255, "value out of range"); // Strings are 8-bit clean
        p += String.fromCharCode(c);
    }
    lapi.lua_pushstring(L, p);
    return 1;
};

const str_lower = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).toLowerCase());
    return 1;
};

const str_upper = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).toUpperCase());
    return 1;
};

const strlib = {
    "char":  str_char,
    "len":   str_len,
    "lower": str_lower,
    "upper": str_upper
};

const createmetatable = function(L) {
    lapi.lua_createtable(L, 0, 1);  /* table to be metatable for strings */
    lapi.lua_pushliteral(L, "");  /* dummy string */
    lapi.lua_pushvalue(L, -2);  /* copy table */
    lapi.lua_setmetatable(L, -2);  /* set table as metatable for strings */
    lapi.lua_pop(L, 1);  /* pop dummy string */
    lapi.lua_pushvalue(L, -2);  /* get string library */
    lapi.lua_setfield(L, -2, "__index");  /* metatable.__index = string */
    lapi.lua_pop(L, 1);  /* pop metatable */  
};

const luaopen_string = function(L) {
    lauxlib.luaL_newlib(L, strlib);
    createmetatable(L);
    return 1;
};

module.exports.luaopen_string = luaopen_string;