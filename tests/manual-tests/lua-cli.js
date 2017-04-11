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

const L = lauxlib.luaL_newstate();

linit.luaL_openlibs(L);

console.log(lua.FENGARI_COPYRIGHT);

for (;;) {
    let input = readlineSync.prompt();

    if (input.length === 0)
        continue;

    let buffer = lua.to_luastring(input);
    if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, lua.to_luastring("=stdin"))
        || lapi.lua_pcall(L, 0, 0, 0)) {
        lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
    }
    lapi.lua_settop(L, 0);  /* remove eventual returns */
}
