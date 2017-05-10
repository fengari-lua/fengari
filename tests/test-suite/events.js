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

        setmetatable(t, nil)
        function f (t, ...) return t, {...} end
        t.__call = f

        do
          local x,y = a(table.unpack{'a', 1})
          assert(x==a and y[1]=='a' and y[2]==1 and y[3]==nil)
          x,y = a()
          assert(x==a and y[1]==nil)
        end


        local b = setmetatable({}, t)
        setmetatable(b,t)

        function f(op)
          return function (...) cap = {[0] = op, ...} ; return (...) end
        end
        t.__add = f("add")
        t.__sub = f("sub")
        t.__mul = f("mul")
        t.__div = f("div")
        t.__idiv = f("idiv")
        t.__mod = f("mod")
        t.__unm = f("unm")
        t.__pow = f("pow")
        t.__len = f("len")
        t.__band = f("band")
        t.__bor = f("bor")
        t.__bxor = f("bxor")
        t.__shl = f("shl")
        t.__shr = f("shr")
        t.__bnot = f("bnot")

        assert(b+5 == b)
        assert(cap[0] == "add" and cap[1] == b and cap[2] == 5 and cap[3]==nil)
        assert(b+'5' == b)
        assert(cap[0] == "add" and cap[1] == b and cap[2] == '5' and cap[3]==nil)
        assert(5+b == 5)
        assert(cap[0] == "add" and cap[1] == 5 and cap[2] == b and cap[3]==nil)
        assert('5'+b == '5')
        assert(cap[0] == "add" and cap[1] == '5' and cap[2] == b and cap[3]==nil)
        b=b-3; assert(getmetatable(b) == t)
        assert(5-a == 5)
        assert(cap[0] == "sub" and cap[1] == 5 and cap[2] == a and cap[3]==nil)
        assert('5'-a == '5')
        assert(cap[0] == "sub" and cap[1] == '5' and cap[2] == a and cap[3]==nil)
        assert(a*a == a)
        assert(cap[0] == "mul" and cap[1] == a and cap[2] == a and cap[3]==nil)
        assert(a/0 == a)
        assert(cap[0] == "div" and cap[1] == a and cap[2] == 0 and cap[3]==nil)
        assert(a%2 == a)
        assert(cap[0] == "mod" and cap[1] == a and cap[2] == 2 and cap[3]==nil)
        assert(a // (1/0) == a)
        assert(cap[0] == "idiv" and cap[1] == a and cap[2] == 1/0 and cap[3]==nil)
        assert(a & "hi" == a)
        assert(cap[0] == "band" and cap[1] == a and cap[2] == "hi" and cap[3]==nil)
        assert(a | "hi" == a)
        assert(cap[0] == "bor" and cap[1] == a and cap[2] == "hi" and cap[3]==nil)
        assert("hi" ~ a == "hi")
        assert(cap[0] == "bxor" and cap[1] == "hi" and cap[2] == a and cap[3]==nil)
        assert(-a == a)
        assert(cap[0] == "unm" and cap[1] == a)
        assert(a^4 == a)
        assert(cap[0] == "pow" and cap[1] == a and cap[2] == 4 and cap[3]==nil)
        assert(a^'4' == a)
        assert(cap[0] == "pow" and cap[1] == a and cap[2] == '4' and cap[3]==nil)
        assert(4^a == 4)
        assert(cap[0] == "pow" and cap[1] == 4 and cap[2] == a and cap[3]==nil)
        assert('4'^a == '4')
        assert(cap[0] == "pow" and cap[1] == '4' and cap[2] == a and cap[3]==nil)
        assert(#a == a)
        assert(cap[0] == "len" and cap[1] == a)
        assert(~a == a)
        assert(cap[0] == "bnot" and cap[1] == a)
        assert(a << 3 == a)
        assert(cap[0] == "shl" and cap[1] == a and cap[2] == 3)
        assert(1.5 >> a == 1.5)
        assert(cap[0] == "shr" and cap[1] == 1.5 and cap[2] == a)
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


test("[test-suite] events: test for rawlen", function (t) {
    let luaCode = `
        t = setmetatable({1,2,3}, {__len = function () return 10 end})
        assert(#t == 10 and rawlen(t) == 3)
        assert(rawlen"abc" == 3)
        assert(not pcall(rawlen, io.stdin))
        assert(not pcall(rawlen, 34))
        assert(not pcall(rawlen))

        -- rawlen for long strings
        assert(rawlen(string.rep('a', 1000)) == 1000)
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


test("[test-suite] events: test comparison", function (t) {
    let luaCode = `
        t = {}
        t.__lt = function (a,b,c)
          collectgarbage()
          assert(c == nil)
          if type(a) == 'table' then a = a.x end
          if type(b) == 'table' then b = b.x end
         return a<b, "dummy"
        end

        function Op(x) return setmetatable({x=x}, t) end

        local function test ()
          assert(not(Op(1)<Op(1)) and (Op(1)<Op(2)) and not(Op(2)<Op(1)))
          assert(not(1 < Op(1)) and (Op(1) < 2) and not(2 < Op(1)))
          assert(not(Op('a')<Op('a')) and (Op('a')<Op('b')) and not(Op('b')<Op('a')))
          assert(not('a' < Op('a')) and (Op('a') < 'b') and not(Op('b') < Op('a')))
          assert((Op(1)<=Op(1)) and (Op(1)<=Op(2)) and not(Op(2)<=Op(1)))
          assert((Op('a')<=Op('a')) and (Op('a')<=Op('b')) and not(Op('b')<=Op('a')))
          assert(not(Op(1)>Op(1)) and not(Op(1)>Op(2)) and (Op(2)>Op(1)))
          assert(not(Op('a')>Op('a')) and not(Op('a')>Op('b')) and (Op('b')>Op('a')))
          assert((Op(1)>=Op(1)) and not(Op(1)>=Op(2)) and (Op(2)>=Op(1)))
          assert((1 >= Op(1)) and not(1 >= Op(2)) and (Op(2) >= 1))
          assert((Op('a')>=Op('a')) and not(Op('a')>=Op('b')) and (Op('b')>=Op('a')))
          assert(('a' >= Op('a')) and not(Op('a') >= 'b') and (Op('b') >= Op('a')))
        end

        test()

        t.__le = function (a,b,c)
          assert(c == nil)
          if type(a) == 'table' then a = a.x end
          if type(b) == 'table' then b = b.x end
         return a<=b, "dummy"
        end

        test()  -- retest comparisons, now using both 'lt' and 'le'
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
