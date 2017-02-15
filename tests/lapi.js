/*jshint esversion: 6 */
"use strict";

const test          = require('tape');
const beautify      = require('js-beautify').js_beautify;

const getState      = require("./tests.js").getState;

const VM            = require("../src/lvm.js");
const ldo           = require("../src/ldo.js");
const lapi          = require("../src/lapi.js");
const lauxlib       = require("../src/lauxlib.js");
const CT            = require('../src/lua.js').constant_types;

test('luaL_newstate, lua_pushnil', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate()

        lapi.lua_pushnil(L);
    }, "JS Lua program ran without error");

    t.strictEqual(
        L.stack[L.top - 1].type,
        CT.LUA_TNIL,
        "nil is on the stack"
    );
});