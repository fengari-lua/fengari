"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const CT      = lua.constant_types;
const TS      = lua.thread_status;

const str_len = function(L) {
    lauxlib.luaL_checkstring(L, 1);
    lapi.lua_pushinteger(L, lapi.lua_tostring(L, 1).length);
    return 1;
};

const strlib = {
    "len": str_len
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