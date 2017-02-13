/*jshint esversion: 6 */
"use strict";

const CT    = require('./lua.js').constant_types;
const UpVal = require('./lfunc.js').UpVal;

class TValue {

    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.metatable = null;
    }

    /* type tag of a TValue (bits 0-3 for tags + variant bits 4-5) */
    ttype() {
        return this.type & 0x3F;
    }

    /* type tag of a TValue with no variants (bits 0-3) */
    ttnov() {
        return this.type & 0x0F;
    }

    checktag(t) {
        return this.type === t;
    }
    
    checktype(t) {
        return this.ttnov() === t;
    }
    
    ttisnumber() {
        return this.checktype(CT.LUA_TNUMBER);
    }
    
    ttisfloat() {
        return this.checktag(CT.LUA_TNUMFLT);
    }
    
    ttisinteger() {
        return this.checktag(CT.LUA_TNUMINT);
    }
    
    ttisnil() {
        return this.checktag(CT.LUA_TNIL);
    }
    
    ttisboolean() {
        return this.checktag(CT.LUA_TBOOLEAN);
    }
    
    ttislightuserdata() {
        return this.checktag(CT.LUA_TLIGHTUSERDATA);
    }
    
    ttisstring() {
        return this.checktype(CT.LUA_TSTRING);
    }
    
    ttisshrstring() {
        return this.checktag(CT.LUA_TSHRSTR);
    }
    
    ttislngstring() {
        return this.checktag(CT.LUA_TLNGSTR);
    }
    
    ttistable() {
        return this.checktag(CT.LUA_TTABLE);
    }
    
    ttisfunction() {
        return this.checktype(CT.LUA_TFUNCTION);
    }
    
    ttisclosure() {
        return (this.type & 0x1F) === CT.LUA_TFUNCTION;
    }
    
    ttisCclosure() {
        return this.checktag(CT.LUA_TCCL);
    }
    
    ttisLclosure() {
        return this.checktag(CT.LUA_TLCL);
    }
    
    ttislcf() {
        return this.checktag(CT.LUA_TLCF);
    }
    
    ttisfulluserdata() {
        return this.checktag(CT.LUA_TUSERDATA);
    }
    
    ttisthread() {
        return this.checktag(CT.LUA_TTHREAD);
    }
    
    ttisdeadkey() {
        return this.checktag(CT.LUA_TDEADKEY);
    }

    l_isfalse() {
        return this.ttisnil() || (this.ttisboolean() && this.value === false);
    }

}

const nil   = new TValue(CT.LUA_TNIL, null);

class Table extends TValue {

    constructor(array, hash) {
        super(CT.LUA_TTABLE, {
            array: array !== undefined ? array : [],
            hash: new Map(hash)
        });

        this.metatable = null;
    }

    static keyValue(key) {
        // Those lua values are used by value, others by reference
        if (key instanceof TValue
            && [CT.LUA_TNUMBER,
                CT.LUA_TSTRING,
                CT.LUA_TSHRSTR,
                CT.LUA_TLNGSTR,
                CT.LUA_TNUMFLT,
                CT.LUA_TNUMINT].indexOf(key.type) > -1) {
            key = key.value;
        }

        return key;
    }

    __newindex(table, key, value) {
        key = Table.keyValue(key);

        if (typeof key === 'number' && key > 0) {
            table.value.array[key - 1] = value; // Lua array starts at 1
        } else {
            table.value.hash.set(key, value);
        }
    }

    __index(table, key) {
        key = Table.keyValue(key);

        let v = nil;
        if (typeof key === 'number' && key > 0) {
            v = table.value.array[key - 1]; // Lua array starts at 1
        } else {
            v = table.value.hash.get(key);
        }

        return v ? v : nil;
    }

    __len(table) {
        return this.luaH_getn();
    }

}

class LClosure extends TValue {

    constructor(n) {
        super(CT.LUA_TLCL, null);

        this.p = null;
        this.nupvalues = n;

        let _ENV = new UpVal();
        _ENV.refcount = 0;
        _ENV.v = null;
        _ENV.u.open.next = null;
        _ENV.u.open.touched = true;
        _ENV.u.value = new Table();

        this.upvals = [
            _ENV
        ];

        this.value = this;
    }

}

class TString extends TValue {

    constructor(string) {
        super(CT.LUA_TSTRING, string);
    }

}


class Userdata extends TValue {

    constructor(jsObject) {
        super(CT.LUA_TUSERDATA, jsObject);

        this.metatable = null;
    }

}


module.exports.LClosure = LClosure;
module.exports.TValue   = TValue;
module.exports.Table    = Table;
module.exports.TString  = TString;
module.exports.Userdata = Userdata;