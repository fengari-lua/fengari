/*jshint esversion: 6 */
"use strict";

const test           = require('tape');
const beautify       = require('js-beautify').js_beautify;

const VM             = require("../src/lvm.js");

const getState       = require("./tests.js").getState;


test('__index, __newindex: with actual table', function (t) {
    let luaCode = `
        local t = {yo=1}
        return t.yo, t.lo
    `, L;
    
    t.plan(3);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
        VM.luaV_execute(L);
    }, "Program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        null,
        "Program output is correct"
    );

    t.strictEqual(
        L.stack[L.top - 2].value,
        1,
        "Program output is correct"
    );
});


test('__index: with non table', function (t) {
    let luaCode = `
        local t = "a string"
        return t.yo
    `, L;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");

    t.throws(function () {
        VM.luaV_execute(L);
    }, "Program executed with expected error");

});


test('__newindex: with non table', function (t) {
    let luaCode = `
        local t = "a string"
        t.yo = "hello"
    `, L;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");

    t.throws(function () {
        VM.luaV_execute(L);
    }, "Program executed with expected error");

});