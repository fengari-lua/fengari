"use strict";

const test       = require('tape');

const lua     = require('../src/lua.js');
const lauxlib = require('../src/lauxlib.js');
const lualib  = require('../src/lualib.js');


const inttable2array = function(t) {
    let a = [];

    t.strong.forEach(function (v, k) {
        if (v.key.ttisnumber())
            a[k - 1] = v.value;
    });

    return a.map(e => e.value);
};

test('table.concat', function (t) {
    let luaCode = `
        return table.concat({1, 2, 3, 4, 5, 6, 7}, ",", 3, 5)
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
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

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        [...lua.lua_topointer(L, -1).strong.entries()]
            .filter(e => e[1].key.ttisnumber()) // Filter out the 'n' field
            .map(e => e[1].value.value).reverse(),
        [1, 2, 3],
        "Correct element(s) on the stack"
    );
});


test('table.unpack', function (t) {
    let luaCode = `
        return table.unpack({1, 2, 3, 4, 5}, 2, 4)
    `, L;

    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tointeger(L, -3),
        2,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tointeger(L, -2),
        3,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tointeger(L, -1),
        4,
        "Correct element(s) on the stack"
    );
});


test('table.insert', function (t) {
    let luaCode = `
        local t = {1, 3, 4}
        table.insert(t, 5)
        table.insert(t, 2, 2)
        return t
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        [...lua.lua_topointer(L, -1).strong.entries()]
            .filter(e => e[1].key.ttisnumber())
            .map(e => e[1].value.value).sort(),
        [1, 2, 3, 4, 5],
        "Correct element(s) on the stack"
    );
});


test('table.remove', function (t) {
    let luaCode = `
        local t = {1, 2, 3, 3, 4, 4}
        table.remove(t)
        table.remove(t, 3)
        return t
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        [...lua.lua_topointer(L, -1).strong.entries()]
            .filter(e => e[1].key.ttisnumber())
            .map(e => e[1].value.value).sort(),
        [1, 2, 3, 4],
        "Correct element(s) on the stack"
    );
});


test('table.move', function (t) {
    let luaCode = `
        local t1 = {3, 4, 5}
        local t2 = {1, 2, nil, nil, nil, 6}
        return table.move(t1, 1, #t1, 3, t2)
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        [...lua.lua_topointer(L, -1).strong.entries()]
            .filter(e => e[1].key.ttisnumber())
            .map(e => e[1].value.value).sort(),
        [1, 2, 3, 4, 5, 6],
        "Correct element(s) on the stack"
    );
});


test('table.sort (<)', function (t) {
    let luaCode = `
        local t = {3, 1, 5, ['just'] = 'tofuckitup', 2, 4}
        table.sort(t)
        return t
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        inttable2array(lua.lua_topointer(L, -1)),
        [1, 2, 3, 4, 5],
        "Correct element(s) on the stack"
    );
});


test('table.sort with cmp function', function (t) {
    let luaCode = `
        local t = {3, 1, 5, ['just'] = 'tofuckitup', 2, 4}
        table.sort(t, function (a, b)
            return a > b
        end)
        return t
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        inttable2array(lua.lua_topointer(L, -1)),
        [5, 4, 3, 2, 1],
        "Correct element(s) on the stack"
    );
});
