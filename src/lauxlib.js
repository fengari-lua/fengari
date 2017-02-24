/*jshint esversion: 6 */
"use strict";

const assert = require('assert');

const lstate = require('./lstate.js');
const lapi   = require('./lapi.js');
const lua    = require('./lua.js');
const ldebug = require('./ldebug.js');
const CT     = lua.constant_types;

const LUA_LOADED_TABLE = "_LOADED";


class luaL_Buffer {
    constructor(L) {
        this.L = L;
        this.b = "";
    }
}

/*
** search for 'objidx' in table at index -1.
** return 1 + string at top if find a good name.
*/
const findfield = function(L, objidx, level) {
    if (level === 0 || !lapi.lua_istable(L, -1))
        return 0;  /* not found */

    lapi.lua_pushnil(L);  /* start 'next' loop */

    while (lapi.lua_next(L, -2)) {  /* for each pair in table */
        if (lapi.lua_type(L, -2) === CT.LUA_TSTRING) {  /* ignore non-string keys */
            if (lapi.lua_rawequal(L, objidx, -1)) {  /* found object? */
                lapi.lua_pop(L, 1);  /* remove value (but keep name) */
                return 1;
            } else if (findfield(L, objidx, level - 1)) {  /* try recursively */
                lapi.lua_remove(L, -2);  /* remove table (but keep name) */
                lapi.lua_pushliteral(L, ".");
                lapi.lua_insert(L, -2);  /* place '.' between the two names */
                lapi.lua_concat(L, 3);
                return 1;
            }
        }
        lapi.lua_pop(L, 1);  /* remove value */
    }

    return 0;  /* not found */
};

/*
** Search for a name for a function in all loaded modules
*/
const pushglobalfuncname = function(L, ar) {
    let top = lapi.lua_gettop(L);
    ldebug.lua_getinfo(L, 'f', ar);  /* push function */
    lapi.lua_getfield(L, lua.LUA_REGISTRYINDEX, lua.LUA_LOADED_TABLE);
    if (findfield(L, top + 1, 2)) {
        let name = lapi.lua_tostring(L, -1);
        if (name.startsWith("_G.")) {
            lapi.lua_pushstring(L, name.slice(3));  /* name start with '_G.'? */
            lapi.lua_remove(L, -2);  /* name start with '_G.'? */
        }
        lapi.lua_copy(L, -1, top + 1);  /* name start with '_G.'? */
        lapi.lua_pop(L, 2);  /* name start with '_G.'? */
    } else {
        lapi.lua_settop(L, top);  /* remove function and global table */
        return 0;
    }
};

const panic = function(L) {
    throw new Error(`PANIC: unprotected error in call to Lua API (${lapi.lua_tostring(L, -1)})`);
};

const luaL_argerror = function(L, arg, extramsg) {
    let ar = new lua.lua_Debug();

    if (!ldebug.lua_getstack(L, 0, ar))  /* no stack frame? */
        return luaL_error(L, 'bad argument #%d (%s)', arg, extramsg);

    ldebug.lua_getinfo(L, 'n', ar);

    if (ar.namewhat === 'method') {
        arg--;  /* do not count 'self' */
        if (arg === 0)  /* error is in the self argument itself? */
            return luaL_error(L, "calling '%s' on  bad self (%s)", ar.name, extramsg);
    }

    if (ar.name === null)
        ar.name = pushglobalfuncname(L, ar) ? lapi.lua_tostring(L, -1) : "?";

    return luaL_error(L, `bad argument #${arg} to '${ar.name}' (${extramsg})`);
};

const typeerror = function(L, arg, tname) {
    let typearg;
    if (luaL_getmetafield(L, arg, "__name") === CT.LUA_TSTRING)
        typearg = lapi.lua_tostring(L, -1);
    else if (lapi.lua_type(L, arg) === CT.LUA_TLIGHTUSERDATA)
        typearg = "light userdata";
    else
        typearg = luaL_typename(L, arg);

    let msg = lapi.lua_pushstring(L, `${tname} expected, got ${typearg}`);
    return luaL_argerror(L, arg, msg);
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
    if (!cond) luaL_argerror(L, arg, extramsg);
};

const luaL_checkany = function(L, arg) {
    if (lapi.lua_type(L, arg) === CT.LUA_TNONE)
        luaL_argerror(L, arg, "value expected");
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
        luaL_argerror(L, arg, "number has no integer representation");
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

const luaL_buffinit = function(L, B) {
    B.L = L;
    B.b = "";
};

const luaL_addlstring = function(B, s) {
    B.b += s;
};

const luaL_addstring = luaL_addlstring;

const luaL_pushresult = function(B) {
    let L = B.L;
    lapi.lua_pushstring(L, B.b);
};

const luaL_addvalue = function(B) {
    let L = B.L;
    let s = lapi.lua_tostring(L, -1);
    // TODO: buffonstack ? necessary ?
    luaL_addstring(B, s);
    lapi.lua_remove(L, -1);
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

const luaL_len = function(L, idx) {
    lapi.lua_len(L, idx);
    let l = lapi.lua_tointegerx(L, -1);
    if (l === false)
        luaL_error(L, "object length is not an integer");
    lapi.lua_pop(L, 1);  /* remove object */
    return l;
};

const luaL_tolstring = function(L, idx) {
    if (luaL_callmeta(L, idx, "__tostring")) {
        if (!lapi.lua_isstring(L, -1))
            luaL_error(L, "'__tostring' must return a string");
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
                let kind = tt === CT.LUA_TSTRING ? lapi.lua_tostring(L, -1) : luaL_typename(L, idx);
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
            luaL_error(L, `stack overflow (${msg})`);
        else
            luaL_error(L, 'stack overflow');
    }
};

const luaL_newlib = function(L, l) {
    lapi.lua_createtable(L);
    luaL_setfuncs(L, l, 0);
};

module.exports.LUA_LOADED_TABLE  = LUA_LOADED_TABLE;
module.exports.luaL_addlstring   = luaL_addlstring;
module.exports.luaL_addstring    = luaL_addstring;
module.exports.luaL_addvalue     = luaL_addvalue;
module.exports.luaL_argcheck     = luaL_argcheck;
module.exports.luaL_argerror     = luaL_argerror;
module.exports.luaL_Buffer       = luaL_Buffer;
module.exports.luaL_buffinit     = luaL_buffinit;
module.exports.luaL_callmeta     = luaL_callmeta;
module.exports.luaL_checkany     = luaL_checkany;
module.exports.luaL_checkinteger = luaL_checkinteger;
module.exports.luaL_checklstring = luaL_checklstring;
module.exports.luaL_checkstack   = luaL_checkstack;
module.exports.luaL_checktype    = luaL_checktype;
module.exports.luaL_error        = luaL_error;
module.exports.luaL_getmetafield = luaL_getmetafield;
module.exports.luaL_getsubtable  = luaL_getsubtable;
module.exports.luaL_len          = luaL_len;
module.exports.luaL_newlib       = luaL_newlib;
module.exports.luaL_newstate     = luaL_newstate;
module.exports.luaL_opt          = luaL_opt;
module.exports.luaL_optinteger   = luaL_optinteger;
module.exports.luaL_optlstring   = luaL_optlstring;
module.exports.luaL_optstring    = luaL_optstring;
module.exports.luaL_pushresult   = luaL_pushresult;
module.exports.luaL_requiref     = luaL_requiref;
module.exports.luaL_setfuncs     = luaL_setfuncs;
module.exports.luaL_tolstring    = luaL_tolstring;
module.exports.luaL_typename     = luaL_typename;
module.exports.luaL_where        = luaL_where;