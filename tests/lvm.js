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