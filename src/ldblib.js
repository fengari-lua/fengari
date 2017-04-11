"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');


const dblib = {
};

// Only with Node
if (typeof require === "function") {
    let fs = false;
    try {
        fs = require('fs');
    } catch (e) {}

    if (fs) {
        const readlineSync = require('readline-sync');
        readlineSync.setDefaultOptions({
            prompt: 'lua_debug> '
        });

        // TODO: if in browser, use a designated input in the DOM ?  
        const db_debug = function(L) {
            for (;;) {
                let input = readlineSync.prompt();

                if (input === "cont")
                    return 0;

                if (input.length === 0)
                    continue;

                let buffer = lua.to_luastring(input);
                if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, lua.to_luastring("=(debug command)"))
                    || lapi.lua_pcall(L, 0, 0, 0)) {
                    lauxlib.lua_writestringerror(`${lapi.lua_tojsstring(L, -1)}\n`);
                }
                lapi.lua_settop(L, 0);  /* remove eventual returns */
            }
        };

        dblib.debug = db_debug;
    }
}

const luaopen_debug = function(L) {
    lauxlib.luaL_newlib(L, dblib);
    return 1;
};

module.exports.luaopen_debug = luaopen_debug;
