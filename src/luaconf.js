"use strict";

const conf = (process.env.FENGARICONF ? JSON.parse(process.env.FENGARICONF) : {});

/*
@@ LUA_COMPAT_FLOATSTRING makes Lua format integral floats without a
@@ a float mark ('.0').
** This macro is not on by default even in compatibility mode,
** because this is not really an incompatibility.
*/
const LUA_COMPAT_FLOATSTRING = conf.LUA_COMPAT_FLOATSTRING || false;

const LUA_MAXINTEGER = 2147483647;
const LUA_MININTEGER = -2147483648;

/*
@@ LUAI_MAXSTACK limits the size of the Lua stack.
** CHANGE it if you need a different limit. This limit is arbitrary;
** its only purpose is to stop Lua from consuming unlimited stack
** space (and to reserve some numbers for pseudo-indices).
*/
const LUAI_MAXSTACK = conf.LUAI_MAXSTACK || 1000000;

/*
@@ LUA_IDSIZE gives the maximum size for the description of the source
@@ of a function in debug information.
** CHANGE it if you want a different size.
*/
const LUA_IDSIZE = conf.LUA_IDSIZE || (60-1); /* fengari uses 1 less than lua as we don't embed the null byte */

const lua_integer2str = function(n) {
    return String(n); /* should match behaviour of LUA_INTEGER_FMT */
};

const lua_number2str = function(n) {
    return String(Number(n.toPrecision(14))); /* should match behaviour of LUA_NUMBER_FMT */
};

const lua_numbertointeger = function(n) {
    return n >= LUA_MININTEGER && n < -LUA_MININTEGER ? n : false;
};

const LUA_INTEGER_FRMLEN = "";
const LUA_NUMBER_FRMLEN = "";

const LUA_INTEGER_FMT = `%${LUA_INTEGER_FRMLEN}d`;
const LUA_NUMBER_FMT  = "%.14g";

const lua_getlocaledecpoint = function() {
    return (1.1).toLocaleString().charCodeAt(1);
};

const luai_apicheck = function(l, e) {
    if (!e) throw Error(e);
};

/*
@@ LUAL_BUFFERSIZE is the buffer size used by the lauxlib buffer system.
*/
const LUAL_BUFFERSIZE = conf.LUAL_BUFFERSIZE || 8192;

// See: http://croquetweak.blogspot.fr/2014/08/deconstructing-floats-frexp-and-ldexp.html
const frexp = function(value) {
    if (value === 0) return [value, 0];
    var data = new DataView(new ArrayBuffer(8));
    data.setFloat64(0, value);
    var bits = (data.getUint32(0) >>> 20) & 0x7FF;
    if (bits === 0) { // denormal
        data.setFloat64(0, value * Math.pow(2, 64));  // exp + 64
        bits = ((data.getUint32(0) >>> 20) & 0x7FF) - 64;
    }
    var exponent = bits - 1022;
    var mantissa = ldexp(value, -exponent);
    return [mantissa, exponent];
};

const ldexp = function(mantissa, exponent) {
    var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
    var result = mantissa;
    for (var i = 0; i < steps; i++)
        result *= Math.pow(2, Math.floor((exponent + i) / steps));
    return result;
};

module.exports.LUAI_MAXSTACK          = LUAI_MAXSTACK;
module.exports.LUA_COMPAT_FLOATSTRING = LUA_COMPAT_FLOATSTRING;
module.exports.LUA_IDSIZE             = LUA_IDSIZE;
module.exports.LUA_INTEGER_FMT        = LUA_INTEGER_FMT;
module.exports.LUA_INTEGER_FRMLEN     = LUA_INTEGER_FRMLEN;
module.exports.LUA_MAXINTEGER         = LUA_MAXINTEGER;
module.exports.LUA_MININTEGER         = LUA_MININTEGER;
module.exports.LUA_NUMBER_FMT         = LUA_NUMBER_FMT;
module.exports.LUA_NUMBER_FRMLEN      = LUA_NUMBER_FRMLEN;
module.exports.LUAL_BUFFERSIZE        = LUAL_BUFFERSIZE;
module.exports.frexp                  = frexp;
module.exports.ldexp                  = ldexp;
module.exports.lua_getlocaledecpoint  = lua_getlocaledecpoint;
module.exports.lua_integer2str        = lua_integer2str;
module.exports.lua_number2str         = lua_number2str;
module.exports.lua_numbertointeger    = lua_numbertointeger;
module.exports.luai_apicheck          = luai_apicheck;
