"use strict";

const test       = require('tape');
const beautify   = require('js-beautify').js_beautify;

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lapi       = require("../src/lapi.js");
const lauxlib    = require("../src/lauxlib.js");
const linit      = require('../src/linit.js');


test('string.len', function (t) {
    let luaCode = `
        local a = "world"
        return string.len("hello"), a:len()
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -2),
        5,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        5,
        "Correct element(s) on the stack"
    );

});


test('string.char', function (t) {
    let luaCode = `
        return string.char(104, 101, 108, 108, 111)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );
});


test('string.upper, string.lower', function (t) {
    let luaCode = `
        return string.upper("hello"), string.lower("HELLO")
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "HELLO",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );
});


test('string.rep', function (t) {
    let luaCode = `
        return string.rep("hello", 3, ", ")
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello, hello, hello",
        "Correct element(s) on the stack"
    );
});


test('string.reverse', function (t) {
    let luaCode = `
        return string.reverse("olleh")
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );
});


test('string.byte', function (t) {
    let luaCode = `
        return string.byte("hello", 2, 4)
    `, L;
    
    t.plan(5);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -3),
        101,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -2),
        108,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        108,
        "Correct element(s) on the stack"
    );
});


test('string.format', function (t) {
    let luaCode = `
        return string.format("%%%d %010d", 10, 23)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "%10 0000000023",
        "Correct element(s) on the stack"
    );
});


test('string.format', function (t) {
    let luaCode = `
        return string.format("%07X", 0xFFFFFFF)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "FFFFFFF",
        "Correct element(s) on the stack"
    );
});


test('string.format', function (t) {
    let luaCode = `
        return string.format("%q", 'a string with "quotes" and \\n new line')
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        '"a string with \\"quotes\\" and \\\n new line"',
        "Correct element(s) on the stack"
    );
});


test('string.sub', function (t) {
    let luaCode = `
        return string.sub("123456789",2,4),  -- "234"
            string.sub("123456789",7),       -- "789"
            string.sub("123456789",7,6),     --  ""
            string.sub("123456789",7,7),     -- "7"
            string.sub("123456789",0,0),     --  ""
            string.sub("123456789",-10,10),  -- "123456789"
            string.sub("123456789",1,9),     -- "123456789"
            string.sub("123456789",-10,-20), --  ""
            string.sub("123456789",-1),      -- "9"
            string.sub("123456789",-4),      -- "6789"
            string.sub("123456789",-6, -4)   -- "456"
    `, L;
    
    t.plan(13);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -11),
        "234",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -10),
        "789",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -9),
         "",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -8),
        "7",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -7),
         "",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -6),
        "123456789",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -5),
        "123456789",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -4),
         "",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -3),
        "9",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "6789",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "456",
        "Correct element(s) on the stack"
    );
});


test('string.dump', function (t) {
    let luaCode = `
            local todump = function()
                local s = "hello"
                local i = 12
                local f = 12.5
                local b = true

                return s .. i .. f
            end

            return string.dump(todump)
        `, L, bytes = [];
    
    t.plan(3);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode.trim());

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

        let dv = lapi.lua_todataview(L, -1);

        lapi.lua_load(L, null, dv, "test", "binary");

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello1212.5",
        "Correct element(s) on the stack"
    );
});


test('string.pack/unpack/packsize', function (t) {
    let luaCode = `
        local s1, n, s2 = "hello", 2, "you"
        local packed = string.pack("c5jc3", s1, n, s2)
        local us1, un, us2 = string.unpack("c5jc3", packed)
        return string.packsize("c5jc3"), s1 == us1 and n == un and s2 == us2
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -2),
        16,
        "Correct element(s) on the stack"
    );

    t.ok(
        lapi.lua_toboolean(L, -1),
        "Correct element(s) on the stack"
    );
});


test('string.find without pattern', function (t) {
    let luaCode = `
        return string.find("hello to you", " to ")
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -2),
        6,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        9,
        "Correct element(s) on the stack"
    );
});


test('string.match', function (t) {
    let luaCode = `
        return string.match("foo: 123 bar: 456", "(%a+):%s*(%d+)")
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "foo",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "123",
        "Correct element(s) on the stack"
    );
});


test('string.find', function (t) {
    let luaCode = `
        return string.find("foo: 123 bar: 456", "(%a+):%s*(%d+)")
    `, L;
    
    t.plan(6);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, luaCode);

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -4),
        1,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -3),
        8,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "foo",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "123",
        "Correct element(s) on the stack"
    );
});