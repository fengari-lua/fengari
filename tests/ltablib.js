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


test('table.concat', function (t) {
    let luaCode = `
        return table.concat({1, 2, 3, 4, 5, 6, 7}, ",", 3, 5)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-table.concat");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "3,4,5",
        "Correct element(s) on the stack"
    );
});


test('table.pack', function (t) {
    let luaCode = `
        return table.pack(1, 2, 3)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-table.pack");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        [...lapi.lua_topointer(L, -1).entries()]
            .filter(e => typeof e[0] === 'number') // Filter out the 'n' field
            .map(e => e[1].value).reverse(),
        [1, 2, 3],
        "Correct element(s) on the stack"
    );
});