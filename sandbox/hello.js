const DataView       = require('buffer-dataview');
const fs             = require('fs');

const BytecodeParser = require("../src/lundump.js");

let p = new BytecodeParser(new DataView(fs.readFileSync("./sandbox/hello.bc")))
p.luaU_undump();