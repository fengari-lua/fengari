"use strict";

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');
const luaconf = require('./luaconf.js');

const math_random = function(L) {
    let low, up;
    let r = Math.random();
    switch (lua.lua_gettop(L)) {  /* check number of arguments */
        case 0:
            lua.lua_pushnumber(L, r);  /* Number between 0 and 1 */
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
    lauxlib.luaL_argcheck(L, low >= 0 || up <= luaconf.LUA_MAXINTEGER + low, 1,
            lua.to_luastring("interval too large", true));

    r *= (up - low) + 1;
    lua.lua_pushinteger(L, Math.floor(r) + low);
    return 1;
};

const math_abs = function(L) {
    if (lua.lua_isinteger(L, 1)) {
        let n = lua.lua_tointeger(L, 1);
        if (n < 0) n = (-n)|0;
        lua.lua_pushinteger(L, n);
    }
    else
        lua.lua_pushnumber(L, Math.abs(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_sin = function(L) {
    lua.lua_pushnumber(L, Math.sin(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_cos = function(L) {
    lua.lua_pushnumber(L, Math.cos(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_tan = function(L) {
    lua.lua_pushnumber(L, Math.tan(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_asin = function(L) {
    lua.lua_pushnumber(L, Math.asin(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_acos = function(L) {
    lua.lua_pushnumber(L, Math.acos(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_atan = function(L) {
    let y = lauxlib.luaL_checknumber(L, 1);
    let x = lauxlib.luaL_optnumber(L, 2, 1);
    lua.lua_pushnumber(L, Math.atan2(y, x));
    return 1;
};

const math_toint = function(L) {
    let n = lua.lua_tointegerx(L, 1);
    if (n !== false)
        lua.lua_pushinteger(L, n);
    else {
        lauxlib.luaL_checkany(L, 1);
        lua.lua_pushnil(L);  /* value is not convertible to integer */
    }
    return 1;
};

const pushnumint = function(L, d) {
    let n = luaconf.lua_numbertointeger(d);
    if (n !== false)  /* does 'd' fit in an integer? */
        lua.lua_pushinteger(L, n);  /* result is integer */
    else
        lua.lua_pushnumber(L, d);  /* result is float */
};

const math_floor = function(L) {
    if (lua.lua_isinteger(L, 1))
        lua.lua_settop(L, 1);
    else
        pushnumint(L, Math.floor(lauxlib.luaL_checknumber(L, 1)));

    return 1;
};

const math_ceil = function(L) {
    if (lua.lua_isinteger(L, 1))
        lua.lua_settop(L, 1);
    else
        pushnumint(L, Math.ceil(lauxlib.luaL_checknumber(L, 1)));

    return 1;
};

const math_sqrt = function(L) {
    lua.lua_pushnumber(L, Math.sqrt(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_ult = function(L) {
    let a = lauxlib.luaL_checkinteger(L, 1);
    let b = lauxlib.luaL_checkinteger(L, 2);
    lua.lua_pushboolean(L, (a >= 0)?(b<0 || a<b):(b<0 && a<b));
    return 1;
};

const math_log = function(L) {
    let x = lauxlib.luaL_checknumber(L, 1);
    let res;
    if (lua.lua_isnoneornil(L, 2))
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
    lua.lua_pushnumber(L, res);
    return 1;
};

const math_exp = function(L) {
    lua.lua_pushnumber(L, Math.exp(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

const math_deg = function(L) {
    lua.lua_pushnumber(L, lauxlib.luaL_checknumber(L, 1) * (180 / Math.PI));
    return 1;
};

const math_rad = function(L) {
    lua.lua_pushnumber(L, lauxlib.luaL_checknumber(L, 1) * (Math.PI / 180));
    return 1;
};

const math_min = function(L) {
    let n = lua.lua_gettop(L);  /* number of arguments */
    let imin = 1;  /* index of current minimum value */
    lauxlib.luaL_argcheck(L, n >= 1, 1, lua.to_luastring("value expected", true));
    for (let i = 2; i <= n; i++){
        if (lua.lua_compare(L, i, imin, lua.LUA_OPLT))
            imin = i;
    }
    lua.lua_pushvalue(L, imin);
    return 1;
};

const math_max = function(L) {
    let n = lua.lua_gettop(L);  /* number of arguments */
    let imax = 1;  /* index of current minimum value */
    lauxlib.luaL_argcheck(L, n >= 1, 1, lua.to_luastring("value expected", true));
    for (let i = 2; i <= n; i++){
        if (lua.lua_compare(L, imax, i, lua.LUA_OPLT))
            imax = i;
    }
    lua.lua_pushvalue(L, imax);
    return 1;
};

const math_type = function(L) {
    if (lua.lua_type(L, 1) === lua.LUA_TNUMBER) {
        if (lua.lua_isinteger(L, 1))
            lua.lua_pushliteral(L, "integer");
        else
            lua.lua_pushliteral(L, "float");
    } else {
        lauxlib.luaL_checkany(L, 1);
        lua.lua_pushnil(L);
    }
    return 1;
};

const math_fmod = function(L) {
    if (lua.lua_isinteger(L, 1) && lua.lua_isinteger(L, 2)) {
        let d = lua.lua_tointeger(L, 2);
        /* no special case needed for -1 in javascript */
        if (d === 0) {
            lauxlib.luaL_argerror(L, 2, lua.to_luastring("zero", true));
        } else
            lua.lua_pushinteger(L, (lua.lua_tointeger(L, 1) % d)|0);
    } else {
        let a = lauxlib.luaL_checknumber(L, 1);
        let b = lauxlib.luaL_checknumber(L, 2);
        lua.lua_pushnumber(L, a%b);
    }
    return 1;
};

const math_modf = function(L) {
    if (lua.lua_isinteger(L, 1)) {
        lua.lua_settop(L, 1);  /* number is its own integer part */
        lua.lua_pushnumber(L, 0);  /* no fractional part */
    } else {
        let n = lauxlib.luaL_checknumber(L, 1);
        let ip = n < 0 ? Math.ceil(n) : Math.floor(n);
        pushnumint(L, ip);
        lua.lua_pushnumber(L, n === ip ? 0 : n - ip);
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
    "sin":        math_sin,
    "sqrt":       math_sqrt,
    "tan":        math_tan,
    "tointeger":  math_toint,
    "type":       math_type,
    "ult":        math_ult
};

const luaopen_math = function(L) {
    lauxlib.luaL_newlib(L, mathlib);
    lua.lua_pushnumber(L, Math.PI);
    lua.lua_setfield(L, -2, lua.to_luastring("pi", true));
    lua.lua_pushnumber(L, Infinity);
    lua.lua_setfield(L, -2, lua.to_luastring("huge", true));
    lua.lua_pushinteger(L, luaconf.LUA_MAXINTEGER);
    lua.lua_setfield(L, -2, lua.to_luastring("maxinteger", true));
    lua.lua_pushinteger(L, luaconf.LUA_MININTEGER);
    lua.lua_setfield(L, -2, lua.to_luastring("mininteger", true));
    return 1;
};

module.exports.luaopen_math = luaopen_math;
