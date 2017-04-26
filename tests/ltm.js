"use strict";

const test       = require('tape');
const beautify   = require('js-beautify').js_beautify;

const lua        = require("../src/lua.js");
const VM         = require("../src/lvm.js");
const lauxlib    = require("../src/lauxlib.js");
const OC         = require('../src/lopcodes.js');

const tests      = require("./tests.js");
const getState   = tests.getState;
const toByteCode = tests.toByteCode;


test('__index, __newindex: with actual table', function (t) {
    let luaCode = `
        local t = {yo=1}
        return t.yo, t.lo
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.ok(
        lua.lua_isnil(L, -1),
        "Program output is correct"
    );

    t.strictEqual(
        lua.lua_tointeger(L, -2),
        1,
        "Program output is correct"
    );
});


test('__newindex: with non table', function (t) {
    let luaCode = `
        local t = "a string"
        t.yo = "hello"
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.throws(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed with expected error");
});


test('__index function in metatable', function (t) {
    let luaCode = `
        local mt = {
            __index = function (table, key)
                return "__index"
            end
        }

        local t = {}

        setmetatable(t, mt)

        return t.yo
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");


    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "__index",
        "Program output is correct"
    );
});


test('__newindex function in metatable', function (t) {
    let luaCode = `
        local mt = {
            __newindex = function (table, key, value)
                return "__newindex"
            end
        }

        local t = {}

        setmetatable(t, mt)

        t.yo = "hello"

        return t.yo
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.ok(
        lua.lua_isnil(L, -1),
        "Program output is correct"
    );
});


test('__index table in metatable', function (t) {
    let luaCode = `
        local mmt = {
            yo = "hello"
        }

        local mt = {
            __index = mmt
        }

        local t = {}

        setmetatable(t, mt)

        return t.yo
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "Program output is correct"
    );
});


test('__newindex table in metatable', function (t) {
    let luaCode = `
        local mmt = {
            yo = "hello"
        }

        local mt = {
            __newindex = mmt
        }

        local t = {}

        setmetatable(t, mt)

        t.yo = "world"

        return t.yo, mmt.yo
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "world",
        "Program output is correct"
    );

    t.ok(
        lua.lua_isnil(L, -2),
        "Program output is correct"
    );
});


test('__index table with own metatable', function (t) {
    let luaCode = `
        local mmmt = {
            __index = function (t, k)
                return "hello"
            end
        }

        local mmt = {
            yoo = "bye"
        }

        setmetatable(mmt, mmmt)

        local mt = {
            __index = mmt
        }

        local t = {}

        setmetatable(t, mt)

        return t.yo
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "Program output is correct"
    );
});


test('__newindex table with own metatable', function (t) {
    let luaCode = `
        local up = nil

        local mmmt = {
            __newindex = function (t, k, v)
                up = v
            end
        }

        local mmt = {}

        setmetatable(mmt, mmmt)

        local mt = {
            __newindex = mmt
        }

        setmetatable(mt, mmt)

        local t = {}

        setmetatable(t, mt)

        t.yo = "hello"

        return t.yo, up
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "Program output is correct"
    );

    t.ok(
        lua.lua_isnil(L, -2),
        "Program output is correct"
    );
});


test('binary __xxx functions in metatable', function (t) {
    let luaCode = `
        local mt = {
            __add = function (a, b)
                return "{} + " .. b
            end,

            __sub = function (a, b)
                return "{} - " .. b
            end,

            __mul = function (a, b)
                return "{} * " .. b
            end,

            __mod = function (a, b)
                return "{} % " .. b
            end,

            __pow = function (a, b)
                return "{} ^ " .. b
            end,

            __div = function (a, b)
                return "{} / " .. b
            end,

            __idiv = function (a, b)
                return "{} // " .. b
            end,

            __band = function (a, b)
                return "{} & " .. b
            end,

            __bor = function (a, b)
                return "{} | " .. b
            end,

            __bxor = function (a, b)
                return "{} ~ " .. b
            end,

            __shl = function (a, b)
                return "{} << " .. b
            end,

            __shr = function (a, b)
                return "{} >> " .. b
            end

        }

        local t = {}

        setmetatable(t, mt)

        return
            t + 1,
            t - 1,
            t * 1,
            t % 1,
            t ^ 1,
            t / 1,
            t // 1,
            t & 1,
            t | 1,
            t ~ 1,
            t << 1,
            t >> 1
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.deepEqual(
        L.stack.slice(L.top - 12, L.top).map(e => e.jsstring()),
        [
            "{} + 1",
            "{} - 1",
            "{} * 1",
            "{} % 1",
            "{} ^ 1",
            "{} / 1",
            "{} // 1",
            "{} & 1",
            "{} | 1",
            "{} ~ 1",
            "{} << 1",
            "{} >> 1"
        ],
        "Program output is correct"
    );
});


test('__eq', function (t) {
    let luaCode = `
        local mt = {
            __eq = function (a, b)
                return true
            end
        }

        local t = {}

        setmetatable(t, mt)

        return t == {}
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.ok(
        lua.lua_toboolean(L, -1),
        "Program output is correct"
    );
});


test('__lt', function (t) {
    let luaCode = `
        local mt = {
            __lt = function (a, b)
                return true
            end
        }

        local t = {}

        setmetatable(t, mt)

        return t < {}
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.ok(
        lua.lua_toboolean(L, -1),
        "Program output is correct"
    );
});


test('__le', function (t) {
    let luaCode = `
        local mt = {
            __le = function (a, b)
                return true
            end
        }

        local t = {}

        setmetatable(t, mt)

        return t <= {}
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.ok(
        lua.lua_toboolean(L, -1),
        "Program output is correct"
    );
});


test('__le that uses __lt', function (t) {
    let luaCode = `
        local mt = {
            __lt = function (a, b)
                return false
            end
        }

        local t = {}

        setmetatable(t, mt)

        return {} <= t
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.ok(
        lua.lua_toboolean(L, -1),
        "Program output is correct"
    );
});


test('__unm, __bnot', function (t) {
    let luaCode = `
        local mt = {
            __unm = function (a)
                return "hello"
            end,

            __bnot = function (a)
                return "world"
            end
        }

        local t = {}

        setmetatable(t, mt)

        return -t, ~t
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "world",
        "Program output is correct"
    );

    t.strictEqual(
        lua.lua_tojsstring(L, -2),
        "hello",
        "Program output is correct"
    );
});


test('__len', function (t) {
    let luaCode = `
        local mt = {
            __len = function (a)
                return "hello"
            end
        }

        local t = {}

        setmetatable(t, mt)

        return #t
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "Program output is correct"
    );
});


test('__concat', function (t) {
    let luaCode = `
        local mt = {
            __concat = function (a)
                return "hello"
            end
        }

        local t = {}

        setmetatable(t, mt)

        return t .. " world"
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "Program output is correct"
    );
});


test('__call', function (t) {
    let luaCode = `
        local mt = {
            __call = function (a, ...)
                return "hello", ...
            end
        }

        local t = {}

        setmetatable(t, mt)

        return t("world","wow")
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {
        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test"), lua.to_luastring("binary"));
    }, "Bytecode parsed without errors");

    t.doesNotThrow(function () {
        lua.lua_call(L, 0, -1);
    }, "Program executed without errors");

    t.deepEqual(
        L.stack.slice(L.top - 3, L.top).map(e => e.jsstring()),
        ["hello", "world", "wow"],
        "Program output is correct"
    );
});
