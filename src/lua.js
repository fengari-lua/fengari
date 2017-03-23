/*jshint esversion: 6 */
"use strict";

const assert  = require('assert');
const luaconf = require('./luaconf.js');

/* mark for precompiled code ('<esc>Lua') */
const LUA_SIGNATURE           = "\x1bLua";

const LUA_VERSION_MAJOR       = "5";
const LUA_VERSION_MINOR       = "3";
const LUA_VERSION_NUM         = 503;
const LUA_VERSION_RELEASE     = "4";

const LUA_VERSION             = "Lua " + LUA_VERSION_MAJOR + "." + LUA_VERSION_MINOR;
const LUA_RELEASE             = LUA_VERSION + "." + LUA_VERSION_RELEASE;
const LUA_COPYRIGHT           = LUA_RELEASE + "  Copyright (C) 1994-2017 Lua.org, PUC-Rio";
const LUA_AUTHORS             = "R. Ierusalimschy, L. H. de Figueiredo, W. Celes";

const FENGARI_VERSION_MAJOR   = "0";
const FENGARI_VERSION_MINOR   = "0";
const FENGARI_VERSION_NUM     = 1;
const FENGARI_VERSION_RELEASE = "1";

const FENGARI_VERSION         = "Fengari " + FENGARI_VERSION_MAJOR + "." + FENGARI_VERSION_MINOR;
const FENGARI_RELEASE         = FENGARI_VERSION + "." + FENGARI_VERSION_RELEASE;
const FENGARI_COPYRIGHT       = FENGARI_RELEASE + "  Copyright (C) 2017 Benoît Giannangeli\nBased on: " + LUA_COPYRIGHT;
const FENGARI_AUTHORS         = "B. Giannangeli";

const LUA_VERSUFFIX           = "_" + LUA_VERSION_MAJOR + "_" + LUA_VERSION_MINOR;

const LUA_INIT_VAR            = "LUA_INIT";
const LUA_INITVARVERSION      = LUA_INIT_VAR + LUA_VERSUFFIX;

const thread_status = {
    LUA_OK:        0,
    LUA_YIELD:     1,
    LUA_ERRRUN:    2,
    LUA_ERRSYNTAX: 3,
    LUA_ERRMEM:    4,
    LUA_ERRGCMM:   5,
    LUA_ERRERR:    6
};

const constant_types = {
    LUA_TNONE:          -1,
    LUA_TNIL:           0,
    LUA_TBOOLEAN:       1,
    LUA_TLIGHTUSERDATA: 2,
    LUA_TNUMBER:        3,
    LUA_TSTRING:        4,
    LUA_TTABLE:         5,
    LUA_TFUNCTION:      6,
    LUA_TUSERDATA:      7,
    LUA_TTHREAD:        8,
    LUA_NUMTAGS:        9
};

constant_types.LUA_TSHRSTR = constant_types.LUA_TSTRING | (0 << 4);  /* short strings */
constant_types.LUA_TLNGSTR = constant_types.LUA_TSTRING | (1 << 4);  /* long strings */

constant_types.LUA_TLIGHTUSERDATA_PTR = constant_types.LUA_TLIGHTUSERDATA | (0 << 4);  /* short strings */
constant_types.LUA_TLIGHTUSERDATA_OBJ = constant_types.LUA_TLIGHTUSERDATA | (1 << 4);  /* long strings */

constant_types.LUA_TNUMFLT = constant_types.LUA_TNUMBER | (0 << 4);  /* float numbers */
constant_types.LUA_TNUMINT = constant_types.LUA_TNUMBER | (1 << 4);  /* integer numbers */

constant_types.LUA_TLCL = constant_types.LUA_TFUNCTION | (0 << 4);  /* Lua closure */
constant_types.LUA_TLCF = constant_types.LUA_TFUNCTION | (1 << 4);  /* light C function */
constant_types.LUA_TCCL = constant_types.LUA_TFUNCTION | (2 << 4);  /* C closure */

const CT = constant_types;

/*
** Comparison and arithmetic functions
*/

const LUA_OPADD  = 0;   /* ORDER TM, ORDER OP */
const LUA_OPSUB  = 1;
const LUA_OPMUL  = 2;
const LUA_OPMOD  = 3;
const LUA_OPPOW  = 4;
const LUA_OPDIV  = 5;
const LUA_OPIDIV = 6;
const LUA_OPBAND = 7;
const LUA_OPBOR  = 8;
const LUA_OPBXOR = 9;
const LUA_OPSHL  = 10;
const LUA_OPSHR  = 11;
const LUA_OPUNM  = 12;
const LUA_OPBNOT = 13;

const LUA_OPEQ = 0;
const LUA_OPLT = 1;
const LUA_OPLE = 2;

const LUA_NUMTAGS = 9;
const LUA_MINSTACK = 20;

const LUA_REGISTRYINDEX = -luaconf.LUAI_MAXSTACK - 1000;

const lua_upvalueindex = function(i) {
    return LUA_REGISTRYINDEX - i;
};

/* predefined values in the registry */
const LUA_RIDX_MAINTHREAD = 1;
const LUA_RIDX_GLOBALS    = 2;
const LUA_RIDX_LAST       = LUA_RIDX_GLOBALS;

const print_version = function() {
    console.log(FENGARI_COPYRIGHT);
};

class lua_Debug {

    constructor() {
        this.event = NaN;
        this.name = null;           /* (n) */
        this.namewhat = null;       /* (n) 'global', 'local', 'field', 'method' */
        this.what = null;           /* (S) 'Lua', 'C', 'main', 'tail' */
        this.source = null;         /* (S) */
        this.currentline = NaN;     /* (l) */
        this.linedefined = NaN;     /* (S) */
        this.lastlinedefined = NaN; /* (S) */
        this.nups = NaN;            /* (u) number of upvalues */
        this.nparams = NaN;         /* (u) number of parameters */
        this.isvararg = NaN;        /* (u) */
        this.istailcall = NaN;      /* (t) */
        this.short_src = null;      /* (S) */
        /* private part */
        this.i_ci = null;           /* active function */
    }

}

const to_luastring = function(str, maxBytesToWrite) {
    maxBytesToWrite = maxBytesToWrite !== undefined ? maxBytesToWrite : Number.MAX_SAFE_INTEGER;
    let outU8Array = [];

    if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
      return 0;
  
    let outIdx = 0;
    let startIdx = 0;
    let endIdx = maxBytesToWrite - 1; // -1 for string null terminator.
    for (let i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
        let u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
        if (u <= 0x7F) {
            if (outIdx >= endIdx) break;
            outU8Array[outIdx++] = u;
        } else if (u <= 0x7FF) {
            if (outIdx + 1 >= endIdx) break;
            outU8Array[outIdx++] = 0xC0 | (u >> 6);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
            if (outIdx + 2 >= endIdx) break;
            outU8Array[outIdx++] = 0xE0 | (u >> 12);
            outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0x1FFFFF) {
            if (outIdx + 3 >= endIdx) break;
            outU8Array[outIdx++] = 0xF0 | (u >> 18);
            outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
            outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0x3FFFFFF) {
            if (outIdx + 4 >= endIdx) break;
            outU8Array[outIdx++] = 0xF8 | (u >> 24);
            outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
            outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
            outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        } else {
            if (outIdx + 5 >= endIdx) break;
            outU8Array[outIdx++] = 0xFC | (u >> 30);
            outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
            outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
            outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
            outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        }
    }
    // Null-terminate the pointer to the buffer.
    // outU8Array[outIdx] = 0;
    return outU8Array;
};

module.exports.CT                      = CT;
module.exports.FENGARI_AUTHORS         = FENGARI_AUTHORS;
module.exports.FENGARI_COPYRIGHT       = FENGARI_COPYRIGHT;
module.exports.FENGARI_RELEASE         = FENGARI_RELEASE;
module.exports.FENGARI_VERSION         = FENGARI_VERSION;
module.exports.FENGARI_VERSION_MAJOR   = FENGARI_VERSION_MAJOR;
module.exports.FENGARI_VERSION_MINOR   = FENGARI_VERSION_MINOR;
module.exports.FENGARI_VERSION_NUM     = FENGARI_VERSION_NUM;
module.exports.FENGARI_VERSION_RELEASE = FENGARI_VERSION_RELEASE;
module.exports.LUA_AUTHORS             = LUA_AUTHORS;
module.exports.LUA_COPYRIGHT           = LUA_COPYRIGHT;
module.exports.LUA_INITVARVERSION      = LUA_INITVARVERSION;
module.exports.LUA_INIT_VAR            = LUA_INIT_VAR;
module.exports.LUA_MINSTACK            = LUA_MINSTACK;
module.exports.LUA_MULTRET             = -1;
module.exports.LUA_NUMTAGS             = LUA_NUMTAGS;
module.exports.LUA_OPADD               = LUA_OPADD;
module.exports.LUA_OPBAND              = LUA_OPBAND;
module.exports.LUA_OPBNOT              = LUA_OPBNOT;
module.exports.LUA_OPBOR               = LUA_OPBOR;
module.exports.LUA_OPBXOR              = LUA_OPBXOR;
module.exports.LUA_OPDIV               = LUA_OPDIV;
module.exports.LUA_OPEQ                = LUA_OPEQ;
module.exports.LUA_OPIDIV              = LUA_OPIDIV;
module.exports.LUA_OPLE                = LUA_OPLE;
module.exports.LUA_OPLT                = LUA_OPLT;
module.exports.LUA_OPMOD               = LUA_OPMOD;
module.exports.LUA_OPMUL               = LUA_OPMUL;
module.exports.LUA_OPPOW               = LUA_OPPOW;
module.exports.LUA_OPSHL               = LUA_OPSHL;
module.exports.LUA_OPSHR               = LUA_OPSHR;
module.exports.LUA_OPSUB               = LUA_OPSUB;
module.exports.LUA_OPUNM               = LUA_OPUNM;
module.exports.LUA_REGISTRYINDEX       = LUA_REGISTRYINDEX;
module.exports.LUA_RELEASE             = LUA_RELEASE;
module.exports.LUA_RIDX_GLOBALS        = LUA_RIDX_GLOBALS;
module.exports.LUA_RIDX_LAST           = LUA_RIDX_LAST;
module.exports.LUA_RIDX_MAINTHREAD     = LUA_RIDX_MAINTHREAD;
module.exports.LUA_SIGNATURE           = LUA_SIGNATURE;
module.exports.LUA_VERSION             = LUA_VERSION;
module.exports.LUA_VERSION_MAJOR       = LUA_VERSION_MAJOR;
module.exports.LUA_VERSION_MINOR       = LUA_VERSION_MINOR;
module.exports.LUA_VERSION_NUM         = LUA_VERSION_NUM;
module.exports.LUA_VERSION_RELEASE     = LUA_VERSION_RELEASE;
module.exports.LUA_VERSUFFIX           = LUA_VERSUFFIX;
module.exports.constant_types          = constant_types;
module.exports.lua_Debug               = lua_Debug;
module.exports.lua_upvalueindex        = lua_upvalueindex;
module.exports.print_version           = print_version;
module.exports.thread_status           = thread_status;
module.exports.to_luastring            = to_luastring;