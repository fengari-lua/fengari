/*jshint esversion: 6 */
"use strict";

const test          = require('tape');
const beautify      = require('js-beautify').js_beautify;

const getState      = require("./tests.js").getState;

const VM            = require("../src/lvm.js");
const ldo           = require("../src/ldo.js");
const lapi          = require("../src/lapi.js");
const CT            = require('../src/lua.js').constant_types;

test('lua_pushnil', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        L = getState(`return "dummy"`);
    }, "New Lua State initiliazed");

    // t.doesNotThrow(function () {
        lapi.lua_pushnil(L);
    // }, "Pushed nil on the stack");

    t.strictEqual(
        L.stack[L.top - 1].type,
        CT.LUA_TNIL,
        "nil is on the stack"
    );
});