/* jshint esversion: 6 */
"use strict";

const assert = require('assert');

const lapi     = require('./lapi.js');
const lauxlib  = require('./lauxlib.js');
const lualib   = require('./lualib.js');
const lbaselib = require('./lbaselib.js');
const lcorolib = require('./lcorolib.js');
const ltablib  = require('./ltablib.js');
const lmathlib = require('./lmathlib.js');

const loadedlibs = {
    [lualib.LUA_MATHLIBNAME]: lmathlib.luaopen_math,
    [lualib.LUA_TABLIBNAME]:  ltablib.luaopen_table,
    [lualib.LUA_COLIBNAME]:   lcorolib.luaopen_coroutine,
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