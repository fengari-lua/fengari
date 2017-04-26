"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lstate  = require('./lstate.js');
const ldo     = require('./ldo.js');
const ldebug  = require('./ldebug.js');
const lobject = require('./lobject.js');

const getco = function(L) {
    let co = lapi.lua_tothread(L, 1);
    lauxlib.luaL_argcheck(L, co, 1, lua.to_luastring("thread expected", true));
    return co;
};

const auxresume = function(L, co, narg) {
    if (!lapi.lua_checkstack(co, narg)) {
        lapi.lua_pushliteral(L, "too many arguments to resume");
        return -1;  /* error flag */
    }

    if (lapi.lua_status(co) === lua.LUA_OK && lapi.lua_gettop(co) === 0) {
        lapi.lua_pushliteral(L, "cannot resume dead coroutine");
        return -1;  /* error flag */
    }

    lapi.lua_xmove(L, co, narg);
    let status = ldo.lua_resume(co, L, narg);
    if (status === lua.LUA_OK || status === lua.LUA_YIELD) {
        let nres = lapi.lua_gettop(co);
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

const luaB_coresume = function(L) {
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

const luaB_auxwrap = function(L) {
    let co = lapi.lua_tothread(L, lua.lua_upvalueindex(1));
    let r = auxresume(L, co, lapi.lua_gettop(L));
    if (r < 0) {
        if (lapi.lua_type(L, -1) === lua.LUA_TSTRING) {  /* error object is a string? */
            lauxlib.luaL_where(L, 1);  /* add extra info */
            lapi.lua_insert(L, -2);
            lapi.lua_concat(L, 2);
        }

        return lapi.lua_error(L);  /* propagate error */
    }

    return r;
};

const luaB_cocreate = function(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TFUNCTION);
    let NL = lstate.lua_newthread(L);
    lapi.lua_pushvalue(L, 1);  /* move function to top */
    lapi.lua_xmove(L, NL, 1);  /* move function from L to NL */
    return 1;
};

const luaB_cowrap = function(L) {
    luaB_cocreate(L);
    lapi.lua_pushcclosure(L, luaB_auxwrap, 1);
    return 1;
};

const luaB_yield = function(L) {
    return ldo.lua_yield(L, lapi.lua_gettop(L));
};

const luaB_costatus = function(L) {
    let co = getco(L);
    if (L === co) lapi.lua_pushliteral(L, "running");
    else {
        switch (lapi.lua_status(co)) {
            case lua.LUA_YIELD:
                lapi.lua_pushliteral(L, "suspended");
                break;
            case lua.LUA_OK: {
                let ar = new lua.lua_Debug();
                if (ldebug.lua_getstack(co, 0, ar) > 0)  /* does it have frames? */
                    lapi.lua_pushliteral(L, "normal");  /* it is running */
                else if (lapi.lua_gettop(co) === 0)
                    lapi.lua_pushliteral(L, "dead");
                else
                    lapi.lua_pushliteral(L, "suspended");  /* initial state */
                break;
            }
            default:  /* some error occurred */
                lapi.lua_pushliteral(L, "dead");
                break;
        }
    }

    return 1;
};

const luaB_yieldable = function(L) {
    lapi.lua_pushboolean(L, ldo.lua_isyieldable(L));
    return 1;
};

const luaB_corunning = function(L) {
    lapi.lua_pushboolean(L, lapi.lua_pushthread(L));
    return 2;
};

const co_funcs = {
    "create":      luaB_cocreate,
    "isyieldable": luaB_yieldable,
    "resume":      luaB_coresume,
    "running":     luaB_corunning,
    "status":      luaB_costatus,
    "wrap":        luaB_cowrap,
    "yield":       luaB_yield
};

const luaopen_coroutine = function(L) {
    lauxlib.luaL_newlib(L, co_funcs);
    return 1;
};

module.exports.luaopen_coroutine = luaopen_coroutine;
