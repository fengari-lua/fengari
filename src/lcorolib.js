/* jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lstate  = require('./lstate.js');
const ldo     = require('./ldo.js');
const CT      = lua.constant_types;
const TS      = lua.thread_status;

const getco = function(L) {
    let co = lapi.lua_tothread(L, 1);
    lauxlib.luaL_argcheck(L, co, 1, "thread expected");
    return co;
};

const auxresume = function(L, co, narg) {
    if (!lapi.lua_checkstack(co, narg)) {
        lapi.lua_pushliteral(L, "too many arguments to resume");
        return -1;  /* error flag */
    }

    if (lapi.lua_status(co) === TS.LUA_OK && lapi.lua_gettop(co) === 0) {
        lapi.lua_pushliteral(L, "cannot resume dead coroutine");
        return -1;  /* error flag */
    }

    lapi.lua_xmove(L, co, narg);
    let status = ldo.lua_resume(co, L, narg);
    if (status === TS.LUA_OK || status === TS.LUA_YIELD) {
        let nres = lapi.lua_gettop(L);
        if (!lapi.lua_checkstack(L, nres + 1)) {
            lapi.lua_pop(co, nres);  /* remove results anyway */
            lapi.lua_pushliteral(L, "too many results to resume");
            return -1;  /* error flag */
        }

        lapi.lua_xmove(co,  L, nres);  /* move yielded values */
        return nres;
    } else {
        lapi.lua_xmove(co, L, 1);  /* move error message */
        return -1;  /* error flag */
    }
};

const luaB_resume = function(L) {
    let co = getco(L);
    let r = auxresume(L, co, lapi.lua_gettop(L) - 1);
    if (r < 0) {
        lapi.lua_pushboolean(L, 0);
        lapi.lua_insert(L, -2);
        return 2;  /* return false + error message */
    } else {
        lapi.lua_pushboolean(L, 1);
        lapi.lua_insert(L, -(r + 1));
        return r + 1;  /* return true + 'resume' returns */
    }
};

const luaB_cocreate = function(L) {
    lauxlib.luaL_checktype(L, 1, CT.LUA_TFUNCTION);
    let NL = lstate.lua_newthread(L);
    lapi.lua_pushvalue(L, 1);  /* move function to top */
    lapi.lua_xmove(L, NL, 1);  /* move function from L to NL */
    return 1;
};

const luaB_yield = function(L) {
    return ldo.lua_yield(L, lapi.lua_gettop(L));
};

const co_funcs = {
    "create":  luaB_cocreate,
    "yield":   luaB_yield,
    "resume":  luaB_resume
};

const luaopen_coroutine = function(L) {
    lauxlib.luaL_newlib(L, co_funcs);
    return 1;
};

module.exports.luaopen_coroutine = luaopen_coroutine;