"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const char    = lua.char;
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const ldebug  = require('./ldebug.js');
const llimit  = require('./llimit.js');

const setfield = function(L, key, value) {
    lapi.lua_pushinteger(L, value);
    lapi.lua_setfield(L, -2, key);
};

const setallfields = function(L, time) {
    setfield(L, "sec", time.getSeconds());
    setfield(L, "min", time.getMinutes());
    setfield(L, "hour", time.getHours());
    setfield(L, "day", time.getDate());
    setfield(L, "month", time.getMonth());
    setfield(L, "year", time.getYear());
    setfield(L, "wday", time.getDay());
    let now = new Date();
    setfield(L, "yday", Math.floor((now - (new Date(now.getFullYear(), 0, 0))) / (1000 * 60 * 60 * 24)));
    // setboolfield(L, "isdst", time.get);
};

const L_MAXDATEFIELD = (llimit.MAX_INT / 2);

const getfield = function(L, key, d, delta) {
    let t = lapi.lua_getfield(L, -1, lua.to_luastring(key));  /* get field and its type */
    let res = lapi.lua_tointegerx(L, -1);
    if (res !== false) {  /* field is not an integer? */
        if (t != lua.LUA_TNIL)  /* some other value? */
            return lauxlib.luaL_error(L, lua.to_luastring(`field '${key}' is not an integer`), true);
        else if (d < 0)  /* absent field; no default? */
            return lauxlib.luaL_error(L, lua.to_luastring(`field '${key}' missing in date table`), true);
        res = d;
    }
    else {
        if (!(-L_MAXDATEFIELD <= res && res <= L_MAXDATEFIELD))
            return lauxlib.luaL_error(L, lua.to_luastring(`field '${key}' is out-of-bound`), true);
        res -= delta;
    }
    lapi.lua_pop(L, 1);
    return res;
};

const os_time = function(L) {
    let t = new Date();
    if (!lapi.lua_isnoneornil(L, 1))  /* called with arg */{
        lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);  /* make sure table is at the top */
        lapi.lua_settop(L, 1);
        t.setSeconds(getfield(L, "sec", 0, 0));
        t.setSeconds(getfield(L, "min", 0, 0));
        t.setSeconds(getfield(L, "hour", 12, 0));
        t.setSeconds(getfield(L, "day", -1, 0));
        t.setSeconds(getfield(L, "month", -1, 1));
        t.setSeconds(getfield(L, "year", -1, 1900));
        setallfields(L, t);
    }

    lapi.lua_pushinteger(L, Math.floor(t / 1000));
    return 1;
};


const syslib = {
    "time": os_time
};

const luaopen_os = function(L) {
    lauxlib.luaL_newlib(L, syslib);
    return 1;
};

module.exports.luaopen_os = luaopen_os;
