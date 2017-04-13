#!/usr/bin/env node
"use strict";

const lua          = require('../../src/lua.js');
const lapi         = require('../../src/lapi.js');
const lauxlib      = require('../../src/lauxlib.js');
const linit        = require('../../src/linit.js');
const fs           = require('fs');
const readlineSync = require('readline-sync');

const stdin = lua.to_luastring("=stdin");
const _PROMPT = lua.to_luastring("_PROMPT");
const _PROMPT2 = lua.to_luastring("_PROMPT2");

const report = function(L, status) {
    if (status !== lua.thread_status.LUA_OK) {
        lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
        lapi.lua_pop(L, 1);
    }
    return status;
};

const docall = function(L, narg, nres) {
    let status = lapi.lua_pcall(L, narg, nres, 0);
    return status;
};

const dochunk = function(L, status) {
    if (status === lua.thread_status.LUA_OK) {
        status = docall(L, 0, 0);
    }
    return report(L, status);
};

const dofile = function(L, name) {
    return dochunk(L, lauxlib.luaL_loadfile(L, lua.to_luastring(name)));
};

const dostring = function(L, s, name) {
    let buffer = lua.to_luastring(s);
    return dochunk(L, lauxlib.luaL_loadbuffer(L, buffer, buffer.length, lua.to_luastring(name)));
};

const L = lauxlib.luaL_newstate();

let script = 2; // Where to start args from

linit.luaL_openlibs(L);

/* create 'arg' table */
lapi.lua_createtable(L, process.argv.length - (script + 1), script + 1);
for (let i = 0; i < process.argv.length; i++) {
    lapi.lua_pushliteral(L, process.argv[i]);
    lapi.lua_seti(L, -2, i - script); /* TODO: rawseti */
}
lapi.lua_setglobal(L, lua.to_luastring("arg"));

{
    let name = "LUA_INIT"+lua.LUA_VERSUFFIX;
    let init = process.env[name];
    if (!init) {
        name = "LUA_INIT";
        init = process.env[name];
    }
    if (init) {
        let status;
        if (init[0] === '@') {
            status = dofile(L, init.substring(1));
        } else {
            status = dostring(L, init, name);
        }
        if (status !== lua.thread_status.LUA_OK) {
            return process.exit(1);
        }
    }
}

console.log(lua.FENGARI_COPYRIGHT);

for (;;) {
    lapi.lua_getglobal(L, _PROMPT);
    let input = readlineSync.prompt({
        prompt: lapi.lua_tojsstring(L, -1) || '> '
    });
    lapi.lua_pop(L, 1);

    if (input.length === 0)
        continue;

    let status;
    {
        let buffer = lua.to_luastring("return " + input);
        status = lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin);
    }
    if (status !== lua.thread_status.LUA_OK) {
        lapi.lua_pop(L, 1);
        let buffer = lua.to_luastring(input);
        if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin) === lua.thread_status.LUA_OK) {
            status = lua.thread_status.LUA_OK;
        }
    }
    while (status === lua.thread_status.LUA_ERRSYNTAX && lapi.lua_tojsstring(L, -1).endsWith("<eof>")) {
        /* continuation */
        lapi.lua_pop(L, 1);
        lapi.lua_getglobal(L, _PROMPT2);
        input += "\n" + readlineSync.prompt({
            prompt: lapi.lua_tojsstring(L, -1) || '>> '
        });
        lapi.lua_pop(L, 1);
        let buffer = lua.to_luastring(input);
        status = lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin);
    }
    if (status === lua.thread_status.LUA_OK) {
        status = docall(L, 0, lua.LUA_MULTRET);
    }
    if (status === lua.thread_status.LUA_OK) {
        let n = lapi.lua_gettop(L);
        if (n > 0) {  /* any result to be printed? */
            lapi.lua_getglobal(L, lua.to_luastring("print"));
            lapi.lua_insert(L, 1);
            if (lapi.lua_pcall(L, n, 0, 0) != lua.thread_status.LUA_OK) {
                lauxlib.lua_writestringerror(`error calling 'print' (${lapi.lua_tojsstring(L, -1)})\n`);
            }
        }
    } else {
        report(L, status);
    }
    lapi.lua_settop(L, 0);  /* remove eventual returns */
}
