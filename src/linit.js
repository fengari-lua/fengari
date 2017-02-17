/* jshint esversion: 6 */
"use strict";

const assert = require('assert');

const lapi     = require('./lapi.js');
const lauxlib  = require('./lauxlib.js');
const lbaselib = require('./lbaselib.js');

const loadedlibs = {
    "_G": lbaselib.luaopen_base
};

const luaL_openlibs = function(L) {
    /* "require" functions from 'loadedlibs' and set results to global table */
    for (let lib in loadedlibs) {
        lauxlib.luaL_requiref(L, lib, loadedlibs[lib], 1);
        lapi.lua_pop(L, 1); /* remove lib */
    }
};

module.exports.luaL_openlibs = luaL_openlibs;