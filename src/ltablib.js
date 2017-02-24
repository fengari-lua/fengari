/* jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lstate  = require('./lstate.js');
const ldo     = require('./ldo.js');
const ldebug  = require('./ldebug.js');
const CT      = lua.constant_types;
const TS      = lua.thread_status;


/*
** Operations that an object must define to mimic a table
** (some functions only need some of them)
*/
const TAB_R  = 1;               /* read */
const TAB_W  = 2;               /* write */
const TAB_L  = 4;               /* length */
const TAB_RW = (TAB_R | TAB_W); /* read/write */

const checkfield = function(L, key, n) {
    lapi.lua_pushstring(L, key);
    return lapi.lua_rawget(L, -n) !== CT.LUA_TNIL;
};

/*
** Check that 'arg' either is a table or can behave like one (that is,
** has a metatable with the required metamethods)
*/
const checktab = function(L, arg, what) {
    if (lapi.lua_type(L, arg) !== CT.LUA_TTABLE) {  /* is it not a table? */
        let n = 1;
        if (lapi.lua_getmetatable(L, arg) &&  /* must have metatable */
            (!(what & TAB_R) || checkfield(L, "__index", ++n)) &&
            (!(what & TAB_W) || checkfield(L, "__newindex", ++n)) &&
            (!(what & TAB_L) || checkfield(L, "__len", ++n))) {
            lapi.lua_pop(L, n);  /* pop metatable and tested metamethods */
        }
        else
            lauxlib.luaL_checktype(L, arg, CT.LUA_TTABLE);  /* force an error */
    }
};

const aux_getn = function(L, n, w) {
    checktab(L, n, w | TAB_L);
    lauxlib.luaL_len(L, n);
};

const addfield = function(L, b, i) {
    lapi.lua_geti(L, 1, i);
    if (!lapi.lua_isstring(L, -1))
        lauxlib.luaL_error(L, `invalid value (${lauxlib.luaL_typename(L, -1)}) at index ${i} in table for 'concat'`);

    lauxlib.luaL_addvalue(b);
};

const tconcat = function(L) {
    let last = aux_getn(L, 1, TAB_R);
    let sep = lauxlib.luaL_optlstring(L, 2, "");
    let i = lauxlib.luaL_optinteger(L, 3, 1);
    last = lauxlib.luaL_optinteger(L, 4, last);

    let b = new lauxlib.luaL_Buffer();
    lauxlib.luaL_buffinit(L, b);

    for (; i < last; i++) {
        addfield(L, b, i);
        lauxlib.luaL_addlstring(b, sep);
    }

    if (i === last)
        addfield(L, b, i);

    lauxlib.luaL_pushresult(b);

    return 1;
};

const pack = function(L) {
    let n = lapi.lua_gettop(L);  /* number of elements to pack */
    lapi.lua_createtable(L, n, 1);  /* create result table */
    lapi.lua_insert(L, 1);  /* put it at index 1 */
    for (let i = n; i >= 1; i--)  /* assign elements */
        lapi.lua_seti(L, 1, i);
    lapi.lua_pushinteger(L, n);
    lapi.lua_setfield(L, 1, "n");  /* t.n = number of elements */
    return 1;  /* return table */
};

const tab_funcs = {
    "concat": tconcat,
    "pack":   pack
};

const luaopen_table = function(L) {
    lauxlib.luaL_newlib(L, tab_funcs);
    return 1;
};

module.exports.luaopen_table = luaopen_table;