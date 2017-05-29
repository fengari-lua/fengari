"use strict";

const test     = require('tape');

global.WEB = false;

const lua     = require('../../../src/lua.js');
const lauxlib = require('../../../src/lauxlib.js');
const lualib  = require('../../../src/lualib.js');


const prefix = `
    local function dostring(s) return assert(load(s))() end

    local testline = 4          -- line where 'test' is defined
    function test (s, l, p)     -- this must be line 4
      -- collectgarbage()   -- avoid gc during trace
      local function f (event, line)
        assert(event == 'line')
        local l = table.remove(l, 1)
        if p then print(l, line) end
        assert(l == line, "wrong trace!!")
      end
      debug.sethook(f,"l"); load(s)(); debug.sethook()
      assert(#l == 0)
    end
`;

test("[test-suite] db: getinfo, ...line...", function (t) {
    let luaCode = `-- $Id: db.lua,v 1.79 2016/11/07 13:02:34 roberto Exp $
        -- See Copyright Notice in file all.lua

        -- testing debug library

        local debug = require "debug"

        local function dostring(s) return assert(load(s))() end

        print"testing debug library and debug information"

        do
        local a=1
        end

        assert(not debug.gethook())

        local testline = 19         -- line where 'test' is defined
        function test (s, l, p)     -- this must be line 19
          collectgarbage()   -- avoid gc during trace
          local function f (event, line)
            assert(event == 'line')
            local l = table.remove(l, 1)
            if p then print(l, line) end
            assert(l == line, "wrong trace!!")
          end
          debug.sethook(f,"l"); load(s)(); debug.sethook()
          assert(#l == 0)
        end


        do
          assert(not pcall(debug.getinfo, print, "X"))   -- invalid option
          assert(not debug.getinfo(1000))   -- out of range level
          assert(not debug.getinfo(-1))     -- out of range level
          local a = debug.getinfo(print)
          assert(a.what == "J" and a.short_src == "[JS]")
          a = debug.getinfo(print, "L")
          assert(a.activelines == nil)
          local b = debug.getinfo(test, "SfL")
          assert(b.name == nil and b.what == "Lua" and b.linedefined == testline and
                 b.lastlinedefined == b.linedefined + 10 and
                 b.func == test and string.find(b.short_src, "%["))
          assert(b.activelines[b.linedefined + 1] and
                 b.activelines[b.lastlinedefined])
          assert(not b.activelines[b.linedefined] and
                 not b.activelines[b.lastlinedefined + 1])
        end
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});
