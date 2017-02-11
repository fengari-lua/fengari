/*jshint esversion: 6 */
"use strict";

const test           = require('tape');
const beautify       = require('js-beautify').js_beautify;

const lua_State      = require("../src/lstate.js").lua_State;
const VM             = require("../src/lvm.js");
const Table          = require("../src/lobject.js").Table;

const getState       = require("./tests.js");


test('__add', function (t) {
    let luaCode = `
        local t = {}
        setmetatable(t, {__add = function ()
            return "hello"
        end})
        return t + 1
    `, L;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
        VM.luaV_execute(L);
    }, "Program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        "hello",
        "Program output is correct"
    );
});