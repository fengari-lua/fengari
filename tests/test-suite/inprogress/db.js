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


test("[test-suite] db: test file ad string names truncation", function (t) {
    let luaCode = `
        a = "function f () end"
        local function dostring (s, x) return load(s, x)() end
        dostring(a)
        assert(debug.getinfo(f).short_src == string.format('[string "%s"]', a))
        dostring(a..string.format("; %s\\n=1", string.rep('p', 400)))
        assert(string.find(debug.getinfo(f).short_src, '^%[string [^\\n]*%.%.%."%]$'))
        dostring(a..string.format("; %s=1", string.rep('p', 400)))
        assert(string.find(debug.getinfo(f).short_src, '^%[string [^\\n]*%.%.%."%]$'))
        dostring("\\n"..a)
        assert(debug.getinfo(f).short_src == '[string "..."]')
        dostring(a, "")
        assert(debug.getinfo(f).short_src == '[string ""]')
        dostring(a, "@xuxu")
        assert(debug.getinfo(f).short_src == "xuxu")
        dostring(a, "@"..string.rep('p', 1000)..'t')
        assert(string.find(debug.getinfo(f).short_src, "^%.%.%.p*t$"))
        dostring(a, "=xuxu")
        assert(debug.getinfo(f).short_src == "xuxu")
        dostring(a, string.format("=%s", string.rep('x', 500)))
        assert(string.find(debug.getinfo(f).short_src, "^x*$"))
        dostring(a, "=")
        assert(debug.getinfo(f).short_src == "")
        a = nil; f = nil;
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(prefix + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});

test("[test-suite] db: local", function (t) {
    let luaCode = `
        repeat
          local g = {x = function ()
            local a = debug.getinfo(2)
            assert(a.name == 'f' and a.namewhat == 'local')
            a = debug.getinfo(1)
            assert(a.name == 'x' and a.namewhat == 'field')
            return 'xixi'
          end}
          local f = function () return 1+1 and (not 1 or g.x()) end
          assert(f() == 'xixi')
          g = debug.getinfo(f)
          assert(g.what == "Lua" and g.func == f and g.namewhat == "" and not g.name)

          function f (x, name)   -- local!
            name = name or 'f'
            local a = debug.getinfo(1)
            assert(a.name == name and a.namewhat == 'local')
            return x
          end

          -- breaks in different conditions
          if 3>4 then break end; f()
          if 3<4 then a=1 else break end; f()
          while 1 do local x=10; break end; f()
          local b = 1
          if 3>4 then return math.sin(1) end; f()
          a = 3<4; f()
          a = 3<4 or 1; f()
          repeat local x=20; if 4>3 then f() else break end; f() until 1
          g = {}
          f(g).x = f(2) and f(10)+f(9)
          assert(g.x == f(19))
          function g(x) if not x then return 3 end return (x('a', 'x')) end
          assert(g(f) == 'a')
        until 1
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(prefix + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test("[test-suite] db: line hook", function (t) {
    let luaCode = `
        test([[if
        math.sin(1)
        then
          a=1
        else
          a=2
        end
        ]], {2,3,4,7})

        test([[--
        if nil then
          a=1
        else
          a=2
        end
        ]], {2,5,6})

        test([[a=1
        repeat
          a=a+1
        until a==3
        ]], {1,3,4,3,4})

        test([[ do
          return
        end
        ]], {2})

        test([[local a
        a=1
        while a<=3 do
          a=a+1
        end
        ]], {1,2,3,4,3,4,3,4,3,5})

        test([[while math.sin(1) do
          if math.sin(1)
          then break
          end
        end
        a=1]], {1,2,3,6})

        test([[for i=1,3 do
          a=i
        end
        ]], {1,2,1,2,1,2,1,3})

        test([[for i,v in pairs{'a','b'} do
          a=tostring(i) .. v
        end
        ]], {1,2,1,2,1,3})

        test([[for i=1,4 do a=1 end]], {1,1,1,1,1})
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(prefix + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test("[test-suite] db: invalid levels in [gs]etlocal", function (t) {
    let luaCode = `
        assert(not pcall(debug.getlocal, 20, 1))
        assert(not pcall(debug.setlocal, -1, 1, 10))
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(prefix + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test("[test-suite] db: parameter names", function (t) {
    let luaCode = `
        local function foo (a,b,...) local d, e end
        local co = coroutine.create(foo)

        assert(debug.getlocal(foo, 1) == 'a')
        assert(debug.getlocal(foo, 2) == 'b')
        assert(not debug.getlocal(foo, 3))
        assert(debug.getlocal(co, foo, 1) == 'a')
        assert(debug.getlocal(co, foo, 2) == 'b')
        assert(not debug.getlocal(co, foo, 3))

        assert(not debug.getlocal(print, 1))
    `, L;

    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(prefix + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});
