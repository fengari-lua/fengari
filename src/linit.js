"use strict";

const lua      = require('./lua.js');
const lauxlib  = require('./lauxlib.js');
const lbaselib = require('./lbaselib.js');
const lcorolib = require('./lcorolib.js');
const lmathlib = require('./lmathlib.js');
const lstrlib  = require('./lstrlib.js');
const ltablib  = require('./ltablib.js');
const lutf8lib = require('./lutf8lib.js');
const ldblib   = require('./ldblib.js');
const liolib   = require('./liolib.js');
const loslib   = require('./loslib.js');
const loadlib  = require('./loadlib.js');
const lualib   = require('./lualib.js');

const loadedlibs = {
    [lualib.LUA_COLIBNAME]:   lcorolib.luaopen_coroutine,
    [lualib.LUA_DBLIBNAME]:   ldblib.luaopen_debug,
    [lualib.LUA_MATHLIBNAME]: lmathlib.luaopen_math,
    [lualib.LUA_IOLIBNAME]:   liolib.luaopen_io,
    [lualib.LUA_OSLIBNAME]:   loslib.luaopen_os,
    [lualib.LUA_STRLIBNAME]:  lstrlib.luaopen_string,
    [lualib.LUA_TABLIBNAME]:  ltablib.luaopen_table,
    [lualib.LUA_UTF8LIBNAME]: lutf8lib.luaopen_utf8,
    "_G":                     lbaselib.luaopen_base
};

// Only with Node
if (typeof require === "function") {

    let fs = false;
    try {
        fs = require('fs');
    } catch (e) {}

    if (fs) {
        loadedlibs[lualib.LUA_LOADLIBNAME] = loadlib.luaopen_package;
    }
}

const luaL_openlibs = function(L) {
    /* "require" functions from 'loadedlibs' and set results to global table */
    for (let lib in loadedlibs) {
        lauxlib.luaL_requiref(L, lua.to_luastring(lib), loadedlibs[lib], 1);
        lua.lua_pop(L, 1); /* remove lib */
    }
};

module.exports.luaL_openlibs = luaL_openlibs;
