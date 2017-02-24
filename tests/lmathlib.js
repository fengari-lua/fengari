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
const lstate     = require('../src/lstate.js');
const CT         = lua.constant_types;


test('math.abs, math.sin, math.cos, math.tan, math.asin, math.acos, math.atan', function (t) {
    let luaCode = `
        return math.abs(-10), math.abs(-10.5), math.cos(10), math.tan(10), math.asin(1), math.acos(0.5), math.atan(10)
    `, L;
    
    t.plan(8);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-math.abs");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -7),
        10,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -6),
        10.5,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -5),
        -0.8390715290764524,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -4),
        0.6483608274590866,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -3),
        1.5707963267948966,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -2),
        1.0471975511965979,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        1.4711276743037347,
        "Correct element(s) on the stack"
    );
});