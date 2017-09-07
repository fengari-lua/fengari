"use strict";

const test       = require('tape');

global.WEB = false;

const lua        = require('../src/lua.js');
const lauxlib    = require("../src/lauxlib.js");

test('luaL_ref, lua_rawgeti, luaL_unref, LUA_REGISTRYINDEX', function (t) {
    let L;

    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();
        lua.lua_pushstring(L, lua.to_luastring("hello references!"));

        let r = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX); // pops a value, stores it and returns a reference
        lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, r); // pushes a value associated with the reference
        lauxlib.luaL_unref(L, lua.LUA_REGISTRYINDEX, r); // releases the reference

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello references!",
        "top is correct"
    );
});
