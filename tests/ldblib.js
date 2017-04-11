"use strict";

const test     = require('tape');

const lapi     = require("../src/lapi.js");
const lauxlib  = require("../src/lauxlib.js");
const lua      = require('../src/lua.js');
const linit    = require('../src/linit.js');

test('debug.getlocal', function (t) {
    let luaCode = `
        local alocal = "alocal"
        local another = "another"

        local result = ""

        local l = function()
            local infunction = "infunction"
            local anotherin = "anotherin"
            result = table.concat(table.pack(debug.getlocal(2, 1)), " ")
                .. table.concat(table.pack(debug.getlocal(2, 2)), " ")
                .. table.concat(table.pack(debug.getlocal(1, 1)), " ")
                .. table.concat(table.pack(debug.getlocal(1, 2)), " ")
        end

        l()

        return result
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tojsstring(L, -1),
        "alocal alocalanother anotherinfunction infunctionanotherin anotherin",
        "Correct element(s) on the stack"
    );

});

test('debug.upvalueid', function (t) {
    let luaCode = `
        local upvalue = "upvalue"

        local l = function()
            return upvalue
        end

        return debug.upvalueid(l, 1)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.ok(
        lapi.lua_touserdata(L, -1),
        "Correct element(s) on the stack"
    );

});
