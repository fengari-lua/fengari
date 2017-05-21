/*jshint esversion: 6 */
"use strict";

const LUAI_MAXCCALLS = 200;
module.exports.LUAI_MAXCCALLS = LUAI_MAXCCALLS;
const LUA_MAXINTEGER = 2147483647;
module.exports.LUA_MAXINTEGER = LUA_MAXINTEGER;
const LUA_MININTEGER = -2147483648;
module.exports.LUA_MININTEGER = LUA_MININTEGER;

const luai_nummod = function(L, a, b) {
    let m = a % b;
    if ((m*b) < 0)
        m += b;
    return m;
};
module.exports.luai_nummod = luai_nummod;

// If later integers are more than 32bit, LUA_MAXINTEGER will then be != MAX_INT
const MAX_INT = 2147483647;
module.exports.MAX_INT = MAX_INT;
const MIN_INT = -2147483648;
module.exports.MIN_INT = MIN_INT;
