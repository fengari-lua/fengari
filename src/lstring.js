"use strict";

const defs = require('./defs.js');

const luaS_eqlngstr = function(a, b) {
    return a == b || (a.length == b.length && a.join() == b.join());
};

/* converts strings (arrays) to a consistent map key */
const luaS_hash = function(str) {
    return str.map(e => `${e}|`).join('');
};

/* variant that takes ownership of array */
const luaS_bless = function(L, str) {
    return str;
};

/* makes a copy */
const luaS_new = function(L, str) {
    return luaS_bless(L, str.slice(0));
};

/* takes a js string */
const luaS_newliteral = function(L, str) {
    return luaS_bless(L, defs.to_luastring(str));
};

module.exports.luaS_eqlngstr   = luaS_eqlngstr;
module.exports.luaS_hash       = luaS_hash;
module.exports.luaS_bless      = luaS_bless;
module.exports.luaS_new        = luaS_new;
module.exports.luaS_newliteral = luaS_newliteral;
