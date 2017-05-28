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


const prefix = `
    function check (f, ...)
      local arg = {...}
      local c = T.listcode(f)
      for i=1, #arg do
        print(arg[i], c[i])
        assert(string.find(c[i], '- '..arg[i]..' *%d'))
      end
      assert(c[#arg+2] == nil)
    end


    function checkequal (a, b)
      a = T.listcode(a)
      b = T.listcode(b)
      for i = 1, #a do
        a[i] = string.gsub(a[i], '%b()', '')   -- remove line number
        b[i] = string.gsub(b[i], '%b()', '')   -- remove line number
        assert(a[i] == b[i])
      end
    end
`;

test("[test-suite] api: some basic instructions", function (t) {
    let luaCode = `
        check(function ()
          (function () end){f()}
        end, 'CLOSURE', 'NEWTABLE', 'GETTABUP', 'CALL', 'SETLIST', 'CALL', 'RETURN')
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        ltests.luaopen_tests(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(prefix + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");
});
