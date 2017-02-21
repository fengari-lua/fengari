/*jshint esversion: 6 */
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
    )
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
    )
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
    
    t.plan(1);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-pcall");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    console.log(lapi.lua_tostring(L, -1));

    // t.ok(
    //     lapi.lua_tostring(L, -1).endsWith("you fucked up"),
    //     "Error is on the stack"
    // )
});