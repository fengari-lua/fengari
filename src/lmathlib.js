/* jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lstate  = require('./lstate.js');
const ldo     = require('./ldo.js');
const ldebug  = require('./ldebug.js');
const llimit  = require('./llimit.js');
const CT      = lua.constant_types;
const TS      = lua.thread_status;


const math_abs = function(L) {
    if (lapi.lua_isinteger(L, 1))
        lapi.lua_pushinteger(L, Math.abs(lapi.lua_tointeger(L, 1)));
    else
        lapi.lua_pushnumber(L, Math.abs(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_sin = function(L) {
    lapi.lua_pushnumber(L, Math.sin(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_cos = function(L) {
    lapi.lua_pushnumber(L, Math.cos(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_tan = function(L) {
    lapi.lua_pushnumber(L, Math.tan(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_asin = function(L) {
    lapi.lua_pushnumber(L, Math.asin(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_acos = function(L) {
    lapi.lua_pushnumber(L, Math.acos(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_atan = function(L) {
    lapi.lua_pushnumber(L, Math.atan(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const mathlib = {
    "abs":  math_abs,
    "sin":  math_sin,
    "cos":  math_cos,
    "tan":  math_tan,
    "asin": math_asin,
    "acos": math_acos,
    "atan": math_atan
};

const luaopen_math = function(L) {
    lauxlib.luaL_newlib(L, mathlib);
    return 1;
};

module.exports.luaopen_math = luaopen_math;