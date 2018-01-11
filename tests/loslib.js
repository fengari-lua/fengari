"use strict";

const test     = require('tape');

const lua     = require('../src/lua.js');
const lauxlib = require('../src/lauxlib.js');
const lualib  = require('../src/lualib.js');
const {to_luastring} = require("../src/fengaricore.js");

test('os.time', function (t) {
    let luaCode = `
        return os.time()
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

    t.ok(
        lua.lua_isinteger(L, -1),
        "Correct element(s) on the stack"
    );
});


test('os.time (with format)', function (t) {
    let luaCode = `
        return os.time({
            day = 8,
            month = 2,
            year = 2015
        })
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
        lua.lua_tointeger(L, -1),
        new Date(2015, 1, 8, 12, 0, 0, 0).getTime() / 1000,
        "Correct element(s) on the stack"
    );
});


test('os.difftime', function (t) {
    let luaCode = `
        local t1 = os.time()
        local t2 = os.time()
        return os.difftime(t2, t1)
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

    t.ok(
        lua.lua_isnumber(L, -1),
        "Correct element(s) on the stack"
    );
});


test('os.date', function (t) {
    let luaCode = `
        return os.date('%Y-%m-%d', os.time({
            day = 8,
            month = 2,
            year = 2015
        }))
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
        "2015-02-08",
        "Correct element(s) on the stack"
    );
});


test('os.getenv', function (t) {
    let luaCode = `
        return os.getenv('PATH')
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

    t.ok(
        lua.lua_isstring(L, -1),
        "Correct element(s) on the stack"
    );
});
