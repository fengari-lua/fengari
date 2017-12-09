"use strict";

const test    = require('tape');

const lua     = require("../src/lua.js");
const lauxlib = require("../src/lauxlib.js");
const lualib  = require("../src/lualib.js");

test('utf8.offset', function (t) {
    let luaCode = `
        return utf8.offset("( ͡° ͜ʖ ͡° )", 5)
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tointeger(L, -1),
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

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tointeger(L, -3),
        176,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tointeger(L, -2),
        32,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tointeger(L, -1),
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

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "( ͡° ͜ʖ ͡° )",
        "Correct element(s) on the stack"
    );
});


test('utf8.len', function (t) {
    let luaCode = `
        return utf8.len("( ͡° ͜ʖ ͡° )")
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tointeger(L, -1),
        12,
        "Correct element(s) on the stack"
    );
});


test('utf8.codes', function (t) {
    let luaCode = `
        local s = "( ͡° ͜ʖ ͡° )"
        local results = ""
        for p, c in utf8.codes(s) do
            results = results .. "[" .. p .. "," .. c .. "] "
        end
        return results
    `, L;

    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "[1,40] [2,32] [3,865] [5,176] [7,32] [8,860] [10,662] [12,32] [13,865] [15,176] [17,32] [18,41] ",
        "Correct element(s) on the stack"
    );
});
