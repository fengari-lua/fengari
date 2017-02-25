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

const math_toint = function(L) {
    let n = lapi.lua_tointegerx(L, 1)
    if (n !== false)
        lapi.lua_pushinteger(L, n);
    else {
        lauxlib.luaL_checkany(L, 1);
        lapi.lua_pushnil(L);  /* value is not convertible to integer */
    }
    return 1;
};

const pushnumint = function(L, d) {
    let n = luaconf.lua_numbertointeger(d);
    if (n !== false)  /* does 'd' fit in an integer? */
        lapi.lua_pushinteger(L, n);  /* result is integer */
    else
        lapi.lua_pushnumber(L, d);  /* result is float */
};

const math_floor = function(L) {
    if (lapi.lua_isinteger(L, 1))
        lapi.lua_settop(L, 1);
    else
        pushnumint(L, lauxlib.luaL_checknumber(L, 1));

    return 1;
};

const math_ceil = function(L) {
    if (lapi.lua_isinteger(L, 1))
        lapi.lua_settop(L, 1);
    else
        pushnumint(L, Math.ceil(lauxlib.luaL_checknumber(L, 1)));

    return 1;
};

const mathlib = {
    "abs":       math_abs,
    "acos":      math_acos,
    "asin":      math_asin,
    "atan":      math_atan,
    "ceil":      math_ceil,
    "cos":       math_cos,
    "floor":     math_floor,
    "sin":       math_sin,
    "tan":       math_tan,
    "tointeger": math_toint
};

const luaopen_math = function(L) {
    lauxlib.luaL_newlib(L, mathlib);
    return 1;
};

module.exports.luaopen_math = luaopen_math;