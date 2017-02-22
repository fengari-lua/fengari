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
        super(CT.LUA_TTABLE, new Map(hash));

        this.metatable = null;
    }

    static keyValue(key) {
        // Those lua values are used by value, others by reference
        if (key instanceof TValue
            && [CT.LUA_TNIL,
                CT.LUA_TSTRING,
                CT.LUA_TSHRSTR,
                CT.LUA_TLNGSTR,
                CT.LUA_TNUMINT].indexOf(key.type) > -1) {
            key = key.value;
        }

        return key;
    }

    __newindex(table, key, value) {
        key = Table.keyValue(key);

        if (typeof key === 'number' && key > 0) {
            table.value.set(key - 1, value); // Lua array starts at 1
        } else {
            table.value.set(key, value);
        }
    }

    __index(table, key) {
        key = Table.keyValue(key);

        let v = nil;
        if (typeof key === 'number' && key > 0) {
            v = table.value.get(key - 1); // Lua array starts at 1
        } else {
            v = table.value.get(key);
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

class CClosure extends TValue {

    constructor(f, n) {
        super(CT.LUA_TCCL, null);

        this.f = f;
        this.nupvalues = n;
        this.upvalue = new Array(n);

        this.value = this;
    }

}

const RETS = "...";
const PRE  = "[string \"";
const POS  = "\"]";

const luaO_chunkid = function(source, bufflen) {
    let l = source.length;
    let out = "";
    if (source[0] === '=') {  /* 'literal' source */
        if (l < bufflen)  /* small enough? */
            out = `${source.slice(1)}`;
        else {  /* truncate it */
            out += `${source.slice(1, bufflen)}`;
        }
    } else if (source[0] === '@') {  /* file name */
        if (l <= bufflen)  /* small enough? */
            out = `${source.slice(1)}`;
        else {  /* add '...' before rest of name */
            bufflen -= RETS.length;
            out = `${RETS}${source.slice(1, l - bufflen)}`;
        }
    } else {  /* string; format as [string "source"] */
        let nli = source.indexOf('\n');  /* find first new line (if any) */
        let nl = nli ? source.slice(nli) : null;
        out = `${PRE}`;  /* add prefix */
        bufflen -= PRE.length - RETS.length; - POS.length + 1;  /* save space for prefix+suffix+'\0' */
        if (l < bufflen && nl === null) {  /* small one-line source? */
            out += `${source}`;  /* keep it */
        } else {
            if (nl !== null) l = nl.length - source.length;  /* stop at first newline */
            if (l > bufflen) l = bufflen;
            out += `${source}${RETS}`;
        }
        out += POS;
    }

    return out;
};

module.exports.LClosure     = LClosure;
module.exports.CClosure     = CClosure;
module.exports.TValue       = TValue;
module.exports.Table        = Table;
module.exports.luaO_chunkid = luaO_chunkid;