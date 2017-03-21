"use strict";

const assert  = require('assert');
const sprintf = require('sprintf');

const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lobject = require('./lobject.js');
const lua     = require('./lua.js');
const luaconf = require('./luaconf.js');
const CT      = lua.constant_types;

const sL_ESC  = '%';
const L_ESC   = sL_ESC.charCodeAt(0);

// (sizeof(size_t) < sizeof(int) ? MAX_SIZET : (size_t)(INT_MAX))
const MAXSIZE = Number.MAX_SAFE_INTEGER;

/*
** maximum number of captures that a pattern can do during
** pattern-matching. This limit is arbitrary, but must fit in
** an unsigned char.
*/
const LUA_MAXCAPTURES = 32;

/* translate a relative string position: negative means back from end */
const posrelat = function(pos, len) {
    if (pos >= 0) return pos;
    else if (0 - pos > len) return 0;
    else return len + pos + 1;
};

const str_sub = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let l = s.length;
    let start = posrelat(lauxlib.luaL_checkinteger(L, 2), l);
    let end = posrelat(lauxlib.luaL_optinteger(L, 3, -1), l);
    if (start < 1) start = 1;
    if (end > l) end = l;
    if (start <= end)
        lapi.lua_pushstring(L, s.slice(start - 1, (start - 1) + (end - start + 1)));
    else lapi.lua_pushliteral(L, "");
    return 1;
};

const str_len = function(L) {
    lapi.lua_pushinteger(L, lauxlib.luaL_checkstring(L, 1).length);
    return 1;
};

const str_char = function(L) {
    let n = lapi.lua_gettop(L);  /* number of arguments */
    let p = "";
    for (let i = 1; i <= n; i++) {
        let c = lauxlib.luaL_checkinteger(L, i);
        lauxlib.luaL_argcheck(L, c >= 0 && c <= 255, "value out of range"); // Strings are 8-bit clean
        p += String.fromCharCode(c);
    }
    lapi.lua_pushstring(L, p);
    return 1;
};

const writer = function(L, b, size, B) {
    assert(Array.isArray(b));
    B.push(...b.slice(0, size));
    return 0;
};

const str_dump = function(L) {
    let b = [];
    let strip = lapi.lua_toboolean(L, 2);
    lauxlib.luaL_checktype(L, 1, CT.LUA_TFUNCTION);
    lapi.lua_settop(L, 1);
    if (lapi.lua_dump(L, writer, b, strip) !== 0)
        return lauxlib.luaL_error(L, "unable to dump given function");
    L.stack[L.top++] = new lobject.TValue(CT.LUA_TLNGSTR, b); // We don't want lua > js > lua string conversion here
    return 1;
};

const SIZELENMOD = luaconf.LUA_NUMBER_FRMLEN.length;

const L_NBFD = 16; // TODO: arbitrary

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
** Add integer part of 'x' to buffer and return new 'x'
*/
const adddigit = function(buff, n, x) {
    let d = Math.floor(x)|0;  /* get integer part from 'x' */
    buff[n] = d < 10 ? d + '0'.charCodeAt(0) : d - 10 + 'a'.charCodeAt(0);  /* add to buffer */
    return x - d;  /* return what is left */
};

const num2straux = function(buff, x) {
    /* if 'inf' or 'NaN', format it like '%g' */
    if (x === Infinity || isNaN(x))
        return sprintf(luaconf.LUA_NUMBER_FMT, x).split('').map(e => e.charCodeAt(0));
    else if (x === 0) {  /* can be -0... */
        /* create "0" or "-0" followed by exponent */
        return sprintf(luaconf.LUA_NUMBER_FMT + "x0p+0", x).split('').map(e => e.charCodeAt(0));
    } else {
        let fe = frexp(x);  /* 'x' fraction and exponent */
        let m = fe[0];
        let e = fe[1];
        let n = 0;  /* character count */
        if (m < 0) {  /* is number negative? */
            buff[n++] = '-'.charCodeAt(0);  /* add signal */
            m = -m;  /* make it positive */
        }
        buff[n++] = '0'.charCodeAt(0);
        buff[n++] = 'x'.charCodeAt(0);  /* add "0x" */
        m = adddigit(buff, n++, m * (1 << L_NBFD));  /* add first digit */
        e -= L_NBFD;  /* this digit goes before the radix point */
        if (m > 0) {  /* more digits? */
            buff[n++] = luaconf.lua_getlocaledecpoint().charCodeAt(0);   /* add radix point */
            do {  /* add as many digits as needed */
                m = adddigit(buff, n++, m * 16);
            } while (m > 0);
        }
        let exp = sprintf("p%+d", e).split('').map(e => e.charCodeAt(0));
        return buff.slice(0, n + 1).concat(exp).concat(buff.slice(n));
    }
};

const lua_number2strx = function(L, buff, fmt, x) {
    let n = num2straux(buff, x);
    if (fmt[SIZELENMOD] === 'A'.charCodeAt(0)) {
        for (let i = 0; i < n; i++)
            buff[i] = String.fromCharCode(buff[i]).toUpperCase().charCodeAt(0);
    } else if (fmt[SIZELENMOD] !== 'a'.charCodeAt(0))
        lauxlib.luaL_error(L, "modifiers for format '%a'/'%A' not implemented");
    return n;
};

/*
** Maximum size of each formatted item. This maximum size is produced
** by format('%.99f', -maxfloat), and is equal to 99 + 3 ('-', '.',
** and '\0') + number of decimal digits to represent maxfloat (which
** is maximum exponent + 1). (99+3+1 then rounded to 120 for "extra
** expenses", such as locale-dependent stuff)
*/
const MAX_ITEM   = 120;// TODO: + l_mathlim(MAX_10_EXP);


/* valid flags in a format specification */
const FLAGS      = ["-", "+", " ", "#", "0"].map(e => e.charCodeAt(0));

/*
** maximum size of each format specification (such as "%-099.99d")
*/
const MAX_FORMAT = 32;

// TODO: locale ?
const isalpha = e => /^[a-zA-Z]$/.test(e.charAt(0));
const isdigit = e => "0".charCodeAt(0) <= e && e <= "9".charCodeAt(0);
const iscntrl = e => (0x00 <= e && e <= 0x1f) || e === 0x7f;
const isgraph = e => e.charCodeAt(0) > 32 && e.charCodeAt(0) < 127; // TODO: Will only work for ASCII
const islower = e => /^(?![A-Z]).*$/.test(e.charAt(0));
const isupper = e => /^(?![a-z]).*$/.test(e.charAt(0));
const isalnum = e => /^[a-zA-Z0-9]$/.test(e.charAt(0));
const ispunct = e => isgraph(e) && !isalnum(e);
const isspace = e => /^\s$/.test(e.charAt(0));
const isxdigit = e => /^[0-9A-Fa-f]$/.test(e.charAt(0));

const addquoted = function(b, s) {
    lauxlib.luaL_addchar(b, '"');
    let len = s.length;
    while (len--) {
        if (s[0] === '"'.charCodeAt(0) || s[0] === '\\'.charCodeAt(0) || s[0] === '\n'.charCodeAt(0)) {
            lauxlib.luaL_addchar(b, '\\');
            lauxlib.luaL_addchar(b, String.fromCharCode(s[0]));
        } else if (iscntrl(s[0])) {
            let buff = [];
            if (!isdigit(s[1]))
                buff = sprintf("\\%d", s[0]).split('').map(e => e.charCodeAt(0));
            else
                buff = sprintf("\\%03d", s[0]).split('').map(e => e.charCodeAt(0));
            lauxlib.luaL_addstring(b, buff);
        } else
            lauxlib.luaL_addchar(b, String.fromCharCode(s[0]));
        s = s.slice(1);
    }
    lauxlib.luaL_addchar(b, '"');
};

/*
** Ensures the 'buff' string uses a dot as the radix character.
*/
const checkdp = function(buff) {
    if (buff.indexOf('.') < 0) {  /* no dot? */
        let point = luaconf.lua_getlocaledecpoint().charCodeAt(0);  /* try locale point */
        let ppoint = buff.indexOf(point);
        if (ppoint) point[ppoint] = '.';  /* change it to a dot */
    }
};

const addliteral = function(L, b, arg) {
    switch(lapi.lua_type(L, arg)) {
        case CT.LUA_TSTRING: {
            let s = L.stack[lapi.index2addr_(L, arg)].value;
            addquoted(b, s, s.length);
            break;
        }
        case CT.LUA_TNUMBER: {
            let buff = lauxlib.luaL_prepbuffsize(b, MAX_ITEM);
            if (!lapi.lua_isinteger(L, arg)) {  /* float? */
                let n = lapi.lua_tonumber(L, arg);  /* write as hexa ('%a') */
                buff.b += lapi.lua_number2strx(L, buff.b, `%${luaconf.LUA_INTEGER_FRMLEN}a`, n);
                checkdp(buff.b);  /* ensure it uses a dot */
            } else {  /* integers */
                let n = lapi.lua_tointeger(L, arg);
                let format = (n === Number.MIN_SAFE_INTEGER) ? `0x%${luaconf.LUA_INTEGER_FRMLEN}x` : luaconf.LUA_INTEGER_FMT;
                buff.b += sprintf(format, n|0);
            }
            break;
        }
        case CT.LUA_TNIL: case CT.LUA_TBOOLEAN: {
            lauxlib.luaL_tolstring(L, arg);
            lauxlib.luaL_addvalue(b);
            break;
        }
        default: {
            lauxlib.luaL_argerror(L, arg, "value has no literal form");
        }
    }
};

const scanformat = function(L, strfrmt, form) {
    let p = strfrmt;
    while (p[0] !== 0 && FLAGS.indexOf(p[0]) >= 0) p = p.slice(1);  /* skip flags */
    if (strfrmt.length - p.length >= FLAGS.length)
        lauxlib.luaL_error(L, "invalid format (repeated flags)");
    if (isdigit(p[0])) p = p.slice(1);  /* skip width */
    if (isdigit(p[0])) p = p.slice(1);  /* (2 digits at most) */
    if (p[0] === '.'.charCodeAt(0)) {
        p = p.slice(1);
        if (isdigit(p[0])) p = p.slice(1);  /* skip precision */
        if (isdigit(p[0])) p = p.slice(1);  /* (2 digits at most) */
    }
    if (isdigit(p[0]))
        lauxlib.luaL_error(L, "invalid format (width or precision too long)");
    form[0] = "%".charCodeAt(0);
    for (let i = 0; i < strfrmt.length - p.length + 1; i++)
        form[i + 1] = strfrmt[i];
    // form[strfrmt.length - p.length + 2] = 0;
    return {
        form: form,
        p: p
    };
};

/*
** add length modifier into formats
*/
const addlenmod = function(form, lenmod) {
    let l = form.length;
    let lm = lenmod.length;
    let spec = form[l - 1];
    for (let i = 0; i < lenmod.length; i++)
        form[i + l - 1] = lenmod[i];
    form[l + lm - 1] = spec;
    // form[l + lm] = 0;
    return form;
};

const str_format = function(L) {
    let top = lapi.lua_gettop(L);
    let arg = 1;
    let strfrmt = lauxlib.luaL_checkstring(L, arg);
    strfrmt = L.stack[lapi.index2addr_(L, 1)].value;
    let b = new lauxlib.luaL_Buffer(L);

    while (strfrmt.length > 0) {
        if (strfrmt[0] !== L_ESC) {
            lauxlib.luaL_addchar(b, String.fromCharCode(strfrmt[0]));
            strfrmt = strfrmt.slice(1);
        } else if ((strfrmt = strfrmt.slice(1))[0] === L_ESC) {
            lauxlib.luaL_addchar(b, String.fromCharCode(strfrmt[0]));
            strfrmt = strfrmt.slice(1);
        } else { /* format item */
            let form = [];  /* to store the format ('%...') */
            let buff = lauxlib.luaL_prepbuffsize(b, MAX_ITEM);  /* to put formatted item */
            if (++arg > top)
                lauxlib.luaL_argerror(L, arg, "no value");
            let f = scanformat(L, strfrmt, form);
            strfrmt = f.p;
            form = f.form;
            switch (String.fromCharCode(strfrmt[0])) {
                case 'c': {
                    strfrmt = strfrmt.slice(1);
                    buff.b += sprintf(String.fromCharCode(...form), lauxlib.luaL_checkinteger(L, arg));
                    break;
                }
                case 'd': case 'i':
                case 'o': case 'u': case 'x': case 'X': {
                    strfrmt = strfrmt.slice(1);
                    let n = lauxlib.luaL_checkinteger(L, arg);
                    form = addlenmod(form, luaconf.LUA_INTEGER_FRMLEN.split('').map(e => e.charCodeAt(0)));
                    buff.b += sprintf(String.fromCharCode(...form), n|0);
                    break;
                }
                case 'a': case 'A': {
                    strfrmt = strfrmt.slice(1);
                    form = addlenmod(form, luaconf.LUA_INTEGER_FRMLEN.split('').map(e => e.charCodeAt(0)));
                    buff.b += lua_number2strx(L, buff.b, form, lauxlib.luaL_checknumber(L, arg));
                    break;
                }
                case 'e': case 'E': case 'f':
                case 'g': case 'G': {
                    strfrmt = strfrmt.slice(1);
                    let n = lauxlib.luaL_checknumber(L, arg);
                    form = addlenmod(form, luaconf.LUA_INTEGER_FRMLEN.split('').map(e => e.charCodeAt(0)));
                    buff.b += sprintf(String.fromCharCode(...form), n);
                    break;
                }
                case 'q': {
                    strfrmt = strfrmt.slice(1);
                    addliteral(L, b, arg);
                    break;
                }
                case 's': {
                    strfrmt = strfrmt.slice(1);
                    let str = lauxlib.luaL_tolstring(L, arg);
                    let  s = L.stack[lapi.index2addr_(L, arg)].value;
                    if (form[2] === '\0')  /* no modifiers? */
                        lauxlib.luaL_addvalue(b);  /* keep entire string */
                    else {
                        lauxlib.luaL_argcheck(L, s.length === str.length, arg, "string contains zeros");
                        if (form.indexOf('.') < 0 && s.length >= 100) {
                            /* no precision and string is too long to be formatted */
                            lauxlib.luaL_addvalue(b);  /* keep entire string */
                        } else {  /* format the string into 'buff' */
                            buff.b += sprintf(String.fromCharCode(...form), s);
                            lapi.lua_pop(L, 1);  /* remove result from 'luaL_tolstring' */
                        }
                    }
                    break;
                }
                default: {  /* also treat cases 'pnLlh' */
                    return lauxlib.luaL_error(L, `invalid option '%${strfrmt[0]}'`);
                }
            }
        }
    }

    lauxlib.luaL_pushresult(b);
    return 1;
};

/* value used for padding */
const LUAL_PACKPADBYTE = 0x00;

/* maximum size for the binary representation of an integer */
const MAXINTSIZE = 16;

const SZINT = 8; // Size of lua_Integer

/* number of bits in a character */
const NB = 8;

/* mask for one character (NB 1's) */
const MC = ((1 << NB) - 1);

const MAXALIGN = 8;

/*
** information to pack/unpack stuff
*/
class Header {
    constructor(L) {
        this.L = L;
        this.islittle = true;
        this.maxalign = 1;
    }
}

/*
** options for pack/unpack
*/
const KOption = {
    Kint:       0, /* signed integers */
    Kuint:      1, /* unsigned integers */
    Kfloat:     2, /* floating-point numbers */
    Kchar:      3, /* fixed-length strings */
    Kstring:    4, /* strings with prefixed length */
    Kzstr:      5, /* zero-terminated strings */
    Kpadding:   6, /* padding */
    Kpaddalign: 7, /* padding for alignment */
    Knop:       8  /* no-op (configuration or spaces) */
};

const digit = function(c) {
    return '0'.charCodeAt(0) <= c.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0);
};

const getnum = function(fmt, df) {
    if (!digit(fmt.s[0]))  /* no number? */
        return df;  /* return default value */
    else {
        let a = 0;
        do {
            a = a * 10 + (fmt.s[0].charCodeAt(0) - '0'.charCodeAt(0));
            fmt.s = fmt.s.slice(1);
        } while (digit(fmt.s[0]) && a <= (MAXSIZE - 9)/10);
        return a;
    }
};

/*
** Read an integer numeral and raises an error if it is larger
** than the maximum size for integers.
*/
const getnumlimit = function(h, fmt, df) {
    let sz = getnum(fmt, df);
    if (sz > MAXINTSIZE || sz <= 0)
        lauxlib.luaL_error(h.L, `integral size (${sz}) out of limits [1,${MAXINTSIZE}]`);
    return sz;
};

/*
** Read and classify next option. 'size' is filled with option's size.
*/
const getoption = function(h, fmt) {
    let r = {
        opt: NaN,
        size: NaN
    };

    r.opt = fmt.s[0];
    fmt.s = fmt.s.slice(1);
    r.size = 0;  /* default */
    switch (r.opt) {
        case 'b': r.size = 1; r.opt = KOption.Kint;   return r; // sizeof(char): 1
        case 'B': r.size = 1; r.opt = KOption.Kuint;  return r;
        case 'h': r.size = 2; r.opt = KOption.Kint;   return r; // sizeof(short): 2
        case 'H': r.size = 2; r.opt = KOption.Kuint;  return r;
        case 'l': r.size = 8; r.opt = KOption.Kint;   return r; // sizeof(long): 8
        case 'L': r.size = 8; r.opt = KOption.Kuint;  return r;
        case 'j': r.size = 8; r.opt = KOption.Kint;   return r; // sizeof(lua_Integer): 8
        case 'J': r.size = 8; r.opt = KOption.Kuint;  return r;
        case 'T': r.size = 8; r.opt = KOption.Kuint;  return r; // sizeof(size_t): 8
        case 'f': r.size = 4; r.opt = KOption.Kfloat; return r; // sizeof(float): 4
        case 'd': r.size = 8; r.opt = KOption.Kfloat; return r; // sizeof(double): 8
        case 'n': r.size = 8; r.opt = KOption.Kfloat; return r; // sizeof(lua_Number): 8
        case 'i': r.size = getnumlimit(h, fmt, 4); r.opt = KOption.Kint;    return r; // sizeof(int): 4
        case 'I': r.size = getnumlimit(h, fmt, 4); r.opt = KOption.Kuint;   return r;
        case 's': r.size = getnumlimit(h, fmt, 8); r.opt = KOption.Kstring; return r;
        case 'c': {
            r.size = getnum(fmt, -1);
            if (r.size === -1)
                lauxlib.luaL_error(h.L, "missing size for format option 'c'");
            r.opt = KOption.Kchar;
            return r;
        }
        case 'z':             r.opt = KOption.Kzstr;      return r;
        case 'x': r.size = 1; r.opt = KOption.Kpadding;   return r;
        case 'X':             r.opt = KOption.Kpaddalign; return r;
        case ' ': break;
        case '<': h.islittle = true; break;
        case '>': h.islittle = false; break;
        case '=': h.islittle = true; break;
        case '!': h.maxalign = getnumlimit(h, fmt, MAXALIGN); break;
        default: lauxlib.luaL_error(h.L, `invalid format option '${r.opt}'`);
    }

    r.opt = KOption.Knop;
    return r;
};

/*
** Read, classify, and fill other details about the next option.
** 'psize' is filled with option's size, 'notoalign' with its
** alignment requirements.
** Local variable 'size' gets the size to be aligned. (Kpadal option
** always gets its full alignment, other options are limited by
** the maximum alignment ('maxalign'). Kchar option needs no alignment
** despite its size.
*/
const getdetails = function(h, totalsize, fmt) {
    let r = {
        opt: NaN,
        size: NaN,
        ntoalign: NaN
    };

    let opt = getoption(h, fmt);
    r.size = opt.size;
    r.opt = opt.opt;
    let align = r.size;  /* usually, alignment follows size */
    if (r.opt === KOption.Kpaddalign) {  /* 'X' gets alignment from following option */
        if (fmt.s[0] === 0)
            lauxlib.luaL_argerror(h.L, 1, "invalid next option for option 'X'");
        else {
            let o = getoption(h, fmt);
            align = o.size;
            o = o.opt;
            if (o === KOption.Kchar || align === 0)
                lauxlib.luaL_argerror(h.L, 1, "invalid next option for option 'X'");
        }
    }
    if (align <= 1 || r.opt === KOption.Kchar)  /* need no alignment? */
        r.ntoalign = 0;
    else {
        if (align > h.maxalign)  /* enforce maximum alignment */
            align = h.maxalign;
        if ((align & (align -1)) !== 0)  /* is 'align' not a power of 2? */
            lauxlib.luaL_argerror(h.L, 1, "format asks for alignment not power of 2");
        r.ntoalign = (align - (totalsize & (align - 1))) & (align - 1);
    }
    return r;
};

/*
** Pack integer 'n' with 'size' bytes and 'islittle' endianness.
** The final 'if' handles the case when 'size' is larger than
** the size of a Lua integer, correcting the extra sign-extension
** bytes if necessary (by default they would be zeros).
*/
const packint = function(b, n, islittle, size, neg) {
    let buff = new Array(size);

    buff[islittle ? 0 :  size - 1] = n & MC;  /* first byte */
    for (let i = 1; i < size; i++) {
        n >>= NB;
        buff[islittle ? i : size - 1 - i] = n & MC;
    }
    if (neg && size > SZINT) {  /* negative number need sign extension? */
        for (let i = SZINT; i < size; i++)  /* correct extra bytes */
            buff[islittle ? i : size - 1 - i] = MC;
    }
    b.push(...buff);  /* add result to buffer */
};

const packnum = function(b, n, islittle, size) {
    let dv = new DataView(new ArrayBuffer(size));
    dv.setFloat64(0, n, islittle);

    for (let i = 0; i < 8; i++)
        b.push(dv.getUint8(i, islittle));
};

const str_pack = function(L) {
    let b = [];
    let h = new Header(L);
    let fmt = lauxlib.luaL_checkstring(L, 1).split('');  /* format string */
    fmt.push('\0'); // Add \0 to avoid overflow
    fmt = {
        s: fmt,
        off: 0
    };
    let arg = 1;  /* current argument to pack */
    let totalsize = 0;  /* accumulate total size of result */
    lapi.lua_pushnil(L);  /* mark to separate arguments from string buffer */
    while (fmt.s.length - 1 > 0) {
        let details = getdetails(h, totalsize, fmt);
        let opt = details.opt;
        let size = details.size;
        let ntoalign = details.ntoalign;
        totalsize += ntoalign + size;
        while (ntoalign-- > 0)
            b.push(LUAL_PACKPADBYTE);  /* fill alignment */
        arg++;
        switch (opt) {
            case KOption.Kint: {  /* signed integers */
                let n = lauxlib.luaL_checkinteger(L, arg);
                if (size < SZINT) {  /* need overflow check? */
                    let lim = 1 << (size * 8) - 1;
                    lauxlib.luaL_argcheck(L, -lim <= n && n < lim, arg, "integer overflow");
                }
                packint(b, n, h.islittle, size, n < 0);
                break;
            }
            case KOption.Kuint: {  /* unsigned integers */
                let n = lauxlib.luaL_checkinteger(L, arg);
                if (size < SZINT)
                    lauxlib.luaL_argcheck(L, n < (1 << (size * NB)), arg, "unsigned overflow");
                packint(b, n, h.islittle, size, false);
                break;
            }
            case KOption.Kfloat: {  /* floating-point options */
                let n = lauxlib.luaL_checknumber(L, arg);  /* get argument */
                packnum(b, n, h.islittle, size);
                break;
            }
            case KOption.Kchar: {  /* fixed-size string */
                let s = lauxlib.luaL_checkstring(L, arg);
                s = L.stack[lapi.index2addr_(L, arg)];
                let len = s.value.length;
                lauxlib.luaL_argcheck(L, len <= size, arg, "string long than given size");
                b.push(...s.value);  /* add string */
                while (len++ < size)  /* pad extra space */
                    b.push(LUAL_PACKPADBYTE);
                break;
            }
            case KOption.Kstring: {  /* strings with length count */
                let s = lauxlib.luaL_checkstring(L, arg);
                s = L.stack[lapi.index2addr_(L, arg)].value;
                let len = s.value.length;
                lauxlib.luaL_argcheck(L, size >= NB || len < (1 << size * NB), arg, "string length does not fit in given size");
                packint(b, len, h.islittle, size, 0);  /* pack length */
                b.push(...s.value);
                totalsize += len;
                break;
            }
            case KOption.Kzstr: {  /* zero-terminated string */
                let s = lauxlib.luaL_checkstring(L, arg);
                s = L.stack[lapi.index2addr_(L, arg)].value;
                let len = s.value.length;
                lauxlib.luaL_argcheck(L, s.value.length === String.fromCharCode(...s.value).length, arg, "strings contains zeros");
                b.push(...s.value);
                b.push(0);  /* add zero at the end */
                totalsize += len + 1;
                break;
            }
            case KOption.Kpadding: b.push(LUAL_PACKPADBYTE);
            case KOption.Kpaddalign: case KOption.Knop:
                arg--;  /* undo increment */
                break;
        }
    }
    L.stack[L.top++] = new lobject.TValue(CT.LUA_TLNGSTR, b); // We don't want lua > js > lua string conversion here
    return 1;
};

const str_reverse = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).split("").reverse().join(""));
    return 1;
};

const str_lower = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).toLowerCase());
    return 1;
};

const str_upper = function(L) {
    lapi.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).toUpperCase());
    return 1;
};

const str_rep = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let n = lauxlib.luaL_checkinteger(L, 2);
    let sep = lauxlib.luaL_optstring(L, 3, "");

    lapi.lua_pushstring(L, (s + sep).repeat(n - 1) + s);
    return 1;
};

const str_byte = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    s = L.stack[lapi.index2addr_(L, 1)].value;
    let l = s.length;
    let posi = posrelat(lauxlib.luaL_optinteger(L, 2, 1), l);
    let pose = posrelat(lauxlib.luaL_optinteger(L, 3, posi), l);

    if (posi < 1) posi = 1;
    if (pose > l) pose = l;
    if (posi > pose) return 0;  /* empty interval; return no values */
    if (pose - posi >= Number.MAX_SAFE_INTEGER)  /* arithmetic overflow? */
        return lauxlib.luaL_error(L, "string slice too long");

    let n = (pose - posi) + 1;
    lauxlib.luaL_checkstack(L, n, "string slice too long");
    for (let i = 0; i < n; i++)
        lapi.lua_pushinteger(L, s[posi + i - 1]);
    return n;
};

const str_packsize = function(L) {
    let h = new Header(L);
    let fmt = lauxlib.luaL_checkstring(L, 1).split('');
    fmt.push('\0'); // Add \0 to avoid overflow
    fmt = {
        s: fmt,
        off: 0
    };
    let totalsize = 0;  /* accumulate total size of result */
    while (fmt.s.length - 1 > 0) {
        let details = getdetails(h, totalsize, fmt);
        let opt = details.opt;
        let size = details.size;
        let ntoalign = details.ntoalign;
        size += ntoalign;  /* total space used by option */
        lauxlib.luaL_argcheck(L, totalsize <= MAXSIZE - size - 1, "format result too large");
        totalsize += size;
        switch (opt) {
            case KOption.Kstring:  /* strings with length count */
            case KOption.Kzstr:    /* zero-terminated string */
                lauxlib.luaL_argerror(L, 1, "variable-length format");
            default:  break;
        }
    }
    lapi.lua_pushinteger(L, totalsize);
    return 1;
};

/*
** Unpack an integer with 'size' bytes and 'islittle' endianness.
** If size is smaller than the size of a Lua integer and integer
** is signed, must do sign extension (propagating the sign to the
** higher bits); if size is larger than the size of a Lua integer,
** it must check the unread bytes to see whether they do not cause an
** overflow.
*/
const unpackint = function(L, str, islittle, size, issigned) {
    let res = 0;
    let limit = size <= SZINT ? size : SZINT;
    for (let i = limit - 1; i >= 0; i--) {
        res <<= NB;
        res |= str[islittle ? i : size - 1 - i];
    }
    if (size < SZINT) {  /* real size smaller than lua_Integer? */
        if (issigned) {  /* needs sign extension? */
            let mask = 1 << (size * NB - 1);
            res = ((res ^ mask) - mask);  /* do sign extension */
        }
    } else if (size > SZINT) {  /* must check unread bytes */
        let mask = issigned || res >= 0 ? 0 : MC;
        for (let i = limit; i < size; i++) {
            if (str[islittle ? i : size - 1 - i] !== mask)
                lauxlib.luaL_error(L, `${size}-byte integer does not fit into Lua Integer`);
        }
    }
    return res;
};

const unpacknum = function(L, b, islittle, size) {
    assert(b.length >= size);

    let dv = new DataView(new ArrayBuffer(size));
    b.forEach((e, i) => dv.setUint8(i, e, islittle));

    return dv.getFloat64(0, islittle);
};

const str_unpack = function(L) {
    let h = new Header(L);
    let fmt = lauxlib.luaL_checkstring(L, 1).split('');
    fmt.push('\0'); // Add \0 to avoid overflow
    fmt = {
        s: fmt,
        off: 0
    };
    let data = lauxlib.luaL_checkstring(L, 2);
    data = L.stack[lapi.index2addr_(L, 2)].value;
    let ld = data.length;
    let pos = posrelat(lauxlib.luaL_optinteger(L, 3, 1), ld) - 1;
    let n = 0;  /* number of results */
    lauxlib.luaL_argcheck(L, pos <= ld, 3, "initial position out of string");
    while (fmt.s.length - 1 > 0) {
        let details = getdetails(h, pos, fmt);
        let opt = details.opt;
        let size = details.size;
        let ntoalign = details.ntoalign;
        if (/*ntoalign + size > ~pos ||*/ pos + ntoalign + size > ld)
            lauxlib.luaL_argerror(L, 2, "data string too short");
        pos += ntoalign;  /* skip alignment */
        /* stack space for item + next position */
        lauxlib.luaL_checkstack(L, 2, "too many results");
        n++;
        switch (opt) {
            case KOption.Kint:
            case KOption.Kuint: {
                let res = unpackint(L, data.slice(pos), h.islittle, size, opt === KOption.Kint);
                lapi.lua_pushinteger(L, res);
                break;
            }
            case KOption.Kfloat: {
                let res = unpacknum(L, data.slice(pos), h.islittle, size);
                lapi.lua_pushnumber(L, res);
                break;
            }
            case KOption.Kchar: {
                // lapi.lua_pushstring(L, data.slice(pos, pos + size));
                L.stack[L.top++] = new lobject.TValue(CT.LUA_TLNGSTR, data.slice(pos, pos + size));
                break;
            }
            case KOption.Kstring: {
                let len = unpackint(L, data.slice(pos), h.islittle, size, 0);
                lauxlib.luaL_argcheck(L, pos + len + size <= ld, 2, "data string too short");
                // lapi.lua_pushstring(L, data.slice(pos + size, pos + size + len));
                L.stack[L.top++] = new lobject.TValue(CT.LUA_TLNGSTR, data.slice(pos + size, pos + size + len));
                pos += len;  /* skip string */
                break;
            }
            case KOption.Kzstr: {
                let len = data.slice(pos).indexOf(0);
                // lapi.lua_pushstring(L, data.slice(pos, pos + len));
                L.stack[L.top++] = new lobject.TValue(CT.LUA_TLNGSTR, data.slice(pos, pos + len));
                pos += len + 1;  /* skip string plus final '\0' */
                break;
            }
            case KOption.Kpaddalign: case KOption.Kpadding: case KOption.Knop:
                n--;  /* undo increment */
                break;
        }
        pos += size;
    }
    lapi.lua_pushinteger(L, pos + 1);  /* next position */
    return n + 1;
};

const CAP_UNFINISHED = -1;
const CAP_POSITION   = -2;
const MAXCCALLS      = 200;
const SPECIALS       = ["^", "$", "*", "+", "?", ".", "(", "[", "%", "-"];

class MatchState {
    constructor(L) {
        this.src = null;  /* unmodified source string */
        this.src_init = null;  /* init of source string */
        this.src_end = null;  /* end ('\0') of source string */
        this.p = null;  /* unmodified pattern string */
        this.p_end = null;  /* end ('\0') of pattern */
        this.L = L;
        this.matchdepth = NaN;  /* control for recursive depth */
        this.level = NaN;  /* total number of captures (finished or unfinished) */
        this.capture = [];
    }
}

const check_capture = function(ms, l) {
    l = String.fromCharCode(l - '1'.charCodeAt(0));
    if (l < 0 || l >= ms.level || ms.capture[l].len === CAP_UNFINISHED)
        return lauxlib.luaL_error(ms.L, `invalid capture index %${l + 1}`);
    return l;
};

const capture_to_close = function(ms) {
    let level = ms.level;
    for (level--; level >= 0; level--)
        if (ms.capture[level].len === CAP_UNFINISHED) return level;
    return lauxlib.luaL_error(ms.L, "invalid pattern capture");
};

const classend = function(ms, p) {
    switch(ms.p.charAt(p++)) {
        case sL_ESC: {
            if (p === ms.p_end)
                lauxlib.luaL_error(ms.L, "malformed pattern (ends with '%')");
            return p + 1;
        }
        case '[': {
            if (ms.p.charAt(p) === '^') p++;
            do {  /* look for a ']' */
                if (p === ms.p_end)
                    lauxlib.luaL_error(ms.L, "malformed pattern (missing ']')");
                if (ms.p.charAt(p++) === L_ESC && p < ms.p_end)
                    p++;  /* skip escapes (e.g. '%]') */
            } while (ms.p.charAt(p) !== ']');
            return p + 1;
        }
        default: {
            return p;
        }
    }
};

const match_class = function(c, cl) {
    let res;
    switch (cl.toLowerCase()) {
        case 'a' : res = isalpha(c); break;
        case 'c' : res = iscntrl(c); break;
        case 'd' : res = isdigit(c.charCodeAt(0)); break;
        case 'g' : res = isgraph(c); break;
        case 'l' : res = islower(c); break;
        case 'p' : res = ispunct(c); break;
        case 's' : res = isspace(c); break;
        case 'u' : res = isupper(c); break;
        case 'w' : res = isalnum(c); break;
        case 'x' : res = isxdigit(c); break;
        case 'z' : res = (c.charCodeAt(0) === 0); break;  /* deprecated option */
        default: return (cl === c);
    }
    return (islower(cl) ? res : !res);
};

const matchbracketclass = function(ms, c, p, ec) {
    let sig = true;
    if (ms.p.charAt(p + 1) === '^') {
        sig = false;
        p++;  /* skip the '^' */
    }
    while (++p < ec) {
        if (ms.p.charAt(p) === L_ESC) {
            p++;
            if (match_class(c, ms.p.charAt(p)))
                return sig;
        } else if (ms.p.charAt(p + 1) === '-' && p + 2 < ec) {
            p += 2;
            if (ms.p.charAt(p - 2) <= c.charCodeAt(0) && c.charCodeAt(0) <= ms.p.charAt(p))
                return sig;
        } else if (ms.p.charAt(p) === c) return sig;
    }
    return !sig;
};

const singlematch = function(ms, s, p, ep) {
    if (s >= ms.src_end)
        return false;
    else {
        let c = ms.src.charAt(s);
        switch (ms.p.charAt(p)) {
            case '.': return true;  /* matches any char */
            case sL_ESC: return match_class(c, ms.p.charAt(p + 1));
            case '[': return matchbracketclass(ms, c, p, ep - 1);
            default: return ms.p.charAt(p) === c;
        }
    }
};

const matchbalance = function(ms, s, p) {
    if (p >= ms.p_end - 1)
        lauxlib.luaL_error(ms.L, "malformed pattern (missing arguments to '%b'");
    if (ms.src.charAt(s) !== ms.p.charAt(p))
        return null;
    else {
        let b = ms.p.charAt(p);
        let e = ms.p.charAt(p + 1);
        let cont = 1;
        while (++s < ms.src_end) {
            if (ms.src.charAt(s) === e) {
                if (--cont === 0) return s + 1;
            }
            else if (s === b) cont++;
        }
    }
    return null;  /* string ends out of balance */
};

const max_expand = function(ms, s, p, ep) {
    let i = 0;  /* counts maximum expand for item */
    while (singlematch(ms, s + i, p, ep))
        i++;
    /* keeps trying to match with the maximum repetitions */
    while (i >= 0) {
        let res = match(ms, s + i, ep + 1);
        if (res) return res;
        i--;  /* else didn't match; reduce 1 repetition to try again */
    }
    return null;
};

const min_expand = function(ms, s, p, ep) {
    for (;;) {
        let res = match(ms, s, ep + 1);
        if (res !== null)
            return res;
        else if (singlematch(ms, s, p, ep))
            s++;  /* try with one more repetition */
        else return null;
    }
};

const start_capture = function(ms, s, p, what) {
    let level = ms.level;
    if (level >= LUA_MAXCAPTURES) lauxlib.luaL_error(ms.L, "too many captures");
    ms.capture[level] = ms.capture[level] ? ms.capture[level] : {};
    ms.capture[level].init = s;
    ms.capture[level].len = what;
    ms.level = level + 1;
    let res;
    if ((res = match(ms, s, p)) === null)  /* match failed? */
        ms.level--;  /* undo capture */
    return res;
};

const end_capture = function(ms, s, p) {
    let l = capture_to_close(ms);
    ms.capture[l].len = s - ms.capture[l].init;  /* close capture */
    let res;
    if ((res = match(ms, s, p)) === null)  /* match failed? */
        ms.capture[l].len = CAP_UNFINISHED;  /* undo capture */
    return res;
};

const match_capture = function(ms, s, l) {
    l = check_capture(ms, l);
    let len = ms.capture[l].len;
    if (ms.src_end >= len && ms.src.slice(ms.capture[l].init, ms.capture[l].init + len) === ms.src.slice(s, s + len))
        return s+len;
    else return null;
};

const match = function(ms, s, p) {
    let gotodefault = false;
    let gotoinit = true;

    if (ms.matchdepth-- === 0)
        lauxlib.luaL_error(ms.L, "pattern too complex");

    while (gotoinit || gotodefault) {
        gotoinit = false;
        if (p !== ms.p_end) {  /* end of pattern? */
            switch (gotodefault ? 'x' : ms.p.charAt(p)) {
                case '(': {  /* start capture */
                    if (ms.p.charAt(p + 1) === ')')  /* position capture? */
                        s = start_capture(ms, s, p + 2, CAP_POSITION);
                    else
                        s = start_capture(ms, s, p + 1, CAP_UNFINISHED);
                    break;
                }
                case ')': {  /* end capture */
                    s = end_capture(ms, s, p + 1);
                    break;
                }
                case '$': {
                    if (p + 1 !== ms.p_end) {  /* is the '$' the last char in pattern? */
                        gotodefault = true;  /* no; go to default */
                        break;
                    }
                    s = ms.src.slice(s).length === 0 ? s : null;  /* check end of string */
                    break;
                }
                case sL_ESC: {  /* escaped sequences not in the format class[*+?-]? */
                    switch (ms.p.charAt(p + 1)) {
                        case 'b': {  /* balanced string? */
                            s = matchbalance(ms, s, p + 2);
                            if (s !== null) {
                                p = p.slice(4);
                                gotoinit = true;
                            }
                            break;
                        }
                        case 'f': {
                            p += 2;
                            if (ms.p.charAt(p) !== '[')
                                lauxlib.luaL_error(ms.L, `missing '[' after '%f' in pattern`);
                            let ep = classend(ms, p);  /* points to what is next */
                            let previous = s === ms.src_init ? '\0' : ms.s.charAt(s - 1);
                            if (!matchbracketclass(ms, previous, p, ep - 1) && matchbracketclass(ms, ms.src.charAt(s), p, ep - 1)) {
                                p = ep; gotoinit = true; break;
                            }
                            s = null;  /* match failed */
                            break;
                        }
                        case '0': case '1': case '2': case '3':
                        case '4': case '5': case '6': case '7':
                        case '8': case '9': {  /* capture results (%0-%9)? */
                            s = match_capture(ms, s, ms.p.charAt(p + 1));
                            if (s !== null) {
                                p += 2; gotoinit = true;
                            }
                            break;
                        }
                        default: gotodefault = true;
                    }
                    break;
                }
                default: {  /* pattern class plus optional suffix */
                    gotodefault = false;
                    let ep = classend(ms, p);  /* points to optional suffix */
                    /* does not match at least once? */
                    if (!singlematch(ms, s, p, ep)) {
                        if (ms.p.charAt(ep) === '*' || ms.p.charAt(ep) === '?' || ms.p.charAt(ep) === '-') {  /* accept empty? */
                            p = ep + 1; gotoinit = true; break;
                        } else  /* '+' or no suffix */
                            s = null;  /* fail */
                    } else {  /* matched once */
                        switch (ms.p.charAt(ep)) {  /* handle optional suffix */
                            case '?': {  /* optional */
                                let res;
                                if ((res = match(ms, s + 1, ep + 1)) !== null)
                                    s = res;
                                else {
                                    p = ep + 1; gotoinit = true;
                                }
                                break;
                            }
                            case '+':  /* 1 or more repetitions */
                                s++;  /* 1 match already done */
                            case '*':  /* 0 or more repetitions */
                                s = max_expand(ms, s, p, ep);
                                break;
                            case '-':  /* 0 or more repetitions (minimum) */
                                s = min_expand(ms, s, p, ep);
                                break;
                            default:  /* no suffix */
                                s++; p = ep; gotoinit = true;
                        }
                    }
                    break;
                }
            }
        }
    }
    ms.matchdepth++;
    return s;
};

const push_onecapture = function(ms, i, s, e) {
    if (i >= ms.level) {
        if (i === 0)
            lapi.lua_pushlstring(ms.L, ms.src.slice(s), e - s);  /* add whole match */
        else
            lauxlib.luaL_error(ms.L, `invalid capture index %${i + 1}`);
    } else {
        let l = ms.capture[i].len;
        if (l === CAP_UNFINISHED) lauxlib.luaL_error(ms.L, "unfinished capture");
        if (l === CAP_POSITION)
            lapi.lua_pushinteger(ms.L, ms.src_init + 1);
        else
            lapi.lua_pushlstring(ms.L, ms.src.slice(ms.capture[i].init), l);
    }
};

const push_captures = function(ms, s, e) {
    let nlevels = ms.level === 0 && ms.src.slice(s) ? 1 : ms.level;
    lauxlib.luaL_checkstack(ms.L, nlevels, "too many catpures");
    for (let i = 0; i < nlevels; i++)
        push_onecapture(ms, i, s, e);
    return nlevels;  /* number of strings pushed */
};

const nospecials = function(p, l) {
    let upto = 0;
    do {
        let special = false;
        let supto = p.slice(upto);
        for (let i = 0; i < SPECIALS.length; i++) {
            if (supto.indexOf(SPECIALS[i]) > -1) {
                special = true;
                break;
            }
        }

        if (special)
            return false;  /* pattern has a special character */
        upto = upto + 1;  /* may have more after \0 */
    } while (upto <= l);
    return true;  /* no special chars found */
};

const prepstate = function(ms, L, s, ls, p, lp) {
    ms.L = L;
    ms.matchdepth = MAXCCALLS;
    ms.src = s;
    ms.src_init = 0;
    ms.src_end = ls;
    ms.p = p;
    ms.p_end = lp;
};

const reprepstate = function(ms) {
    ms.level = 0;
    assert(ms.matchdepth === MAXCCALLS);
};

const str_find_aux = function(L, find) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let p = lauxlib.luaL_checkstring(L, 2);
    let ls = s.length;
    let lp = p.length;
    let init = posrelat(lauxlib.luaL_optinteger(L, 3, 1), ls);
    if (init < 1) init = 1;
    else if (init > ls + 1) {  /* start after string's end? */
        lauxlib.lua_pushnil(L);  /* cannot find anything */
        return 1;
    }
    /* explicit request or no special characters? */
    if (find && (lapi.lua_toboolean(L, 4) || nospecials(p, lp))) {
        /* do a plain search */
        let f = s.indexOf(p);
        if (f > -1) {
            lapi.lua_pushinteger(L, f + 1);
            lapi.lua_pushinteger(L, f + lp);
            return 2;
        }
    } else {
        let ms = new MatchState(L);
        let s1 = init - 1;
        let anchor = s.charAt(0) === '^';
        if (anchor) {
            p = p.slice(1); lp--;  /* skip anchor character */
        }
        prepstate(ms, L, s, ls, p, lp);
        do {
            let res;
            reprepstate(ms);
            if ((res = match(ms, s1, 0)) !== null) {
                if (find) {
                    lapi.lua_pushinteger(L, s1 + 1);  /* start */
                    lapi.lua_pushinteger(L, res);   /* end */
                    return push_captures(ms, null, 0) + 2;
                } else
                    return push_captures(ms, s1, res);
            }
        } while (s1++ < ms.src_end && !anchor);
    }
    lapi.lua_pushnil(L);  /* not found */
    return 1;
};

const str_find = function(L) {
    return str_find_aux(L, 1);
};

const str_match = function(L) {
    return str_find_aux(L, 0);
};

/* state for 'gmatch' */
class GMatchState {
    constructor() {
        this.src = NaN;  /* current position */
        this.p = NaN;  /* pattern */
        this.lastmatch = NaN;  /* end of last match */
        this.ms = new MatchState();  /* match state */
    }
}

const gmatch_aux = function(L) {
    let gm = lapi.lua_touserdata(L, lua.lua_upvalueindex(3));
    gm.ms.L = L;
    for (let src = gm.src; src < gm.ms.src_end; src++) {
        reprepstate(gm.ms);
        let e;
        if ((e = match(gm.ms, src, gm.p)) !== null && e !== gm.lastmatch) {
            gm.src = gm.lastmatch = e;
            return push_captures(gm.ms, src, e);
        }
    }
    return 0;  /* not found */
};

const str_gmatch = function(L) {
    let s = lauxlib.luaL_checkstring(L, 1);
    let p = lauxlib.luaL_checkstring(L, 2);
    let ls = s.length;
    let lp = p.length;
    lapi.lua_settop(L, 2);  /* keep them on closure to avoid being collected */
    let gm = lapi.lua_newuserdata(L, new GMatchState());
    prepstate(gm.ms, L, s, ls, p, lp);
    gm.src = 0;
    gm.p = 0;
    gm.lastmatch = null;
    lapi.lua_pushcclosure(L, gmatch_aux, 3);
    return 1;
};

const add_s = function(ms, b, s, e) {
    let L = ms.L;
    let news = lapi.lua_tostring(L, 3);
    let l = news.length;
    for (let i = 0; i < l; i++) {
        if (news.charAt(i) !== sL_ESC)
            lauxlib.luaL_addchar(b, news.charAt(i));
        else {
            i++;  /* skip ESC */
            if (!isdigit(news.charCodeAt(i))) {
                if (news.charAt(i) !== sL_ESC)
                    lauxlib.luaL_error(L, `invalid use of '${sL_ESC}' in replacement string`);
                lauxlib.luaL_addchar(b, news.charAt(i));
            } else if (news.charAt(i) === '0')
                lauxlib.luaL_addlstring(b, ms.src.slice(s), e - s);
            else {
                push_onecapture(ms, news.charCodeAt(i) - '1'.charCodeAt(0), s, e);
                lauxlib.luaL_tolstring(L, -1);
                lapi.lua_remove(L, -2);  /* remove original value */
                lauxlib.luaL_addvalue(b);  /* add capture to accumulated result */
            }
        }
    }
};

const add_value = function(ms, b, s, e, tr) {
    let L = ms.L;
    switch (tr) {
        case CT.LUA_TFUNCTION: {
            lapi.lua_pushvalue(L, 3);
            let n = push_captures(ms, s, e);
            lapi.lua_call(L, n, 1);
            break;
        }
        case CT.LUA_TTABLE: {
            push_onecapture(ms, 0, s, e);
            lapi.lua_gettable(L, 3);
            break;
        }
        default: {  /* LUA_TNUMBER or LUA_TSTRING */
            add_s(ms, b, s, e);
            return;
        }
    }
    if (!lapi.lua_toboolean(L, -1)) {  /* nil or false? */
        lapi.lua_pop(L, 1);
        lapi.lua_pushlstring(L, s, e - s);  /* keep original text */
    } else if (!lapi.lua_isstring(L, -1))
        lauxlib.luaL_error(L, `invalid replacement value (a ${lauxlib.luaL_typename(L, -1)})`);
        lauxlib.luaL_addvalue(b);  /* add result to accumulator */
};

const str_gsub = function(L) {
    let src = lauxlib.luaL_checkstring(L, 1);  /* subject */
    let srcl = src.length;
    let p = lauxlib.luaL_checkstring(L, 2);  /* pattern */
    let lp = p.length;
    let lastmatch = null;  /* end of last match */
    let tr = lapi.lua_type(L, 3);  /* replacement type */
    let max_s = lauxlib.luaL_optinteger(L, 4, srcl + 1);  /* max replacements */
    let anchor = p.charAt(0) === '^';
    let n = 0;  /* replacement count */
    let ms = new MatchState(L);
    let b = new lauxlib.luaL_Buffer(L);
    lauxlib.luaL_argcheck(L, tr === CT.LUA_TNUMBER || tr === CT.LUA_TSTRING || tr === CT.LUA_TFUNCTION || tr === CT.LUA_TTABLE, 3,
        "string/function/table expected");
    lauxlib.luaL_buffinit(L, b);
    if (anchor) {
        p = p.slice(1); lp--;  /* skip anchor character */
    }
    prepstate(ms, L, src, srcl, p, lp);
    src = 0; p = 0;
    while (n < max_s) {
        let e;
        reprepstate(ms);
        if ((e = match(ms, src, p)) !== null && e !== lastmatch) {  /* match? */
            n++;
            add_value(ms, b, src, e, tr);  /* add replacement to buffer */
            src = lastmatch = e;
        } else if (src < ms.src_end)  /* otherwise, skip one character */
            lauxlib.luaL_addchar(b, ms.src.charAt(src++));
        else break;  /* end of subject */
        if (anchor) break;
    }
    lauxlib.luaL_addlstring(b, ms.src.slice(src), ms.src_end - src);
    lauxlib.luaL_pushresult(b);
    lapi.lua_pushinteger(L, n);  /* number of substitutions */
    return 2;
};

const strlib = {
    "byte":     str_byte,
    "char":     str_char,
    "dump":     str_dump,
    "find":     str_find,
    "format":   str_format,
    "gmatch":   str_gmatch,
    "gsub":     str_gsub,
    "len":      str_len,
    "lower":    str_lower,
    "match":    str_match,
    "pack":     str_pack,
    "packsize": str_packsize,
    "rep":      str_rep,
    "reverse":  str_reverse,
    "sub":      str_sub,
    "unpack":   str_unpack,
    "upper":    str_upper
};

const createmetatable = function(L) {
    lapi.lua_createtable(L, 0, 1);  /* table to be metatable for strings */
    lapi.lua_pushliteral(L, "");  /* dummy string */
    lapi.lua_pushvalue(L, -2);  /* copy table */
    lapi.lua_setmetatable(L, -2);  /* set table as metatable for strings */
    lapi.lua_pop(L, 1);  /* pop dummy string */
    lapi.lua_pushvalue(L, -2);  /* get string library */
    lapi.lua_setfield(L, -2, "__index");  /* metatable.__index = string */
    lapi.lua_pop(L, 1);  /* pop metatable */  
};

const luaopen_string = function(L) {
    lauxlib.luaL_newlib(L, strlib);
    createmetatable(L);
    return 1;
};

module.exports.luaopen_string = luaopen_string;
