"use strict";

const test       = require('tape');
const beautify   = require('js-beautify').js_beautify;

const tests      = require("./tests.js");
const getState   = tests.getState;
const toByteCode = tests.toByteCode;

const VM         = require("../src/lvm.js");
const ldo        = require("../src/ldo.js");
const lapi       = require("../src/lapi.js");
const lauxlib    = require("../src/lauxlib.js");
const lua        = require('../src/lua.js');
const linit      = require('../src/linit.js');
const CT         = lua.constant_types;


test('print', function (t) {
    let luaCode = `
        print("hello", "world", 123)
    `, L;
    
    t.plan(1);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-print");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");
});


test('setmetatable, getmetatable', function (t) {
    let luaCode = `
        local mt = {
            __index = function ()
                print("hello")
                return "hello"
            end
        }

        local t = {}

        setmetatable(t, mt);

        return t[1], getmetatable(t)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-setmetatable-getmetatable");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "hello",
        "Correct element(s) on the stack"
    );

    t.ok(
        lapi.lua_istable(L, -1),
        "Correct element(s) on the stack"
    );
});


test('rawequal', function (t) {
    let luaCode = `
        local mt = {
            __eq = function ()
                return true
            end
        }

        local t1 = {}
        local t2 = {}

        setmetatable(t1, mt);

        return rawequal(t1, t2), t1 == t2
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-rawequal");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.notOk(
        lapi.lua_toboolean(L, -2),
        "Correct element(s) on the stack"
    );

    t.ok(
        lapi.lua_toboolean(L, -1),
        "Correct element(s) on the stack"
    );
});


test('rawset, rawget', function (t) {
    let luaCode = `
        local mt = {
            __newindex = function (table, key, value)
                rawset(table, key, "hello")
            end
        }

        local t = {}

        setmetatable(t, mt);

        t["yo"] = "bye"
        rawset(t, "yoyo", "bye")

        return rawget(t, "yo"), t["yo"], rawget(t, "yoyo"), t["yoyo"]
    `, L;
    
    t.plan(5);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-rawequal");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -4),
        "hello",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -3),
        "hello",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "bye",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "bye",
        "Correct element(s) on the stack"
    );
});


test('type', function (t) {
    let luaCode = `
        return type(1), type(true), type("hello"), type({}), type(nil)
    `, L;
    
    t.plan(6);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-type");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -5),
        "number",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -4),
        "boolean",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -3),
        "string",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "table",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "nil",
        "Correct element(s) on the stack"
    );
});


test('error', function (t) {
    let luaCode = `
        error("you fucked up")
    `, L;
    
    t.plan(1);

    t.throws(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-error");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");
});


test('error, protected', function (t) {
    let luaCode = `
        error("you fucked up")
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-error");

        lapi.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lapi.lua_tostring(L, -1).endsWith("you fucked up"),
        "Error is on the stack"
    );
});


test('pcall', function (t) {
    let luaCode = `
        local willFail = function ()
            error("you fucked up")
        end

        return pcall(willFail)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-pcall");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.ok(
        lapi.lua_tostring(L, -1).endsWith("you fucked up"),
        "Error is on the stack"
    );
});


test('xpcall', function (t) {
    let luaCode = `
        local willFail = function ()
            error("you fucked up")
        end

        local msgh = function (err)
            return "Something's wrong: " .. err
        end

        return xpcall(willFail, msgh)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-pcall");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    console.log(lapi.lua_tostring(L, -1));

    t.ok(
        lapi.lua_tostring(L, -1).startsWith("Something's wrong:"),
        "msgh was called and modified the error"
    );

    t.ok(
        lapi.lua_tostring(L, -1).endsWith("you fucked up"),
        "msgh was called and modified the error"
    );
});


test('ipairs', function (t) {
    let luaCode = `
        local t = {1, 2, 3, 4, 5, ['yo'] = 'lo'}

        local sum = 0
        for i, v in ipairs(t) do
            sum = sum + v
        end

        return sum
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-ipairs");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        15,
        "Correct element(s) on the stack"
    );
});


test('select', function (t) {
    let luaCode = `
        return {select('#', 1, 2, 3)}, {select(2, 1, 2, 3)}, {select(-2, 1, 2, 3)}
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-select");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        [...lapi.lua_topointer(L, -3).entries()].map(e => e[1].value),
        [3],
        "Correct element(s) on the stack"
    );

    t.deepEqual(
        [...lapi.lua_topointer(L, -2).entries()].map(e => e[1].value).sort(),
        [2, 3],
        "Correct element(s) on the stack"
    );

    t.deepEqual(
        [...lapi.lua_topointer(L, -1).entries()].map(e => e[1].value).sort(),
        [2, 3],
        "Correct element(s) on the stack"
    );
});


test('tonumber', function (t) {
    let luaCode = `
        return tonumber('123'), tonumber('12.3'), tonumber('az', 36), tonumber('10', 2)
    `, L;
    
    t.plan(5);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-tonumber");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -4),
        123,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -3),
        12.3,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -2),
        395,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        2,
        "Correct element(s) on the stack"
    );
});


test('assert', function (t) {
    let luaCode = `
        assert(1 < 0, "this doesn't makes sense")
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-assert");

        lapi.lua_pcall(L, 0, -1, 0);

    }, "JS Lua program ran without error");

    t.ok(
        lapi.lua_tostring(L, -1).endsWith("this doesn't makes sense"),
        "Error is on the stack"
    );
});


test('rawlen', function (t) {
    let luaCode = `
        return rawlen({1, 2, 3}), rawlen('hello')
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-rawlen");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -2),
        3,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        5,
        "Correct element(s) on the stack"
    );
});


test('next', function (t) {
    let luaCode = `
        local total = 0
        local t = {
            1,
            two = 2,
            3,
            four = 4
        }

        for k,v in next, t, nil do
            total = total + v
        end

        return total
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-next");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        10,
        "Correct element(s) on the stack"
    );
});


test('pairs', function (t) {
    let luaCode = `
        local total = 0
        local t = {
            1,
            two = 2,
            3,
            four = 4
        }

        for k,v in pairs(t) do
            total = total + v
        end

        return total
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-pairs");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        10,
        "Correct element(s) on the stack"
    );
});


test('pairs with __pairs', function (t) {
    let luaCode = `
        local total = 0

        local mt = {
            __pairs = function(t)
                return next, {5, 6, 7, 8}, nil
            end
        }

        local t = {
            1,
            two = 2,
            3,
            four = 4
        }

        setmetatable(t, mt)

        for k,v in pairs(t) do
            total = total + v
        end

        return total
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-pairs");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        26,
        "Correct element(s) on the stack"
    );
});