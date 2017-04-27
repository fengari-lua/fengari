 /*jshint esversion: 6 */
"use strict";

const assert = require('assert');

const defs    = require('./defs.js');
const ljstype = require('./ljstype.js');
const luaconf = require('./luaconf.js');
const llimit  = require('./llimit.js');
const ltable  = require('./ltable.js');
const CT      = defs.constant_types;
const UpVal   = require('./lfunc.js').UpVal;
const char    = defs.char;

let tvalueCount = 0;

class TValue {

    constructor(type, value) {
        this.id = tvalueCount++;
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

    setfltvalue(x) {
        this.type = CT.LUA_TNUMFLT;
        this.value = x;
    }

    setivalue(x) {
        this.type = CT.LUA_TNUMINT;
        this.value = x;
    }

    setnilvalue() {
        this.type = CT.LUA_TNIL;
        this.value = void 0;
    }

    setfvalue(x) {
        this.type = CT.LUA_TLCF;
        this.value = x;
    }

    setpvalue(x) {
        this.type = CT.LUA_TLIGHTUSERDATA;
        this.value = x;
    }

    setbvalue(x) {
        this.type = CT.LUA_TBOOLEAN;
        this.value = x;
    }

    setfrom(tv) { /* in lua C source setobj2t is often used for this */
        this.type = tv.type;
        this.value = tv.value;
    }

    jsstring(from, to) {
        return defs.to_jsstring(this.value, from, to);
    }

}

const luaO_nilobject = new TValue(CT.LUA_TNIL, null);
module.exports.luaO_nilobject = luaO_nilobject;

const table_keyValue = function(key) {
    // Those lua values are used by value, others by reference
    if (key instanceof TValue) {
        if ([CT.LUA_TNIL,
            CT.LUA_TBOOLEAN,
            CT.LUA_TSTRING,
            CT.LUA_TTHREAD,
            CT.LUA_TNUMINT].indexOf(key.type) > -1) {
            key = key.value;
        } else if ([CT.LUA_TSHRSTR, CT.LUA_TLNGSTR].indexOf(key.type) > -1) {
            key = key.value.map(e => `${e}|`).join('');
        }
    } else if (typeof key === "string") { // To avoid
        key = defs.to_luastring(key).map(e => `${e}|`).join('');
    } else if (Array.isArray(key)) {
        key = key.map(e => `${e}|`).join('');
    }

    return key;
};

const table_newindex = function(table, key, value) {
    key = table_keyValue(key);

    table.value.set(key, value);
};

const table_index = function(table, key) {
    key = table_keyValue(key);

    let v = table.value.get(key);

    return v ? v : luaO_nilobject;
};

class LClosure {

    constructor(L, n) {
        this.p = null;
        this.nupvalues = n;

        let _ENV = new UpVal(L);
        _ENV.refcount = 0;
        _ENV.v = null;
        _ENV.u.open.next = null;
        _ENV.u.open.touched = true;
        _ENV.u.value = new TValue(CT.LUA_TTABLE, ltable.luaH_new(L));

        this.upvals = [
            _ENV
        ];
    }

}

class CClosure {

    constructor(f, n) {
        this.f = f;
        this.nupvalues = n;
        this.upvalue = new Array(n);
    }

}

/*
** Description of a local variable for function prototypes
** (used for debug information)
*/
class LocVar {
    constructor() {
        this.varname = null;
        this.startpc = NaN;  /* first point where variable is active */
        this.endpc = NaN;    /* first point where variable is dead */
    }
}

const RETS = defs.to_luastring("...", true);
const PRE  = defs.to_luastring("[string \"");
const POS  = defs.to_luastring("\"]");

const luaO_chunkid = function(source, bufflen) {
    source = source instanceof TValue ? source.value : source;
    bufflen = bufflen instanceof TValue ? bufflen.value : bufflen;
    let l = source.length;
    let out = [];
    if (source[0] === char['=']) {  /* 'literal' source */
        if (l < bufflen)  /* small enough? */
            out = source.slice(1);
        else {  /* truncate it */
            out = out.concat(source.slice(1, bufflen));
        }
    } else if (source[0] === char['@']) {  /* file name */
        if (l <= bufflen)  /* small enough? */
            out = source.slice(1);
        else {  /* add '...' before rest of name */
            bufflen -= RETS.length;
            out = RETS.concat(source.slice(1, l - bufflen));
        }
    } else {  /* string; format as [string "source"] */
        let nli = source.indexOf(char['\n']);  /* find first new line (if any) */
        let nl = nli > -1 ? source.slice(nli) : null;
        out = PRE;  /* add prefix */
        bufflen -= PRE.length + RETS.length + POS.length + 1;  /* save space for prefix+suffix+'\0' */
        if (l < bufflen && nl === null) {  /* small one-line source? */
            out = out.concat(source);  /* keep it */
        } else {
            if (nl !== null) l = nl.length - source.length;  /* stop at first newline */
            if (l > bufflen) l = bufflen;
            out = out.concat(source).concat(RETS);
        }
        out = out.concat(POS);
    }

    return out;
};

const luaO_hexavalue = function(c) {
    if (ljstype.lisdigit(c)) return c - char['0'];
    else return (String.fromCharCode(c).toLowerCase().charCodeAt(0) - char['a']) + 10;
};

const UTF8BUFFSZ = 8;

const luaO_utf8desc = function(buff, x) {
    let n = 1;  /* number of bytes put in buffer (backwards) */
    assert(x <= 0x10FFFF);
    if (x < 0x80)  /* ascii? */
        buff[UTF8BUFFSZ - 1] = x;
    else {  /* need continuation bytes */
        let mfb = 0x3f;  /* maximum that fits in first byte */
        do {
            buff[UTF8BUFFSZ - (n++)] = 0x80 | (x & 0x3f);
            x >>= 6;  /* remove added bits */
            mfb >>= 1;  /* now there is one less bit available in first byte */
        } while (x > mfb);  /* still needs continuation byte? */
        buff[UTF8BUFFSZ - n] = (~mfb << 1) | x;  /* add first byte */
    }
    return n;
};

/* maximum number of significant digits to read (to avoid overflows
   even with single floats) */
const MAXSIGDIG = 30;

/*
** convert an hexadecimal numeric string to a number, following
** C99 specification for 'strtod'
*/
const lua_strx2number = function(s) {
    let dot = char[luaconf.lua_getlocaledecpoint()];
    let r = 0.0;  /* result (accumulator) */
    let sigdig = 0;  /* number of significant digits */
    let nosigdig = 0;  /* number of non-significant digits */
    let e = 0;  /* exponent correction */
    let neg;  /* 1 if number is negative */
    let hasdot = false;  /* true after seen a dot */

    while (ljstype.lisspace(s[0])) s = s.slice(1);  /* skip initial spaces */

    neg = s[0] === char['-'];  /* check signal */
    s = neg || s[0] === char['+'] ? s.slice(1) : s;  /* skip sign if one */
    if (!(s[0] === char['0'] && (s[1] === char['x'] || s[1] === char['X'])))  /* check '0x' */
        return 0.0;  /* invalid format (no '0x') */

    for (s = s.slice(2); ; s = s.slice(1)) {  /* skip '0x' and read numeral */
        if (s[0] === dot) {
            if (hasdot) break;  /* second dot? stop loop */
            else hasdot = true;
        } else if (ljstype.lisxdigit(s[0])) {
            if (sigdig === 0 && s[0] === char['0'])  /* non-significant digit (zero)? */
                nosigdig++;
            else if (++sigdig <= MAXSIGDIG)  /* can read it without overflow? */
                r = (r * 16) + luaO_hexavalue(s[0]);
            else e++; /* too many digits; ignore, but still count for exponent */
            if (hasdot) e--;  /* decimal digit? correct exponent */
        } else break;  /* neither a dot nor a digit */
    }

    if (nosigdig + sigdig === 0)  /* no digits? */
        return 0.0;  /* invalid format */
    e *= 4;  /* each digit multiplies/divides value by 2^4 */
    if (s[0] === char['p'] || s[0] === char['P']) {  /* exponent part? */
        let exp1 = 0;  /* exponent value */
        let neg1;  /* exponent signal */
        s = s.slice(1);  /* skip 'p' */
        neg1 = s[0] === char['-'];  /* check signal */
        s = neg1 || s[0] === char['+'] ? s.slice(1) : s;  /* skip sign if one */
        if (!ljstype.lisdigit(s[0]))
            return 0.0;  /* invalid; must have at least one digit */
        while (ljstype.lisdigit(s[0])) {  /* read exponent */
            exp1 = exp1 * 10 + s[0] - char['0'];
            s = s.slice(1);
        }
        if (neg1) exp1 = -exp1;
        e += exp1;
    }
    if (neg) r = -r;
    return defs.to_jsstring(s).trim().search(/s/) < 0 ? luaconf.ldexp(r, e) : null;  /* Only valid if nothing left is s*/
};

const l_str2dloc = function(s, mode) {
    let flt = mode === 'x' ? lua_strx2number(s) : parseFloat(defs.to_jsstring(s));
    return !isNaN(flt) ? flt : null;  /* OK if no trailing characters */
};

const l_str2d = function(s) {
    let pidx = /[.xXnN]/g.exec(String.fromCharCode(...s));
    pidx = pidx ? pidx.index : null;
    let pmode = pidx ? s[pidx] : null;
    let mode = pmode ? String.fromCharCode(pmode).toLowerCase() : 0;
    if (mode === 'n')  /* reject 'inf' and 'nan' */
        return null;
    let end = l_str2dloc(s, mode);  /* try to convert */
    if (end === null) {   /* failed? may be a different locale */
        // throw new Error("Locale not available to handle number"); // TODO
    }
    return end;
};

const MAXBY10  = llimit.MAX_INT / 10;
const MAXLASTD = llimit.MAX_INT % 10;

const l_str2int = function(s) {
    let a = 0;
    let empty = true;
    let neg;

    while (ljstype.lisspace(s[0])) s = s.slice(1);  /* skip initial spaces */
    neg = s[0] === char['-'];

    if (neg || s[0] === char['+'])
        s = s.slice(1);

    if (s[0] === char['0'] && (s[1] === char['x'] || s[1] === char['X'])) {  /* hex? */
        s = s.slice(2);  /* skip '0x' */

        for (; ljstype.lisxdigit(s[0]); s = s.slice(1)) {
            a = a * 16 + luaO_hexavalue(s[0]);
            empty = false;
        }
    } else {  /* decimal */
        for (; ljstype.lisdigit(s[0]); s = s.slice(1)) {
            let d = s[0] - char['0'];
            if (a >= MAXBY10 && (a > MAXBY10 || d > MAXLASTD + neg))  /* overflow? */
                return null;  /* do not accept it (as integer) */
            a = a * 10 + d;
            empty = false;
        }
    }

    while (ljstype.lisspace(s[0])) s = s.slice(1);  /* skip trailing spaces */

    if (empty || (s.length > 0 && s[0] !== 0)) return null;  /* something wrong in the numeral */
    else {
        return (neg ? -a : a)|0;
    }
};

const luaO_str2num = function(s) {
    let s2i = l_str2int(s);

    if (s2i !== null) {   /* try as an integer */
        return new TValue(CT.LUA_TNUMINT, s2i);
    } else {   /* else try as a float */
        s2i = l_str2d(s);

        if (s2i !== null) {
            return new TValue(CT.LUA_TNUMFLT, s2i);
        } else
            return false;  /* conversion failed */
    }
};

const luaO_utf8esc = function(x) {
    let buff = [];
    let n = 1;  /* number of bytes put in buffer (backwards) */
    assert(x <= 0x10ffff);
    if (x < 0x80)  /* ascii? */
        buff[UTF8BUFFSZ - 1] = x;
    else {  /* need continuation bytes */
        let mfb = 0x3f;  /* maximum that fits in first byte */
        do {  /* add continuation bytes */
            buff[UTF8BUFFSZ - (n++)] = 0x80 | (x & 0x3f);
            x >>= 6;  /* remove added bits */
            mfb >>= 1;  /* now there is one less bit available in first byte */
        } while (x > mfb);  /* still needs continuation byte? */
        buff[UTF8BUFFSZ - n] = (~mfb << 1) | x;  /* add first byte */
    }
    return {
        buff: buff,
        n: n
    };
};

/*
** converts an integer to a "floating point byte", represented as
** (eeeeexxx), where the real value is (1xxx) * 2^(eeeee - 1) if
** eeeee !== 0 and (xxx) otherwise.
*/
const luaO_int2fb = function(x) {
    let e = 0;  /* exponent */
    if (x < 8) return x;
    while (x >= (8 << 4)) {  /* coarse steps */
        x = (x + 0xf) >> 4;  /* x = ceil(x / 16) */
        e += 4;
    }
    while (x >= (8 << 1)) {  /* fine steps */
        x = (x + 1) >> 1;  /* x = ceil(x / 2) */
        e++;
    }
    return ((e+1) << 3) | (x - 8);
};

const intarith = function(L, op, v1, v2) {
    switch (op) {
        case defs.LUA_OPADD:  return (v1 + v2)|0;
        case defs.LUA_OPSUB:  return (v1 - v2)|0;
        case defs.LUA_OPMUL:  return (v1 * v2)|0;
        case defs.LUA_OPMOD:  return (v1 - Math.floor(v1 / v2) * v2)|0; // % semantic on negative numbers is different in js
        case defs.LUA_OPIDIV: return (v1 / v2)|0;
        case defs.LUA_OPBAND: return (v1 & v2);
        case defs.LUA_OPBOR:  return (v1 | v2);
        case defs.LUA_OPBXOR: return (v1 ^ v2);
        case defs.LUA_OPSHL:  return (v1 << v2);
        case defs.LUA_OPSHR:  return (v1 >> v2);
        case defs.LUA_OPUNM:  return (0 - v1)|0;
        case defs.LUA_OPBNOT: return (~0 ^ v1);
    }
};


const numarith = function(L, op, v1, v2) {
    switch (op) {
        case defs.LUA_OPADD:  return v1 + v2;
        case defs.LUA_OPSUB:  return v1 - v2;
        case defs.LUA_OPMUL:  return v1 * v2;
        case defs.LUA_OPDIV:  return v1 / v2;
        case defs.LUA_OPPOW:  return Math.pow(v1, v2);
        case defs.LUA_OPIDIV: return (v1 / v2);
        case defs.LUA_OPUNM:  return -v1;
        case defs.LUA_OPMOD:  return v1 % v2;
    }
};

module.exports.CClosure       = CClosure;
module.exports.LClosure       = LClosure;
module.exports.LocVar         = LocVar;
module.exports.TValue         = TValue;
module.exports.UTF8BUFFSZ     = UTF8BUFFSZ;
module.exports.intarith       = intarith;
module.exports.luaO_chunkid   = luaO_chunkid;
module.exports.luaO_hexavalue = luaO_hexavalue;
module.exports.luaO_int2fb    = luaO_int2fb;
module.exports.luaO_str2num   = luaO_str2num;
module.exports.luaO_utf8desc  = luaO_utf8desc;
module.exports.luaO_utf8esc   = luaO_utf8esc;
module.exports.numarith       = numarith;
module.exports.table_index    = table_index;
module.exports.table_keyValue = table_keyValue;
module.exports.table_newindex = table_newindex;
