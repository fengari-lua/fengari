/*jshint esversion: 6 */
"use strict";

const test           = require('tape');
const beautify       = require('js-beautify').js_beautify;

const VM             = require("../src/lvm.js");

const getState       = require("./tests.js").getState;


test('__index', function (t) {
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