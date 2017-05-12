"use strict";

const test     = require('tape');

global.WEB = false;

const lua     = require('../../src/lua.js');
const lauxlib = require('../../src/lauxlib.js');
const lualib  = require('../../src/lualib.js');


const dostring = `local function dostring (x) return assert(load(x), "")() end`;

test("[test-suite] events: dostring", function (t) {
    let luaCode = `
        dostring("x \\v\\f = \\t\\r 'a\\0a' \\v\\f\\f")
        assert(x == 'a\\0a' and string.len(x) == 3)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(dostring + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


// TODO: bell character '\a' in JS is parsed as 'a'
test("[test-suite] events: escape sequences", function (t) {
    let luaCode = `
        assert('\\n\\"\\'\\\\' == [[

"'\\]])
        assert(string.find("\\b\\f\\n\\r\\t\\v", "^%c%c%c%c%c%c$"))
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test("[test-suite] events: assume ASCII just for tests", function (t) {
    let luaCode = `
        assert("\\09912" == 'c12')
        assert("\\99ab" == 'cab')
        assert("\\099" == '\\99')
        assert("\\099\\n" == 'c\\10')
        assert('\\0\\0\\0alo' == '\\0' .. '\\0\\0' .. 'alo')

        assert(010 .. 020 .. -030 == "1020-30")
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test("[test-suite] events: hexadecimal escapes", function (t) {
    let luaCode = `
        assert("\\x00\\x05\\x10\\x1f\\x3C\\xfF\\xe8" == "\\0\\5\\16\\31\\60\\255\\232")

        local function lexstring (x, y, n)
          local f = assert(load('return ' .. x ..
                    ', require"debug".getinfo(1).currentline', ''))
          local s, l = f()
          assert(s == y and l == n)
        end

        lexstring("'abc\\\\z  \\n   efg'", "abcefg", 2)
        lexstring("'abc\\\\z  \\n\\n\\n'", "abc", 4)
        lexstring("'\\\\z  \\n\\t\\f\\v\\n'",  "", 3)
        lexstring("[[\\nalo\\nalo\\n\\n]]", "alo\\nalo\\n\\n", 5)
        lexstring("[[\\nalo\\ralo\\n\\n]]", "alo\\nalo\\n\\n", 5)
        lexstring("[[\\nalo\\ralo\\r\\n]]", "alo\\nalo\\n", 4)
        lexstring("[[\\ralo\\n\\ralo\\r\\n]]", "alo\\nalo\\n", 4)
        lexstring("[[alo]\\n]alo]]", "alo]\\n]alo", 2)

assert("abc\\z
        def\\z
        ghi\\z
       " == 'abcdefghi')
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test("[test-suite] events: UTF-8 sequences", function (t) {
    let luaCode = `
        assert("\\u{0}\\u{00000000}\\x00\\0" == string.char(0, 0, 0, 0))

        -- limits for 1-byte sequences
        assert("\\u{0}\\u{7F}" == "\\x00\\z\\x7F")

        -- limits for 2-byte sequences
        assert("\\u{80}\\u{7FF}" == "\\xC2\\x80\\z\\xDF\\xBF")

        -- limits for 3-byte sequences
        assert("\\u{800}\\u{FFFF}" ==   "\\xE0\\xA0\\x80\\z\\xEF\\xBF\\xBF")

        -- limits for 4-byte sequences
        assert("\\u{10000}\\u{10FFFF}" == "\\xF0\\x90\\x80\\x80\\z\\xF4\\x8F\\xBF\\xBF")
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});

