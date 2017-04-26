"use strict";

const test     = require('tape');

const lapi     = require("../../src/lapi.js");
const lauxlib  = require("../../src/lauxlib.js");
const lua      = require('../../src/lua.js');
const linit    = require('../../src/linit.js');


const checkerror = `
    local maxi, mini = math.maxinteger, math.mininteger

    local function checkerror (msg, f, ...)
      local s, err = pcall(f, ...)
      assert(not s and string.find(err, msg))
    end
`;

test('testing string comparisons', function (t) {
    let luaCode = `
        assert('alo' < 'alo1')
        assert('' < 'a')
        assert('alo\\0alo' < 'alo\\0b')
        assert('alo\\0alo\\0\\0' > 'alo\\0alo\\0')
        assert('alo' < 'alo\\0')
        assert('alo\\0' > 'alo')
        assert('\\0' < '\\1')
        assert('\\0\\0' < '\\0\\1')
        assert('\\1\\0a\\0a' <= '\\1\\0a\\0a')
        assert(not ('\\1\\0a\\0b' <= '\\1\\0a\\0a'))
        assert('\\0\\0\\0' < '\\0\\0\\0\\0')
        assert(not('\\0\\0\\0\\0' < '\\0\\0\\0'))
        assert('\\0\\0\\0' <= '\\0\\0\\0\\0')
        assert(not('\\0\\0\\0\\0' <= '\\0\\0\\0'))
        assert('\\0\\0\\0' <= '\\0\\0\\0')
        assert('\\0\\0\\0' >= '\\0\\0\\0')
        assert(not ('\\0\\0b' < '\\0\\0a\\0'))
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing string.sub', function (t) {
    let luaCode = `
        assert('alo' < 'alo1')
        assert('' < 'a')
        assert('alo\\0alo' < 'alo\\0b')
        assert('alo\\0alo\\0\\0' > 'alo\\0alo\\0')
        assert('alo' < 'alo\\0')
        assert('alo\\0' > 'alo')
        assert('\\0' < '\\1')
        assert('\\0\\0' < '\\0\\1')
        assert('\\1\\0a\\0a' <= '\\1\\0a\\0a')
        assert(not ('\\1\\0a\\0b' <= '\\1\\0a\\0a'))
        assert('\\0\\0\\0' < '\\0\\0\\0\\0')
        assert(not('\\0\\0\\0\\0' < '\\0\\0\\0'))
        assert('\\0\\0\\0' <= '\\0\\0\\0\\0')
        assert(not('\\0\\0\\0\\0' <= '\\0\\0\\0'))
        assert('\\0\\0\\0' <= '\\0\\0\\0')
        assert('\\0\\0\\0' >= '\\0\\0\\0')
        assert(not ('\\0\\0b' < '\\0\\0a\\0'))
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing string.find', function (t) {
    let luaCode = `
        assert(string.find("123456789", "345") == 3)
        a,b = string.find("123456789", "345")
        assert(string.sub("123456789", a, b) == "345")
        assert(string.find("1234567890123456789", "345", 3) == 3)
        assert(string.find("1234567890123456789", "345", 4) == 13)
        assert(string.find("1234567890123456789", "346", 4) == nil)
        assert(string.find("1234567890123456789", ".45", -9) == 13)
        assert(string.find("abcdefg", "\\0", 5, 1) == nil)
        assert(string.find("", "") == 1)
        assert(string.find("", "", 1) == 1)
        assert(not string.find("", "", 2))
        assert(string.find('', 'aaa', 1) == nil)
        assert(('alo(.)alo'):find('(.)', 1, 1) == 4)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing string.len and #', function (t) {
    let luaCode = `
        assert(string.len("") == 0)
        assert(string.len("\\0\\0\\0") == 3)
        assert(string.len("1234567890") == 10)

        assert(#"" == 0)
        assert(#"\\0\\0\\0" == 3)
        assert(#"1234567890" == 10)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing string.byte/string.char', function (t) {
    let luaCode = `
        assert(string.byte("a") == 97)
        assert(string.byte("\\xe4") > 127)
        assert(string.byte(string.char(255)) == 255)
        assert(string.byte(string.char(0)) == 0)
        assert(string.byte("\\0") == 0)
        assert(string.byte("\\0\\0alo\\0x", -1) == string.byte('x'))
        assert(string.byte("ba", 2) == 97)
        assert(string.byte("\\n\\n", 2, -1) == 10)
        assert(string.byte("\\n\\n", 2, 2) == 10)
        assert(string.byte("") == nil)
        assert(string.byte("hi", -3) == nil)
        assert(string.byte("hi", 3) == nil)
        assert(string.byte("hi", 9, 10) == nil)
        assert(string.byte("hi", 2, 1) == nil)
        assert(string.char() == "")
        assert(string.char(0, 255, 0) == "\\0\\255\\0")
        assert(string.char(0, string.byte("\\xe4"), 0) == "\\0\\xe4\\0")
        assert(string.char(string.byte("\\xe4l\\0óu", 1, -1)) == "\\xe4l\\0óu")
        assert(string.char(string.byte("\\xe4l\\0óu", 1, 0)) == "")
        assert(string.char(string.byte("\\xe4l\\0óu", -10, 100)) == "\\xe4l\\0óu")

        assert(string.upper("ab\\0c") == "AB\\0C")
        assert(string.lower("\\0ABCc%$") == "\\0abcc%$")
        assert(string.rep('teste', 0) == '')
        assert(string.rep('tés\\00tê', 2) == 'tés\\0têtés\\000tê')
        assert(string.rep('', 10) == '')

        if string.packsize("i") == 4 then
          -- result length would be 2^31 (int overflow)
          checkerror("too large", string.rep, 'aa', (1 << 30))
          checkerror("too large", string.rep, 'a', (1 << 30), ',')
        end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing repetitions with separator', function (t) {
    let luaCode = `
        assert(string.rep('teste', 0, 'xuxu') == '')
        assert(string.rep('teste', 1, 'xuxu') == 'teste')
        assert(string.rep('\\1\\0\\1', 2, '\\0\\0') == '\\1\\0\\1\\0\\0\\1\\0\\1')
        assert(string.rep('', 10, '.') == string.rep('.', 9))
        assert(not pcall(string.rep, "aa", maxi // 2 + 10))
        assert(not pcall(string.rep, "", maxi // 2 + 10, "aa"))

        assert(string.reverse"" == "")
        assert(string.reverse"\\0\\1\\2\\3" == "\\3\\2\\1\\0")
        assert(string.reverse"\\0001234" == "4321\\0")

        for i=0,30 do assert(string.len(string.rep('a', i)) == i) end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing tostring', function (t) {
    let luaCode = `
        assert(type(tostring(nil)) == 'string')
        assert(type(tostring(12)) == 'string')
        assert(string.find(tostring{}, 'table:'))
        assert(string.find(tostring(print), 'function:'))
        assert(#tostring('\\0') == 1)
        assert(tostring(true) == "true")
        assert(tostring(false) == "false")
        assert(tostring(-1203) == "-1203")
        assert(tostring(1203.125) == "1203.125")
        assert(tostring(-0.5) == "-0.5")
        assert(tostring(-32767) == "-32767")
        if math.tointeger(2147483647) then   -- no overflow? (32 bits)
          assert(tostring(-2147483647) == "-2147483647")
        end
        if math.tointeger(4611686018427387904) then   -- no overflow? (64 bits)
          assert(tostring(4611686018427387904) == "4611686018427387904")
          assert(tostring(-4611686018427387904) == "-4611686018427387904")
        end

        if tostring(0.0) == "0.0" then   -- "standard" coercion float->string
          assert('' .. 12 == '12' and 12.0 .. '' == '12.0')
          assert(tostring(-1203 + 0.0) == "-1203.0")
        else   -- compatible coercion
          assert(tostring(0.0) == "0")
          assert('' .. 12 == '12' and 12.0 .. '' == '12')
          assert(tostring(-1203 + 0.0) == "-1203")
        end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing string.format', function (t) {
    let luaCode = `
        x = '"ílo"\\n\\\\'
        assert(string.format('%q%s', x, x) == '"\\\\"ílo\\\\"\\\\\\n\\\\\\\\""ílo"\\n\\\\')
        assert(string.format('%q', "\\0") == [["\\0"]])
        assert(load(string.format('return %q', x))() == x)
        x = "\\0\\1\\0023\\5\\0009"
        assert(load(string.format('return %q', x))() == x)
        assert(string.format("\\0%c\\0%c%x\\0", string.byte("\\xe4"), string.byte("b"), 140) ==
                      "\\0\\xe4\\0b8c\\0")
        assert(string.format('') == "")
        assert(string.format("%c",34)..string.format("%c",48)..string.format("%c",90)..string.format("%c",100) ==
               string.format("%c%c%c%c", 34, 48, 90, 100))
        assert(string.format("%s\\0 is not \\0%s", 'not be', 'be') == 'not be\\0 is not \\0be')
        assert(string.format("%%%d %010d", 10, 23) == "%10 0000000023")
        assert(tonumber(string.format("%f", 10.3)) == 10.3)
        x = string.format('"%-50s"', 'a')
        assert(#x == 52)
        assert(string.sub(x, 1, 4) == '"a  ')

        assert(string.format("-%.20s.20s", string.rep("%", 2000)) ==
                             "-"..string.rep("%", 20)..".20s")
        assert(string.format('"-%20s.20s"', string.rep("%", 2000)) ==
               string.format("%q", "-"..string.rep("%", 2000)..".20s"))
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing %q', function (t) {
    let luaCode = `
        do
          local function checkQ (v)
            local s = string.format("%q", v)
            local nv = load("return " .. s)()
            assert(v == nv and math.type(v) == math.type(nv))
          end
          checkQ("\\0\\0\\1\\255\\u{234}")
          checkQ(math.maxinteger)
          checkQ(math.mininteger)
          checkQ(math.pi)
          checkQ(0.1)
          checkQ(true)
          checkQ(nil)
          checkQ(false)
          checkerror("no literal", string.format, "%q", {})
        end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing embedded zeros error', function (t) {
    let luaCode = `
        assert(string.format("\\0%s\\0", "\\0\\0\\1") == "\\0\\0\\0\\1\\0")
        checkerror("contains zeros", string.format, "%10s", "\\0")
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing format x tostring', function (t) {
    let luaCode = `
        assert(string.format("%s %s", nil, true) == "nil true")
        assert(string.format("%s %.4s", false, true) == "false true")
        assert(string.format("%.3s %.3s", false, true) == "fal tru")
        local m = setmetatable({}, {__tostring = function () return "hello" end,
                                    __name = "hi"})
        assert(string.format("%s %.10s", m, m) == "hello hello")
        getmetatable(m).__tostring = nil   -- will use '__name' from now on
        assert(string.format("%.4s", m) == "hi: ")

        getmetatable(m).__tostring = function () return {} end
        checkerror("'__tostring' must return a string", tostring, m)


        assert(string.format("%x", 0.0) == "0")
        assert(string.format("%02x", 0.0) == "00")
        assert(string.format("%08X", 0xFFFFFFFF) == "FFFFFFFF")
        assert(string.format("%+08d", 31501) == "+0031501")
        assert(string.format("%+08d", -30927) == "-0030927")
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});


test('testing longest number that can be formatted', function (t) {
    let luaCode = `
        do
          local i = 1
          local j = 10000
          while i + 1 < j do   -- binary search for maximum finite float
            local m = (i + j) // 2
            if 10^m < math.huge then i = m else j = m end
          end
          assert(10^i < math.huge and 10^j == math.huge)
          local s = string.format('%.99f', -(10^i))
          assert(string.len(s) >= i + 101)
          assert(tonumber(s) == -(10^i))
        end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(checkerror + luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});
