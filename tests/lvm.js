/*jshint esversion: 6 */
"use strict";

const test           = require('tape');
const fs             = require('fs');
const child_process  = require('child_process');
const beautify       = require('js-beautify').js_beautify;
const tmp            = require('tmp');
const DataView       = require('buffer-dataview');

const BytecodeParser = require("../src/lundump.js");
const lua_State      = require("../src/lstate.js").lua_State;
const LuaVM          = require("../src/lvm.js").LuaVM;
const Table          = require("../src/lobject.js").Table;

const toByteCode = function (luaCode) {
    var luaFile = tmp.fileSync(),
        bclist;

    fs.writeSync(luaFile.fd, luaCode);

    child_process.execSync(`luac-5.3 -o ${luaFile.name}.bc ${luaFile.name}`);
    child_process.execSync(`luac-5.3 -l ${luaFile.name} > ${luaFile.name}.bc.txt`);

    bclist = fs.readFileSync(`${luaFile.name}.bc.txt`, 'utf8');

    console.log(bclist);

    return {
        dataView: new DataView(fs.readFileSync(`${luaFile.name}.bc`)),
        bclist: bclist
    };
};

const getVM = function (luaCode) {
    var bc = toByteCode(luaCode),
        dv = bc.dataView,
        bcl = bc.bclist;

    let p = new BytecodeParser(dv);
    let cl = p.luaU_undump();

    let L = new lua_State(cl);

    return new LuaVM(L);
};

test('LOADK, RETURN', function (t) {
    let luaCode = `
        local a = "hello world"
        return a
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
        "hello world",
        "Program output is correct"
    );
});


test('MOV', function (t) {
    let luaCode = `
        local a = "hello world"
        local b = a
        return b
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
        "hello world",
        "Program output is correct"
    );
});

test('Binary op', function (t) {
    let luaCode = `
        local a = 5
        local b = 10
        return a + b, a - b, a * b, a / b, a % b, a^b, a // b, a & b, a | b, a ~ b, a << b, a >> b
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.deepEqual(
        vm.L.stack.slice(vm.L.top - 12, vm.L.top).map(function (e) { return e.value; }),
        [15, -5, 50, 0.5, 5, 9765625.0, 0, 0, 15, 15, 5120, 0],
        "Program output is correct"
    );
});


test('Unary op, LOADBOOL', function (t) {
    let luaCode = `
        local a = 5
        local b = false
        return -a, not b, ~a
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.deepEqual(
        vm.L.stack.slice(vm.L.top - 3, vm.L.top).map(function (e) { return e.value; }),
        [-5, true, -6],
        "Program output is correct"
    );
});


test('NEWTABLE', function (t) {
    let luaCode = `
        local a = {}
        return a
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.ok(
        vm.L.stack[vm.L.top - 1] instanceof Table,
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
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
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
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.deepEqual(
        vm.L.stack.slice(vm.L.top - 3, vm.L.top).map(function (e) { return e.value; }),
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
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
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
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.deepEqual(
        vm.L.stack.slice(vm.L.top - 3, vm.L.top).map(function (e) { return e.value; }),
        [1, 2, 3],
        "Program output is correct"
    );
});


test('LE, JMP', function (t) {
    let luaCode = `
        local a, b = 1, 1

        return a >= b
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
        true,
        "Program output is correct"
    );
});


test('LT', function (t) {
    let luaCode = `
        local a, b = 1, 1

        return a > b
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
        false,
        "Program output is correct"
    );
});


test('EQ', function (t) {
    let luaCode = `
        local a, b = 1, 1

        return a == b
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
        true,
        "Program output is correct"
    );
});


test('TESTSET (and)', function (t) {
    let luaCode = `
        local a = true
        local b = "hello"

        return a and b
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
        "hello",
        "Program output is correct"
    );
});


test('TESTSET (or)', function (t) {
    let luaCode = `
        local a = false
        local b = "hello"

        return a or b
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
        "hello",
        "Program output is correct"
    );
});


test('TEST (true)', function (t) {
    let luaCode = `
        local a = true
        local b = "hello"

        if a then
            return b
        end

        return "goodbye"
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
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
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
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
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
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
    `, vm;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
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
    `, vm;
    
    t.plan(3);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value.array[1].value,
        "hello",
        "Program output is correct"
    );

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value.hash.get("two").value,
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
    `, vm;
    
    t.plan(1);

    t.comment("Running following code: \n" + luaCode);

    // t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    // }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value,
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
    `, vm;
    
    t.plan(3);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        vm = getVM(luaCode);
        vm.execute();
    }, "Program executed without errors");

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value.array[1].value,
        "hello",
        "Program output is correct"
    );

    t.strictEqual(
        vm.L.stack[vm.L.top - 1].value.hash.get("two").value,
        "world",
        "Program output is correct"
    );
});