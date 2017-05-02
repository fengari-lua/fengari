/*jshint esversion: 6 */
"use strict";

const lua = require("./lua.js");

const LUA_VERSUFFIX = "_" + lua.LUA_VERSION_MAJOR + "_" + lua.LUA_VERSION_MINOR;
module.exports.LUA_VERSUFFIX = LUA_VERSUFFIX;

const LUA_COLIBNAME = "coroutine";
module.exports.LUA_COLIBNAME = LUA_COLIBNAME;
module.exports[LUA_COLIBNAME] = require("./lcorolib.js").luaopen_coroutine;

const LUA_TABLIBNAME = "table";
module.exports.LUA_TABLIBNAME = LUA_TABLIBNAME;
module.exports[LUA_TABLIBNAME] = require("./ltablib.js").luaopen_table;

const LUA_IOLIBNAME = "io";
module.exports.LUA_IOLIBNAME = LUA_IOLIBNAME;
module.exports[LUA_IOLIBNAME] = require("./liolib.js").luaopen_io;

const LUA_OSLIBNAME = "os";
module.exports.LUA_OSLIBNAME = LUA_OSLIBNAME;
module.exports[LUA_OSLIBNAME] = require("./loslib.js").luaopen_os;

const LUA_STRLIBNAME = "string";
module.exports.LUA_STRLIBNAME = LUA_STRLIBNAME;
module.exports[LUA_STRLIBNAME] = require("./lstrlib.js").luaopen_string;

const LUA_UTF8LIBNAME = "utf8";
module.exports.LUA_UTF8LIBNAME = LUA_UTF8LIBNAME;
module.exports[LUA_UTF8LIBNAME] = require("./lutf8lib.js").luaopen_utf8;

const LUA_BITLIBNAME = "bit32";
module.exports.LUA_BITLIBNAME = LUA_BITLIBNAME;
// module.exports[LUA_BITLIBNAME] = require("./lbitlib.js").luaopen_bit32;

const LUA_MATHLIBNAME = "math";
module.exports.LUA_MATHLIBNAME = LUA_MATHLIBNAME;
module.exports[LUA_MATHLIBNAME] = require("./lmathlib.js").luaopen_math;

const LUA_DBLIBNAME = "debug";
module.exports.LUA_DBLIBNAME = LUA_DBLIBNAME;
module.exports[LUA_DBLIBNAME] = require("./ldblib.js").luaopen_debug;

const LUA_LOADLIBNAME = "package";
module.exports.LUA_LOADLIBNAME = LUA_LOADLIBNAME;
module.exports[LUA_LOADLIBNAME] = require("./loadlib.js").luaopen_package;
