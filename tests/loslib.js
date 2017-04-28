"use strict";

const test     = require('tape');

const lauxlib  = require("../src/lauxlib.js");
const lua      = require('../src/lua.js');

test('os.time', function (t) {
    let luaCode = `
        return os.time()
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.ok(
        lua.lua_isinteger(L, -1),
        "Correct element(s) on the stack"
    );

});


test('os.getenv', function (t) {
    let luaCode = `
        return os.getenv('HOME')
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.ok(
        lua.lua_isstring(L, -1),
        "Correct element(s) on the stack"
    );

});
