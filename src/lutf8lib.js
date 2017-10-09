"use strict";

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');

const MAXUNICODE = 0x10FFFF;

const iscont = function(p) {
    let c = p & 0xC0;
    return c === 0x80;
};

/* translate a relative string position: negative means back from end */
const u_posrelat = function(pos, len) {
    if (pos >= 0) return pos;
    else if (0 - pos > len) return 0;
    else return len + pos + 1;
};

/*
** Decode one UTF-8 sequence, returning NULL if byte sequence is invalid.
*/
const limits = [0xFF, 0x7F, 0x7FF, 0xFFFF];
const utf8_decode = function(s, pos) {
    let c = s[pos];
    let res = 0;  /* final result */
    if (c < 0x80)  /* ascii? */
        res = c;
    else {
        let count = 0;  /* to count number of continuation bytes */
        while (c & 0x40) {  /* still have continuation bytes? */
            let cc = s[pos + (++count)];  /* read next byte */
            if ((cc & 0xC0) !== 0x80)  /* not a continuation byte? */
                return null;  /* invalid byte sequence */
            res = (res << 6) | (cc & 0x3F);  /* add lower 6 bits from cont. byte */
            c <<= 1;  /* to test next bit */
        }
        res |= ((c & 0x7F) << (count * 5));  /* add first byte */
        if (count > 3 || res > MAXUNICODE || res <= limits[count])
            return null;  /* invalid byte sequence */
        pos += count;  /* skip continuation bytes read */
    }

    return {
        code: res,
        pos: pos + 1
    };
};

/*
** utf8len(s [, i [, j]]) --> number of characters that start in the
** range [i,j], or nil + current position if 's' is not well formed in
** that interval
*/
const utflen = function(L) {
    let n = 0;
    let s = lauxlib.luaL_checkstring(L, 1);
    let len = s.length;
    let posi = u_posrelat(lauxlib.luaL_optinteger(L, 2, 1), len);
    let posj = u_posrelat(lauxlib.luaL_optinteger(L, 3, -1), len);

    lauxlib.luaL_argcheck(L, 1 <= posi && --posi <= len, 2, lua.to_luastring("initial position out of string"));
    lauxlib.luaL_argcheck(L, --posj < len, 3, lua.to_luastring("final position out of string"));

    while (posi <= posj) {
        let dec = utf8_decode(s, posi);
        if (dec === null) { /* conversion error? */
            lua.lua_pushnil(L);  /* return nil ... */
            lua.lua_pushinteger(L, posi + 1);  /* ... and current position */
            return 2;
        }
        posi = dec.pos;
        n++;
    }
    lua.lua_pushinteger(L, n);
    return 1;
};

const pushutfchar = function(L, arg) {
    let code = lauxlib.luaL_checkinteger(L, arg);
    lauxlib.luaL_argcheck(L, 0 <= code && code <= MAXUNICODE, arg, lua.to_luastring("value out of range", true));
    lua.lua_pushstring(L, lua.to_luastring(String.fromCodePoint(code)));
};

/*
** utfchar(n1, n2, ...)  -> char(n1)..char(n2)...
*/
const utfchar = function(L) {
    let n = lua.lua_gettop(L);  /* number of arguments */
    if (n === 1)  /* optimize common case of single char */
        pushutfchar(L, 1);
    else {
        let b = new lauxlib.luaL_Buffer();
        lauxlib.luaL_buffinit(L, b);
        for (let i = 1; i <= n; i++) {
            pushutfchar(L, i);
            lauxlib.luaL_addvalue(b);
        }
        lauxlib.luaL_pushresult(b);
    }
    return 1;
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

    lauxlib.luaL_argcheck(L, 1 <= posi && --posi <= s.length, 3, lua.to_luastring("position out of range", true));

    if (n === 0) {
        /* find beginning of current byte sequence */
        while (posi > 0 && iscont(s[posi])) posi--;
    } else {
        if (iscont(s[posi]))
            lauxlib.luaL_error(L, lua.to_luastring("initial position is a continuation byte", true));

        if (n < 0) {
            while (n < 0 && posi > 0) {  /* move back */
                do {  /* find beginning of previous character */
                    posi--;
                } while (posi > 0 && iscont(s[posi]));
                n++;
            }
        } else {
            n--;  /* do not move for 1st character */
            while (n > 0 && posi < s.length) {
                do {  /* find beginning of next character */
                    posi++;
                } while (iscont(s[posi]));  /* (cannot pass final '\0') */
                n--;
            }
        }
    }

    if (n === 0)  /* did it find given character? */
        lua.lua_pushinteger(L, posi + 1);
    else  /* no such character */
        lua.lua_pushnil(L);

    return 1;
};

/*
** codepoint(s, [i, [j]])  -> returns codepoints for all characters
** that start in the range [i,j]
*/
const codepoint = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let posi = u_posrelat(lauxlib.luaL_optinteger(L, 2, 1), s.length);
    let pose = u_posrelat(lauxlib.luaL_optinteger(L, 3, posi), s.length);

    lauxlib.luaL_argcheck(L, posi >= 1, 2, lua.to_luastring("out of range", true));
    lauxlib.luaL_argcheck(L, pose <= s.length, 3, lua.to_luastring("out of range", true));

    if (posi > pose) return 0;  /* empty interval; return no values */
    if (pose - posi >= Number.MAX_SAFE_INTEGER)
        return lauxlib.luaL_error(L, lua.to_luastring("string slice too long", true));
    let n = (pose - posi) + 1;
    lauxlib.luaL_checkstack(L, n, lua.to_luastring("string slice too long", true));
    n = 0;
    for (posi -= 1; posi < pose;) {
        let dec = utf8_decode(s, posi);
        if (dec === null)
            return lauxlib.luaL_error(L, lua.to_luastring("invalid UTF-8 code", true));
        lua.lua_pushinteger(L, dec.code);
        posi = dec.pos;
        n++;
    }
    return n;
};

const iter_aux = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let len = s.length;
    let n = lua.lua_tointeger(L, 2) - 1;

    if (n < 0)  /* first iteration? */
        n = 0;  /* start from here */
    else if (n < len) {
        n++;  /* skip current byte */
        while (iscont(s[n])) n++;  /* and its continuations */
    }

    if (n >= len)
        return 0;  /* no more codepoints */
    else {
        let dec = utf8_decode(s, n);
        if (dec === null || iscont(s[dec.pos]))
            return lauxlib.luaL_error(L, lua.to_luastring("invalid UTF-8 code", true));
        lua.lua_pushinteger(L, n + 1);
        lua.lua_pushinteger(L, dec.code);
        return 2;
    }
};

const iter_codes = function(L) {
    lauxlib.luaL_checkstring(L, 1);
    lua.lua_pushcfunction(L, iter_aux);
    lua.lua_pushvalue(L, 1);
    lua.lua_pushinteger(L, 0);
    return 3;
};

const funcs = {
    "char":      utfchar,
    "codepoint": codepoint,
    "codes":     iter_codes,
    "len":       utflen,
    "offset":    byteoffset
};

/* pattern to match a single UTF-8 character */
const UTF8PATT = [ 91, 0, 45, 127, 194, 45, 244, 93, 91, 128, 45, 191, 93, 42 ];

const luaopen_utf8 = function(L) {
    lauxlib.luaL_newlib(L, funcs);
    lua.lua_pushstring(L, UTF8PATT);
    lua.lua_setfield(L, -2, lua.to_luastring("charpattern", true));
    return 1;
};

module.exports.luaopen_utf8 = luaopen_utf8;
