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