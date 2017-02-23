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

test('simple coroutine', function (t) {
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

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-coroutine");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        625,
        "Correct element(s) on the stack"
    );
});