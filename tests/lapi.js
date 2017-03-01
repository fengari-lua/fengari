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

test('luaL_newstate, lua_pushnil, luaL_typename', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushnil(L);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "nil",
        "Correct element(s) on the stack"
    );
});


test('lua_pushnumber', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushnumber(L, 10.5);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "number",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        10.5,
        "top is correct"
    );
});


test('lua_pushinteger', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushinteger(L, 10);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "number",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        10,
        "top is correct"
    );
});


test('lua_pushstring', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushstring(L, "hello");

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "string",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "top is correct"
    );
});


test('lua_pushboolean', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushboolean(L, true);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "boolean",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_toboolean(L, -1),
        true,
        "top is correct"
    );
});


test('lua_pushvalue', function (t) {
    let L;
    
    t.plan(5);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushstring(L, "hello");

        lapi.lua_pushvalue(L, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "string",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lauxlib.luaL_typename(L, -2),
        "string",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "hello",
        "Correct element(s) on the stack"
    );
});


test('lua_pushjsclosure', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            return 0;
        };

        L = lauxlib.luaL_newstate();

        lapi.lua_pushstring(L, "a value associated to the C closure");
        lapi.lua_pushjsclosure(L, fn, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "function",
        "Correct element(s) on the stack"
    );
});


test('lua_pushjsfunction', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            return 0;
        };

        L = lauxlib.luaL_newstate();

        lapi.lua_pushjsfunction(L, fn);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lauxlib.luaL_typename(L, -1),
        "function",
        "Correct element(s) on the stack"
    );
});


test('lua_call (calling a light JS function)', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            lapi.lua_pushstring(L, "hello");
            return 1;
        };

        L = lauxlib.luaL_newstate();

        lapi.lua_pushjsfunction(L, fn);

        lapi.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "top is correct"
    );
});


test('lua_call (calling a JS closure)', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            lapi.lua_pushstring(L, lapi.lua_tostring(L, lua.lua_upvalueindex(1)));
            return 1;
        };

        L = lauxlib.luaL_newstate();

        lapi.lua_pushstring(L, "upvalue hello !");
        lapi.lua_pushjsclosure(L, fn, 1);

        lapi.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "upvalue hello !",
        "top is correct"
    );
});


test('lua_pcall (calling a light JS function)', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            lapi.lua_pushstring(L, "hello");
            return 1;
        };

        L = lauxlib.luaL_newstate();

        lapi.lua_pushjsfunction(L, fn);

        lapi.lua_pcall(L, 0, 1, 0);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "top is correct"
    );
});


test('lua_pcall that breaks', function (t) {
    let L;
    
    t.plan(1);

    t.doesNotThrow(function () {

        let fn = function(L) {
            return "undefined_value";
        };

        L = lauxlib.luaL_newstate();

        lapi.lua_pushjsfunction(L, fn);

        lapi.lua_pcall(L, 0, 1, 0);

    }, "JS Lua program ran without error");

    console.log(L.stack[L.top - 1].value);
});


test('lua_pop', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushstring(L, "hello");
        lapi.lua_pushstring(L, "world");

        lapi.lua_pop(L, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );
});


test('lua_load and lua_call it', function (t) {
    let luaCode = `
        local a = "JS > Lua > JS \o/"
        return a
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        lapi.lua_load(L, null, bc, "test-lua_load", "binary");

        lapi.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "JS > Lua > JS \o/",
        "Correct element(s) on the stack"
    );
});


test('lua script reads js upvalues', function (t) {
    let luaCode = `
        return js .. " world"
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        lapi.lua_load(L, null, bc, "test-lua_load", "binary");

        lapi.lua_pushstring(L, "hello");
        lapi.lua_setglobal(L, "js");

        lapi.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );
});


test('lua_createtable', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();

        lapi.lua_createtable(L, 3, 3);

    }, "JS Lua program ran without error");

    t.ok(
        lapi.lua_istable(L, -1),
        "Correct element(s) on the stack"
    );
});


test('lua_newtable', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();

        lapi.lua_newtable(L);

    }, "JS Lua program ran without error");

    t.ok(
        lapi.lua_istable(L, -1),
        "Correct element(s) on the stack"
    );
});


test('lua_settable, lua_gettable', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();

        lapi.lua_newtable(L);

        lapi.lua_pushstring(L, "key");
        lapi.lua_pushstring(L, "value");

        lapi.lua_settable(L, -3);

        lapi.lua_pushstring(L, "key");
        lapi.lua_gettable(L, -2);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "value",
        "Correct element(s) on the stack"
    );
});