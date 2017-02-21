/*jshint esversion: 6 */
"use strict";

const assert = require('assert');

const lstate = require('./lstate.js');
const lapi   = require('./lapi.js');
const lua    = require('./lua.js');
const ldebug = require('./ldebug.js');
const CT     = lua.constant_types;

const LUA_LOADED_TABLE = "_LOADED"

const panic = function(L) {
    let msg = `PANIC: unprotected error in call to Lua API (${lapi.lua_tostring(L, -1)})`;
    console.error(msg);
    return 0;
};

// const luaL_argerror = function(L, arg, extramsg) {
//     let ar = new lua.lua_Debug();
// 
//     if (!lapi.lua_getstack(L, 0, ar))  /* no stack frame? */
//         return luaL_error(L, 'bad argument #%d (%s)', arg, extramsg);
// 
//     ldebug.lua_getinfo(L, 'n', ar);
// 
//     if (ar.namewhat === 'method') {
//         arg--;  /* do not count 'self' */
//         if (arg === 0)  /* error is in the self argument itself? */
//             return luaL_error(L, "calling '%s' on  bad self (%s)", ar.name, extramsg);
//     }
// 
//     if (ar.name === null)
//         ar.name = pushglobalfuncname(L, ar) ? lapi.lua_tostring(L, -1) : "?";
// 
//     return luaL_error(L, "bad argument #%d to '%s' (%s)", arg, ar.name, extramsg);
// };

const typeerror = function(L, arg, tname) {
    let typearg;
    if (luaL_getmetafield(L, arg, "__name") === CT.LUA_TSTRING)
        typearg = lapi.lua_tostring(L, -1);
    else if (lapi.lua_type(L, arg) === CT.LUA_TLIGHTUSERDATA)
        typearg = "light userdata";
    else
        typearg = luaL_typename(L, arg);

    throw new Error(`${tname} expected, got ${typearg}`);

    // TODO:
    // let msg = lua_pushstring(L, `${tname} expected, got ${typearg}`);
    // return luaL_argerror(L, arg, msg);
};

const luaL_where = function(L, level) {
    let ar = new lua.lua_Debug();
    if (ldebug.lua_getstack(L, level, ar)) {
        ldebug.lua_getinfo(L, "Sl", ar);
        if (ar.currentline > 0) {
            lapi.lua_pushstring(L, `${ar.short_src}:${ar.currentline}:`);
            return;
        }
    }
    lapi.lua_pushstring(L, "");
};

const luaL_error = function(L, fmt, ...args) {
    let i = 0;

    // TODO: bypassing lua_pushvstring for now
    lapi.lua_pushstring(L, fmt.replace(/(^%[sfIpdcU]|([^%])%[sfIpdcU])/g, function (m, p1, p2, off) {
        return p2 ? p2 + args[i++] : args[i++];
    }));

    return lapi.lua_error(L);
};

const tag_error = function(L, arg, tag) {
    typeerror(L, arg, lapi.lua_typename(L, tag));
};

const luaL_newstate = function() {
    let L = lstate.lua_newstate();
    if (L) lapi.lua_atpanic(L, panic);
    return L;
};


const luaL_typename = function(L, i) {
    return lapi.lua_typename(L, lapi.lua_type(L, i));
};

const luaL_argcheck = function(L, cond, arg, extramsg) {
    if (!cond) throw new Error("bad argument"); // TODO: luaL_argerror
};

const luaL_checkany = function(L, arg) {
    if (lapi.lua_type(L, arg) === CT.LUA_TNONE)
        throw new Error("value expected"); // TODO: luaL_argerror(L, arg, "value expected");
};

const luaL_checktype = function(L, arg, t) {
    if (lapi.lua_type(L, arg) !== t)
        tag_error(L, arg, t);
};

const luaL_checklstring = function(L, arg) {
    let s = lapi.lua_tolstring(L, arg);
    if (!s) tag_error(L, arg, CT.LUA_TSTRING);
    return s;
};

const luaL_optlstring = function(L, arg, def) {
    if (lapi.lua_type(L, arg) <= 0) {
        return def;
    } else return luaL_checklstring(L, arg);
};

const luaL_optstring = luaL_optlstring;

const interror = function(L, arg) {
    if (lapi.lua_isnumber(L, arg))
        throw new Error("number has no integer representation");
    else
        tag_error(L, arg, CT.LUA_TNUMBER);
};

const luaL_checkinteger = function(L, arg) {
    let d = lapi.lua_tointeger(L, arg);
    if (d === false)
        interror(L, arg);
    return d;
};

const luaL_optinteger = function(L, arg, def) {
    return luaL_opt(L, luaL_checkinteger, arg, def);
};

const luaL_opt = function(L, f, n, d) {
    return lapi.lua_type(L, n) <= 0 ? d : f(L, n);
};

const luaL_getmetafield = function(L, obj, event) {
    if (!lapi.lua_getmetatable(L, obj))
        return CT.LUA_TNIL;
    else {
        lapi.lua_pushstring(L, event);
        let tt = lapi.lua_rawget(L, -2);
        if (tt === CT.LUA_TNIL)
            lapi.lua_pop(L, 2);
        return tt;
    }
};

const luaL_callmeta = function(L, obj, event) {
    obj = lapi.lua_absindex(L, obj);
    if (luaL_getmetafield(L, obj, event) === CT.LUA_TNIL)
        return false;

    lapi.lua_pushvalue(L, obj);
    lapi.lua_call(L, 1, 1);

    return true;
};

const luaL_tolstring = function(L, idx) {
    if (luaL_callmeta(L, idx, "__tostring")) {
        if (!lapi.lua_isstring(L, -1))
            throw new Error("'__tostring' must return a string"); // TODO: luaL_error
    } else {
        switch(lapi.lua_type(L, idx)) {
            case CT.LUA_TNUMBER:
            case CT.LUA_TSTRING:
            case CT.LUA_TBOOLEAN:
                lapi.lua_pushstring(L, `${lapi.index2addr(L, idx).value}`);
                break;
            case CT.LUA_TNIL:
                lapi.lua_pushstring(L, `nil`);
                break;
            default:
                let tt = luaL_getmetafield(L, idx, "__name");
                let kind = tt === CT.LUA_TSTRING ? lua_tostring(L, -1) : luaL_typename(L, idx);
                lapi.lua_pushstring(L, `${kind}`); // We can't print memory address in JS
                if (tt !== CT.LUA_TNIL)
                    lapi.lua_remove(L, -2);
                break;
        }
    }

    return lapi.lua_tolstring(L, -1);
};

/*
** Stripped-down 'require': After checking "loaded" table, calls 'openf'
** to open a module, registers the result in 'package.loaded' table and,
** if 'glb' is true, also registers the result in the global table.
** Leaves resulting module on the top.
*/
const luaL_requiref = function(L, modname, openf, glb) {
    luaL_getsubtable(L, lua.LUA_REGISTRYINDEX, LUA_LOADED_TABLE);
    lapi.lua_getfield(L, -1, modname); /* LOADED[modname] */
    if (!lapi.lua_toboolean(L, -1)) {  /* package not already loaded? */
        lapi.lua_pop(L, 1);  /* remove field */
        lapi.lua_pushcfunction(L, openf);
        lapi.lua_pushstring(L, modname);  /* argument to open function */
        lapi.lua_call(L, 1, 1);  /* call 'openf' to open module */
        lapi.lua_pushvalue(L, -1);  /* make copy of module (call result) */
        lapi.lua_setfield(L, -3, modname);  /* LOADED[modname] = module */
    }
    lapi.lua_remove(L, -2);  /* remove LOADED table */
    if (glb) {
        lapi.lua_pushvalue(L, -1);  /* copy of module */
        lapi.lua_setglobal(L, modname);  /* _G[modname] = module */
    }
};

/*
** ensure that stack[idx][fname] has a table and push that table
** into the stack
*/
const luaL_getsubtable = function(L, idx, fname) {
    if (lapi.lua_getfield(L, idx, fname) === CT.LUA_TTABLE)
        return true;  /* table already there */
    else {
        lapi.lua_pop(L, 1);  /* remove previous result */
        idx = lapi.lua_absindex(L, idx);
        lapi.lua_newtable(L);
        lapi.lua_pushvalue(L, -1);  /* copy to be left at top */
        lapi.lua_setfield(L, idx, fname);  /* assign new table to field */
        return false;  /* false, because did not find table there */
    }
};

/*
** set functions from list 'l' into table at top - 'nup'; each
** function gets the 'nup' elements at the top as upvalues.
** Returns with only the table at the stack.
*/
const luaL_setfuncs = function(L, l, nup) {
    luaL_checkstack(L, nup, "too many upvalues");
    for (let lib in l) {  /* fill the table with given functions */
        for (let i = 0; i < nup; i++)  /* copy upvalues to the top */
            lapi.lua_pushvalue(L, -nup);
        lapi.lua_pushcclosure(L, l[lib], nup);  /* closure with those upvalues */
        lapi.lua_setfield(L, -(nup + 2), lib);
    }
    lapi.lua_pop(L, nup);  /* remove upvalues */
};

/*
** Ensures the stack has at least 'space' extra slots, raising an error
** if it cannot fulfill the request. (The error handling needs a few
** extra slots to format the error message. In case of an error without
** this extra space, Lua will generate the same 'stack overflow' error,
** but without 'msg'.)
*/
const luaL_checkstack = function(L, space, msg) {
    if (!lapi.lua_checkstack(L, space)) {
        if (msg)
            throw new Error(L, `stack overflow (${msg})`);
        else
            throw new Error(L, 'stack overflow'); // TODO: luaL_error
    }
};

module.exports.luaL_newstate     = luaL_newstate;
module.exports.luaL_typename     = luaL_typename;
module.exports.luaL_checkany     = luaL_checkany;
module.exports.luaL_checktype    = luaL_checktype;
module.exports.luaL_callmeta     = luaL_callmeta;
module.exports.luaL_getmetafield = luaL_getmetafield;
module.exports.luaL_requiref     = luaL_requiref;
module.exports.luaL_getsubtable  = luaL_getsubtable;
module.exports.luaL_setfuncs     = luaL_setfuncs;
module.exports.luaL_checkstack   = luaL_checkstack;
module.exports.LUA_LOADED_TABLE  = LUA_LOADED_TABLE;
module.exports.luaL_tolstring    = luaL_tolstring;
module.exports.luaL_argcheck     = luaL_argcheck;
module.exports.luaL_checklstring = luaL_checklstring;
module.exports.luaL_optlstring   = luaL_optlstring;
module.exports.luaL_optstring    = luaL_optstring;
module.exports.luaL_checkinteger = luaL_checkinteger;
module.exports.luaL_optinteger   = luaL_optinteger;
module.exports.luaL_opt          = luaL_opt;
module.exports.luaL_where        = luaL_where;
module.exports.luaL_error        = luaL_error;