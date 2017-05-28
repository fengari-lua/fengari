"use strict";

const test     = require('tape');

global.WEB = false;

const lua     = require('../../../src/lua.js');
const lauxlib = require('../../../src/lauxlib.js');
const lualib  = require('../../../src/lualib.js');

const ltests  = require('../ltests.js');


test("[test-suite] api: testing reuse in constant table", function (t) {
    let luaCode = `
        local function checkKlist (func, list)
          local k = T.listk(func)
          assert(#k == #list)
          for i = 1, #k do
            assert(k[i] == list[i] and math.type(k[i]) == math.type(list[i]))
          end
        end

        local function foo ()
          local a
          a = 3;
          a = 0; a = 0.0; a = -7 + 7
          a = 3.78/4; a = 3.78/4
          a = -3.78/4; a = 3.78/4; a = -3.78/4
          a = -3.79/4; a = 0.0; a = -0;
          a = 3; a = 3.0; a = 3; a = 3.0
        end

        checkKlist(foo, {3, 0, 0.0, 3.78/4, -3.78/4, -3.79/4, 3.0})
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        ltests.luaopen_tests(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");
});
