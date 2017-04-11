/*jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lobject = require('./lobject.js');
const lua     = require('./lua.js');
const CT      = lua.constant_types;
const nil     = require('./ldo.js').nil;
const Table   = lobject.Table;
const TValue  = lobject.TValue;


Table.prototype.ordered_intindexes = function() {
    return [...this.value.keys()]
        .filter(e => typeof e === 'number' && e % 1 === 0)  // Only integer indexes
        .sort(function (a, b) {
            return a > b ? 1 : -1;
        });
};

Table.prototype.ordered_indexes = function() {
    return [...this.value.keys()]
        .sort(function(a, b) {
            if (typeof a !== "number") return 1;
            if (typeof b !== "number") return -1;
            return a > b ? 1 : -1;
        });
};

/*
** Try to find a boundary in table 't'. A 'boundary' is an integer index
** such that t[i] is non-nil and t[i+1] is nil (and 0 if t[1] is nil).
*/
Table.prototype.luaH_getn = function() {
    // TODO: is this costly ?
    let indexes = this.ordered_intindexes();
    let len = indexes.length;

    for (let i = 0; i < len; i++) {
        let key = indexes[i];

        if (!this.__index(this, key).ttisnil() // t[i] is non-nil
            && (i === len - 1 || this.__index(this, indexes[i + 1]).ttisnil())) { // t[i+1] is nil or is the last integer indexed element
            return indexes[i] + 1;
        }
    }

    return 0;
};

Table.prototype.luaH_next = function(L, keyI) {
    let keyO = L.stack[keyI];
    let key = Table.keyValue(keyO);
    let indexes = this.ordered_indexes();

    if (indexes.length === 0) return 0;

    let i = indexes.indexOf(key);

    if ((i >= 0 || key === null) && i < indexes.length - 1) {
        if (key === null) i = -1;
        let nidx = indexes[i+1];
        let tnidx = typeof nidx;

        if (tnidx === 'number' && nidx % 1 === 0)
            L.stack[keyI] = new TValue(CT.LUA_TNUMINT, indexes[i + 1]);
        else if (tnidx === 'string')
            L.stack[keyI] = new TValue(CT.LUA_TLNGSTR, indexes[i + 1].split('|').map(e => Number.parseInt(e)).slice(0, -1));
        else
            L.stack[keyI] = indexes[i + 1];

        L.stack[keyI + 1] = this.value.get(indexes[i + 1]);
        return 1;
    }

    return 0;
};
