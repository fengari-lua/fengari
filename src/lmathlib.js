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

const math_sqrt = function(L) {
    lapi.lua_pushnumber(L, Math.sqrt(lauxlib.luaL_checknumber(L, 1)));
};

const math_ult = function(L) {
    let a = lauxlib.luaL_checkinteger(L, 1);
    let b = lauxlib.luaL_checkinteger(L, 2);
    lapi.lua_pushboolean(L, Math.abs(a) < Math.abs(b));
    return 1;
};

const math_log = function(L) {
    let x = lauxlib.luaL_checknumber(L, 1);
    if (lapi.lua_isnoneornil(L, 2))
        res = Math.log(x);
    else {
        let base = lauxlib.luaL_checknumber(L, 2);
        if (base === 2)
            res = Math.log2(x);
        else if (base === 10)
            res = Math.log10(x);
        else
            res = Math.log(x)/Math.log(base);
    }
    lapi.lua_pushnumber(L, res);
    return 1;
};

const math_exp = function(L) {
    lapi.lua_pushnumber(L, Math.exp(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_deg = function(L) {
    lapi.lua_pushnumber(L, lauxlib.luaL_checknumber(L, 1) * (180 / Math.PI));
    return 1;
};

const math_rad = function(L) {
    lapi.lua_pushnumber(L, lauxlib.luaL_checknumber(L, 1) * (Math.PI / 180));
};

const math_min = function(L) {
    let n = lapi.lua_gettop(L);  /* number of arguments */
    let imin = 1;  /* index of current minimum value */
    lauxlib.luaL_argcheck(L, n >= 1, 1, "value expected");
    for (let i = 2; i <= n; i++){
        if (lapi.lua_compare(L, i, imin, lua.LUA_OPLT))
            imin = i;
    }
    lapi.lua_pushvalue(L, imin);
    return 1;
};

const math_max = function(L) {
    let n = lapi.lua_gettop(L);  /* number of arguments */
    let imax = 1;  /* index of current minimum value */
    lauxlib.luaL_argcheck(L, n >= 1, 1, "value expected");
    for (let i = 2; i <= n; i++){
        if (lapi.lua_compare(L, imax, i, lua.LUA_OPLT))
            imax = i;
    }
    lapi.lua_pushvalue(L, imax);
    return 1;
};

const math_type = function(L) {
    if (lapi.lua_type(L, 1) === CT.LUA_TNUMBER) {
        if (lapi.lua_isinteger(L, 1))
            lapi.lua_pushliteral(L, "integer");
        else
            lapi.lua_pushliteral(L, "float");
    } else {
        lauxlib.luaL_checkany(L, 1);
        lapi.lua_pushnil(L);
    }
    return 1;
};

const mathlib = {
    "abs":       math_abs,
    "acos":      math_acos,
    "asin":      math_asin,
    "atan":      math_atan,
    "ceil":      math_ceil,
    "cos":       math_cos,
    "deg":       math_deg,
    "exp":       math_exp,
    "floor":     math_floor,
    "log":       math_log,
    "max":       math_max,
    "min":       math_min,
    "rad":       math_rad,
    "sin":       math_sin,
    "sqrt":      math_sqrt,
    "sqrt":      math_sqrt,
    "tan":       math_tan,
    "tointeger": math_toint,
    "type":      math_type,
    "ult":       math_ult
};

const luaopen_math = function(L) {
    lauxlib.luaL_newlib(L, mathlib);
    lapi.lua_pushnumber(L, Math.PI);
    lapi.lua_setfield(L, -2, "pi");
    lapi.lua_pushnumber(L, Number.MAX_VALUE);
    lapi.lua_setfield(L, -2, "huge");
    lapi.lua_pushnumber(L, Number.MAX_SAFE_INTEGER);
    lapi.lua_setfield(L, -2, "maxinteger");
    lapi.lua_pushnumber(L, Number.MIN_SAFE_INTEGER);
    lapi.lua_setfield(L, -2, "mininteger");
    return 1;
};

module.exports.luaopen_math = luaopen_math;