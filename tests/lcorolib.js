"use strict";

const test       = require('tape');

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lauxlib    = require("../src/lauxlib.js");
const lua        = require('../src/lua.js');
const lstate     = require('../src/lstate.js');


test('coroutine.create, coroutine.yield, coroutine.resume', function (t) {
    let luaCode = `
        local co = coroutine.create(function (start)
            local b = coroutine.yield(start * start);
            coroutine.yield(b * b)
        end)

        local success, pow = coroutine.resume(co, 5)
        success, pow = coroutine.resume(co, pow)

        return pow
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-coroutine"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        625,
        "Correct element(s) on the stack"
    );
});


test('coroutine.status', function (t) {
    let luaCode = `
        local co = coroutine.create(function (start)
            local b = coroutine.yield(start * start);
            coroutine.yield(b * b)
        end)

        local s1 = coroutine.status(co)

        local success, pow = coroutine.resume(co, 5)
        success, pow = coroutine.resume(co, pow)

        coroutine.resume(co, pow)

        local s2 = coroutine.status(co)

        return s1, s2
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-coroutine.status"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -2),
        "suspended",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "dead",
        "Correct element(s) on the stack"
    );
});


test('coroutine.isyieldable', function (t) {
    let luaCode = `
        local co = coroutine.create(function ()
            coroutine.yield(coroutine.isyieldable());
        end)

        local succes, yieldable = coroutine.resume(co)

        return yieldable, coroutine.isyieldable()
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-coroutine.isyieldable"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_toboolean(L, -2),
        "Correct element(s) on the stack"
    );

    t.notOk(
        lua.lua_toboolean(L, -1),
        "Correct element(s) on the stack"
    );
});


test('coroutine.running', function (t) {
    let luaCode = `
        local running, ismain

        local co = coroutine.create(function ()
            running, ismain = coroutine.running()
        end)

        coroutine.resume(co)

        return running, ismain
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-coroutine.running"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_tothread(L, -2) instanceof lstate.lua_State,
        "Correct element(s) on the stack"
    );

    t.notOk(
        lua.lua_toboolean(L, -1),
        "Correct element(s) on the stack"
    );
});


test('coroutine.wrap', function (t) {
    let luaCode = `
        local co = coroutine.wrap(function (start)
            local b = coroutine.yield(start * start);
            coroutine.yield(b * b)
        end)

        pow = co(5)
        pow = co(pow)

        return pow
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-coroutine.wrap"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        625,
        "Correct element(s) on the stack"
    );
});
