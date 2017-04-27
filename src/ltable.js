/*jshint esversion: 6 */
"use strict";

const defs    = require('./defs.js');
const lobject = require('./lobject.js');
const CT      = defs.constant_types;


const ordered_intindexes = function(table) {
    return [...table.value.keys()]
        .filter(e => typeof e === 'number' && e % 1 === 0 && e > 0)  // Only integer indexes
        .sort(function (a, b) {
            return a > b ? 1 : -1;
        });
};

const ordered_indexes = function(table) {
    return [...table.value.keys()]
        .sort(function(a, b) {
            if (typeof a !== "number" || a <= 0) return 1;
            if (typeof b !== "number" || b <= 0) return -1;
            return a > b ? 1 : -1;
        });
};

const luaH_new = function(L) {
    let t = new Map();
    return t;
};

/*
** Try to find a boundary in table 't'. A 'boundary' is an integer index
** such that t[i] is non-nil and t[i+1] is nil (and 0 if t[1] is nil).
*/
const luaH_getn = function(table) {
    let indexes = ordered_intindexes(table);
    let len = indexes.length;

    // If first index != 1, length is 0
    if (indexes[0] !== 1) return 0;

    for (let i = 0; i < len; i++) {
        let key = indexes[i];

        if (!lobject.table_index(table, key).ttisnil() // t[key] is non-nil
            && (indexes[i + 1] - key > 1 || lobject.table_index(table, indexes[i + 1]).ttisnil())) { // gap with next key or next value is nil
            return indexes[i];
        }
    }

    return 0;
};

const luaH_next = function(L, table, keyI) {
    let keyO = L.stack[keyI];
    let key = lobject.table_keyValue(keyO);
    let indexes = ordered_indexes(table);

    if (indexes.length === 0) return 0;

    let i = indexes.indexOf(key);

    if ((i >= 0 || key === null) && i < indexes.length - 1) {
        if (key === null) i = -1;
        let nidx = indexes[i+1];
        let tnidx = typeof nidx;

        if (tnidx === 'number' && nidx % 1 === 0)
            L.stack[keyI] = new lobject.TValue(CT.LUA_TNUMINT, indexes[i + 1]);
        else if (tnidx === 'string')
            L.stack[keyI] = new lobject.TValue(CT.LUA_TLNGSTR, indexes[i + 1].split('|').map(e => Number.parseInt(e)).slice(0, -1));
        else
            L.stack[keyI] = indexes[i + 1];

        L.stack[keyI + 1] = table.value.get(indexes[i + 1]);
        return 1;
    }

    return 0;
};

module.exports.luaH_new = luaH_new;
module.exports.luaH_next = luaH_next;
module.exports.luaH_getn = luaH_getn;
