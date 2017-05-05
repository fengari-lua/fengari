"use strict";

const test     = require('tape');

const lauxlib  = require("../../src/lauxlib.js");
const lua      = require('../../src/lua.js');


test("[test-suite] calls: test 'type'", function (t) {
    let luaCode = `
        assert(type(1<2) == 'boolean')
        assert(type(true) == 'boolean' and type(false) == 'boolean')
        assert(type(nil) == 'nil'
           and type(-3) == 'number'
           and type'x' == 'string'
           and type{} == 'table'
           and type(type) == 'function')

        assert(type(assert) == type(print))
        function f (x) return a:x (x) end
        assert(type(f) == 'function')
        assert(not pcall(type))
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


test("[test-suite] calls: test error in 'print'", function (t) {
    let luaCode = `
        do    -- test error in 'print' too...
          local tostring = _ENV.tostring

          _ENV.tostring = nil
          local st, msg = pcall(print, 1)
          assert(st == false and string.find(msg, "attempt to call a nil value"))

          _ENV.tostring = function () return {} end
          local st, msg = pcall(print, 1)
          assert(st == false and string.find(msg, "must return a string"))
          
          _ENV.tostring = tostring
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


test("[test-suite] calls: testing local-function recursion", function (t) {
    let luaCode = `
        fact = false
        do
          local res = 1
          local function fact (n)
            if n==0 then return res
            else return n*fact(n-1)
            end
          end
          assert(fact(5) == 120)
        end
        assert(fact == false)
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


test("[test-suite] calls: testing declarations", function (t) {
    let luaCode = `
        a = {i = 10}
        self = 20
        function a:x (x) return x+self.i end
        function a.y (x) return x+self end

        assert(a:x(1)+10 == a.y(1))

        a.t = {i=-100}
        a["t"].x = function (self, a,b) return self.i+a+b end

        assert(a.t:x(2,3) == -95)

        do
          local a = {x=0}
          function a:add (x) self.x, a.y = self.x+x, 20; return self end
          assert(a:add(10):add(20):add(30).x == 60 and a.y == 20)
        end

        local a = {b={c={}}}

        function a.b.c.f1 (x) return x+1 end
        function a.b.c:f2 (x,y) self[x] = y end
        assert(a.b.c.f1(4) == 5)
        a.b.c:f2('k', 12); assert(a.b.c.k == 12)


        t = nil   -- 'declare' t
        function f(a,b,c) local d = 'a'; t={a,b,c,d} end

        f(      -- this line change must be valid
          1,2)
        assert(t[1] == 1 and t[2] == 2 and t[3] == nil and t[4] == 'a')
        f(1,2,   -- this one too
              3,4)
        assert(t[1] == 1 and t[2] == 2 and t[3] == 3 and t[4] == 'a')

        function fat(x)
          if x <= 1 then return 1
          else return x*load("return fat(" .. x-1 .. ")", "")()
          end
        end

        assert(load "load 'assert(fat(6)==720)' () ")()
        a = load('return fat(5), 3')
        a,b = a()
        assert(a == 120 and b == 3)

        function err_on_n (n)
          if n==0 then error(); exit(1);
          else err_on_n (n-1); exit(1);
          end
        end

        do
          function dummy (n)
            if n > 0 then
              assert(not pcall(err_on_n, n))
              dummy(n-1)
            end
          end
        end

        dummy(10)

        function deep (n)
          if n>0 then deep(n-1) end
        end
        deep(10)
        deep(200)

        -- testing tail call
        function deep (n) if n>0 then return deep(n-1) else return 101 end end
        assert(deep(30000) == 101)
        a = {}
        function a:deep (n) if n>0 then return self:deep(n-1) else return 101 end end
        assert(a:deep(30000) == 101)



        a = nil
        (function (x) a=x end)(23)
        assert(a == 23 and (function (x) return x*2 end)(20) == 40)
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


test("[test-suite] calls: testing closures", function (t) {
    let luaCode = `
        -- fixed-point operator
        Z = function (le)
              local function a (f)
                return le(function (x) return f(f)(x) end)
              end
              return a(a)
            end


        -- non-recursive factorial

        F = function (f)
              return function (n)
                       if n == 0 then return 1
                       else return n*f(n-1) end
                     end
            end

        fat = Z(F)

        assert(fat(0) == 1 and fat(4) == 24 and Z(F)(5)==5*Z(F)(4))

        local function g (z)
          local function f (a,b,c,d)
            return function (x,y) return a+b+c+d+a+x+y+z end
          end
          return f(z,z+1,z+2,z+3)
        end

        f = g(10)
        assert(f(9, 16) == 10+11+12+13+10+9+16+10)

        Z, F, f = nil
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


test("[test-suite] calls: testing multiple returns", function (t) {
    let luaCode = `
        function unlpack (t, i)
          i = i or 1
          if (i <= #t) then
            return t[i], unlpack(t, i+1)
          end
        end

        function equaltab (t1, t2)
          assert(#t1 == #t2)
          for i = 1, #t1 do
            assert(t1[i] == t2[i])
          end
        end

        local pack = function (...) return (table.pack(...)) end

        function f() return 1,2,30,4 end
        function ret2 (a,b) return a,b end

        local a,b,c,d = unlpack{1,2,3}
        assert(a==1 and b==2 and c==3 and d==nil)
        a = {1,2,3,4,false,10,'alo',false,assert}
        equaltab(pack(unlpack(a)), a)
        equaltab(pack(unlpack(a), -1), {1,-1})
        a,b,c,d = ret2(f()), ret2(f())
        assert(a==1 and b==1 and c==2 and d==nil)
        a,b,c,d = unlpack(pack(ret2(f()), ret2(f())))
        assert(a==1 and b==1 and c==2 and d==nil)
        a,b,c,d = unlpack(pack(ret2(f()), (ret2(f()))))
        assert(a==1 and b==1 and c==nil and d==nil)

        a = ret2{ unlpack{1,2,3}, unlpack{3,2,1}, unlpack{"a", "b"}}
        assert(a[1] == 1 and a[2] == 3 and a[3] == "a" and a[4] == "b")
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


test("[test-suite] calls: testing calls with 'incorrect' arguments", function (t) {
    let luaCode = `
        rawget({}, "x", 1)
        rawset({}, "x", 1, 2)
        assert(math.sin(1,2) == math.sin(1))
        table.sort({10,9,8,4,19,23,0,0}, function (a,b) return a<b end, "extra arg")
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


test("[test-suite] calls: test for generic load", function (t) {
    let luaCode = `
        local x = "-- a comment\\0\\0\\0\\n  x = 10 + \\n23; \\
             local a = function () x = 'hi' end; \\
             return '\\0'"

        function read1 (x)
          local i = 0
          return function ()
            --print(x)
            i=i+1
            return string.sub(x, i, i)
          end
        end

        function cannotload (msg, a,b)
          assert(not a and string.find(b, msg))
        end

        a = assert(load(read1(x), "modname", "t", _G))
        assert(a() == "\0" and _G.x == 33)
        assert(debug.getinfo(a).source == "modname")
        -- cannot read text in binary mode
        cannotload("attempt to load a text chunk", load(read1(x), "modname", "b", {}))
        cannotload("attempt to load a text chunk", load(x, "modname", "b"))

        a = assert(load(function () return nil end))
        a()  -- empty chunk

        assert(not load(function () return true end))
    `, L;
    
    t.plan(1);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    // t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    // }, "Lua program ran without error");

});
