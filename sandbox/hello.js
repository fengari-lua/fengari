const DataView       = require('buffer-dataview');
const fs             = require('fs');

const BytecodeParser = require("../src/lundump.js");
const lua_State      = require('../src/lstate.js').lua_State;

let p = new BytecodeParser(new lua_State(), new DataView(fs.readFileSync("./sandbox/hello.bc")))
p.luaU_undump();