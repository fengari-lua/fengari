/*jshint esversion: 6 */
"use strict";

const assert  = require('assert');
const lualib  = require('./lualib.js');
const luaconf = require('./luaconf.js');

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

const LUA_INIT_VAR            = "LUA_INIT";
const LUA_INITVARVERSION      = LUA_INIT_VAR + lualib.LUA_VERSUFFIX;

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

module.exports.constant_types          = constant_types;
module.exports.thread_status           = thread_status;
module.exports.LUA_MULTRET             = -1;
module.exports.print_version           = print_version;
module.exports.LUA_VERSION_MAJOR       = LUA_VERSION_MAJOR;
module.exports.LUA_VERSION_MINOR       = LUA_VERSION_MINOR;
module.exports.LUA_VERSION_NUM         = LUA_VERSION_NUM;
module.exports.LUA_VERSION_RELEASE     = LUA_VERSION_RELEASE;
module.exports.LUA_VERSION             = LUA_VERSION;
module.exports.LUA_RELEASE             = LUA_RELEASE;
module.exports.LUA_COPYRIGHT           = LUA_COPYRIGHT;
module.exports.LUA_AUTHORS             = LUA_AUTHORS;
module.exports.FENGARI_VERSION_MAJOR   = FENGARI_VERSION_MAJOR;
module.exports.FENGARI_VERSION_MINOR   = FENGARI_VERSION_MINOR;
module.exports.FENGARI_VERSION_NUM     = FENGARI_VERSION_NUM;
module.exports.FENGARI_VERSION_RELEASE = FENGARI_VERSION_RELEASE;
module.exports.FENGARI_VERSION         = FENGARI_VERSION;
module.exports.FENGARI_RELEASE         = FENGARI_RELEASE;
module.exports.FENGARI_COPYRIGHT       = FENGARI_COPYRIGHT;
module.exports.FENGARI_AUTHORS         = FENGARI_AUTHORS;
module.exports.LUA_INIT_VAR            = LUA_INIT_VAR;
module.exports.LUA_INITVARVERSION      = LUA_INITVARVERSION;
module.exports.LUA_NUMTAGS             = LUA_NUMTAGS;
module.exports.LUA_MINSTACK            = LUA_MINSTACK;
module.exports.LUA_RIDX_MAINTHREAD     = LUA_RIDX_MAINTHREAD;
module.exports.LUA_RIDX_GLOBALS        = LUA_RIDX_GLOBALS;
module.exports.LUA_RIDX_LAST           = LUA_RIDX_LAST;
module.exports.LUA_REGISTRYINDEX       = LUA_REGISTRYINDEX;
module.exports.lua_upvalueindex        = lua_upvalueindex;