 /*jshint esversion: 6 */
"use strict";

const assert = require('assert');

const ljstype = require('./ljstype.js');
const lua     = require('./lua.js');
const luaconf = require('./luaconf.js');
const CT      = lua.constant_types;
const UpVal   = require('./lfunc.js').UpVal;

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

    ttisobject() {
        return this.checktag(CT.LUA_TLIGHTUSERDATA_OBJ);
    }

    ttisptr() {
        return this.checktag(CT.LUA_TLIGHTUSERDATA_PTR);
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

    jsstring(from, to) {
        return jsstring(this.value, from, to);
    }

}

const luaO_nilobject = new TValue(CT.LUA_TNIL, null);
module.exports.luaO_nilobject = luaO_nilobject;

const jsstring = function(value, from, to) {
    let u0, u1, u2, u3, u4, u5;
    let idx = 0;
    value = value.slice(from ? from : 0, to);

    var str = '';
    while (1) {
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
        u0 = value[idx++];
        if (u0 === 0) { str += "\0"; continue; } // Lua string embed '\0'
        if (!u0) return str;
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        u1 = value[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        u2 = value[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
            u3 = value[idx++] & 63;
            if ((u0 & 0xF8) == 0xF0) {
                u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
            } else {
                u4 = value[idx++] & 63;
                if ((u0 & 0xFC) == 0xF8) {
                    u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
                } else {
                    u5 = value[idx++] & 63;
                    u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
                }
            }
        }
        if (u0 < 0x10000) {
            str += String.fromCharCode(u0);
        } else {
            var ch = u0 - 0x10000;
            str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
    }

    return str;
};

class Table extends TValue {

    constructor(array, hash) {
        super(CT.LUA_TTABLE, new Map(hash));

        this.metatable = null;
    }

    static keyValue(key) {
        // Those lua values are used by value, others by reference
        if (key instanceof TValue) {
            if ([CT.LUA_TNIL,
                CT.LUA_TBOOLEAN,
                CT.LUA_TSTRING,
                CT.LUA_TNUMINT].indexOf(key.type) > -1) {
                key = key.value;
            } else if ([CT.LUA_TSHRSTR, CT.LUA_TLNGSTR].indexOf(key.type) > -1) {
                key = key.value.map(e => `${e}|`).join('');
            }
        } else if (typeof key === "string") { // To avoid
            key = lua.to_luastring(key).map(e => `${e}|`).join('');
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

        let v = luaO_nilobject;
        if (typeof key === 'number' && key > 0) {
            v = table.value.get(key - 1); // Lua array starts at 1
        } else {
            v = table.value.get(key);
        }

        return v ? v : luaO_nilobject;
    }

    __len(table) {
        return this.luaH_getn();
    }

}

class LClosure extends TValue {

    constructor(L, n) {
        super(CT.LUA_TLCL, null);

        this.p = null;
        this.nupvalues = n;

        let _ENV = new UpVal(L);
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

const RETS = "...";
const PRE  = "[string \"";
const POS  = "\"]";

const luaO_chunkid = function(source, bufflen) {
    source = source instanceof TValue ? source.jsstring() : source;
    bufflen = bufflen instanceof TValue ? bufflen.value : bufflen;
    let l = source.length;
    let out = "";
    if (source.charAt(0) === '=') {  /* 'literal' source */
        if (l < bufflen)  /* small enough? */
            out = `${source.slice(1)}`;
        else {  /* truncate it */
            out += `${source.slice(1, bufflen)}`;
        }
    } else if (source.charAt(0) === '@') {  /* file name */
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
        bufflen -= PRE.length + RETS.length + POS.length + 1;  /* save space for prefix+suffix+'\0' */
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

const luaO_hexavalue = function(c) {
    if (ljstype.lisdigit(c)) return c.charCodeAt(0) - '0'.charCodeAt(0);
    else return (c.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)) + 10;
};

const UTF8BUFFSZ = 8;

const luaO_utf8desc = function(buff, x) {
    let n = 1;  /* number of bytes put in buffer (backwards) */
    assert(x <= 0x10FFFF);
    if (x < 0x80)  /* ascii? */
        buff[UTF8BUFFSZ - 1] = String.fromCharCode(x);
    else {  /* need continuation bytes */
        let mfb = 0x3f;  /* maximum that fits in first byte */
        do {
            buff[UTF8BUFFSZ - (n++)] = String.fromCharCode(0x80 | (x & 0x3f));
            x >>= 6;  /* remove added bits */
            mfb >>= 1;  /* now there is one less bit available in first byte */
        } while (x > mfb);  /* still needs continuation byte? */
        buff[UTF8BUFFSZ - n] = String.fromCharCode((~mfb << 1) | x);  /* add first byte */
    }
    return n;
};

/* maximum number of significant digits to read (to avoid overflows
   even with single floats) */
const MAXSIGDIG = 30;

// See: http://croquetweak.blogspot.fr/2014/08/deconstructing-floats-frexp-and-ldexp.html
const frexp = function(value) {
    if (value === 0) return [value, 0];
    var data = new DataView(new ArrayBuffer(8));
    data.setFloat64(0, value);
    var bits = (data.getUint32(0) >>> 20) & 0x7FF;
    if (bits === 0) { // denormal
        data.setFloat64(0, value * Math.pow(2, 64));  // exp + 64
        bits = ((data.getUint32(0) >>> 20) & 0x7FF) - 64;
    }
    var exponent = bits - 1022;
    var mantissa = ldexp(value, -exponent);
    return [mantissa, exponent];
};

const ldexp = function(mantissa, exponent) {
    var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
    var result = mantissa;
    for (var i = 0; i < steps; i++)
        result *= Math.pow(2, Math.floor((exponent + i) / steps));
    return result;
};


/*
** convert an hexadecimal numeric string to a number, following
** C99 specification for 'strtod'
*/
const lua_strx2number = function(s) {
    let dot = luaconf.lua_getlocaledecpoint();
    let r = 0.0;  /* result (accumulator) */
    let sigdig = 0;  /* number of significant digits */
    let nosigdig = 0;  /* number of non-significant digits */
    let e = 0;  /* exponent correction */
    let neg;  /* 1 if number is negative */
    let hasdot = false;  /* true after seen a dot */

    while (ljstype.lisspace(s.charAt(0))) s = s.slice(1);  /* skip initial spaces */

    neg = s.charAt(0) === '-';  /* check signal */
    s = neg || s.charAt(0) === '+' ? s.slice(1) : s;  /* skip sign if one */
    if (!(s.charAt(0) === '0' && (s.charAt(1) === 'x' || s.charAt(1) === 'X')))  /* check '0x' */
        return 0.0;  /* invalid format (no '0x') */

    for (s = s.slice(2); ; s = s.slice(1)) {  /* skip '0x' and read numeral */
        if (s.charAt(0) === dot) {
            if (hasdot) break;  /* second dot? stop loop */
            else hasdot = true;
        } else if (ljstype.lisxdigit(s.charAt(0))) {
            if (sigdig === 0 && s.charAt(0) === '0')  /* non-significant digit (zero)? */
                nosigdig++;
            else if (++sigdig <= MAXSIGDIG)  /* can read it without overflow? */
                r = (r * 16) + luaO_hexavalue(s);
            else e++; /* too many digits; ignore, but still count for exponent */
            if (hasdot) e--;  /* decimal digit? correct exponent */
        } else break;  /* neither a dot nor a digit */
    }

    if (nosigdig + sigdig === 0)  /* no digits? */
        return 0.0;  /* invalid format */
    e *= 4;  /* each digit multiplies/divides value by 2^4 */
    if (s.charAt(0) === 'p' || s.charAt(0) === 'P') {  /* exponent part? */
        let exp1 = 0;  /* exponent value */
        let neg1;  /* exponent signal */
        s = s.slice(1);  /* skip 'p' */
        neg1 = s.charAt(0) === '-';  /* check signal */
        s = neg1 || s.charAt(0) === '+' ? s.slice(1) : s;  /* skip sign if one */
        if (!ljstype.lisdigit(s.charAt(0)))
            return 0.0;  /* invalid; must have at least one digit */
        while (ljstype.lisdigit(s.charAt(0))) {  /* read exponent */
            exp1 = exp1 * 10 + s.charCodeAt(0) - '0'.charCodeAt(0);
            s = s.slice(1);
        }
        if (neg1) exp1 = -exp1;
        e += exp1;
    }
    if (neg) r = -r;
    return s.trim().search(/s/) < 0 ? ldexp(r, e) : null;  /* Only valid if nothing left is s*/
};

const l_str2dloc = function(s, mode) {
    let flt = mode === 'x' ? lua_strx2number(s) : parseFloat(s);
    return !isNaN(flt) ? flt : null;  /* OK if no trailing characters */
};

const l_str2d = function(s) {
    let pidx = /[.xXnN]/g.exec(s);
    pidx = pidx ? pidx.index : null;
    let pmode = pidx ? s[pidx] : null;
    let mode = pmode ? pmode.toLowerCase() : 0;
    if (mode === 'n')  /* reject 'inf' and 'nan' */
        return null;
    let end = l_str2dloc(s, mode);  /* try to convert */
    if (end === null) {   /* failed? may be a different locale */
        throw new Error("Locale not available to handle number"); // TODO
    }
    return end;
};

const MAXBY10  = Number.MAX_SAFE_INTEGER / 10;
const MAXLASTD = Number.MAX_SAFE_INTEGER % 10;

const l_str2int = function(s) {
    let a = 0;
    let empty = true;
    let neg;

    while (ljstype.lisspace(s[0])) s = s.slice(1);  /* skip initial spaces */
    neg = s[0] === '-';

    if (neg || s[0] === '+')
        s = s.slice(1);

    if (s[0] === '0' && (s[1] === 'x' || s[1] === 'X')) {  /* hex? */
        s = s.slice(2);  /* skip '0x' */

        for (; ljstype.lisxdigit(s[0]); s = s.slice(1)) {
            a = a * 16 + luaO_hexavalue(s[0]);
            empty = false;
        }
    } else {  /* decimal */
        for (; ljstype.lisdigit(s[0]); s = s.slice(1)) {
            let d = parseInt(s[0]);
            if (a >= MAXBY10 && (a > MAXBY10 || d > MAXLASTD + neg))  /* overflow? */
                return null;  /* do not accept it (as integer) */
            a = a * 10 + d;
            empty = false;
        }
    }

    while (ljstype.lisspace(s[0])) s = s.slice(1);  /* skip trailing spaces */

    if (empty || s[0] !== "\0") return null;  /* something wrong in the numeral */
    else {
        return neg ? -a : a;
    }
};

const luaO_str2num = function(s) {
    let s2i = l_str2int(s);

    if (s2i !== null) {   /* try as an integer */
        return new TValue(CT.LUA_TNUMINT, s2i);
    } else {   /* else try as a float */
        s2i = l_str2d(s.join(''));

        if (s2i !== null) {
            return new TValue(CT.LUA_TNUMFLT, s2i);
        } else
            return false;  /* conversion failed */
    }
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
        case lua.LUA_OPADD:  return (v1 + v2);
        case lua.LUA_OPSUB:  return (v1 - v2);
        case lua.LUA_OPMUL:  return (v1 * v2);
        case lua.LUA_OPMOD:  return (v1 % v2);
        case lua.LUA_OPIDIV: return (v1 / v2);
        case lua.LUA_OPBAND: return (v1 & v2);
        case lua.LUA_OPBOR:  return (v1 | v2);
        case lua.LUA_OPBXOR: return (v1 ^ v2);
        case lua.LUA_OPSHL:  return (v1 << v2);
        case lua.LUA_OPSHR:  return (v1 >> v2);
        case lua.LUA_OPUNM:  return (-v1);
        case lua.LUA_OPBNOT: return (~v1);
    }
};


const numarith = function(L, op, v1, v2) {
    switch (op) {
        case lua.LUA_OPADD:  return v1 + v2;
        case lua.LUA_OPSUB:  return v1 - v2;
        case lua.LUA_OPMUL:  return v1 * v2;
        case lua.LUA_OPDIV:  return v1 / v2;
        case lua.LUA_OPPOW:  return Math.pow(v1, v2);
        case lua.LUA_OPIDIV: return (v1 / v2);
        case lua.LUA_OPUNM:  return -v1;
        case lua.LUA_OPMOD:  return v1 % v2;
    }
};

module.exports.CClosure       = CClosure;
module.exports.LClosure       = LClosure;
module.exports.LocVar         = LocVar;
module.exports.TValue         = TValue;
module.exports.Table          = Table;
module.exports.UTF8BUFFSZ     = UTF8BUFFSZ;
module.exports.frexp          = frexp;
module.exports.intarith       = intarith;
module.exports.jsstring       = jsstring;
module.exports.ldexp          = ldexp;
module.exports.luaO_chunkid   = luaO_chunkid;
module.exports.luaO_hexavalue = luaO_hexavalue;
module.exports.luaO_int2fb    = luaO_int2fb;
module.exports.luaO_str2num   = luaO_str2num;
module.exports.luaO_utf8desc  = luaO_utf8desc;
module.exports.numarith       = numarith;
