#!/usr/bin/env node
"use strict";

global.WEB = false;

const lua     = require('../../src/lua.js');
const lauxlib = require('../../src/lauxlib.js');
const lualib  = require('../../src/lualib.js');

let luaCode = `
    a = "debug me"
    debug.debug()
`, L;

L = lauxlib.luaL_newstate();

lualib.luaL_openlibs(L);

lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

lua.lua_call(L, 0, 0);
