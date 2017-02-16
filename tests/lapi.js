/*jshint esversion: 6 */
"use strict";

const test     = require('tape');
const beautify = require('js-beautify').js_beautify;

const getState = require("./tests.js").getState;

const VM       = require("../src/lvm.js");
const ldo      = require("../src/ldo.js");
const lapi     = require("../src/lapi.js");
const lauxlib  = require("../src/lauxlib.js");
const CT       = require('../src/lua.js').constant_types;

test('luaL_newstate, lua_pushnil, lua_gettop, luaL_typename', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushnil(L);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_gettop(L),
        1,
        "top is correct"
    );

    t.strictEqual(
        lauxlib.luaL_typename(L, lapi.lua_gettop(L)),
        "nil",
        "Correct element(s) on the stack"
    );
});


test('lua_pushnumber', function (t) {
    let L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushnumber(L, 10.5);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_gettop(L),
        1,
        "top is correct"
    );

    t.strictEqual(
        lauxlib.luaL_typename(L, lapi.lua_gettop(L)),
        "number",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        L.stack[lapi.lua_gettop(L)].value,
        10.5,
        "top is correct"
    );
});


test('lua_pushinteger', function (t) {
    let L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushnumber(L, 10);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_gettop(L),
        1,
        "top is correct"
    );

    t.strictEqual(
        lauxlib.luaL_typename(L, lapi.lua_gettop(L)),
        "number",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        L.stack[lapi.lua_gettop(L)].value,
        10,
        "top is correct"
    );
});


test('lua_pushstring', function (t) {
    let L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushstring(L, "hello");

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_gettop(L),
        1,
        "top is correct"
    );

    t.strictEqual(
        lauxlib.luaL_typename(L, lapi.lua_gettop(L)),
        "string",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        L.stack[lapi.lua_gettop(L)].value,
        "hello",
        "top is correct"
    );
});


test('lua_pushboolean', function (t) {
    let L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushboolean(L, true);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_gettop(L),
        1,
        "top is correct"
    );

    t.strictEqual(
        lauxlib.luaL_typename(L, lapi.lua_gettop(L)),
        "boolean",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        L.stack[lapi.lua_gettop(L)].value,
        true,
        "top is correct"
    );
});


test('lua_pushvalue', function (t) {
    let L;
    
    t.plan(6);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lapi.lua_pushstring(L, "hello");

        lapi.lua_pushvalue(L, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_gettop(L),
        2,
        "top is correct"
    );

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
        L.stack[lapi.lua_gettop(L)].value,
        "hello",
        "top is correct"
    );

    t.strictEqual(
        L.stack[lapi.lua_gettop(L) - 1].value,
        "hello",
        "top is correct"
    );
});