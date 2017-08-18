"use strict";

const lua   = require("./lua.js");
const linit = require('./linit.js');

const LUA_VERSUFFIX = "_" + lua.LUA_VERSION_MAJOR + "_" + lua.LUA_VERSION_MINOR;
module.exports.LUA_VERSUFFIX = LUA_VERSUFFIX;

const LUA_COLIBNAME = "coroutine";
module.exports.LUA_COLIBNAME = LUA_COLIBNAME;
module.exports.luaopen_coroutine = require("./lcorolib.js").luaopen_coroutine;

const LUA_TABLIBNAME = "table";
module.exports.LUA_TABLIBNAME = LUA_TABLIBNAME;
module.exports.luaopen_table = require("./ltablib.js").luaopen_table;

if (!WEB) {
    const LUA_IOLIBNAME = "io";
    module.exports.LUA_IOLIBNAME = LUA_IOLIBNAME;
    module.exports.luaopen_io = require("./liolib.js").luaopen_io;
}

const LUA_OSLIBNAME = "os";
module.exports.LUA_OSLIBNAME = LUA_OSLIBNAME;
module.exports.luaopen_os = require("./loslib.js").luaopen_os;

const LUA_STRLIBNAME = "string";
module.exports.LUA_STRLIBNAME = LUA_STRLIBNAME;
module.exports.luaopen_string = require("./lstrlib.js").luaopen_string;

const LUA_UTF8LIBNAME = "utf8";
module.exports.LUA_UTF8LIBNAME = LUA_UTF8LIBNAME;
module.exports.luaopen_utf8 = require("./lutf8lib.js").luaopen_utf8;

const LUA_BITLIBNAME = "bit32";
module.exports.LUA_BITLIBNAME = LUA_BITLIBNAME;
// module.exports.luaopen_bit32 = require("./lbitlib.js").luaopen_bit32;

const LUA_MATHLIBNAME = "math";
module.exports.LUA_MATHLIBNAME = LUA_MATHLIBNAME;
module.exports.luaopen_math = require("./lmathlib.js").luaopen_math;

const LUA_DBLIBNAME = "debug";
module.exports.LUA_DBLIBNAME = LUA_DBLIBNAME;
module.exports.luaopen_debug = require("./ldblib.js").luaopen_debug;

const LUA_LOADLIBNAME = "package";
module.exports.LUA_LOADLIBNAME = LUA_LOADLIBNAME;
module.exports.luaopen_package = require("./loadlib.js").luaopen_package;

module.exports.luaL_openlibs = linit.luaL_openlibs;
