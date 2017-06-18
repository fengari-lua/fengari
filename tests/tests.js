"use strict";

global.WEB = false;

const fs             = require('fs');
const child_process  = require('child_process');
const tmp            = require('tmp');

const lua            = require("../src/lua.js");
const lauxlib        = require("../src/lauxlib.js");

const toByteCode = function (luaCode) {
    var luaFile = tmp.fileSync();

    fs.writeSync(luaFile.fd, luaCode);

    child_process.execSync(`luac -o ${luaFile.name}.bc ${luaFile.name}`);

    let b = fs.readFileSync(`${luaFile.name}.bc`);
    let dv = new DataView(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));

    return dv;
};

const getState = function(luaCode) {
    let L = lauxlib.luaL_newstate();
    if (!L)
        throw Error("unable to create lua_State");

    if (lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode)) !== lua.LUA_OK)
        return Error(lua.lua_tojsstring(L, -1));

    return L;
};

module.exports.getState = getState;
module.exports.toByteCode = toByteCode;
