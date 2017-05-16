"use strict";

global.WEB = false;
global.LUA_USE_ASSERT = true;

const lua     = require('../../src/lua.js');
const lauxlib = require('../../src/lauxlib.js');


const tpanic = function(L) {
    console.error(`PANIC: unprotected error in call to Lua API (${lua.lua_tojsstring(L, -1)})\n`);
    return process.exit(1);  /* do not return to Lua */
};

const newuserdata = function(L) {
    lua.lua_newuserdata(L, lauxlib.luaL_checkinteger(L, 1));
    return 1;
};

const tests_funcs = {
    "newuserdata": newuserdata
};

const luaB_opentests = function(L) {
    lua.lua_atpanic(L, tpanic);
    lauxlib.luaL_newlib(L, tests_funcs);
    return 1;
};

const luaopen_tests = function(L) {
    lauxlib.luaL_requiref(L, lua.to_luastring("T"), luaB_opentests, 1);
    lua.lua_pop(L, 1); /* remove lib */
};

module.exports.luaopen_tests = luaopen_tests;
