"use strict";

const test     = require('tape');

const lauxlib  = require("../src/lauxlib.js");
const lua      = require('../src/lua.js');

test('require an existing module', function (t) {
    let luaCode = `
        return require('os')
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
        lua.lua_istable(L, -1),
        "Correct element(s) on the stack"
    );

});


test('require a file', function (t) {
    let luaCode = `
        return require('tests/module-hello')()
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

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello from module",
        "Correct element(s) on the stack"
    );

});


test('package.loadlib', function (t) {
    let luaCode = `
        return package.loadlib('./tests/lib-hello.js.mod', 'hello')()
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

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello from js lib",
        "Correct element(s) on the stack"
    );

});
