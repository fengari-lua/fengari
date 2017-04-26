"use strict";

const assert     = require('assert');
const seedrandom = require('seedrandom');

const lua        = require('./lua.js');
const lapi       = require('./lapi.js');
const lauxlib    = require('./lauxlib.js');
const lstate     = require('./lstate.js');
const ldo        = require('./ldo.js');
const ldebug     = require('./ldebug.js');
const llimit     = require('./llimit.js');
const luaconf    = require('./luaconf.js');
const TS         = lua.thread_status;

var RNG          = seedrandom();

const math_randomseed = function(L) {
    RNG = seedrandom(Math.abs(lauxlib.luaL_checknumber(L, 1)));
};

const math_random = function(L) {
    let low, up;
    let r = RNG();
    switch (lapi.lua_gettop(L)) {  /* check number of arguments */
        case 0:
            lapi.lua_pushnumber(L, r);  /* Number between 0 and 1 */
            return 1;
        case 1: {
            low = 1;
            up = lauxlib.luaL_checkinteger(L, 1);
            break;
        }
        case 2: {
            low = lauxlib.luaL_checkinteger(L, 1);
            up = lauxlib.luaL_checkinteger(L, 2);
            break;
        }
        default: return lauxlib.luaL_error(L, lua.to_luastring("wrong number of arguments", true));
    }

    /* random integer in the interval [low, up] */
    lauxlib.luaL_argcheck(L, low <= up, 1, lua.to_luastring("interval is empty", true));
    lauxlib.luaL_argcheck(L, low >= 0 || up <= llimit.MAX_INT + low, 1,
            lua.to_luastring("interval too large", true));

    r *= (up - low) + 1;
    lapi.lua_pushinteger(L, r + low);
    return 1;
};

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
    let n = lapi.lua_tointegerx(L, 1);
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
        pushnumint(L, Math.floor(lauxlib.luaL_checknumber(L, 1)));

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
    return 1;
};

const math_ult = function(L) {
    let a = lauxlib.luaL_checkinteger(L, 1);
    let b = lauxlib.luaL_checkinteger(L, 2);
    lapi.lua_pushboolean(L, Math.abs(a) < Math.abs(b));
    return 1;
};

const math_log = function(L) {
    let x = lauxlib.luaL_checknumber(L, 1);
    let res;
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
    return 1;
};

const math_min = function(L) {
    let n = lapi.lua_gettop(L);  /* number of arguments */
    let imin = 1;  /* index of current minimum value */
    lauxlib.luaL_argcheck(L, n >= 1, 1, lua.to_luastring("value expected", true));
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
    lauxlib.luaL_argcheck(L, n >= 1, 1, lua.to_luastring("value expected", true));
    for (let i = 2; i <= n; i++){
        if (lapi.lua_compare(L, imax, i, lua.LUA_OPLT))
            imax = i;
    }
    lapi.lua_pushvalue(L, imax);
    return 1;
};

const math_type = function(L) {
    if (lapi.lua_type(L, 1) === lua.LUA_TNUMBER) {
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

const math_fmod = function(L) {
    if (lapi.lua_isinteger(L, 1) && lapi.lua_isinteger(L, 2)) {
        let d = lapi.lua_tointeger(L, 2);
        if (Math.abs(d) + 1 <= 1) {
            lauxlib.luaL_argcheck(L, d !== 0, 2, lua.to_luastring("zero", true));
            lapi.lua_pushinteger(L, 0);
        } else
            lapi.lua_pushinteger(L, lapi.lua_tointeger(L, 1) % d);
    } else {
        let a = lauxlib.luaL_checknumber(L, 1);
        let b = lauxlib.luaL_checknumber(L, 2);
        lapi.lua_pushnumber(L, Number((a - (Math.floor(a / b) * b)).toPrecision(8)));
    }
    return 1;
};

const math_modf = function(L) {
    if (lapi.lua_isinteger(L, 1)) {
        lapi.lua_settop(L, 1);  /* number is its own integer part */
        lapi.lua_pushnumber(L, 0);  /* no fractional part */
    } else {
        let n = lauxlib.luaL_checknumber(L, 1);
        let ip = n < 0 ? Math.ceil(n) : Math.floor(n);
        pushnumint(L, ip);
        lapi.lua_pushnumber(L, n === ip ? 0 : n - ip);
    }
    return 2;
};

const mathlib = {
    "abs":        math_abs,
    "acos":       math_acos,
    "asin":       math_asin,
    "atan":       math_atan,
    "ceil":       math_ceil,
    "cos":        math_cos,
    "deg":        math_deg,
    "exp":        math_exp,
    "floor":      math_floor,
    "fmod":       math_fmod,
    "log":        math_log,
    "max":        math_max,
    "min":        math_min,
    "modf":       math_modf,
    "rad":        math_rad,
    "random":     math_random,
    "randomseed": math_randomseed,
    "sin":        math_sin,
    "sqrt":       math_sqrt,
    "tan":        math_tan,
    "tointeger":  math_toint,
    "type":       math_type,
    "ult":        math_ult
};

const luaopen_math = function(L) {
    lauxlib.luaL_newlib(L, mathlib);
    lapi.lua_pushnumber(L, Math.PI);
    lapi.lua_setfield(L, -2, lua.to_luastring("pi", true));
    lapi.lua_pushnumber(L, Number.MAX_VALUE);
    lapi.lua_setfield(L, -2, lua.to_luastring("huge", true));
    lapi.lua_pushinteger(L, llimit.MAX_INT);
    lapi.lua_setfield(L, -2, lua.to_luastring("maxinteger", true));
    lapi.lua_pushinteger(L, llimit.MIN_INT);
    lapi.lua_setfield(L, -2, lua.to_luastring("mininteger", true));
    return 1;
};

module.exports.luaopen_math = luaopen_math;
