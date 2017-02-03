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
        vm.L.stack[0].value,
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
        vm.L.stack[0].value,
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
        vm.L.stack.slice(0, 12).map(function (e) { return e.value; }),
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
        vm.L.stack.slice(0, 3).map(function (e) { return e.value; }),
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
        vm.L.stack[0] instanceof Table,
        "Program output is correct"
    );
});