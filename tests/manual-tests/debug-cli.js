"use strict";

const lauxlib  = require("../../src/lauxlib.js");
const lua      = require('../../src/lua.js');
const linit    = require('../../src/linit.js');

let luaCode = `
    a = "debug me"
    debug.debug()
`, L;

L = lauxlib.luaL_newstate();

linit.luaL_openlibs(L);

lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

lua.lua_call(L, 0, -1);
