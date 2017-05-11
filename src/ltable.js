/*jshint esversion: 6 */
"use strict";

const assert = require('assert');

const defs    = require('./defs.js');
const ldebug  = require('./ldebug.js');
const lobject = require('./lobject.js');
const lstring = require('./lstring.js');
const CT      = defs.constant_types;

const table_hash = function(key) {
    switch(key.type) {
    case CT.LUA_TBOOLEAN:
    case CT.LUA_TLIGHTUSERDATA: /* XXX: if user pushes conflicting lightuserdata then the table will do odd things */
    case CT.LUA_TNUMFLT:
    case CT.LUA_TNUMINT:
    case CT.LUA_TTABLE:
    case CT.LUA_TLCL:
    case CT.LUA_TLCF:
    case CT.LUA_TCCL:
    case CT.LUA_TUSERDATA:
    case CT.LUA_TTHREAD:
        return key.value;
    case CT.LUA_TSHRSTR:
    case CT.LUA_TLNGSTR:
        return lstring.luaS_hashlongstr(key.tsvalue());
    default:
        throw new Error("unknown key type: " + key.type);
    }
};

class Table {
    constructor(L) {
        this.id = L.l_G.id_counter++;
        this.strong = new Map();
        this.dead_hashes = [];
        this.metatable = null;
    }
}

const clean_dead_keys = function(t) {
    for (let i=0; i<t.dead_hashes.length; i++) {
        t.strong.delete(t.dead_hashes[i]);
    }
};

const luaH_new = function(L) {
    return new Table(L);
};

const getgeneric = function(t, hash) {
    let v = t.strong.get(hash);
    return v ? v.value : lobject.luaO_nilobject;
};

const luaH_getint = function(t, key) {
    assert(typeof key == "number" && (key|0) === key);
    return getgeneric(t, key);
};

const luaH_getstr = function(t, key) {
    assert(key instanceof lstring.TString);
    return getgeneric(t, lstring.luaS_hashlongstr(key));
};

const luaH_get = function(t, key) {
    assert(key instanceof lobject.TValue);
    if (key.ttisnil())
        return lobject.luaO_nilobject;
    return getgeneric(t, table_hash(key));
};

const setgeneric = function(t, hash, key) {
    let v = t.strong.get(hash);
    if (v)
        return v.value;

    clean_dead_keys(t);
    let tv = new lobject.TValue(CT.LUA_TNIL, null);
    t.strong.set(hash, {
        key: key,
        value: tv
    });
    return tv;
};

const luaH_setint = function(t, key, value) {
    assert(typeof key == "number" && (key|0) === key && value instanceof lobject.TValue);
    let hash = key; /* table_hash known result */
    if (value.ttisnil()) {
        delete_hash(t, hash);
        return;
    }
    let v = t.strong.get(hash);
    if (v) {
        let tv = v.value;
        tv.setfrom(value);
    } else {
        clean_dead_keys(t);
        t.strong.set(hash, {
            key: new lobject.TValue(CT.LUA_TNUMINT, key),
            value: new lobject.TValue(value.type, value.value)
        });
    }
};

const luaH_set = function(t, key) {
    assert(key instanceof lobject.TValue);
    let hash = table_hash(key);
    return setgeneric(t, hash, new lobject.TValue(key.type, key.value));
};

/* Can't remove from table immediately due to next() */
const delete_hash = function(t, hash) {
    let e = t.strong.get(hash);
    if (e) {
        e.key.setdeadvalue();
        e.value = new lobject.TValue(CT.LUA_TNIL, null);
        t.dead_hashes.push(hash);
    }
};

const luaH_delete = function(t, key) {
    assert(key instanceof lobject.TValue);
    let hash = table_hash(key);
    return delete_hash(t, hash);
};

/*
** Try to find a boundary in table 't'. A 'boundary' is an integer index
** such that t[i] is non-nil and t[i+1] is nil (and 0 if t[1] is nil).
*/
const luaH_getn = function(t) {
    let i = 0;
    let j = t.strong.size + 1; /* use known size of Map to bound search */
    /* now do a binary search between them */
    while (j - i > 1) {
        let m = Math.floor((i+j)/2);
        if (luaH_getint(t, m).ttisnil()) j = m;
        else i = m;
    }
    return i;
};

/*
** Javascript tables don't have any next-like primitive.
** For each call of `next` this does a full iteration up to the item
*/
const luaH_next = function(L, table, keyI) {
    let keyO = L.stack[keyI];

    let iterresult;
    if (keyO.type === CT.LUA_TNIL) {
        iterresult = table.strong.keys().next();
    } else {
        let hash = table_hash(keyO);

        if (!table.strong.has(hash))
            /* item not in table */
            return ldebug.luaG_runerror(L, defs.to_luastring("invalid key to 'next'"))

        let indexes = table.strong.keys();
        while (1) {
            let e = indexes.next();
            if (e.done)
                throw "unreachable";
            else if (e.value == hash)
                break;
        }
        iterresult = indexes.next();
    }
    if (iterresult.done)
        return false;

    let entry = table.strong.get(iterresult.value);
    L.stack[keyI] = new lobject.TValue(entry.key.type, entry.key.value);
    L.stack[keyI+1] = new lobject.TValue(entry.value.type, entry.value.value);
    return true;
};

module.exports.luaH_delete  = luaH_delete;
module.exports.luaH_get     = luaH_get;
module.exports.luaH_getint  = luaH_getint;
module.exports.luaH_getn    = luaH_getn;
module.exports.luaH_getstr  = luaH_getstr;
module.exports.luaH_set     = luaH_set;
module.exports.luaH_setint  = luaH_setint;
module.exports.luaH_new     = luaH_new;
module.exports.luaH_next    = luaH_next;
