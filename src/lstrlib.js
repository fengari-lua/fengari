"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');

/* translate a relative string position: negative means back from end */
const posrelat = function(pos, len) {
    if (pos >= 0) return pos;
    else if (0 - pos > len) return 0;
    else return len + pos + 1;
};

const str_len = function(L) {
    lapi.lua_pushinteger(L, lauxlib.luaL_checkstring(L, 1).length);
    return 1;
};

const str_char = function(L) {
    let n = lapi.lua_gettop(L);  /* number of arguments */
    let p = "";
    for (let i = 1; i <= n; i++) {
        let c = lauxlib.luaL_checkinteger(L, i);
        lauxlib.luaL_argcheck(L, c >= 0 && c <= 255, "value out of range"); // Strings are 8-bit clean
        p += String.fromCharCode(c);
    }
    lapi.lua_pushstring(L, p);
    return 1;
};

const str_reverse = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).split("").reverse().join(""));
    return 1;
};

const str_lower = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).toLowerCase());
    return 1;
};

const str_upper = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).toUpperCase());
    return 1;
};

const str_rep = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let n = lauxlib.luaL_checkinteger(L, 2);
    let sep = lauxlib.luaL_optstring(L, 3, "");

    lapi.lua_pushstring(L, (s + sep).repeat(n - 1) + s);
    return 1;
};

const str_byte = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    s = L.stack[lapi.index2addr_(L, 1)].value;
    let l = s.length;
    let posi = posrelat(lauxlib.luaL_optinteger(L, 2, 1), l);
    let pose = posrelat(lauxlib.luaL_optinteger(L, 3, posi), l);

    if (posi < 1) posi = 1;
    if (pose > l) pose = l;
    if (posi > pose) return 0;  /* empty interval; return no values */
    if (pose - posi >= Number.MAX_SAFE_INTEGER)  /* arithmetic overflow? */
        return lauxlib.luaL_error(L, "string slice too long");

    let n = (pose - posi) + 1;
    lauxlib.luaL_checkstack(L, n, "string slice too long");
    for (let i = 0; i < n; i++)
        lapi.lua_pushinteger(L, s[posi + i - 1]);
    return n;
};

const strlib = {
    "byte":    str_byte,
    "char":    str_char,
    "len":     str_len,
    "lower":   str_lower,
    "rep":     str_rep,
    "reverse": str_reverse,
    "upper":   str_upper
};

const createmetatable = function(L) {
    lapi.lua_createtable(L, 0, 1);  /* table to be metatable for strings */
    lapi.lua_pushliteral(L, "");  /* dummy string */
    lapi.lua_pushvalue(L, -2);  /* copy table */
    lapi.lua_setmetatable(L, -2);  /* set table as metatable for strings */
    lapi.lua_pop(L, 1);  /* pop dummy string */
    lapi.lua_pushvalue(L, -2);  /* get string library */
    lapi.lua_setfield(L, -2, "__index");  /* metatable.__index = string */
    lapi.lua_pop(L, 1);  /* pop metatable */  
};

const luaopen_string = function(L) {
    lauxlib.luaL_newlib(L, strlib);
    createmetatable(L);
    return 1;
};

module.exports.luaopen_string = luaopen_string;