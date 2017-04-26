"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lstate  = require('./lstate.js');
const ldo     = require('./ldo.js');
const ldebug  = require('./ldebug.js');
const llimit  = require('./llimit.js');
const lobject = require('./lobject.js');


/*
** Operations that an object must define to mimic a table
** (some functions only need some of them)
*/
const TAB_R  = 1;               /* read */
const TAB_W  = 2;               /* write */
const TAB_L  = 4;               /* length */
const TAB_RW = (TAB_R | TAB_W); /* read/write */

const checkfield = function(L, key, n) {
    lapi.lua_pushstring(L, key);
    return lapi.lua_rawget(L, -n) !== lua.LUA_TNIL;
};

/*
** Check that 'arg' either is a table or can behave like one (that is,
** has a metatable with the required metamethods)
*/
const checktab = function(L, arg, what) {
    if (lapi.lua_type(L, arg) !== lua.LUA_TTABLE) {  /* is it not a table? */
        let n = 1;
        if (lapi.lua_getmetatable(L, arg) &&  /* must have metatable */
            (!(what & TAB_R) || checkfield(L, lua.to_luastring("__index", true), ++n)) &&
            (!(what & TAB_W) || checkfield(L, lua.to_luastring("__newindex", true), ++n)) &&
            (!(what & TAB_L) || checkfield(L, lua.to_luastring("__len", true), ++n))) {
            lapi.lua_pop(L, n);  /* pop metatable and tested metamethods */
        }
        else
            lauxlib.luaL_checktype(L, arg, lua.LUA_TTABLE);  /* force an error */
    }
};

const aux_getn = function(L, n, w) {
    checktab(L, n, w | TAB_L);
    return lauxlib.luaL_len(L, n);
};

const addfield = function(L, b, i) {
    lapi.lua_geti(L, 1, i);
    if (!lapi.lua_isstring(L, -1))
        lauxlib.luaL_error(L, lua.to_luastring(`invalid value (${lobject.jsstring(lauxlib.luaL_typename(L, -1))}) at index ${i} in table for 'concat'`));

    lauxlib.luaL_addvalue(b);
};

const tinsert = function(L) {
    let e = aux_getn(L, 1, TAB_RW) + 1;  /* first empty element */
    let pos;
    switch (lapi.lua_gettop(L)) {
        case 2:
            pos = e;
            break;
        case 3: {
            pos = lauxlib.luaL_checkinteger(L, 2);  /* 2nd argument is the position */
            lauxlib.luaL_argcheck(L, 1 <= pos && pos <= e, 2, lua.to_luastring("position out of bounds", true));
            for (let i = e; i > pos; i--) {  /* move up elements */
                lapi.lua_geti(L, 1, i - 1);
                lapi.lua_seti(L, 1, i);  /* t[i] = t[i - 1] */
            }
            break;
        }
        default: {
            return lauxlib.luaL_error(L, lua.to_luastring("wrong number of arguments to 'insert'", true));
        }
    }

    lapi.lua_seti(L, 1, pos);  /* t[pos] = v */
    return 0;
};

const tremove = function(L) {
    let size = aux_getn(L, 1, TAB_RW);
    let pos = lauxlib.luaL_optinteger(L, 2, size);
    if (pos !== size)  /* validate 'pos' if given */
        lauxlib.luaL_argcheck(L, 1 <= pos && pos <= size + 1, 1, lua.to_luastring("position out of bounds", true));
    lapi.lua_geti(L, 1, pos);  /* result = t[pos] */
    for (; pos < size; pos++) {
        lapi.lua_geti(L, 1, pos + 1);
        lapi.lua_seti(L, 1, pos);  /* t[pos] = t[pos + 1] */
    }
    lapi.lua_pushnil(L);
    lapi.lua_seti(L, 1, pos);  /* t[pos] = nil */
    return 1;
};

/*
** Copy elements (1[f], ..., 1[e]) into (tt[t], tt[t+1], ...). Whenever
** possible, copy in increasing order, which is better for rehashing.
** "possible" means destination after original range, or smaller
** than origin, or copying to another table.
*/
const tmove = function(L) {
    let f = lauxlib.luaL_checkinteger(L, 2);
    let e = lauxlib.luaL_checkinteger(L, 3);
    let t = lauxlib.luaL_checkinteger(L, 4);
    let tt = !lapi.lua_isnoneornil(L, 5) ? 5 : 1;  /* destination table */
    checktab(L, 1, TAB_R);
    checktab(L, tt, TAB_W);
    if (e >= f) {  /* otherwise, nothing to move */
        lauxlib.luaL_argcheck(L, f > 0 || e < llimit.LUA_MAXINTEGER + f, 3, lua.to_luastring("too many elements to move", true));
        let n = e - f + 1;  /* number of elements to move */
        lauxlib.luaL_argcheck(L, t <= llimit.LUA_MAXINTEGER - n + 1, 4, lua.to_luastring("destination wrap around", true));

        if (t > e || t <= f || (tt !== 1 && lapi.lua_compare(L, 1, tt, lua.LUA_OPEQ) !== 1)) {
            for (let i = 0; i < n; i++) {
                lapi.lua_geti(L, 1, f + i);
                lapi.lua_seti(L, tt, t + i);
            }
        } else {
            for (let i = n - 1; i >= 0; i--) {
                lapi.lua_geti(L, 1, f + i);
                lapi.lua_seti(L, tt, t + i);
            }
        }
    }

    lapi.lua_pushvalue(L, tt);  /* return destination table */
    return 1;
};

const tconcat = function(L) {
    let last = aux_getn(L, 1, TAB_R);
    let sep = lauxlib.luaL_optlstring(L, 2, "");
    let i = lauxlib.luaL_optinteger(L, 3, 1);
    last = lauxlib.luaL_optinteger(L, 4, last);

    let b = new lauxlib.luaL_Buffer(L);
    lauxlib.luaL_buffinit(L, b);

    for (; i < last; i++) {
        addfield(L, b, i);
        lauxlib.luaL_addlstring(b, sep);
    }

    if (i === last)
        addfield(L, b, i);

    lauxlib.luaL_pushresult(b);

    return 1;
};

const pack = function(L) {
    let n = lapi.lua_gettop(L);  /* number of elements to pack */
    lapi.lua_createtable(L, n, 1);  /* create result table */
    lapi.lua_insert(L, 1);  /* put it at index 1 */
    for (let i = n; i >= 1; i--)  /* assign elements */
        lapi.lua_seti(L, 1, i);
    lapi.lua_pushinteger(L, n);
    lapi.lua_setfield(L, 1, ["n".charCodeAt(0)]);  /* t.n = number of elements */
    return 1;  /* return table */
};

const unpack = function(L) {
    let i = lauxlib.luaL_optinteger(L, 2, 1);
    let e = lauxlib.luaL_opt(L, lauxlib.luaL_checkinteger, 3, lauxlib.luaL_len(L, 1));
    if (i > e) return 0;  /* empty range */
    let n = e - i;  /* number of elements minus 1 (avoid overflows) */
    if (n >= llimit.MAX_INT || !lapi.lua_checkstack(L, ++n))
        return lauxlib.luaL_error(L, lua.to_luastring("too many results to unpack", true));
    for (; i < e; i++)  /* push arg[i..e - 1] (to avoid overflows) */
        lapi.lua_geti(L, 1, i);
    lapi.lua_geti(L, 1, e);  /* push last element */
    return n;
};


// TODO: Maybe do the quicksort after all
const auxsort = function(L) {
    let t = lapi.index2addr(L, 1);

    if (lapi.lua_type(L, 2) !== lua.LUA_TFUNCTION) {  /* no function? */
        [...t.value.entries()]
            .sort(function (a, b) {
                if (typeof a[0] !== 'number') return 1;
                else if (typeof b[0] !== 'number') return -1;
                return lapi.lua_compare_(L, a[1], b[1], lua.LUA_OPLT) === 1 ? -1 : 1;  /* a < b */
            })
            .forEach((e, i) => typeof e[0] === 'number' ? t.value.set(i + 1, e[1]) : true);
    } else {
        [...t.value.entries()]
            .sort(function (a, b) {
                if (typeof a[0] !== 'number') return 1;
                else if (typeof b[0] !== 'number') return -1;

                lapi.lua_pushvalue(L, 2);  /* push function */
                lapi.lua_pushtvalue(L, a[1]);  /* since we use Map.sort, a and b are not on the stack */
                lapi.lua_pushtvalue(L, b[1]);
                lapi.lua_call(L, 2, 1);  /* call function */
                let res = lapi.lua_toboolean(L, -1);  /* get result */
                lapi.lua_pop(L, 1);  /* pop result */
                return res ? -1 : 1;
            })
            .forEach((e, i) => typeof e[0] === 'number' ? t.value.set(i + 1, e[1]) : true);
    }
};

const sort = function(L) {
    let n = aux_getn(L, 1, TAB_RW);
    if (n > 1) {  /* non-trivial interval? */
        lauxlib.luaL_argcheck(L, n < llimit.MAX_INT, 1, lua.to_luastring("array too big", true));
        if (!lapi.lua_isnoneornil(L, 2))  /* is there a 2nd argument? */
            lauxlib.luaL_checktype(L, 2, lua.LUA_TFUNCTION);  /* must be a function */
        lapi.lua_settop(L, 2);  /* make sure there are two arguments */
        auxsort(L);
    }
    return 0;
};

const tab_funcs = {
    "concat": tconcat,
    "insert": tinsert,
    "move":   tmove,
    "pack":   pack,
    "remove": tremove,
    "sort":   sort,
    "unpack": unpack
};

const luaopen_table = function(L) {
    lauxlib.luaL_newlib(L, tab_funcs);
    return 1;
};

module.exports.luaopen_table = luaopen_table;
