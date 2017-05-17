"use strict";

const defs = require('./defs.js');

const assert = require("assert");

class TString {

    constructor(L, str) {
        this.hash = null;
        this.realstring = str;
    }

    getstr() {
        return this.realstring;
    }

    tsslen() {
        return this.realstring.length;
    }

}

const luaS_eqlngstr = function(a, b) {
    if (LUA_USE_ASSERT) assert(a instanceof TString);
    if (LUA_USE_ASSERT) assert(b instanceof TString);
    return a == b || (a.realstring.length == b.realstring.length && a.realstring.join() == b.realstring.join());
};

/* converts strings (arrays) to a consistent map key */
const luaS_hash = function(str) {
    if (LUA_USE_ASSERT) assert(Array.isArray(str));
    return str.map(e => `${e}|`).join('');
};

const luaS_hashlongstr = function(ts) {
    if (LUA_USE_ASSERT) assert(ts instanceof TString);
    if(ts.hash === null) {
        ts.hash = luaS_hash(ts.getstr());
    }
    return ts.hash;
};

/* variant that takes ownership of array */
const luaS_bless = function(L, str) {
    return new TString(L, str);
};

/* makes a copy */
const luaS_new = function(L, str) {
    return luaS_bless(L, str.slice(0));
};

/* takes a js string */
const luaS_newliteral = function(L, str) {
    return luaS_bless(L, defs.to_luastring(str));
};

module.exports.luaS_eqlngstr    = luaS_eqlngstr;
module.exports.luaS_hash        = luaS_hash;
module.exports.luaS_hashlongstr = luaS_hashlongstr;
module.exports.luaS_bless       = luaS_bless;
module.exports.luaS_new         = luaS_new;
module.exports.luaS_newliteral  = luaS_newliteral;
module.exports.TString          = TString;
