"use strict";

const test       = require('tape');

const tests      = require("./tests.js");
const toByteCode = tests.toByteCode;

const lua     = require('../src/lua.js');
const lauxlib = require('../src/lauxlib.js');
const lualib  = require('../src/lualib.js');


test('math.abs, math.sin, math.cos, math.tan, math.asin, math.acos, math.atan', function (t) {
    let luaCode = `
        return math.abs(-10), math.abs(-10.5), math.cos(10), math.tan(10),
               math.asin(1), math.acos(0.5), math.atan(10)
    `, L;
    
    t.plan(8);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tointeger(L, -7),
        10,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -6),
        10.5,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -5),
        -0.8390715290764524,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -4),
        0.6483608274590866,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -3),
        1.5707963267948966,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -2),
        1.0471975511965979,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        1.4711276743037347,
        "Correct element(s) on the stack"
    );
});


test('math.ceil, math.floor', function (t) {
    let luaCode = `
        return math.ceil(10.5), math.floor(10.5)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tointeger(L, -2),
        11,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tointeger(L, -1),
        10,
        "Correct element(s) on the stack"
    );

});


test('math.deg, math.rad', function (t) {
    let luaCode = `
        return math.deg(10), math.rad(10)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -2),
        572.9577951308232,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        0.17453292519943295,
        "Correct element(s) on the stack"
    );

});


test('math.log', function (t) {
    let luaCode = `
        return math.log(10), math.log(10, 2), math.log(10, 10)
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -3),
        2.302585092994046,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -2),
        3.321928094887362,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        1,
        "Correct element(s) on the stack"
    );

});


test('math.exp', function (t) {
    let luaCode = `
        return math.exp(10)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        22026.465794806718,
        "Correct element(s) on the stack"
    );

});


test('math.min, math.max', function (t) {
    let luaCode = `
        return math.max(10, 5, 23), math.min(10, 5, 23)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -2),
        23,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        5,
        "Correct element(s) on the stack"
    );

});


test('math.random', function (t) {
    let luaCode = `
        return math.random(), math.random(10, 15)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.ok(
        0 <= lua.lua_tonumber(L, -2) <= 1,
        "Correct element(s) on the stack"
    );

    t.ok(
        10 <= lua.lua_tonumber(L, -1) <= 15,
        "Correct element(s) on the stack"
    );

});


test('math.sqrt', function (t) {
    let luaCode = `
        return math.sqrt(10)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        3.1622776601683795,
        "Correct element(s) on the stack"
    );

});


test('math.tointeger', function (t) {
    let luaCode = `
        return math.tointeger('10')
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        10,
        "Correct element(s) on the stack"
    );

});


test('math.type', function (t) {
    let luaCode = `
        return math.type(10), math.type(10.5), math.type('hello')
    `, L;
    
    t.plan(4);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tojsstring(L, -3),
        "integer",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tojsstring(L, -2),
        "float",
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tojsstring(L, -1),
        null,
        "Correct element(s) on the stack"
    );

});


test('math.ult', function (t) {
    let luaCode = `
        return math.tointeger('10')
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_toboolean(L, -1),
        true,
        "Correct element(s) on the stack"
    );

});


test('math.fmod', function (t) {
    let luaCode = `
        return math.fmod(2,5)
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        2,
        "Correct element(s) on the stack"
    );

});


test('math.modf', function (t) {
    let luaCode = `
        return math.modf(3.4, 0.6)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode);

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lua.lua_load(L, null, bc, lua.to_luastring("test-math"), lua.to_luastring("binary"));

        lua.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lua.lua_tonumber(L, -2),
        3,
        "Correct element(s) on the stack"
    );

    t.strictEqual(
        lua.lua_tonumber(L, -1),
        0.3999999999999999,
        "Correct element(s) on the stack"
    );

});
