"use strict";

const defs = require('./defs.js');

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
    if (process.env.LUA_USE_APICHECK && !(a instanceof TString)) throw Error("assertion failed");
    if (process.env.LUA_USE_APICHECK && !(b instanceof TString)) throw Error("assertion failed");
    return a == b || (a.realstring.length == b.realstring.length && a.realstring.join() == b.realstring.join());
};

/* converts strings (arrays) to a consistent map key */
const luaS_hash = function(str) {
    if (process.env.LUA_USE_APICHECK && !(Array.isArray(str))) throw Error("assertion failed");
    return str.map(e => `${e}|`).join('');
};

const luaS_hashlongstr = function(ts) {
    if (process.env.LUA_USE_APICHECK && !(ts instanceof TString)) throw Error("assertion failed");
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
