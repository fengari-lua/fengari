/*jshint esversion: 6 */
"use strict";

const fs             = require('fs');
const child_process  = require('child_process');
const tmp            = require('tmp');
const DataView       = require('buffer-dataview');

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

    // console.log(bclist);

    return {
        dataView: new DataView(fs.readFileSync(`${luaFile.name}.bc`)),
        bclist: bclist
    };
};

const getState = function(luaCode) {
    var bc = toByteCode(luaCode),
        dv = bc.dataView,
        bcl = bc.bclist;

    let L = lauxlib.luaL_newstate();

    let p = new BytecodeParser(dv);
    let cl = p.luaU_undump(L);

    return L;
};


module.exports.getState = getState;
module.exports.toByteCode = toByteCode;