"use strict";

const fs             = require('fs');
const child_process  = require('child_process');
const tmp            = require('tmp');

const BytecodeParser = require("../src/lundump.js");
const lauxlib        = require("../src/lauxlib.js");
const VM             = require("../src/lvm.js");

const toByteCode = function (luaCode) {
    var luaFile = tmp.fileSync(),
        bclist;

    fs.writeSync(luaFile.fd, luaCode);

    child_process.execSync(`luac -o ${luaFile.name}.bc ${luaFile.name}`);
    child_process.execSync(`luac -l ${luaFile.name} > ${luaFile.name}.bc.txt`);

    bclist = fs.readFileSync(`${luaFile.name}.bc.txt`, 'utf8');

    let b = fs.readFileSync(`${luaFile.name}.bc`);
    let dv = new DataView(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));

    return {
        dataView: dv,
        bclist: bclist
    };
};

const getState = function(luaCode) {
    var bc = toByteCode(luaCode),
        dv = bc.dataView,
        bcl = bc.bclist;

    let L = lauxlib.luaL_newstate();

    let p = new BytecodeParser(L, dv).luaU_undump();

    return L;
};

module.exports.getState = getState;
module.exports.toByteCode = toByteCode;