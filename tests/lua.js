"use strict";

const test     = require('tape');

const lapi     = require("../src/lapi.js");
const lauxlib  = require("../src/lauxlib.js");
const lua      = require('../src/lua.js');
const linit    = require('../src/linit.js');

test('string.lua', function (t) {
    let luaCode = `
        return dofile("tests/single.lua")
    `, L;
    
    t.plan(1);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    // t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    // }, "Lua program ran without error");

});
