"use strict";

const test       = require('tape');
const beautify   = require('js-beautify').js_beautify;

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lapi       = require("../src/lapi.js");
const lauxlib    = require("../src/lauxlib.js");
const linit      = require('../src/linit.js');
const Table      = require("../src/lobject.js").Table;

// Roughly the same tests as test/lvm.js to cover all opcodes

test('LOADK, RETURN', function (t) {
    let luaCode = `
        local a = "hello world"
        return a
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );

});


test('MOVE', function (t) {
    let luaCode = `
        local a = "hello world"
        local b = a
        return b
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );

});


test('Binary op', function (t) {
    let luaCode = `
        local a = 5
        local b = 10
        return a + b, a - b, a * b, a / b, a % b, a^b, a // b, a & b, a | b, a ~ b, a << b, a >> b
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 12, L.top).map(e => e.value),
        [15, -5, 50, 0.5, 5, 9765625.0, 0, 0, 15, 15, 5120, 0],
        "Program output is correct"
    );

});


test('Unary op, LOADBOOL', function (t) {
    let luaCode = `
        local a = 5
        local b = false
        return -a, not b, ~a
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 3, L.top).map(e => e.value),
        [-5, true, -6],
        "Program output is correct"
    );
});


test('NEWTABLE', function (t) {
    let luaCode = `
        local a = {}
        return a
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.ok(
        L.stack[lapi.index2addr_(L, -1)] instanceof Table,
        "Program output is correct"
    );
});


test('CALL', function (t) {
    let luaCode = `
        local f = function (a, b)
            return a + b
        end

        local c = f(1, 2)

        return c
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        3,
        "Program output is correct"
    );
});

test('Multiple return', function (t) {
    let luaCode = `
        local f = function (a, b)
            return a + b, a - b, a * b
        end

        local c
        local d
        local e

        c, d, e = f(1,2)

        return c, d, e
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 3, L.top).map(e => e.value),
        [3, -1, 2],
        "Program output is correct"
    );
});


test('TAILCALL', function (t) {
    let luaCode = `
        local f = function (a, b)
            return a + b
        end

        return f(1,2)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        3,
        "Program output is correct"
    );
});


test('VARARG', function (t) {
    let luaCode = `
        local f = function (...)
            return ...
        end

        return f(1,2,3)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, null, luaCode, "test", "text");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 3, L.top).map(e => e.value),
        [1, 2, 3],
        "Program output is correct"
    );
});