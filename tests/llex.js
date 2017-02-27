/*jshint esversion: 6 */
"use strict";

const test     = require('tape');
const beautify = require('js-beautify').js_beautify;

const tests    = require("./tests.js");

const lapi     = require("../src/lapi.js");
const lauxlib  = require("../src/lauxlib.js");
const llex     = require("../src/llex.js");
const lua      = require('../src/lua.js');
const R        = llex.RESERVED;


test('basic lexing', function (t) {
    let luaCode = `
        return "hello lex !"
    `, L;
    
    t.plan(2);

    let readTokens = [];

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        let ls = new llex.LexState();
        llex.luaX_setinput(L, ls, new llex.MBuffer(luaCode), luaCode, luaCode.charAt(0));

        llex.luaX_next(ls);

        while (ls.t.token !== R.TK_EOS) {
            console.log(llex.luaX_tokens[ls.t.token - llex.FIRST_RESERVED]);

            readTokens.push(ls.t.token);
            llex.luaX_next(ls);
        }


    }, "JS Lua program ran without error");

    t.deepEqual(
        readTokens,
        [R.TK_RETURN, R.TK_STRING],
        "Correct tokens found"
    )

});