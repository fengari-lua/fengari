"use strict";

const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lualib  = require('./lualib.js');

const loadedlibs = {
    "_G": lualib.luaopen_base,
    [lualib.LUA_LOADLIBNAME]: lualib.luaopen_package,
    [lualib.LUA_COLIBNAME]:   lualib.luaopen_coroutine,
    [lualib.LUA_TABLIBNAME]:  lualib.luaopen_table,
    [lualib.LUA_IOLIBNAME]:   lualib.luaopen_io,
    [lualib.LUA_OSLIBNAME]:   lualib.luaopen_os,
    [lualib.LUA_STRLIBNAME]:  lualib.luaopen_string,
    [lualib.LUA_MATHLIBNAME]: lualib.luaopen_math,
    [lualib.LUA_UTF8LIBNAME]: lualib.luaopen_utf8,
    [lualib.LUA_DBLIBNAME]:   lualib.luaopen_debug
};

const luaL_openlibs = function(L) {
    /* "require" functions from 'loadedlibs' and set results to global table */
    for (let lib in loadedlibs) {
        lauxlib.luaL_requiref(L, lib, loadedlibs[lib], 1);
        lapi.lua_pop(L, 1); /* remove lib */
    }
};

module.exports.luaL_openlibs = luaL_openlibs;
