"use strict";

const assert = require('assert');

const lapi     = require('./lapi.js');
const lauxlib  = require('./lauxlib.js');
const lbaselib = require('./lbaselib.js');
const lcorolib = require('./lcorolib.js');
const lmathlib = require('./lmathlib.js');
const lstrlib  = require('./lstrlib.js');
const ltablib  = require('./ltablib.js');
const lualib   = require('./lualib.js');

const loadedlibs = {
    [lualib.LUA_COLIBNAME]:   lcorolib.luaopen_coroutine,
    [lualib.LUA_MATHLIBNAME]: lmathlib.luaopen_math,
    [lualib.LUA_STRLIBNAME]:  lstrlib.luaopen_string,
    [lualib.LUA_TABLIBNAME]:  ltablib.luaopen_table,
    "_G":                     lbaselib.luaopen_base
};

const luaL_openlibs = function(L) {
    /* "require" functions from 'loadedlibs' and set results to global table */
    for (let lib in loadedlibs) {
        lauxlib.luaL_requiref(L, lib, loadedlibs[lib], 1);
        lapi.lua_pop(L, 1); /* remove lib */
    }
};

module.exports.luaL_openlibs = luaL_openlibs;