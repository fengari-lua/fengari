"use strict";

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');

let lua_writestring;
let lua_writeline;
if (typeof process === "undefined") {
    let buff = "";
    let decoder = new TextDecoder("utf-8");
    lua_writestring = function(s) {
        buff += decoder.decode(s, {stream: true});
    };
    let empty = new Uint8Array(0);
    lua_writeline = function() {
        buff += decoder.decode(empty);
        console.log(buff);
        buff = "";
    };
} else {
    lua_writestring = function(s) {
        process.stdout.write(Buffer.from(s));
    };
    lua_writeline = function() {
        process.stdout.write("\n");
    };
}
const luaB_print = function(L) {
    let n = lua.lua_gettop(L); /* number of arguments */
    lua.lua_getglobal(L, lua.to_luastring("tostring", true));
    for (let i = 1; i <= n; i++) {
        lua.lua_pushvalue(L, -1);  /* function to be called */
        lua.lua_pushvalue(L, i);  /* value to print */
        lua.lua_call(L, 1, 1);
        let s = lua.lua_tolstring(L, -1);
        if (s === null)
            return lauxlib.luaL_error(L, lua.to_luastring("'tostring' must return a string to 'print'", true));
        if (i > 1) lua_writestring(lua.to_luastring("\t"));
        lua_writestring(s);
        lua.lua_pop(L, 1);
    }
    lua_writeline();
    return 0;
};

const luaB_tostring = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_tolstring(L, 1);

    return 1;
};

const luaB_getmetatable = function(L) {
    lauxlib.luaL_checkany(L, 1);
    if (!lua.lua_getmetatable(L, 1)) {
        lua.lua_pushnil(L);
        return 1;  /* no metatable */
    }
    lauxlib.luaL_getmetafield(L, 1, lua.to_luastring("__metatable", true));
    return 1;  /* returns either __metatable field (if present) or metatable */
};

const luaB_setmetatable = function(L) {
    let t = lua.lua_type(L, 2);
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lauxlib.luaL_argcheck(L, t === lua.LUA_TNIL || t === lua.LUA_TTABLE, 2, lua.to_luastring("nil or table expected", true));
    if (lauxlib.luaL_getmetafield(L, 1, lua.to_luastring("__metatable", true)) !== lua.LUA_TNIL)
        return lauxlib.luaL_error(L, lua.to_luastring("cannot change a protected metatable", true));
    lua.lua_settop(L, 2);
    lua.lua_setmetatable(L, 1);
    return 1;
};

const luaB_rawequal = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_checkany(L, 2);
    lua.lua_pushboolean(L, lua.lua_rawequal(L, 1, 2));
    return 1;
};

const luaB_rawlen = function(L) {
    let t = lua.lua_type(L, 1);
    lauxlib.luaL_argcheck(L, t === lua.LUA_TTABLE || t === lua.LUA_TSTRING, 1, lua.to_luastring("table or string expected", true));
    lua.lua_pushinteger(L, lua.lua_rawlen(L, 1));
    return 1;
};

const luaB_rawget = function(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lauxlib.luaL_checkany(L, 2);
    lua.lua_settop(L, 2);
    lua.lua_rawget(L, 1);
    return 1;
};

const luaB_rawset = function(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lauxlib.luaL_checkany(L, 2);
    lauxlib.luaL_checkany(L, 3);
    lua.lua_settop(L, 3);
    lua.lua_rawset(L, 1);
    return 1;
};

const opts = [
    "stop", "restart", "collect",
    "count", "step", "setpause", "setstepmul",
    "isrunning"
].map((e) => lua.to_luastring(e));
const luaB_collectgarbage = function(L) {
    lauxlib.luaL_checkoption(L, 1, lua.to_luastring("collect"), opts);
    lauxlib.luaL_optinteger(L, 2, 0);
    lauxlib.luaL_error(L, lua.to_luastring("lua_gc not implemented"));
};

const luaB_type = function(L) {
    let t = lua.lua_type(L, 1);
    lauxlib.luaL_argcheck(L, t !== lua.LUA_TNONE, 1, lua.to_luastring("value expected", true));
    lua.lua_pushstring(L, lua.lua_typename(L, t));
    return 1;
};

const pairsmeta = function(L, method, iszero, iter) {
    lauxlib.luaL_checkany(L, 1);
    if (lauxlib.luaL_getmetafield(L, 1, method) === lua.LUA_TNIL) {  /* no metamethod? */
        lua.lua_pushcfunction(L, iter);  /* will return generator, */
        lua.lua_pushvalue(L, 1);  /* state, */
        if (iszero) lua.lua_pushinteger(L, 0);  /* and initial value */
        else lua.lua_pushnil(L);
    } else {
        lua.lua_pushvalue(L, 1);  /* argument 'self' to metamethod */
        lua.lua_call(L, 1, 3);  /* get 3 values from metamethod */
    }
    return 3;
};

const luaB_next = function(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lua.lua_settop(L, 2);  /* create a 2nd argument if there isn't one */
    if (lua.lua_next(L, 1))
        return 2;
    else {
        lua.lua_pushnil(L);
        return 1;
    }
};

const luaB_pairs = function(L) {
    return pairsmeta(L, lua.to_luastring("__pairs", true), 0, luaB_next);
};

/*
** Traversal function for 'ipairs'
*/
const ipairsaux = function(L) {
    let i = lauxlib.luaL_checkinteger(L, 2) + 1;
    lua.lua_pushinteger(L, i);
    return lua.lua_geti(L, 1, i) === lua.LUA_TNIL ? 1 : 2;
};

/*
** 'ipairs' function. Returns 'ipairsaux', given "table", 0.
** (The given "table" may not be a table.)
*/
const luaB_ipairs = function(L) {
    // Lua 5.2
    // return pairsmeta(L, "__ipairs", 1, ipairsaux);

    lauxlib.luaL_checkany(L, 1);
    lua.lua_pushcfunction(L, ipairsaux);  /* iteration function */
    lua.lua_pushvalue(L, 1);  /* state */
    lua.lua_pushinteger(L, 0);  /* initial value */
    return 3;
};

const b_str2int = function(s, base) {
    try {
        s = lua.to_jsstring(s);
    } catch (e) {
        return null;
    }
    let r = /^[\t\v\f \n\r]*([+-]?)0*([0-9A-Za-z]+)[\t\v\f \n\r]*$/.exec(s);
    if (!r) return null;
    let neg = r[1] === "-";
    let digits = r[2];
    let n = 0;
    for (let si=0; si<digits.length; si++) {
        let digit = /\d/.test(digits[si])
            ? (digits.charCodeAt(si) - '0'.charCodeAt(0))
            : (digits[si].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 10);
        if (digit >= base) return null;  /* invalid numeral */
        n = ((n * base)|0) + digit;
    }
    return (neg ? -n : n)|0;
};

const luaB_tonumber = function(L) {
    if (lua.lua_type(L, 2) <= 0) {  /* standard conversion? */
        lauxlib.luaL_checkany(L, 1);
        if (lua.lua_type(L, 1) === lua.LUA_TNUMBER) {  /* already a number? */
            lua.lua_settop(L, 1);
            return 1;
        } else {
            let s = lua.lua_tostring(L, 1);
            if (s !== null && lua.lua_stringtonumber(L, s) === s.length+1)
                return 1;  /* successful conversion to number */
        }
    } else {
        let base = lauxlib.luaL_checkinteger(L, 2);
        lauxlib.luaL_checktype(L, 1, lua.LUA_TSTRING);  /* no numbers as strings */
        let s = lua.lua_tostring(L, 1);
        lauxlib.luaL_argcheck(L, 2 <= base && base <= 36, 2, lua.to_luastring("base out of range", true));
        let n = b_str2int(s, base);
        if (n !== null) {
            lua.lua_pushinteger(L, n);
            return 1;
        }
    }

    lua.lua_pushnil(L);
    return 1;
};

const luaB_error = function(L) {
    let level = lauxlib.luaL_optinteger(L, 2, 1);
    lua.lua_settop(L, 1);
    if (lua.lua_type(L, 1) === lua.LUA_TSTRING && level > 0) {
        lauxlib.luaL_where(L, level);  /* add extra information */
        lua.lua_pushvalue(L, 1);
        lua.lua_concat(L, 2);
    }
    return lua.lua_error(L);
};

const luaB_assert = function(L) {
    if (lua.lua_toboolean(L, 1))  /* condition is true? */
        return lua.lua_gettop(L);  /* return all arguments */
    else {
        lauxlib.luaL_checkany(L, 1);  /* there must be a condition */
        lua.lua_remove(L, 1);  /* remove it */
        lua.lua_pushliteral(L, "assertion failed!");  /* default message */
        lua.lua_settop(L, 1);  /* leave only message (default if no other one) */
        return luaB_error(L);  /* call 'error' */
    }
};

const luaB_select = function(L) {
    let n = lua.lua_gettop(L);
    if (lua.lua_type(L, 1) === lua.LUA_TSTRING && lua.lua_tostring(L, 1)[0] === "#".charCodeAt(0)) {
        lua.lua_pushinteger(L, n - 1);
        return 1;
    } else {
        let i = lauxlib.luaL_checkinteger(L, 1);
        if (i < 0) i = n + i;
        else if (i > n) i = n;
        lauxlib.luaL_argcheck(L, 1 <= i, 1, lua.to_luastring("index out of range", true));
        return n - i;
    }
};

/*
** Continuation function for 'pcall' and 'xpcall'. Both functions
** already pushed a 'true' before doing the call, so in case of success
** 'finishpcall' only has to return everything in the stack minus
** 'extra' values (where 'extra' is exactly the number of items to be
** ignored).
*/
const finishpcall = function(L, status, extra) {
    if (status !== lua.LUA_OK && status !== lua.LUA_YIELD) {  /* error? */
        lua.lua_pushboolean(L, 0);  /* first result (false) */
        lua.lua_pushvalue(L, -2);  /* error message */
        return 2;  /* return false, msg */
    } else
        return lua.lua_gettop(L) - extra;
};

const luaB_pcall = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lua.lua_pushboolean(L, 1);  /* first result if no errors */
    lua.lua_insert(L, 1);  /* put it in place */
    let status = lua.lua_pcallk(L, lua.lua_gettop(L) - 2, lua.LUA_MULTRET, 0, 0, finishpcall);
    return finishpcall(L, status, 0);
};

/*
** Do a protected call with error handling. After 'lua_rotate', the
** stack will have <f, err, true, f, [args...]>; so, the function passes
** 2 to 'finishpcall' to skip the 2 first values when returning results.
*/
const luaB_xpcall = function(L) {
    let n = lua.lua_gettop(L);
    lauxlib.luaL_checktype(L, 2, lua.LUA_TFUNCTION);  /* check error function */
    lua.lua_pushboolean(L, 1);  /* first result */
    lua.lua_pushvalue(L, 1);  /* function */
    lua.lua_rotate(L, 3, 2);  /* move them below function's arguments */
    let status = lua.lua_pcallk(L, n - 2, lua.LUA_MULTRET, 2, 2, finishpcall);
    return finishpcall(L, status, 2);
};

// TODO: does it overwrite the upvalue of the previous closure ?
const load_aux = function(L, status, envidx) {
    if (status === lua.LUA_OK) {
        if (envidx !== 0) {  /* 'env' parameter? */
            lua.lua_pushvalue(L, envidx);  /* environment for loaded function */
            if (!lua.lua_setupvalue(L, -2, 1))  /* set it as 1st upvalue */
                lua.lua_pop(L, 1);  /* remove 'env' if not used by previous call */
        }
        return 1;
    } else {  /* error (message is on top of the stack) */
        lua.lua_pushnil(L);
        lua.lua_insert(L, -2);  /* put before error message */
        return 2;  /* return nil plus error message */
    }
};

/*
** reserved slot, above all arguments, to hold a copy of the returned
** string to avoid it being collected while parsed. 'load' has four
** optional arguments (chunk, source name, mode, and environment).
*/
const RESERVEDSLOT = 5;

/*
** Reader for generic 'load' function: 'lua_load' uses the
** stack for internal stuff, so the reader cannot change the
** stack top. Instead, it keeps its resulting string in a
** reserved slot inside the stack.
*/
const generic_reader = function(L, ud) {
    lauxlib.luaL_checkstack(L, 2, lua.to_luastring("too many nested functions", true));
    lua.lua_pushvalue(L, 1);  /* get function */
    lua.lua_call(L, 0, 1);  /* call it */
    if (lua.lua_isnil(L, -1)) {
        lua.lua_pop(L, 1);  /* pop result */
        return null;
    } else if (!lua.lua_isstring(L, -1))
        lauxlib.luaL_error(L, lua.to_luastring("reader function must return a string", true));
    lua.lua_replace(L, RESERVEDSLOT);  /* save string in reserved slot */
    return lua.lua_tostring(L, RESERVEDSLOT);
};

const luaB_load = function(L) {
    let s = lua.lua_tostring(L, 1);
    let mode = lauxlib.luaL_optstring(L, 3, lua.to_luastring("bt", true));
    let env = !lua.lua_isnone(L, 4) ? 4 : 0;  /* 'env' index or 0 if no 'env' */
    let status;
    if (s !== null) {  /* loading a string? */
        let chunkname = lauxlib.luaL_optstring(L, 2, s);
        status = lauxlib.luaL_loadbufferx(L, s, s.length, chunkname, mode);
    } else {  /* loading from a reader function */
        let chunkname = lauxlib.luaL_optstring(L, 2, lua.to_luastring("=(load)", true));
        lauxlib.luaL_checktype(L, 1, lua.LUA_TFUNCTION);
        lua.lua_settop(L, RESERVEDSLOT);  /* create reserved slot */
        status = lua.lua_load(L, generic_reader, null, chunkname, mode);
    }
    return load_aux(L, status, env);
};

const luaB_loadfile = function(L) {
    let fname = lauxlib.luaL_optstring(L, 1, null);
    let mode = lauxlib.luaL_optstring(L, 2, null);
    let env = !lua.lua_isnone(L, 3) ? 3 : 0;  /* 'env' index or 0 if no 'env' */
    let status = lauxlib.luaL_loadfilex(L, fname, mode);
    return load_aux(L, status, env);
};

const dofilecont = function(L, d1, d2) {
    return lua.lua_gettop(L) - 1;
};

const luaB_dofile = function(L) {
    let fname = lauxlib.luaL_optstring(L, 1, null);
    lua.lua_settop(L, 1);
    if (lauxlib.luaL_loadfile(L, fname) !== lua.LUA_OK)
        return lua.lua_error(L);
    lua.lua_callk(L, 0, lua.LUA_MULTRET, 0, dofilecont);
    return dofilecont(L, 0, 0);
};

const base_funcs = {
    "assert":         luaB_assert,
    "collectgarbage": luaB_collectgarbage,
    "dofile":         luaB_dofile,
    "error":          luaB_error,
    "getmetatable":   luaB_getmetatable,
    "ipairs":         luaB_ipairs,
    "load":           luaB_load,
    "loadfile":       luaB_loadfile,
    "next":           luaB_next,
    "pairs":          luaB_pairs,
    "pcall":          luaB_pcall,
    "print":          luaB_print,
    "rawequal":       luaB_rawequal,
    "rawget":         luaB_rawget,
    "rawlen":         luaB_rawlen,
    "rawset":         luaB_rawset,
    "select":         luaB_select,
    "setmetatable":   luaB_setmetatable,
    "tonumber":       luaB_tonumber,
    "tostring":       luaB_tostring,
    "type":           luaB_type,
    "xpcall":         luaB_xpcall
};

const luaopen_base = function(L) {
    /* open lib into global table */
    lua.lua_pushglobaltable(L);
    lauxlib.luaL_setfuncs(L, base_funcs, 0);
    /* set global _G */
    lua.lua_pushvalue(L, -1);
    lua.lua_setfield(L, -2, lua.to_luastring("_G", true));
    /* set global _VERSION */
    lua.lua_pushliteral(L, lua.LUA_VERSION);
    lua.lua_setfield(L, -2, lua.to_luastring("_VERSION", true));
    return 1;
};

module.exports.luaopen_base = luaopen_base;
