"use strict";

const test     = require('tape');

global.WEB = false;

const lauxlib  = require("../../src/lauxlib.js");
const lua      = require('../../src/lua.js');


test("[test-suite] events: testing metatable", function (t) {
    let luaCode = `
        X = 20; B = 30

        _ENV = setmetatable({}, {__index=_G})

        collectgarbage()

        X = X+10
        assert(X == 30 and _G.X == 20)
        B = false
        assert(B == false)
        B = nil
        assert(B == 30)

        assert(getmetatable{} == nil)
        assert(getmetatable(4) == nil)
        assert(getmetatable(nil) == nil)
        a={name = "NAME"}; setmetatable(a, {__metatable = "xuxu",
                            __tostring=function(x) return x.name end})
        assert(getmetatable(a) == "xuxu")
        assert(tostring(a) == "NAME")
        -- cannot change a protected metatable
        assert(pcall(setmetatable, a, {}) == false)
        a.name = "gororoba"
        assert(tostring(a) == "gororoba")

        local a, t = {10,20,30; x="10", y="20"}, {}
        assert(setmetatable(a,t) == a)
        assert(getmetatable(a) == t)
        assert(setmetatable(a,nil) == a)
        assert(getmetatable(a) == nil)
        assert(setmetatable(a,t) == a)


        function f (t, i, e)
          assert(not e)
          local p = rawget(t, "parent")
          return (p and p[i]+3), "dummy return"
        end

        t.__index = f

        a.parent = {z=25, x=12, [4] = 24}
        assert(a[1] == 10 and a.z == 28 and a[4] == 27 and a.x == "10")

        collectgarbage()

        a = setmetatable({}, t)
        function f(t, i, v) rawset(t, i, v-3) end
        setmetatable(t, t)   -- causes a bug in 5.1 !
        t.__newindex = f
        a[1] = 30; a.x = "101"; a[5] = 200
        assert(a[1] == 27 and a.x == 98 and a[5] == 197)

        do    -- bug in Lua 5.3.2
          local mt = {}
          mt.__newindex = mt
          local t = setmetatable({}, mt)
          t[1] = 10     -- will segfault on some machines
          assert(mt[1] == 10)
        end

        local c = {}
        a = setmetatable({}, t)
        t.__newindex = c
        a[1] = 10; a[2] = 20; a[3] = 90
        assert(c[1] == 10 and c[2] == 20 and c[3] == 90)

        do
          local a;
          a = setmetatable({}, {__index = setmetatable({},
                             {__index = setmetatable({},
                             {__index = function (_,n) return a[n-3]+4, "lixo" end})})})
          a[0] = 20
          for i=0,10 do
            assert(a[i*3] == 20 + i*4)
          end
        end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test("[test-suite] events: new index", function (t) {
    let luaCode = `
        do  -- newindex
          local foi
          local a = {}
          for i=1,10 do a[i] = 0; a['a'..i] = 0; end
          setmetatable(a, {__newindex = function (t,k,v) foi=true; rawset(t,k,v) end})
          foi = false; a[1]=0; assert(not foi)
          foi = false; a['a1']=0; assert(not foi)
          foi = false; a['a11']=0; assert(foi)
          foi = false; a[11]=0; assert(foi)
          foi = false; a[1]=nil; assert(not foi)
          foi = false; a[1]=nil; assert(foi)
        end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});
