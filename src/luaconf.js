/*jshint esversion: 6 */
"use strict";

/*
@@ LUAI_MAXSTACK limits the size of the Lua stack.
** CHANGE it if you need a different limit. This limit is arbitrary;
** its only purpose is to stop Lua from consuming unlimited stack
** space (and to reserve some numbers for pseudo-indices).
*/
const LUAI_MAXSTACK = 1000000;

/*
@@ LUA_IDSIZE gives the maximum size for the description of the source
@@ of a function in debug information.
** CHANGE it if you want a different size.
*/
const LUA_IDSIZE = 60;

const lua_numbertointeger = function(n) {
    return n|0;
};

const LUA_INTEGER_FRMLEN = "";
const LUA_NUMBER_FRMLEN = "";

const LUA_INTEGER_FMT = `%${LUA_INTEGER_FRMLEN}d`;
const LUA_NUMBER_FMT  = "%.7g";

const lua_getlocaledecpoint = function() {
    return (1.1).toLocaleString().substring(1, 2);
};

module.exports.LUAI_MAXSTACK         = LUAI_MAXSTACK;
module.exports.LUA_IDSIZE            = LUA_IDSIZE;
module.exports.LUA_INTEGER_FMT       = LUA_INTEGER_FMT;
module.exports.LUA_INTEGER_FRMLEN    = LUA_INTEGER_FRMLEN;
module.exports.LUA_NUMBER_FMT        = LUA_NUMBER_FMT;
module.exports.LUA_NUMBER_FRMLEN     = LUA_NUMBER_FRMLEN;
module.exports.lua_getlocaledecpoint = lua_getlocaledecpoint;
module.exports.lua_numbertointeger   = lua_numbertointeger;