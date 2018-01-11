"use strict";

const test       = require('tape');

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lua     = require('../src/lua.js');
const lauxlib = require('../src/lauxlib.js');
const lualib  = require('../src/lualib.js');
const {to_luastring} = require("../src/fengaricore.js");

test('luaL_loadstring', function (t) {
    let luaCode = `
        local a = "hello world"
        return a
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );
});


test('load', function (t) {
    let luaCode = `
        local f = load("return 'js running lua running lua'")
        return f()
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "js running lua running lua",
        "Correct element(s) on the stack"
    );
});


test('luaL_loadbuffer', function (t) {
    let luaCode = `
        local a = "hello world"
        return a
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadbuffer(L, bc, null, to_luastring("test"));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );
});

// TODO: test stdin
test('loadfile', function (t) {
    let luaCode = `
        local f = loadfile("tests/loadfile-test.lua")
        return f()
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );
});


test('loadfile (binary)', function (t) {
    let luaCode = `
        local f = loadfile("tests/loadfile-test.bc")
        return f()
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );
});


test('dofile', function (t) {
    let luaCode = `
        return dofile("tests/loadfile-test.lua")
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );
});
