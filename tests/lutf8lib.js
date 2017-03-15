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


test('utf8.codepoint', function (t) {
    let luaCode = `
        return utf8.codepoint("( ͡° ͜ʖ ͡° )", 5, 8)
    `, L;
    
    t.plan(5);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -3),
        176,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -2),
        32,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        860,
        "Correct element(s) on the stack"
    );

});


test('utf8.char', function (t) {
    let luaCode = `
        return utf8.char(40, 32, 865, 176, 32, 860, 662, 32, 865, 176, 32, 41)
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
        lapi.lua_tostring(L, -1),
        "( ͡° ͜ʖ ͡° )",
        "Correct element(s) on the stack"
    );

});