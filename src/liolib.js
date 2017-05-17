"use strict";

const fs      = require('fs');

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');


const IO_PREFIX = "_IO_";
const IOPREF_LEN = IO_PREFIX.length;
const IO_INPUT = lua.to_luastring(IO_PREFIX + "input");
const IO_OUTPUT = lua.to_luastring(IO_PREFIX + "output");

const tolstream = function(L) {
    return lauxlib.luaL_checkudata(L, 1, lauxlib.LUA_FILEHANDLE);
};

const isclosed = function(p) {
    return p.closef === null;
};

const io_type = function(L) {
    lauxlib.luaL_checkany(L, 1);
    let p = lauxlib.luaL_testudata(L, 1, lauxlib.LUA_FILEHANDLE);
    if (p === null)
        lua.lua_pushnil(L);  /* not a file */
    else if (isclosed(p))
        lua.lua_pushliteral(L, "closed file");
    else
        lua.lua_pushliteral(L, "file");
    return 1;
};

const f_tostring = function(L) {
    let p = tolstream(L);
    if (isclosed(p))
        lua.lua_pushliteral(L, "file (closed)");
    else
        lua.lua_pushstring(L, lua.to_luastring(`file (${p.f.toString()})`));
    return 1;
};

const tofile = function(L) {
    let p = tolstream(L);
    if (isclosed(p))
        lauxlib.luaL_error(L, lua.to_luastring("attempt to use a closed file"));
    if (process.env.LUA_USE_APICHECK && !(p.f)) throw Error("assertion failed");
    return p.f;
};

const newprefile = function(L) {
    let p = lua.lua_newuserdata(L);
    p.f = null;
    p.closef = null;
    lauxlib.luaL_setmetatable(L, lauxlib.LUA_FILEHANDLE);
    return p;
};

const aux_close = function(L) {
    let p = tolstream(L);
    let cf = p.closef;
    p.closef = null;
    return cf(L);
};

const io_close = function(L) {
    if (lua.lua_isnone(L, 1))  /* no argument? */
        lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, IO_OUTPUT);  /* use standard output */
    tofile(L);  /* make sure argument is an open stream */
    return aux_close(L);
};

const getiofile = function(L, findex) {
    lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, findex);
    let p = lua.lua_touserdata(L, -1);
    if (isclosed(p))
        lauxlib.luaL_error(L, lua.to_luastring("standard %s file is closed"), findex.slice(IOPREF_LEN));
    return p.f;
};

const g_write = function(L, f, arg) {
    let nargs = lua.lua_gettop(L) - arg;
    let status = true;
    let err;
    for (; nargs--; arg++) {
        let s = lauxlib.luaL_checklstring(L, arg);
        try {
            status = status && (fs.writeSync(f.fd, Uint8Array.from(s)) === s.length);
        } catch (e) {
            status = false;
            err = e;
        }
    }
    if (status) return 1;  /* file handle already on stack top */
    else return lauxlib.luaL_fileresult(L, status, null, err);
};

const io_write = function(L) {
    return g_write(L, getiofile(L, IO_OUTPUT), 1);
};

const f_write = function(L) {
    let f = tofile(L);
    lua.lua_pushvalue(L, 1); /* push file at the stack top (to be returned) */
    return g_write(L, f, 2);
};

const iolib = {
    "close": io_close,
    "type": io_type,
    "write": io_write
};

const flib = {
    "close": io_close,
    "write": f_write,
    "__tostring": f_tostring
};

const createmeta = function(L) {
    lauxlib.luaL_newmetatable(L, lauxlib.LUA_FILEHANDLE);  /* create metatable for file handles */
    lua.lua_pushvalue(L, -1);  /* push metatable */
    lua.lua_setfield(L, -2, lua.to_luastring("__index", true));  /* metatable.__index = metatable */
    lauxlib.luaL_setfuncs(L, flib, 0);  /* add file methods to new metatable */
    lua.lua_pop(L, 1);  /* pop new metatable */
};

const io_noclose = function(L) {
    let p = tolstream(L);
    p.closef = io_noclose;
    lua.lua_pushnil(L);
    lua.lua_pushliteral(L, "cannot close standard file");
    return 2;
};

const createstdfile = function(L, f, k, fname) {
    let p = newprefile(L);
    p.f = f;
    p.closef = io_noclose;
    if (k !== null) {
        lua.lua_pushvalue(L, -1);
        lua.lua_setfield(L, lua.LUA_REGISTRYINDEX, k);  /* add file to registry */
    }
    lua.lua_setfield(L, -2, fname);  /* add file to module */
};

const luaopen_io = function(L) {
    lauxlib.luaL_newlib(L, iolib);
    createmeta(L);
    /* create (and set) default files */
    createstdfile(L, process.stdin, IO_INPUT, lua.to_luastring("stdin"));
    createstdfile(L, process.stdout, IO_OUTPUT, lua.to_luastring("stdout"));
    createstdfile(L, process.stderr, null, lua.to_luastring("stderr"));
    return 1;
};

module.exports.luaopen_io = luaopen_io;
