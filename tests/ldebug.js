"use strict";

const test       = require('tape');

const lua     = require('../src/lua.js');
const lauxlib = require('../src/lauxlib.js');
const lualib  = require('../src/lualib.js');
const {to_luastring} = require("../src/fengaricore.js");

test('luaG_typeerror', function (t) {
    let luaCode = `
        local a = true
        return #a
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

        lua.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");


    t.ok(
        lua.lua_tojsstring(L, -1).endsWith("attempt to get length of a boolean value (local 'a')"),
        "Correct error was thrown"
    );
});


test('luaG_typeerror', function (t) {
    let luaCode = `
        local a = true
        return a.yo
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

        lua.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_tojsstring(L, -1).endsWith("attempt to index a boolean value (local 'a')"),
        "Correct error was thrown"
    );
});


test('luaG_typeerror', function (t) {
    let luaCode = `
        local a = true
        return a.yo
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

        lua.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_tojsstring(L, -1).endsWith("attempt to index a boolean value (local 'a')"),
        "Correct error was thrown"
    );
});


test('luaG_typeerror', function (t) {
    let luaCode = `
        local a = true
        a.yo = 1
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

        lua.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_tojsstring(L, -1).endsWith("attempt to index a boolean value (local 'a')"),
        "Correct error was thrown"
    );
});


test('luaG_concaterror', function (t) {
    let luaCode = `
        return {} .. 'hello'
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

        lua.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_tojsstring(L, -1).endsWith("attempt to concatenate a table value"),
        "Correct error was thrown"
    );
});


test('luaG_opinterror', function (t) {
    let luaCode = `
        return {} + 'hello'
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

        lua.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_tojsstring(L, -1).endsWith("attempt to perform arithmetic on a table value"),
        "Correct error was thrown"
    );
});


test('luaG_tointerror', function (t) {
    let luaCode = `
        return 123.5 & 12
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, to_luastring(luaCode));

        lua.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_tojsstring(L, -1).endsWith("number has no integer representation"),
        "Correct error was thrown"
    );
});
