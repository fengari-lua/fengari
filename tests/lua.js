"use strict";

const test     = require('tape');

const lua     = require('../src/lua.js');
const lauxlib = require('../src/lauxlib.js');
const lualib  = require('../src/lualib.js');
const lapi    = require('../src/lapi.js');


// TODO: remove
test.skip('locals.lua', function (t) {
    let luaCode = `
        _soft = true
        require = function(lib) return _G[lib] end  -- NYI
        return dofile("tests/lua-tests/locals.lua")
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");
});


test.skip('constructs.lua', function (t) {
    let luaCode = `
        _soft = true
        require = function(lib) return _G[lib] end  -- NYI
        return dofile("tests/lua-tests/constructs.lua")
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");
});


test.skip('strings.lua', function (t) {
    let luaCode = `
        return dofile("tests/lua-tests/strings.lua")
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");
});
