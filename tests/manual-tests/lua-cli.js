#!/usr/bin/env node
"use strict";

const lua          = require('../../src/lua.js');
const lapi         = require('../../src/lapi.js');
const lauxlib      = require('../../src/lauxlib.js');
const linit        = require('../../src/linit.js');
const fs           = require('fs');
const readlineSync = require('readline-sync');

readlineSync.setDefaultOptions({
    prompt: '> '
});

const stdin = lua.to_luastring("=stdin");

const L = lauxlib.luaL_newstate();

linit.luaL_openlibs(L);

console.log(lua.FENGARI_COPYRIGHT);

for (;;) {
    let input = readlineSync.prompt();

    if (input.length === 0)
        continue;

    let status;
    {
        let buffer = lua.to_luastring("return " + input);
        status = lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin);
    }
    if (status !== lua.thread_status.LUA_OK) {
        lapi.lua_pop(L, 1);
        let buffer = lua.to_luastring(input);
        if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin) === lua.thread_status.LUA_OK) {
            status = lua.thread_status.LUA_OK;
        }
    }
    if (status !== lua.thread_status.LUA_OK) {
        lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
        continue;
    }
    if (lapi.lua_pcall(L, 0, 0, 0) !== lua.thread_status.LUA_OK) {
        lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
        lapi.lua_settop(L, 0);
        continue;
    }
    lapi.lua_settop(L, 0);  /* remove eventual returns */
}
