"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');
const luaconf = require('./luaconf.js');


/*
** Operations that an object must define to mimic a table
** (some functions only need some of them)
*/
const TAB_R  = 1;               /* read */
const TAB_W  = 2;               /* write */
const TAB_L  = 4;               /* length */
const TAB_RW = (TAB_R | TAB_W); /* read/write */

const checkfield = function(L, key, n) {
    lua.lua_pushstring(L, key);
    return lua.lua_rawget(L, -n) !== lua.LUA_TNIL;
};

/*
** Check that 'arg' either is a table or can behave like one (that is,
** has a metatable with the required metamethods)
*/
const checktab = function(L, arg, what) {
    if (lua.lua_type(L, arg) !== lua.LUA_TTABLE) {  /* is it not a table? */
        let n = 1;
        if (lua.lua_getmetatable(L, arg) &&  /* must have metatable */
            (!(what & TAB_R) || checkfield(L, lua.to_luastring("__index", true), ++n)) &&
            (!(what & TAB_W) || checkfield(L, lua.to_luastring("__newindex", true), ++n)) &&
            (!(what & TAB_L) || checkfield(L, lua.to_luastring("__len", true), ++n))) {
            lua.lua_pop(L, n);  /* pop metatable and tested metamethods */
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
    lua.lua_geti(L, 1, i);
    if (!lua.lua_isstring(L, -1))
        lauxlib.luaL_error(L, lua.to_luastring("invalid value (%s) at index %d in table for 'concat'"),
            lauxlib.luaL_typename(L, -1), i);

    lauxlib.luaL_addvalue(b);
};

const tinsert = function(L) {
    let e = aux_getn(L, 1, TAB_RW) + 1;  /* first empty element */
    let pos;
    switch (lua.lua_gettop(L)) {
        case 2:
            pos = e;
            break;
        case 3: {
            pos = lauxlib.luaL_checkinteger(L, 2);  /* 2nd argument is the position */
            lauxlib.luaL_argcheck(L, 1 <= pos && pos <= e, 2, lua.to_luastring("position out of bounds", true));
            for (let i = e; i > pos; i--) {  /* move up elements */
                lua.lua_geti(L, 1, i - 1);
                lua.lua_seti(L, 1, i);  /* t[i] = t[i - 1] */
            }
            break;
        }
        default: {
            return lauxlib.luaL_error(L, lua.to_luastring("wrong number of arguments to 'insert'", true));
        }
    }

    lua.lua_seti(L, 1, pos);  /* t[pos] = v */
    return 0;
};

const tremove = function(L) {
    let size = aux_getn(L, 1, TAB_RW);
    let pos = lauxlib.luaL_optinteger(L, 2, size);
    if (pos !== size)  /* validate 'pos' if given */
        lauxlib.luaL_argcheck(L, 1 <= pos && pos <= size + 1, 1, lua.to_luastring("position out of bounds", true));
    lua.lua_geti(L, 1, pos);  /* result = t[pos] */
    for (; pos < size; pos++) {
        lua.lua_geti(L, 1, pos + 1);
        lua.lua_seti(L, 1, pos);  /* t[pos] = t[pos + 1] */
    }
    lua.lua_pushnil(L);
    lua.lua_seti(L, 1, pos);  /* t[pos] = nil */
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
    let tt = !lua.lua_isnoneornil(L, 5) ? 5 : 1;  /* destination table */
    checktab(L, 1, TAB_R);
    checktab(L, tt, TAB_W);
    if (e >= f) {  /* otherwise, nothing to move */
        lauxlib.luaL_argcheck(L, f > 0 || e < luaconf.LUA_MAXINTEGER + f, 3, lua.to_luastring("too many elements to move", true));
        let n = e - f + 1;  /* number of elements to move */
        lauxlib.luaL_argcheck(L, t <= luaconf.LUA_MAXINTEGER - n + 1, 4, lua.to_luastring("destination wrap around", true));

        if (t > e || t <= f || (tt !== 1 && lua.lua_compare(L, 1, tt, lua.LUA_OPEQ) !== 1)) {
            for (let i = 0; i < n; i++) {
                lua.lua_geti(L, 1, f + i);
                lua.lua_seti(L, tt, t + i);
            }
        } else {
            for (let i = n - 1; i >= 0; i--) {
                lua.lua_geti(L, 1, f + i);
                lua.lua_seti(L, tt, t + i);
            }
        }
    }

    lua.lua_pushvalue(L, tt);  /* return destination table */
    return 1;
};

const tconcat = function(L) {
    let last = aux_getn(L, 1, TAB_R);
    let sep = lauxlib.luaL_optlstring(L, 2, []);
    let i = lauxlib.luaL_optinteger(L, 3, 1);
    last = lauxlib.luaL_optinteger(L, 4, last);

    let b = new lauxlib.luaL_Buffer();
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
    let n = lua.lua_gettop(L);  /* number of elements to pack */
    lua.lua_createtable(L, n, 1);  /* create result table */
    lua.lua_insert(L, 1);  /* put it at index 1 */
    for (let i = n; i >= 1; i--)  /* assign elements */
        lua.lua_seti(L, 1, i);
    lua.lua_pushinteger(L, n);
    lua.lua_setfield(L, 1, ["n".charCodeAt(0)]);  /* t.n = number of elements */
    return 1;  /* return table */
};

const unpack = function(L) {
    let i = lauxlib.luaL_optinteger(L, 2, 1);
    let e = lauxlib.luaL_opt(L, lauxlib.luaL_checkinteger, 3, lauxlib.luaL_len(L, 1));
    if (i > e) return 0;  /* empty range */
    let n = e - i;  /* number of elements minus 1 (avoid overflows) */
    if (n >= Number.MAX_SAFE_INTEGER || !lua.lua_checkstack(L, ++n))
        return lauxlib.luaL_error(L, lua.to_luastring("too many results to unpack", true));
    for (; i < e; i++)  /* push arg[i..e - 1] (to avoid overflows) */
        lua.lua_geti(L, 1, i);
    lua.lua_geti(L, 1, e);  /* push last element */
    return n;
};

const l_randomizePivot = function() {
    return Math.floor(Math.random()*1<<32);
};

const RANLIMIT = 100;

const set2 = function(L, i, j) {
    lua.lua_seti(L, 1, i);
    lua.lua_seti(L, 1, j);
};

const sort_comp = function(L, a, b) {
    if (lua.lua_isnil(L, 2))  /* no function? */
        return lua.lua_compare(L, a, b, lua.LUA_OPLT);  /* a < b */
    else {  /* function */
        lua.lua_pushvalue(L, 2);    /* push function */
        lua.lua_pushvalue(L, a-1);  /* -1 to compensate function */
        lua.lua_pushvalue(L, b-2);  /* -2 to compensate function and 'a' */
        lua.lua_call(L, 2, 1);      /* call function */
        let res = lua.lua_toboolean(L, -1);  /* get result */
        lua.lua_pop(L, 1);          /* pop result */
        return res;
    }
};

const partition = function(L, lo, up) {
    let i = lo;  /* will be incremented before first use */
    let j = up - 1;  /* will be decremented before first use */
    /* loop invariant: a[lo .. i] <= P <= a[j .. up] */
    for (;;) {
        /* next loop: repeat ++i while a[i] < P */
        while (lua.lua_geti(L, 1, ++i), sort_comp(L, -1, -2)) {
            if (i == up - 1)  /* a[i] < P  but a[up - 1] == P  ?? */
                lauxlib.luaL_error(L, lua.to_luastring("invalid order function for sorting"));
            lua.lua_pop(L, 1);  /* remove a[i] */
        }
        /* after the loop, a[i] >= P and a[lo .. i - 1] < P */
        /* next loop: repeat --j while P < a[j] */
        while (lua.lua_geti(L, 1, --j), sort_comp(L, -3, -1)) {
            if (j < i)  /* j < i  but  a[j] > P ?? */
                lauxlib.luaL_error(L, lua.to_luastring("invalid order function for sorting"));
            lua.lua_pop(L, 1);  /* remove a[j] */
        }
        /* after the loop, a[j] <= P and a[j + 1 .. up] >= P */
        if (j < i) {  /* no elements out of place? */
            /* a[lo .. i - 1] <= P <= a[j + 1 .. i .. up] */
            lua.lua_pop(L, 1);  /* pop a[j] */
            /* swap pivot (a[up - 1]) with a[i] to satisfy pos-condition */
            set2(L, up - 1, i);
            return i;
        }
        /* otherwise, swap a[i] - a[j] to restore invariant and repeat */
        set2(L, i, j);
    }
};

const choosePivot = function(lo, up, rnd) {
    let r4 = Math.floor((up - lo) / 4);  /* range/4 */
    let p = rnd % (r4 * 2) + (lo + r4);
    assert(lo + r4 <= p && p <= up - r4);
    return p;
};

const auxsort = function(L, lo, up, rnd) {
    while (lo < up) {  /* loop for tail recursion */
        /* sort elements 'lo', 'p', and 'up' */
        lua.lua_geti(L, 1, lo);
        lua.lua_geti(L, 1, up);
        if (sort_comp(L, -1, -2))  /* a[up] < a[lo]? */
            set2(L, lo, up);  /* swap a[lo] - a[up] */
        else
            lua.lua_pop(L, 2);  /* remove both values */
        if (up - lo == 1)  /* only 2 elements? */
            return;  /* already sorted */
        let p;  /* Pivot index */
        if (up - lo < RANLIMIT || rnd === 0)  /* small interval or no randomize? */
            p = Math.floor((lo + up)/2);  /* middle element is a good pivot */
        else  /* for larger intervals, it is worth a random pivot */
            p = choosePivot(lo, up, rnd);
        lua.lua_geti(L, 1, p);
        lua.lua_geti(L, 1, lo);
        if (sort_comp(L, -2, -1))  /* a[p] < a[lo]? */
            set2(L, p, lo);  /* swap a[p] - a[lo] */
        else {
            lua.lua_pop(L, 1);  /* remove a[lo] */
            lua.lua_geti(L, 1, up);
            if (sort_comp(L, -1, -2))  /* a[up] < a[p]? */
                set2(L, p, up);  /* swap a[up] - a[p] */
            else
                lua.lua_pop(L, 2);
        }
        if (up - lo == 2)  /* only 3 elements? */
            return;  /* already sorted */
        lua.lua_geti(L, 1, p);  /* get middle element (Pivot) */
        lua.lua_pushvalue(L, -1);  /* push Pivot */
        lua.lua_geti(L, 1, up - 1);  /* push a[up - 1] */
        set2(L, p, up - 1);  /* swap Pivot (a[p]) with a[up - 1] */
        p = partition(L, lo, up);
        let n;
        /* a[lo .. p - 1] <= a[p] == P <= a[p + 1 .. up] */
        if (p - lo < up - p) {  /* lower interval is smaller? */
            auxsort(L, lo, p - 1, rnd);  /* call recursively for lower interval */
            n = p - lo;  /* size of smaller interval */
            lo = p + 1;  /* tail call for [p + 1 .. up] (upper interval) */
        } else {
            auxsort(L, p + 1, up, rnd);  /* call recursively for upper interval */
            n = up - p;  /* size of smaller interval */
            up = p - 1;  /* tail call for [lo .. p - 1]  (lower interval) */
        }
        if ((up - lo) / 128 > n) /* partition too imbalanced? */
            rnd = l_randomizePivot();  /* try a new randomization */
    }  /* tail call auxsort(L, lo, up, rnd) */
};

const sort = function(L) {
    let n = aux_getn(L, 1, TAB_RW);
    if (n > 1) {  /* non-trivial interval? */
        lauxlib.luaL_argcheck(L, n < Number.MAX_SAFE_INTEGER, 1, lua.to_luastring("array too big", true));
        if (!lua.lua_isnoneornil(L, 2))  /* is there a 2nd argument? */
            lauxlib.luaL_checktype(L, 2, lua.LUA_TFUNCTION);  /* must be a function */
        lua.lua_settop(L, 2);  /* make sure there are two arguments */
        auxsort(L, 1, n, 0);
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
