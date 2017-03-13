"use strict";

const test       = require('tape');
const beautify   = require('js-beautify').js_beautify;

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lapi       = require("../src/lapi.js");
const lauxlib    = require("../src/lauxlib.js");
const linit      = require('../src/linit.js');
const Table      = require("../src/lobject.js").Table;

// Roughly the same tests as test/lvm.js to cover all opcodes

test('LOADK, RETURN', function (t) {
    let luaCode = `
        local a = "hello world"
        return a
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );

});


test('MOVE', function (t) {
    let luaCode = `
        local a = "hello world"
        local b = a
        return b
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );

});


test('Binary op', function (t) {
    let luaCode = `
        local a = 5
        local b = 10
        return a + b, a - b, a * b, a / b, a % b, a^b, a // b, a & b, a | b, a ~ b, a << b, a >> b
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 12, L.top).map(e => e.value),
        [15, -5, 50, 0.5, 5, 9765625.0, 0, 0, 15, 15, 5120, 0],
        "Program output is correct"
    );

});


test('Unary op, LOADBOOL', function (t) {
    let luaCode = `
        local a = 5
        local b = false
        return -a, not b, ~a
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 3, L.top).map(e => e.value),
        [-5, true, -6],
        "Program output is correct"
    );
});


test('NEWTABLE', function (t) {
    let luaCode = `
        local a = {}
        return a
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.ok(
        L.stack[lapi.index2addr_(L, -1)] instanceof Table,
        "Program output is correct"
    );
});


test('CALL', function (t) {
    let luaCode = `
        local f = function (a, b)
            return a + b
        end

        local c = f(1, 2)

        return c
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        3,
        "Program output is correct"
    );
});

test('Multiple return', function (t) {
    let luaCode = `
        local f = function (a, b)
            return a + b, a - b, a * b
        end

        local c
        local d
        local e

        c, d, e = f(1,2)

        return c, d, e
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 3, L.top).map(e => e.value),
        [3, -1, 2],
        "Program output is correct"
    );
});


test('TAILCALL', function (t) {
    let luaCode = `
        local f = function (a, b)
            return a + b
        end

        return f(1,2)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        3,
        "Program output is correct"
    );
});


test('VARARG', function (t) {
    let luaCode = `
        local f = function (...)
            return ...
        end

        return f(1,2,3)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.deepEqual(
        L.stack.slice(L.top - 3, L.top).map(e => e.value),
        [1, 2, 3],
        "Program output is correct"
    );
});


test('LE, JMP', function (t) {
    let luaCode = `
        local a, b = 1, 1

        return a >= b
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_toboolean(L, -1),
        true,
        "Program output is correct"
    );
});


test('LT', function (t) {
    let luaCode = `
        local a, b = 1, 1

        return a > b
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_toboolean(L, -1),
        false,
        "Program output is correct"
    );
});


test('EQ', function (t) {
    let luaCode = `
        local a, b = 1, 1

        return a == b
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_toboolean(L, -1),
        true,
        "Program output is correct"
    );
});


test('TESTSET (and)', function (t) {
    let luaCode = `
        local a = true
        local b = "hello"

        return a and b
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Program output is correct"
    );
});


test('TESTSET (or)', function (t) {
    let luaCode = `
        local a = false
        local b = "hello"

        return a or b
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Program output is correct"
    );
});


test('TEST (false)', function (t) {
    let luaCode = `
        local a = false
        local b = "hello"

        if a then
            return b
        end

        return "goodbye"
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "goodbye",
        "Program output is correct"
    );
});


test('FORPREP, FORLOOP (int)', function (t) {
    let luaCode = `
        local total = 0

        for i = 0, 10 do
            total = total + i
        end

        return total
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tointeger(L, -1),
        55,
        "Program output is correct"
    );
});


test('FORPREP, FORLOOP (float)', function (t) {
    let luaCode = `
        local total = 0

        for i = 0.5, 10.5 do
            total = total + i
        end

        return total
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        60.5,
        "Program output is correct"
    );
});


test('SETTABLE, GETTABLE', function (t) {
    let luaCode = `
        local t = {}

        t[1] = "hello"
        t["two"] = "world"

        return t
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_topointer(L, -1).get(0).jsstring(),
        "hello",
        "Program output is correct"
    );

    t.strictEqual(
        lapi.lua_topointer(L, -1).get('116|119|111|').jsstring(),
        "world",
        "Program output is correct"
    );
});


test('SETUPVAL, GETUPVAL', function (t) {
    let luaCode = `
        local up = "hello"

        local f = function ()
            upup = "yo"
            up = "world"
            return up;
        end

        return f()
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "world",
        "Program output is correct"
    );
});


test('SETTABUP, GETTABUP', function (t) {
    let luaCode = `
        t = {}

        t[1] = "hello"
        t["two"] = "world"

        return t
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_topointer(L, -1).get(0).jsstring(),
        "hello",
        "Program output is correct"
    );

    t.strictEqual(
        lapi.lua_topointer(L, -1).get('116|119|111|').jsstring(),
        "world",
        "Program output is correct"
    );
});


test('SELF', function (t) {
    let luaCode = `
        local t = {}

        t.value = "hello"
        t.get = function (self)
            return self.value
        end

        return t:get()
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello",
        "Program output is correct"
    );
});


test('SETLIST', function (t) {
    let luaCode = `
        local t = {1, 2, 3, 4, 5, 6, 7, 8, 9}

        return t
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.deepEqual(
        [...lapi.lua_topointer(L, -1).entries()].map(e => e[1].value).sort(),
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        "Program output is correct"
    );
});


test('Variable SETLIST', function (t) {
    let luaCode = `
        local a = function ()
            return 6, 7, 8, 9
        end

        local t = {1, 2, 3, 4, 5, a()}

        return t
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.deepEqual(
        [...lapi.lua_topointer(L, -1).entries()].map(e => e[1].value).sort(),
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        "Program output is correct"
    );
});

test('Long SETLIST', function (t) {
    let luaCode = `
        local t = {1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5}

        return t
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.deepEqual(
        [...lapi.lua_topointer(L, -1).entries()].map(e => e[1].value).reverse(),
        [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
        "Program output is correct"
    );
});


test('TFORCALL, TFORLOOP', function (t) {
    let luaCode = `
        local iterator = function (t, i)
            i = i + 1
            local v = t[i]
            if v then
                return i, v
            end
        end

        local iprs = function(t)
            return iterator, t, 0
        end

        local t = {1, 2, 3}
        local r = 0
        for k,v in iprs(t) do
            r = r + v
        end

        return r
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        6,
        "Program output is correct"
    );
});


test('LEN', function (t) {
    let luaCode = `
        local t = {[10000] = "foo"}
        local t2 = {1, 2, 3}
        local s = "hello"

        return #t, #t2, #s
    `, L;
    
    t.plan(5);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tonumber(L, -1),
        5,
        "Program output is correct"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -2),
        3,
        "Program output is correct"
    );

    t.strictEqual(
        lapi.lua_tonumber(L, -3),
        0,
        "Program output is correct"
    );
});


test('CONCAT', function (t) {
    let luaCode = `
        return "hello " .. 2 .. " you"
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        let reader = function(L, data) {
            let code = luaCode;
            luaCode = null;
            return code;
        };
        
        lapi.lua_load(L, reader, luaCode, "test", "text");

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lapi.lua_call(L, 0, -1);

    }, "Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -1),
        "hello 2 you",
        "Program output is correct"
    );
});