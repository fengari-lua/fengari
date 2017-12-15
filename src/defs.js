"use strict";

const assert  = require('assert');
const luaconf = require('./luaconf.js');

// To avoid charCodeAt everywhere
const char = [];
for (let i = 0; i < 127; i++)
    char[String.fromCharCode(i)] = i;
module.exports.char = char;

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
const FENGARI_AUTHORS         = "B. Giannangeli, Daurnimator";
const FENGARI_COPYRIGHT       = FENGARI_RELEASE + "  Copyright (C) 2017 " + FENGARI_AUTHORS + "\nBased on: " + LUA_COPYRIGHT;

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

const LUA_MINSTACK = 20;

const LUA_REGISTRYINDEX = -luaconf.LUAI_MAXSTACK - 1000;

const lua_upvalueindex = function(i) {
    return LUA_REGISTRYINDEX - i;
};

/* predefined values in the registry */
const LUA_RIDX_MAINTHREAD = 1;
const LUA_RIDX_GLOBALS    = 2;
const LUA_RIDX_LAST       = LUA_RIDX_GLOBALS;

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

const string_of = Uint8Array.of.bind(Uint8Array);

const is_luastring = function(s) {
    return s instanceof Uint8Array;
};

/* test two lua strings for equality */
const luastring_cmp = function(a, b) {
    return a === b || (a.length === b.length && a.join() === b.join());
};

const to_jsstring = function(value, from, to) {
    assert(is_luastring(value), "jsstring expects a Uint8Array");

    if (to === void 0) {
        to = value.length;
    } else {
        to = Math.min(value.length, to);
    }

    let str = "";
    for (let i = (from!==void 0?from:0); i < to;) {
        let u;
        let u0 = value[i++];
        if (u0 < 0x80) {
            /* single byte sequence */
            u = u0;
        } else if (u0 < 0xC2 || u0 > 0xF4) {
            throw RangeError("cannot convert invalid utf8 to javascript string");
        } else if (u0 <= 0xDF) {
            /* two byte sequence */
            if (i >= to) throw RangeError("cannot convert invalid utf8 to javascript string");
            let u1 = value[i++];
            if ((u1&0xC0) !== 0x80) throw RangeError("cannot convert invalid utf8 to javascript string");
            u = ((u0 & 0x1F) << 6) + (u1 & 0x3F);
        } else if (u0 <= 0xEF) {
            /* three byte sequence */
            if (i+1 >= to) throw RangeError("cannot convert invalid utf8 to javascript string");
            let u1 = value[i++];
            if ((u1&0xC0) !== 0x80) throw RangeError("cannot convert invalid utf8 to javascript string");
            let u2 = value[i++];
            if ((u2&0xC0) !== 0x80) throw RangeError("cannot convert invalid utf8 to javascript string");
            u = ((u0 & 0x0F) << 12) + ((u1 & 0x3F) << 6) + (u2 & 0x3F);
        } else {
            /* four byte sequence */
            if (i+2 >= to) throw RangeError("cannot convert invalid utf8 to javascript string");
            let u1 = value[i++];
            if ((u1&0xC0) !== 0x80) throw RangeError("cannot convert invalid utf8 to javascript string");
            let u2 = value[i++];
            if ((u2&0xC0) !== 0x80) throw RangeError("cannot convert invalid utf8 to javascript string");
            let u3 = value[i++];
            if ((u3&0xC0) !== 0x80) throw RangeError("cannot convert invalid utf8 to javascript string");
            u = ((u0 & 0x07) << 18) + ((u1 & 0x3F) << 12) + ((u2 & 0x3F) << 6) + (u3 & 0x3F);
        }
        str += String.fromCodePoint(u);
    }
    return str;
};

const uri_allowed = {}; /* bytes allowed unescaped in a uri */
for (let c of ";,/?:@&=+$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,-_.!~*'()#") {
    uri_allowed[c.charCodeAt(0)] = true;
}

/* utility function to convert a lua string to a js string with uri escaping */
const to_uristring = function(a) {
    let s = "";
    for (let i=0; i<a.length; i++) {
        let v = a[i];
        if (uri_allowed[v]) {
            s += String.fromCharCode(v);
        } else {
            s += "%" + (v<0x10?"0":"") + v.toString(16);
        }
    }
    return s;
};

const to_luastring_cache = {};

const to_luastring = function(str, cache) {
    assert(typeof str === "string", "to_luastring expects a javascript string");

    if (cache) {
        let cached = to_luastring_cache[str];
        if (is_luastring(cached)) return cached;
    }

    let outU8Array = Array(str.length); /* array is at *least* going to be length of string */
    let outIdx = 0;
    for (let i = 0; i < str.length; ++i) {
        let u = str.codePointAt(i);
        if (u <= 0x7F) {
            outU8Array[outIdx++] = u;
        } else if (u <= 0x7FF) {
            outU8Array[outIdx++] = 0xC0 | (u >> 6);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
            outU8Array[outIdx++] = 0xE0 | (u >> 12);
            outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        } else {
            i++; /* It was a surrogate pair and hence used up two javascript chars */
            outU8Array[outIdx++] = 0xF0 | (u >> 18);
            outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
            outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
            outU8Array[outIdx++] = 0x80 | (u & 63);
        }
    }
    outU8Array = Uint8Array.from(outU8Array);

    if (cache) to_luastring_cache[str] = outU8Array;

    return outU8Array;
};

const from_userstring = function(str) {
    if (typeof str === "string")
        return to_luastring(str);
    assert(is_luastring(str), "expects an array of bytes or javascript string");
    return str;
};

/*
** Event codes
*/
const LUA_HOOKCALL     = 0;
const LUA_HOOKRET      = 1;
const LUA_HOOKLINE     = 2;
const LUA_HOOKCOUNT    = 3;
const LUA_HOOKTAILCALL = 4;


/*
** Event masks
*/
const LUA_MASKCALL  = (1 << LUA_HOOKCALL);
const LUA_MASKRET   = (1 << LUA_HOOKRET);
const LUA_MASKLINE  = (1 << LUA_HOOKLINE);
const LUA_MASKCOUNT = (1 << LUA_HOOKCOUNT);

/*
** LUA_PATH_SEP is the character that separates templates in a path.
** LUA_PATH_MARK is the string that marks the substitution points in a
** template.
** LUA_EXEC_DIR in a Windows path is replaced by the executable's
** directory.
*/
const LUA_PATH_SEP  = ";";
module.exports.LUA_PATH_SEP = LUA_PATH_SEP;

const LUA_PATH_MARK = "?";
module.exports.LUA_PATH_MARK = LUA_PATH_MARK;

const LUA_EXEC_DIR  = "!";
module.exports.LUA_EXEC_DIR = LUA_EXEC_DIR;


/*
@@ LUA_PATH_DEFAULT is the default path that Lua uses to look for
** Lua libraries.
@@ LUA_CPATH_DEFAULT is the default path that Lua uses to look for
** C libraries.
** CHANGE them if your machine has a non-conventional directory
** hierarchy or if you want to install your libraries in
** non-conventional directories.
*/
const LUA_VDIR = LUA_VERSION_MAJOR + "." + LUA_VERSION_MINOR;
module.exports.LUA_VDIR = LUA_VDIR;

if (typeof process === "undefined") {
    const LUA_DIRSEP = "/";
    module.exports.LUA_DIRSEP = LUA_DIRSEP;

    const LUA_LDIR = "./lua/" + LUA_VDIR + "/";
    module.exports.LUA_LDIR = LUA_LDIR;

    const LUA_CDIR = "./lua/" + LUA_VDIR + "/";
    module.exports.LUA_CDIR = LUA_CDIR;

    const LUA_PATH_DEFAULT =
        LUA_LDIR + "?.lua;" + LUA_LDIR + "?/init.lua;" +
        LUA_CDIR + "?.lua;" + LUA_CDIR + "?/init.lua;" +
        "./?.lua;./?/init.lua";
    module.exports.LUA_PATH_DEFAULT = LUA_PATH_DEFAULT;

    const LUA_CPATH_DEFAULT =
        LUA_CDIR + "?.js;" + LUA_CDIR + "loadall.js;./?.js";
    module.exports.LUA_CPATH_DEFAULT = LUA_CPATH_DEFAULT;
} else if (require('os').platform() === 'win32') {
    const LUA_DIRSEP = "\\";
    module.exports.LUA_DIRSEP = LUA_DIRSEP;

    /*
    ** In Windows, any exclamation mark ('!') in the path is replaced by the
    ** path of the directory of the executable file of the current process.
    */
    const LUA_LDIR = "!\\lua\\";
    module.exports.LUA_LDIR = LUA_LDIR;

    const LUA_CDIR = "!\\";
    module.exports.LUA_CDIR = LUA_CDIR;

    const LUA_SHRDIR = "!\\..\\share\\lua\\" + LUA_VDIR + "\\";
    module.exports.LUA_SHRDIR = LUA_SHRDIR;

    const LUA_PATH_DEFAULT =
        LUA_LDIR + "?.lua;" + LUA_LDIR + "?\\init.lua;" +
        LUA_CDIR + "?.lua;" + LUA_CDIR + "?\\init.lua;" +
        LUA_SHRDIR + "?.lua;" + LUA_SHRDIR + "?\\init.lua;" +
        ".\\?.lua;.\\?\\init.lua";
    module.exports.LUA_PATH_DEFAULT = LUA_PATH_DEFAULT;

    const LUA_CPATH_DEFAULT =
        LUA_CDIR + "?.dll;" +
        LUA_CDIR + "..\\lib\\lua\\" + LUA_VDIR + "\\?.dll;" +
        LUA_CDIR + "loadall.dll;.\\?.dll";
    module.exports.LUA_CPATH_DEFAULT = LUA_CPATH_DEFAULT;
} else {
    const LUA_DIRSEP = "/";
    module.exports.LUA_DIRSEP = LUA_DIRSEP;

    const LUA_ROOT = "/usr/local/";
    module.exports.LUA_ROOT = LUA_ROOT;

    const LUA_LDIR = LUA_ROOT + "share/lua/" + LUA_VDIR + "/";
    module.exports.LUA_LDIR = LUA_LDIR;

    const LUA_CDIR = LUA_ROOT + "lib/lua/" + LUA_VDIR + "/";
    module.exports.LUA_CDIR = LUA_CDIR;

    const LUA_PATH_DEFAULT =
        LUA_LDIR + "?.lua;" + LUA_LDIR + "?/init.lua;" +
        LUA_CDIR + "?.lua;" + LUA_CDIR + "?/init.lua;" +
        "./?.lua;./?/init.lua";
    module.exports.LUA_PATH_DEFAULT = LUA_PATH_DEFAULT;

    const LUA_CPATH_DEFAULT =
        LUA_CDIR + "?.so;" + LUA_CDIR + "loadall.so;./?.so";
    module.exports.LUA_CPATH_DEFAULT = LUA_CPATH_DEFAULT;
}

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
module.exports.LUA_HOOKCALL            = LUA_HOOKCALL;
module.exports.LUA_HOOKCOUNT           = LUA_HOOKCOUNT;
module.exports.LUA_HOOKLINE            = LUA_HOOKLINE;
module.exports.LUA_HOOKRET             = LUA_HOOKRET;
module.exports.LUA_HOOKTAILCALL        = LUA_HOOKTAILCALL;
module.exports.LUA_INITVARVERSION      = LUA_INITVARVERSION;
module.exports.LUA_INIT_VAR            = LUA_INIT_VAR;
module.exports.LUA_MASKCALL            = LUA_MASKCALL;
module.exports.LUA_MASKCOUNT           = LUA_MASKCOUNT;
module.exports.LUA_MASKLINE            = LUA_MASKLINE;
module.exports.LUA_MASKRET             = LUA_MASKRET;
module.exports.LUA_MINSTACK            = LUA_MINSTACK;
module.exports.LUA_MULTRET             = -1;
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
module.exports.thread_status           = thread_status;
module.exports.is_luastring            = is_luastring;
module.exports.luastring_cmp           = luastring_cmp;
module.exports.string_of               = string_of;
module.exports.to_jsstring             = to_jsstring;
module.exports.to_luastring            = to_luastring;
module.exports.to_uristring            = to_uristring;
module.exports.from_userstring         = from_userstring;
