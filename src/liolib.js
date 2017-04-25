"use strict";

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');

const iolib = {
};

const flib = {
};

const createmeta = function(L) {
    lauxlib.luaL_newmetatable(L, lauxlib.LUA_FILEHANDLE);  /* create metatable for file handles */
    lua.lua_pushvalue(L, -1);  /* push metatable */
    lua.lua_setfield(L, -2, lua.to_luastring("__index", true));  /* metatable.__index = metatable */
    lauxlib.luaL_setfuncs(L, flib, 0);  /* add file methods to new metatable */
    lua.lua_pop(L, 1);  /* pop new metatable */
};

const luaopen_io = function(L) {
    lauxlib.luaL_newlib(L, iolib);
    createmeta(L);
    return 1;
};

module.exports.luaopen_io = luaopen_io;
