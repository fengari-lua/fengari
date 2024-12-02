"use strict";

const lua = require('../src/lua.js');
const lauxlib = require("../src/lauxlib.js");
const {to_jsstring, to_luastring} = require("../src/fengaricore.js");


test('luaL_ref, lua_rawgeti, luaL_unref, LUA_REGISTRYINDEX', () => {
    let L = lauxlib.luaL_newstate();
    if (!L) throw Error("failed to create lua state");

    {
        lua.lua_pushstring(L, to_luastring("hello references!"));

        let r = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX); // pops a value, stores it and returns a reference
        lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, r); // pushes a value associated with the reference
        lauxlib.luaL_unref(L, lua.LUA_REGISTRYINDEX, r); // releases the reference
    }

    expect(lua.lua_tojsstring(L, -1))
        .toBe("hello references!");
});


test('luaL_checkstring', () => {
    let L = lauxlib.luaL_newstate();
    if (!L) throw Error("failed to create lua state");

    {
        lua.lua_pushstring(L, to_luastring("hello!"));
    }

    expect(lauxlib.luaL_checkstring(L, -1))
        .toBeInstanceOf(Uint8Array);
    expect(to_jsstring(lauxlib.luaL_checkstring(L, -1)))
        .toBe("hello!");
});
