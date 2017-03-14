"use strict";

const test    = require('tape');
const tests   = require("./tests.js");

const lapi    = require("../src/lapi.js");
const lauxlib = require("../src/lauxlib.js");
const linit   = require('../src/linit.js');

test('utf8.offset', function (t) {
    let luaCode = `
        return utf8.offset("( ͡° ͜ʖ ͡° )", 5)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        7,
        "Correct element(s) on the stack"
    );

});