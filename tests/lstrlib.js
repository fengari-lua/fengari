"use strict";

const test       = require('tape');
const beautify   = require('js-beautify').js_beautify;

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lapi       = require("../src/lapi.js");
const lauxlib    = require("../src/lauxlib.js");
const linit      = require('../src/linit.js');


test('string.len', function (t) {
    let luaCode = `
        local a = "world"
        return string.len("hello"), a:len()
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -2),
        5,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        5,
        "Correct element(s) on the stack"
    );

});


test('string.char', function (t) {
    let luaCode = `
        return string.char(104, 101, 108, 108, 111)
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
        "hello",
        "Correct element(s) on the stack"
    );
});


test('string.upper, string.lower', function (t) {
    let luaCode = `
        return string.upper("hello"), string.lower("HELLO")
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "HELLO",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );
});