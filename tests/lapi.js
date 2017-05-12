"use strict";

const test       = require('tape');

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lauxlib    = require("../src/lauxlib.js");
const lua        = require('../src/lua.js');

test('luaL_newstate, lua_pushnil, luaL_typename', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lua.lua_pushnil(L);

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "nil".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );
});


test('lua_pushnumber', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lua.lua_pushnumber(L, 10.5);

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "number".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        10.5,
        "top is correct"
    );
});


test('lua_pushinteger', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lua.lua_pushinteger(L, 10);

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "number".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tointeger(L, -1),
        10,
        "top is correct"
    );
});


test('lua_pushliteral', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lua.lua_pushliteral(L, "hello");

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "string".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "top is correct"
    );
});


test('lua_pushboolean', function (t) {
    let L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lua.lua_pushboolean(L, true);

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "boolean".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_toboolean(L, -1),
        true,
        "top is correct"
    );
});


test('lua_pushvalue', function (t) {
    let L;
    
    t.plan(5);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lua.lua_pushliteral(L, "hello");

        lua.lua_pushvalue(L, -1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "string".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );

    t.deepEqual(
        lauxlib.luaL_typename(L, -2),
        "string".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tojsstring(L, -2),
        "hello",
        "Correct element(s) on the stack"
    );
});


test('lua_pushjsclosure', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            return 0;
        };

        L = lauxlib.luaL_newstate();

        lua.lua_pushliteral(L, "a value associated to the C closure");
        lua.lua_pushjsclosure(L, fn, 1);

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "function".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );
});


test('lua_pushjsfunction', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            return 0;
        };

        L = lauxlib.luaL_newstate();

        lua.lua_pushjsfunction(L, fn);

    }, "JS Lua program ran without error");

    t.deepEqual(
        lauxlib.luaL_typename(L, -1),
        "function".split('').map(e => e.charCodeAt(0)),
        "Correct element(s) on the stack"
    );
});


test('lua_call (calling a light JS function)', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            lua.lua_pushliteral(L, "hello");
            return 1;
        };

        L = lauxlib.luaL_newstate();

        lua.lua_pushjsfunction(L, fn);

        lua.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "top is correct"
    );
});


test('lua_call (calling a JS closure)', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            lua.lua_pushstring(L, lua.lua_tostring(L, lua.lua_upvalueindex(1)));
            return 1;
        };

        L = lauxlib.luaL_newstate();

        lua.lua_pushliteral(L, "upvalue hello !");
        lua.lua_pushjsclosure(L, fn, 1);

        lua.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "upvalue hello !",
        "top is correct"
    );
});


test('lua_pcall (calling a light JS function)', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let fn = function(L) {
            lua.lua_pushliteral(L, "hello");
            return 1;
        };

        L = lauxlib.luaL_newstate();

        lua.lua_pushjsfunction(L, fn);

        lua.lua_pcall(L, 0, 1, 0);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "top is correct"
    );
});


test('lua_pcall that breaks', function (t) {
    let L;
    
    t.plan(1);

    t.doesNotThrow(function () {

        let fn = function(L) {
            return "undefined_value";
        };

        L = lauxlib.luaL_newstate();

        lua.lua_pushjsfunction(L, fn);

        lua.lua_pcall(L, 0, 1, 0);

    }, "JS Lua program ran without error");

    console.log(L.stack[L.top - 1].value);
});


test('lua_pop', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lua.lua_pushliteral(L, "hello");
        lua.lua_pushliteral(L, "world");

        lua.lua_pop(L, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello",
        "Correct element(s) on the stack"
    );
});


test('lua_load and lua_call it', function (t) {
    let luaCode = `
        local a = "JS > Lua > JS \o/"
        return a
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lua.lua_load(L, function(L, s) { let r = s.bc; s.bc = null; return r; }, {bc: bc}, lua.to_luastring("test-lua_load"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "JS > Lua > JS \o/",
        "Correct element(s) on the stack"
    );
});


test('lua script reads js upvalues', function (t) {
    let luaCode = `
        return js .. " world"
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

        lua.lua_pushliteral(L, "hello");
        lua.lua_setglobal(L, lua.to_luastring("js"));

        lua.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "hello world",
        "Correct element(s) on the stack"
    );
});


test('lua_createtable', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();

        lua.lua_createtable(L, 3, 3);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_istable(L, -1),
        "Correct element(s) on the stack"
    );
});


test('lua_newtable', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();

        lua.lua_newtable(L);

    }, "JS Lua program ran without error");

    t.ok(
        lua.lua_istable(L, -1),
        "Correct element(s) on the stack"
    );
});


test('lua_settable, lua_gettable', function (t) {
    let L;
    
    t.plan(2);

    t.doesNotThrow(function () {
        L = lauxlib.luaL_newstate();

        lua.lua_newtable(L);

        lua.lua_pushliteral(L, "key");
        lua.lua_pushliteral(L, "value");

        lua.lua_settable(L, -3);

        lua.lua_pushliteral(L, "key");
        lua.lua_gettable(L, -2);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        "value",
        "Correct element(s) on the stack"
    );
});

test('lua_atnativeerror', function(t) {
    t.plan(7);

    let L = lauxlib.luaL_newstate();
    let errob = {};

    lua.lua_pushcfunction(L, function(L) {
        throw errob;
    });
    t.strictEqual(lua.lua_pcall(L, 0, 0, 0), -1, "without a native error handler pcall should be -1");
    lua.lua_pop(L, 1);


    lua.lua_atnativeerror(L, function(L) {
        let e = lua.lua_touserdata(L, 1);
        t.strictEqual(e, errob);
        lua.lua_pushstring(L, lua.to_luastring("runtime error!"));
        return 1;
    });
    lua.lua_pushcfunction(L, function(L) {
        throw errob;
    });
    t.strictEqual(lua.lua_pcall(L, 0, 0, 0), lua.LUA_ERRRUN, "should return lua.LUA_ERRRUN");
    t.strictEqual(lua.lua_tojsstring(L, -1), "runtime error!");
    lua.lua_pop(L, 1);


    lua.lua_atnativeerror(L, function(L) {
        let e = lua.lua_touserdata(L, 1);
        t.strictEqual(e, errob);
        lauxlib.luaL_error(L, lua.to_luastring("runtime error!"));
    });
    lua.lua_pushcfunction(L, function(L) {
        throw errob;
    });
    t.strictEqual(lua.lua_pcall(L, 0, 0, 0), lua.LUA_ERRRUN, "luaL_error from a native error handler should result in LUA_ERRRUN");
    t.strictEqual(lua.lua_tojsstring(L, -1), "runtime error!");
    lua.lua_pop(L, 1);
});
