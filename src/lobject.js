 /*jshint esversion: 6 */
"use strict";

const defs    = require('./defs.js');
const ljstype = require('./ljstype.js');
const ldebug  = require('./ldebug.js');
const lstring = require('./lstring.js');
const luaconf = require('./luaconf.js');
const lvm     = require('./lvm.js');
const llimit  = require('./llimit.js');
const ltm     = require('./ltm.js');
const CT      = defs.constant_types;
const char    = defs.char;

const LUA_TPROTO = CT.LUA_NUMTAGS;
const LUA_TDEADKEY = CT.LUA_NUMTAGS+1;

class TValue {

    constructor(type, value) {
        this.type = type;
        this.value = value;
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
        return this.checktag(LUA_TDEADKEY);
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

    sethvalue(x) {
        this.type = CT.LUA_TTABLE;
        this.value = x;
    }

    setdeadvalue() {
        this.type = LUA_TDEADKEY;
        this.value = null;
    }

    setfrom(tv) { /* in lua C source setobj2t is often used for this */
        this.type = tv.type;
        this.value = tv.value;
    }

    tsvalue() {
        if (process.env.LUA_USE_APICHECK && !(this.ttisstring())) throw Error("assertion failed");
        return this.value;
    }

    svalue() {
        return this.tsvalue().getstr();
    }

    vslen() {
        return this.tsvalue().tsslen();
    }

    jsstring(from, to) {
        return defs.to_jsstring(this.svalue(), from, to);
    }

}

const luaO_nilobject = new TValue(CT.LUA_TNIL, null);
Object.freeze(luaO_nilobject);
module.exports.luaO_nilobject = luaO_nilobject;

class LClosure {

    constructor(L, n) {
        this.id = L.l_G.id_counter++;

        this.p = null;
        this.nupvalues = n;
        this.upvals = new Array(n); /* list of upvalues as UpVals. initialised in luaF_initupvals */
    }

}

class CClosure {

    constructor(L, f, n) {
        this.id = L.l_G.id_counter++;

        this.f = f;
        this.nupvalues = n;
        this.upvalue = new Array(n); /* list of upvalues as TValues */
        while (n--) {
            this.upvalue[n] = new TValue(CT.LUA_TNIL, null);
        }
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
    if (process.env.LUA_USE_APICHECK && !(x <= 0x10FFFF)) throw Error("assertion failed");
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
    if (process.env.LUA_USE_APICHECK && !(x <= 0x10ffff)) throw Error("assertion failed");
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

const pushstr = function(L, str) {
    L.stack[L.top++] = new TValue(CT.LUA_TLNGSTR, lstring.luaS_new(L, str));
};

const luaO_pushvfstring = function(L, fmt, argp) {
    let n = 0;
    let i = 0;
    let a = 0;
    let e;
    while (1) {
        e = fmt.indexOf(char['%'], i);
        if (e == -1) break;
        pushstr(L, fmt.slice(i, e));
        switch(fmt[e+1]) {
            case char['s']:
                let s = argp[a++];
                if (s === null) s = defs.to_luastring("(null)", true)
                pushstr(L, s);
                break;
            case char['c']:
                let buff = argp[a++];
                if (ljstype.lisprint(buff))
                    pushstr(L, [buff]);
                else
                    luaO_pushfstring(L, defs.to_luastring("<\\%d>", true), buff);
                break;
            case char['d']:
            case char['I']:
            case char['f']:
                pushstr(L, defs.to_luastring(''+argp[a++]));
                break;
            // case char['p']:
            case char['U']:
                pushstr(L, defs.to_luastring(String.fromCodePoint(argp[a++])));
                break;
            case char['%']:
                pushstr(L, [char['%']]);
                break;
            default: {
                ldebug.luaG_runerror(L, defs.to_luastring("invalid option '%%%c' to 'lua_pushfstring'"), fmt[e + 1]);
            }
        }
        n += 2;
        i = e + 2;
    }
    pushstr(L, fmt.slice(i));
    if (n > 0) lvm.luaV_concat(L, n+1);
    return L.stack[L.top-1].svalue();
};

const luaO_pushfstring = function(L, fmt, ...argp) {
    return luaO_pushvfstring(L, fmt, argp);
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
        case defs.LUA_OPIDIV: return Math.floor(v1 / v2)|0;
        case defs.LUA_OPBAND: return (v1 & v2);
        case defs.LUA_OPBOR:  return (v1 | v2);
        case defs.LUA_OPBXOR: return (v1 ^ v2);
        case defs.LUA_OPSHL:  return (v1 << v2);
        case defs.LUA_OPSHR:  return (v1 >> v2);
        case defs.LUA_OPUNM:  return (0 - v1)|0;
        case defs.LUA_OPBNOT: return (~0 ^ v1);
        default: throw Error("invalid operation");
    }
};


const numarith = function(L, op, v1, v2) {
    switch (op) {
        case defs.LUA_OPADD:  return v1 + v2;
        case defs.LUA_OPSUB:  return v1 - v2;
        case defs.LUA_OPMUL:  return v1 * v2;
        case defs.LUA_OPDIV:  return v1 / v2;
        case defs.LUA_OPPOW:  return Math.pow(v1, v2);
        case defs.LUA_OPIDIV: return Math.floor(v1 / v2);
        case defs.LUA_OPUNM:  return -v1;
        case defs.LUA_OPMOD:  return v1 % v2;
        default: throw Error("invalid operation");
    }
};

const luaO_arith = function(L, op, p1, p2, res) {
    switch (op) {
        case defs.LUA_OPBAND: case defs.LUA_OPBOR: case defs.LUA_OPBXOR:
        case defs.LUA_OPSHL: case defs.LUA_OPSHR:
        case defs.LUA_OPBNOT: {  /* operate only on integers */
            let i1 = lvm.tointeger(p1);
            let i2 = lvm.tointeger(p2);
            if (i1 !== false && i2 !== false) {
                res.type  = CT.LUA_TNUMINT;
                res.value = intarith(L, op, i1, i2);
                return;
            }
            else break;  /* go to the end */
        }
        case defs.LUA_OPDIV: case defs.LUA_OPPOW: {  /* operate only on floats */
            let n1 = lvm.tonumber(p1);
            let n2 = lvm.tonumber(p2);
            if (n1 !== false && n2 !== false) {
                res.type  = CT.LUA_TNUMFLT;
                res.value = numarith(L, op, n1, n2);
                return;
            }
            else break;  /* go to the end */
        }
        default: {  /* other operations */
            let n1 = lvm.tonumber(p1);
            let n2 = lvm.tonumber(p2);
            if (p1.ttisinteger() && p2.ttisinteger()) {
                res.type  = CT.LUA_TNUMINT;
                res.value = intarith(L, op, p1.value, p2.value);
                return;
            }
            else if (n1 !== false && n2 !== false) {
                res.type  = CT.LUA_TNUMFLT;
                res.value = numarith(L, op, n1, n2);
                return;
            }
            else break;  /* go to the end */
        }
    }
    /* could not perform raw operation; try metamethod */
    if (process.env.LUA_USE_APICHECK && !(L !== null)) throw Error("assertion failed");  /* should not fail when folding (compile time) */
    ltm.luaT_trybinTM(L, p1, p2, res, (op - defs.LUA_OPADD) + ltm.TMS.TM_ADD);
};


module.exports.CClosure          = CClosure;
module.exports.LClosure          = LClosure;
module.exports.LUA_TDEADKEY      = LUA_TDEADKEY;
module.exports.LUA_TPROTO        = LUA_TPROTO;
module.exports.LocVar            = LocVar;
module.exports.TValue            = TValue;
module.exports.UTF8BUFFSZ        = UTF8BUFFSZ;
module.exports.luaO_arith        = luaO_arith;
module.exports.luaO_chunkid      = luaO_chunkid;
module.exports.luaO_hexavalue    = luaO_hexavalue;
module.exports.luaO_int2fb       = luaO_int2fb;
module.exports.luaO_pushfstring  = luaO_pushfstring;
module.exports.luaO_pushvfstring = luaO_pushvfstring;
module.exports.luaO_str2num      = luaO_str2num;
module.exports.luaO_utf8desc     = luaO_utf8desc;
module.exports.luaO_utf8esc      = luaO_utf8esc;
module.exports.numarith          = numarith;
