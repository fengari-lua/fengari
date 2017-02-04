/*jshint esversion: 6 */
"use strict";

const CT = require('./lua.js').constant_types;


class TValue {

    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.metatable = null;
    }

}


class LClosure extends TValue {

    constructor(n) {
        super(CT.LUA_TLCL, null);

        this.p = null;
        this.nupvalues = n;
        this.upvals = [];

        this.value = this;
    }

}

class TString extends TValue {

    constructor(string) {
        super(CT.LUA_TSTRING, string);
    }

}


class Table extends TValue {

    constructor(array, hash) {
        super(CT.LUA_TTABLE, {
            array: array !== undefined ? array : [],
            hash: new Map(hash)
        });

        this.usermetatable = null;

        this.metatable = {
            __newindex: function (table, key) {
                if (key instanceof TValue) {
                    // Those lua values are used by value, tables and functions by reference
                    if ([CT.TNUMBER, CT.TSTRING, CT.TSHRSTR, CT.TLNGSTR, CT.TNUMFLT, CT.TNUMINT].indexOf(key.type) > -1) {
                        key = key.value;
                    }
                }

                if (typeof key === 'number') {
                    table.value.array[key] = value;
                } else {
                    table.value.hash.set(key, value);
                }
            },

            __index: function (table, key, value) {
                if (key instanceof TValue) {
                    // Those lua values are used by value, tables and functions by reference
                    if ([CT.TNUMBER, CT.TSTRING, CT.TSHRSTR, CT.TLNGSTR, CT.TNUMFLT, CT.TNUMINT].indexOf(key.type) > -1) {
                        key = key.value;
                    }
                }

                if (typeof key === 'number') {
                    return table.value.array[key];
                } else {
                    return table.value.hash.get(key);
                }
            },

            __len: function (table) {
                return t.value.array.length;
            }
        };
    }

}


module.exports = {
    LClosure: LClosure,
    TValue: TValue,
    Table: Table
};