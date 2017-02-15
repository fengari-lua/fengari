/*jshint esversion: 6 */
"use strict";

const assert = require('assert');
const lualib = require('./lualib.js');

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

const print_version = function() {
    console.log(FENGARI_COPYRIGHT);
};


const handle_script = function(L, args) {
    // TODO: stdin

};

const handle_luainit = function(L) {
    // TODO: Should execute script in LUA_INIT_5_3
    return thread_status.LUA_OK;
};

/*
** Main body of stand-alone interpreter (to be called in protected mode).
** Reads the options and handles them all.
*/
const pmain = function(L) {
    // arguments are a userdata wrapping a plain JS object
    let args = L.stack[1].value; // For now it should only hold a DataView containing bytecode

    // TODO: luaL_checkversion(L);
    // TODO: LUA_NOENV
    // TODO: luaL_openlibs(L);
    // TODO: createargtable(L, argv, argc, script);

    if (!args.E) {
        if (handle_luainit(L) != thread_status.LUA_OK)
            return 0; /* error running LUA_INIT */
    }

    // TODO: runargs(L, argv, script)
    if (args.script && handle_script(L, args) != thread_status.LUA_OK)
        return 0;

    // TODO: doREPL(L);
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