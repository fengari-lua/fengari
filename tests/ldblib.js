"use strict";

const test     = require('tape');

const lapi     = require("../src/lapi.js");
const lauxlib  = require("../src/lauxlib.js");
const lua      = require('../src/lua.js');
const linit    = require('../src/linit.js');

test('debug.sethook', function (t) {
    let luaCode = `
        local result = ""

        debug.sethook(function (event)
            result = result .. event .. " "
        end, "crl", 1)

        local l = function() end

        l()
        l()
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
        "return count line count line count line count return count line count line count return count line count line count return count line return ",
        "Correct element(s) on the stack"
    );

});


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

test('debug.setlocal', function (t) {
    let luaCode = `
        local alocal = "alocal"
        local another = "another"

        local l = function()
            local infunction = "infunction"
            local anotherin = "anotherin"

            debug.setlocal(2, 1, 1)
            debug.setlocal(2, 2, 2)
            debug.setlocal(1, 1, 3)
            debug.setlocal(1, 2, 4)

            return infunction, anotherin
        end

        local a, b = l()

        return alocal, another, a, b
    `, L;
    
    t.plan(6);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

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
        2,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -2),
        3,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        4,
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


test('debug.upvaluejoin', function (t) {
    let luaCode = `
        local upvalue1 = "upvalue1"
        local upvalue2 = "upvalue2"

        local l1 = function()
            return upvalue1
        end

        local l2 = function()
            return upvalue2
        end

        debug.upvaluejoin(l1, 1, l2, 1)

        return l1()
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
        "upvalue2",
        "Correct element(s) on the stack"
    );

});


test('debug.traceback (with a global)', function (t) {
    let luaCode = `
        local trace

        rec = function(n)
            n = n or 0
            if n < 10 then
                rec(n + 1)
            else
                trace = debug.traceback()
            end
        end

        rec()

        return trace
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        luaCode = lua.to_luastring(luaCode);
        lauxlib.luaL_loadbuffer(L, luaCode, luaCode.length, lua.to_luastring("traceback-test"));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tojsstring(L, -1),
`stack traceback:
\t...[string "traceback-test"]9: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]7: in function 'rec'
\t...[string "traceback-test"]15: in main chunk`,
        "Correct element(s) on the stack"
    );

});


test('debug.traceback (with a upvalue)', function (t) {
    let luaCode = `
        local trace
        local rec

        rec = function(n)
            n = n or 0
            if n < 10 then
                rec(n + 1)
            else
                trace = debug.traceback()
            end
        end

        rec()

        return trace
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        luaCode = lua.to_luastring(luaCode);
        lauxlib.luaL_loadbuffer(L, luaCode, luaCode.length, lua.to_luastring("traceback-test"));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tojsstring(L, -1),
`stack traceback:
\t...[string "traceback-test"]10: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in upvalue 'rec'
\t...[string "traceback-test"]8: in local 'rec'
\t...[string "traceback-test"]16: in main chunk`,
        "Correct element(s) on the stack"
    );

});

test('debug.getinfo', function (t) {
    let luaCode = `
        local alocal = function(p1, p2) end
        global = function() return alocal end

        local d1 = debug.getinfo(alocal)
        local d2 = debug.getinfo(global)

        print(d1.short_src, d1.nups, d1.what, d1.nparams,
              d2.short_src, d2.nups, d2.what, d2.nparams)

        return d1.short_src, d1.nups, d1.what, d1.nparams,
               d2.short_src, d2.nups, d2.what, d2.nparams
    `, L;
    
    t.plan(10);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        luaCode = lua.to_luastring(luaCode);
        lauxlib.luaL_loadbuffer(L, luaCode, luaCode.length, lua.to_luastring("getinfo-test"));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tojsstring(L, -8),
        `[string "getinfo-test"]`,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -7),
        0,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tojsstring(L, -6),
        `Lua`,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -5),
        2,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tojsstring(L, -4),
        `[string "getinfo-test"]`,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -3),
        1,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tojsstring(L, -2),
        `Lua`,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        0,
        "Correct element(s) on the stack"
    );

});
