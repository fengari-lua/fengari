"use strict";

const {
    LUA_VERSION_MAJOR,
    LUA_VERSION_MINOR
} = require("./lua.js");

/**
 * @typedef {import('./lstate').lua_State} lua_State
 */

const LUA_VERSUFFIX = "_" + LUA_VERSION_MAJOR + "_" + LUA_VERSION_MINOR;
module.exports.LUA_VERSUFFIX = LUA_VERSUFFIX;

module.exports.lua_assert = function(c) {};

/** @type {(L: lua_State) => number} */
module.exports.luaopen_base = require("./lbaselib.js").luaopen_base;

const LUA_COLIBNAME = "coroutine";
module.exports.LUA_COLIBNAME = LUA_COLIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_coroutine = require("./lcorolib.js").luaopen_coroutine;

const LUA_TABLIBNAME = "table";
module.exports.LUA_TABLIBNAME = LUA_TABLIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_table = require("./ltablib.js").luaopen_table;

if (typeof process !== "undefined") {
    const LUA_IOLIBNAME = "io";
    module.exports.LUA_IOLIBNAME = LUA_IOLIBNAME;
    /** @type {(L: lua_State) => number} */
    module.exports.luaopen_io = require("./liolib.js").luaopen_io;
}

const LUA_OSLIBNAME = "os";
module.exports.LUA_OSLIBNAME = LUA_OSLIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_os = require("./loslib.js").luaopen_os;

const LUA_STRLIBNAME = "string";
module.exports.LUA_STRLIBNAME = LUA_STRLIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_string = require("./lstrlib.js").luaopen_string;

const LUA_UTF8LIBNAME = "utf8";
module.exports.LUA_UTF8LIBNAME = LUA_UTF8LIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_utf8 = require("./lutf8lib.js").luaopen_utf8;

const LUA_BITLIBNAME = "bit32";
module.exports.LUA_BITLIBNAME = LUA_BITLIBNAME;
// module.exports.luaopen_bit32 = require("./lbitlib.js").luaopen_bit32;

const LUA_MATHLIBNAME = "math";
module.exports.LUA_MATHLIBNAME = LUA_MATHLIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_math = require("./lmathlib.js").luaopen_math;

const LUA_DBLIBNAME = "debug";
module.exports.LUA_DBLIBNAME = LUA_DBLIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_debug = require("./ldblib.js").luaopen_debug;

const LUA_LOADLIBNAME = "package";
module.exports.LUA_LOADLIBNAME = LUA_LOADLIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_package = require("./loadlib.js").luaopen_package;

const LUA_FENGARILIBNAME = "fengari";
module.exports.LUA_FENGARILIBNAME = LUA_FENGARILIBNAME;
/** @type {(L: lua_State) => number} */
module.exports.luaopen_fengari = require("./fengarilib.js").luaopen_fengari;

/** @type {(L: lua_State) => void} */
module.exports.luaL_openlibs = require('./linit.js').luaL_openlibs;
