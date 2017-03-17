"use strict";

const assert  = require('assert');
const sprintf = require('sprintf');

const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');
const lobject = require('./lobject.js');
const lua     = require('./lua.js');
const luaconf = require('./luaconf.js');
const CT      = lua.constant_types;

const L_ESC   = '%'.charCodeAt(0);

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

const isdigit = e => "0".charCodeAt(0) <= e && e <= "9".charCodeAt(0);

const iscntrl = e => (0x00 <= e && e <= 0x1f) || e === 0x7f;

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

const strlib = {
    "byte":    str_byte,
    "char":    str_char,
    "dump":    str_dump,
    "format":  str_format,
    "len":     str_len,
    "lower":   str_lower,
    "rep":     str_rep,
    "reverse": str_reverse,
    "sub":     str_sub,
    "upper":   str_upper
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
