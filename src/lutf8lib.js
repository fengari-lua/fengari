"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');


const iscont = function(p) {
    return p & 0xC0 === 0x80;
};

/* translate a relative string position: negative means back from end */
const u_posrelat = function(pos, len) {
    if (pos >= 0) return pos;
    else if (0 - pos > len) return 0;
    else return len + pos + 1;
};

/*
** offset(s, n, [i])  -> index where n-th character counting from
**   position 'i' starts; 0 means character at 'i'.
*/
const byteoffset = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let n = lauxlib.luaL_checkinteger(L, 2);
    let posi = n >= 0 ? 1 : s.length + 1;
    posi = u_posrelat(lauxlib.luaL_optinteger(L, 3, posi), s.length);
    lauxlib.luaL_argcheck(L, 1 <= posi && --posi <= s.length, 3, "position ot ouf range");

    if (n === 0) {
        /* find beginning of current byte sequence */
        while (posi > 0 && iscont(s.slice(posi))) posi--;
    } else {
        if (iscont(s.slice(posi)))
            lauxlib.luaL_error(L, "initial position is a continuation byte");

        if (n < 0) {
            while (n < 0 && posi > 0) {  /* move back */
                do {  /* find beginning of previous character */
                    posi--;
                } while (posi > 0 && iscont(s.slice(posi)));
                n++;
            }
        } else {
            n--;  /* do not move for 1st character */
            while (n > 0 && posi < s.length) {
                do {  /* find beginning of next character */
                    posi++;
                } while (iscont(s.slice(posi)));  /* (cannot pass final '\0') */
                n--;
            }
        }
    }

    if (n === 0)  /* did it find given character? */
        lapi.lua_pushinteger(L, posi + 1);
    else  /* no such character */
        lapi.lua_pushnil(L);

    return 1;
};

const funcs = {
    "offset": byteoffset
};

/* pattern to match a single UTF-8 character */
const UTF8PATT = "[\0-\x7F\xC2-\xF4][\x80-\xBF]*";

const luaopen_utf8 = function(L) {
    lauxlib.luaL_newlib(L, funcs);
    lapi.lua_pushstring(L, UTF8PATT);
    lapi.lua_setfield(L, -2, "charpattern");
    return 1;
};

module.exports.luaopen_utf8 = luaopen_utf8;