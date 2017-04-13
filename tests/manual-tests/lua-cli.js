#!/usr/bin/env node
"use strict";

const lua          = require('../../src/lua.js');
const lapi         = require('../../src/lapi.js');
const lauxlib      = require('../../src/lauxlib.js');
const linit        = require('../../src/linit.js');
const fs           = require('fs');
const readlineSync = require('readline-sync');

const stdin = lua.to_luastring("=stdin");
const _PROMPT = lua.to_luastring("_PROMPT");
const _PROMPT2 = lua.to_luastring("_PROMPT2");

const L = lauxlib.luaL_newstate();

linit.luaL_openlibs(L);

console.log(lua.FENGARI_COPYRIGHT);

for (;;) {
    lapi.lua_getglobal(L, _PROMPT);
    let input = readlineSync.prompt({
        prompt: lapi.lua_tojsstring(L, -1) || '> '
    });
    lapi.lua_pop(L, 1);

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
    while (status === lua.thread_status.LUA_ERRSYNTAX && lapi.lua_tojsstring(L, -1).endsWith("<eof>")) {
        /* continuation */
        lapi.lua_pop(L, 1);
        lapi.lua_getglobal(L, _PROMPT2);
        input += "\n" + readlineSync.prompt({
            prompt: lapi.lua_tojsstring(L, -1) || '>> '
        });
        lapi.lua_pop(L, 1);
        let buffer = lua.to_luastring(input);
        status = lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin);
    }
    if (status !== lua.thread_status.LUA_OK) {
        lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
        lapi.lua_settop(L, 0);
        continue;
    }
    if (lapi.lua_pcall(L, 0, lua.LUA_MULTRET, 0) !== lua.thread_status.LUA_OK) {
        lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
        lapi.lua_settop(L, 0);
        continue;
    }
    let n = lapi.lua_gettop(L);
    if (n > 0) {  /* any result to be printed? */
        lapi.lua_getglobal(L, lua.to_luastring("print"));
        lapi.lua_insert(L, 1);
        if (lapi.lua_pcall(L, n, 0, 0) != lua.thread_status.LUA_OK) {
            lauxlib.lua_writestringerror(`error calling 'print' (${lapi.lua_tojsstring(L, -1)})\n`);
            lapi.lua_settop(L, 0);
            continue;
        }
    }
    lapi.lua_settop(L, 0);  /* remove eventual returns */
}
