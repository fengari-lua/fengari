"use strict";

const assert   = require('assert');

const defs     = require('./defs.js');
const ldebug   = require('./ldebug.js');
const ldo      = require('./ldo.js');
const ljstype  = require('./ljstype.js');
const lobject  = require('./lobject.js');
const lstring  = require('./lstring.js');
const ltable   = require('./ltable.js');
const llimits  = require('./llimits.js');
const lzio     = require('./lzio.js');

const {LUA_TLNGSTR} = defs.constant_types;
const char     = defs.char;
const TS       = defs.thread_status;

const FIRST_RESERVED = 257;

const LUA_ENV = defs.to_luastring("_ENV", true);

const RESERVED = {
    /* terminal symbols denoted by reserved words */
    TK_AND:      FIRST_RESERVED,
    TK_BREAK:    FIRST_RESERVED + 1,
    TK_DO:       FIRST_RESERVED + 2,
    TK_ELSE:     FIRST_RESERVED + 3,
    TK_ELSEIF:   FIRST_RESERVED + 4,
    TK_END:      FIRST_RESERVED + 5,
    TK_FALSE:    FIRST_RESERVED + 6,
    TK_FOR:      FIRST_RESERVED + 7,
    TK_FUNCTION: FIRST_RESERVED + 8,
    TK_GOTO:     FIRST_RESERVED + 9,
    TK_IF:       FIRST_RESERVED + 10,
    TK_IN:       FIRST_RESERVED + 11,
    TK_LOCAL:    FIRST_RESERVED + 12,
    TK_NIL:      FIRST_RESERVED + 13,
    TK_NOT:      FIRST_RESERVED + 14,
    TK_OR:       FIRST_RESERVED + 15,
    TK_REPEAT:   FIRST_RESERVED + 16,
    TK_RETURN:   FIRST_RESERVED + 17,
    TK_THEN:     FIRST_RESERVED + 18,
    TK_TRUE:     FIRST_RESERVED + 19,
    TK_UNTIL:    FIRST_RESERVED + 20,
    TK_WHILE:    FIRST_RESERVED + 21,
    /* other terminal symbols */
    TK_IDIV:     FIRST_RESERVED + 22,
    TK_CONCAT:   FIRST_RESERVED + 23,
    TK_DOTS:     FIRST_RESERVED + 24,
    TK_EQ:       FIRST_RESERVED + 25,
    TK_GE:       FIRST_RESERVED + 26,
    TK_LE:       FIRST_RESERVED + 27,
    TK_NE:       FIRST_RESERVED + 28,
    TK_SHL:      FIRST_RESERVED + 29,
    TK_SHR:      FIRST_RESERVED + 30,
    TK_DBCOLON:  FIRST_RESERVED + 31,
    TK_EOS:      FIRST_RESERVED + 32,
    TK_FLT:      FIRST_RESERVED + 33,
    TK_INT:      FIRST_RESERVED + 34,
    TK_NAME:     FIRST_RESERVED + 35,
    TK_STRING:   FIRST_RESERVED + 36
};

const R = RESERVED;

const luaX_tokens = [
    "and", "break", "do", "else", "elseif",
    "end", "false", "for", "function", "goto", "if",
    "in", "local", "nil", "not", "or", "repeat",
    "return", "then", "true", "until", "while",
    "//", "..", "...", "==", ">=", "<=", "~=",
    "<<", ">>", "::", "<eof>",
    "<number>", "<integer>", "<name>", "<string>"
];

class SemInfo {
    constructor() {
        this.r = NaN;
        this.i = NaN;
        this.ts = null;
    }
}

class Token {
    constructor() {
        this.token = NaN;
        this.seminfo = new SemInfo();
    }
}

/* state of the lexer plus state of the parser when shared by all
   functions */
class LexState {
    constructor() {
        this.current = NaN;  /* current character (charint) */
        this.linenumber = NaN;  /* input line counter */
        this.lastline = NaN;  /* line of last token 'consumed' */
        this.t = new Token();  /* current token */
        this.lookahead = new Token();  /* look ahead token */
        this.fs = null;  /* current function (parser) */
        this.L = null;
        this.z = null; /* input stream */
        this.buff = null;  /* buffer for tokens */
        this.h = null;  /* to reuse strings */
        this.dyd = null;  /* dynamic structures used by the parser */
        this.source = null;  /* current source name */
        this.envn = null;  /* environment variable name */
    }
}

const save = function(ls, c) {
    let b = ls.buff;
    if (b.n + 1 > b.buffer.length) {
        if (b.buffer.length >= llimits.MAX_INT/2)
            lexerror(ls, defs.to_luastring("lexical element too long", true), 0);
        let newsize = b.buffer.length*2;
        lzio.luaZ_resizebuffer(ls.L, b, newsize);
    }
    b.buffer[b.n++] = c < 0 ? 255 + c + 1 : c;
};

const luaX_token2str = function(ls, token) {
    if (token < FIRST_RESERVED) {  /* single-byte symbols? */
        return lobject.luaO_pushfstring(ls.L, defs.to_luastring("'%c'", true), token);
    } else {
        let s = luaX_tokens[token - FIRST_RESERVED];
        if (token < R.TK_EOS)  /* fixed format (symbols and reserved words)? */
            return lobject.luaO_pushfstring(ls.L, defs.to_luastring("'%s'", true), defs.to_luastring(s));
        else  /* names, strings, and numerals */
            return defs.to_luastring(s);
    }
};

const currIsNewline = function(ls) {
    return ls.current === char['\n'] || ls.current === char['\r'];
};

const next = function(ls) {
    ls.current = ls.z.zgetc();
};

const save_and_next = function(ls) {
    save(ls, ls.current);
    next(ls);
};

/*
** creates a new string and anchors it in scanner's table so that
** it will not be collected until the end of the compilation
** (by that time it should be anchored somewhere)
*/
const luaX_newstring = function(ls, str) {
    let L = ls.L;
    let ts = lstring.luaS_new(L, str);
    let o = ltable.luaH_set(L, ls.h, new lobject.TValue(LUA_TLNGSTR, ts));
    if (o.ttisnil()) { /* not in use yet? */
        o.setbvalue(true);
    } else { /* string already present */
        /* HACK: Workaround lack of ltable 'keyfromval' */
        let tpair = ls.h.strong.get(lstring.luaS_hashlongstr(ts));
        assert(tpair.value == o);
        ts = tpair.key.tsvalue(); /* re-use value previously stored */
    }
    return ts;
};

/*
** increment line number and skips newline sequence (any of
** \n, \r, \n\r, or \r\n)
*/
const inclinenumber = function(ls) {
    let old = ls.current;
    assert(currIsNewline(ls));
    next(ls);  /* skip '\n' or '\r' */
    if (currIsNewline(ls) && ls.current !== old)
        next(ls);  /* skip '\n\r' or '\r\n' */
    if (++ls.linenumber >= llimits.MAX_INT)
        lexerror(ls, defs.to_luastring("chunk has too many lines", true), 0);
};

const luaX_setinput = function(L, ls, z, source, firstchar) {
    ls.t = {
        token: 0,
        seminfo: new SemInfo()
    };
    ls.L = L;
    ls.current = firstchar;
    ls.lookahead = {
        token: R.TK_EOS,
        seminfo: new SemInfo()
    };
    ls.z = z;
    ls.fs = null;
    ls.linenumber = 1;
    ls.lastline = 1;
    ls.source = source;
    ls.envn = lstring.luaS_bless(L, LUA_ENV);
    lzio.luaZ_resizebuffer(L, ls.buff, llimits.LUA_MINBUFFER);  /* initialize buffer */
};

const check_next1 = function(ls, c) {
    if (ls.current === c.charCodeAt(0)) {
        next(ls);
        return true;
    }

    return false;
};

/*
** Check whether current char is in set 'set' (with two chars) and
** saves it
*/
const check_next2 = function(ls, set) {
    if (ls.current === set[0].charCodeAt(0) || ls.current === set[1].charCodeAt(0)) {
        save_and_next(ls);
        return true;
    }

    return false;
};

const read_numeral = function(ls, seminfo) {
    let expo = "Ee";
    let first = ls.current;
    assert(ljstype.lisdigit(ls.current));
    save_and_next(ls);
    if (first === char['0'] && check_next2(ls, "xX"))  /* hexadecimal? */
        expo = "Pp";

    for (;;) {
        if (check_next2(ls, expo))  /* exponent part? */
            check_next2(ls, "-+");  /* optional exponent sign */
        if (ljstype.lisxdigit(ls.current))
            save_and_next(ls);
        else if (ls.current === char['.'])
            save_and_next(ls);
        else break;
    }

    // save(ls, 0);

    let obj = new lobject.TValue();
    if (lobject.luaO_str2num(lzio.luaZ_buffer(ls.buff), obj) === 0)  /* format error? */
        lexerror(ls, defs.to_luastring("malformed number", true), R.TK_FLT);
    if (obj.ttisinteger()) {
        seminfo.i = obj.value;
        return R.TK_INT;
    } else {
        assert(obj.ttisfloat());
        seminfo.r = obj.value;
        return R.TK_FLT;
    }
};

const txtToken = function(ls, token) {
    switch (token) {
        case R.TK_NAME: case R.TK_STRING:
        case R.TK_FLT: case R.TK_INT:
            // save(ls, 0);
            return lobject.luaO_pushfstring(ls.L, defs.to_luastring("'%s'", true), lzio.luaZ_buffer(ls.buff));
        default:
            return luaX_token2str(ls, token);
    }
};

const lexerror = function(ls, msg, token) {
    msg = ldebug.luaG_addinfo(ls.L, msg, ls.source, ls.linenumber);
    if (token)
        lobject.luaO_pushfstring(ls.L, defs.to_luastring("%s near %s"), msg, txtToken(ls, token));
    ldo.luaD_throw(ls.L, TS.LUA_ERRSYNTAX);
};

const luaX_syntaxerror = function(ls, msg) {
    lexerror(ls, msg, ls.t.token);
};

/*
** skip a sequence '[=*[' or ']=*]'; if sequence is well formed, return
** its number of '='s; otherwise, return a negative number (-1 iff there
** are no '='s after initial bracket)
*/
const skip_sep = function(ls) {
    let count = 0;
    let s = ls.current;
    assert(s === char['['] || s === char[']']);
    save_and_next(ls);
    while (ls.current === char['=']) {
        save_and_next(ls);
        count++;
    }
    return ls.current === s ? count : (-count) - 1;
};

const read_long_string = function(ls, seminfo, sep) {
    let line = ls.linenumber;  /* initial line (for error message) */
    save_and_next(ls);  /* skip 2nd '[' */

    if (currIsNewline(ls))  /* string starts with a newline? */
        inclinenumber(ls);  /* skip it */

    let skip = false;
    for (; !skip ;) {
        switch (ls.current) {
            case lzio.EOZ: {  /* error */
                let what = seminfo ? "string" : "comment";
                let msg = `unfinished long ${what} (starting at line ${line})`;
                lexerror(ls, defs.to_luastring(msg), R.TK_EOS);
                break;
            }
            case char[']']: {
                if (skip_sep(ls) === sep) {
                    save_and_next(ls);  /* skip 2nd ']' */
                    skip = true;
                }
                break;
            }
            case char['\n']: case char['\r']: {
                save(ls, char['\n']);
                inclinenumber(ls);
                if (!seminfo) lzio.luaZ_resetbuffer(ls.buff);
                break;
            }
            default: {
                if (seminfo) save_and_next(ls);
                else next(ls);
            }
        }
    }

    if (seminfo)
        seminfo.ts = luaX_newstring(ls, ls.buff.buffer.subarray(2 + sep, ls.buff.n - (2 + sep)));
};

const esccheck = function(ls, c, msg) {
    if (!c) {
        if (ls.current !== lzio.EOZ)
            save_and_next(ls);  /* add current to buffer for error message */
        lexerror(ls, msg, R.TK_STRING);
    }
};

const gethexa = function(ls) {
    save_and_next(ls);
    esccheck(ls, ljstype.lisxdigit(ls.current), defs.to_luastring("hexadecimal digit expected", true));
    return lobject.luaO_hexavalue(ls.current);
};

const readhexaesc = function(ls) {
    let r = gethexa(ls);
    r = (r << 4) + gethexa(ls);
    lzio.luaZ_buffremove(ls.buff, 2);  /* remove saved chars from buffer */
    return r;
};

const readutf8desc = function(ls) {
    let i = 4;  /* chars to be removed: '\', 'u', '{', and first digit */
    save_and_next(ls);  /* skip 'u' */
    esccheck(ls, ls.current === char['{'], defs.to_luastring("missing '{'", true));
    let r = gethexa(ls);  /* must have at least one digit */

    save_and_next(ls);
    while (ljstype.lisxdigit(ls.current)) {
        i++;
        r = (r << 4) + lobject.luaO_hexavalue(ls.current);
        esccheck(ls, r <= 0x10FFFF, defs.to_luastring("UTF-8 value too large", true));
        save_and_next(ls);
    }
    esccheck(ls, ls.current === char['}'], defs.to_luastring("missing '}'", true));
    next(ls);  /* skip '}' */
    lzio.luaZ_buffremove(ls.buff, i);  /* remove saved chars from buffer */
    return r;
};

const utf8esc = function(ls) {
    let buff = new Uint8Array(lobject.UTF8BUFFSZ);
    let n = lobject.luaO_utf8esc(buff, readutf8desc(ls));
    for (; n > 0; n--)  /* add 'buff' to string */
        save(ls, buff[lobject.UTF8BUFFSZ - n]);
};

const readdecesc = function(ls) {
    let r = 0;  /* result accumulator */
    let i;
    for (i = 0; i < 3 && ljstype.lisdigit(ls.current); i++) {  /* read up to 3 digits */
        r = 10 * r + ls.current - char['0'];
        save_and_next(ls);
    }
    esccheck(ls, r <= 255, defs.to_luastring("decimal escape too large", true));
    lzio.luaZ_buffremove(ls.buff, i);  /* remove read digits from buffer */
    return r;
};

const read_string = function(ls, del, seminfo) {
    save_and_next(ls);  /* keep delimiter (for error messages) */

    while (ls.current !== del) {
        switch (ls.current) {
            case lzio.EOZ:
                lexerror(ls, defs.to_luastring("unfinished string", true), R.TK_EOS);
                break;
            case char['\n']:
            case char['\r']:
                lexerror(ls, defs.to_luastring("unfinished string", true), R.TK_STRING);
                break;
            case char['\\']: {  /* escape sequences */
                save_and_next(ls);  /* keep '\\' for error messages */
                let will;
                let c;
                switch(ls.current) {
                    case char['a']: c = 7 /* \a isn't valid JS */; will = 'read_save'; break;
                    case char['b']: c = char['\b']; will = 'read_save'; break;
                    case char['f']: c = char['\f']; will = 'read_save'; break;
                    case char['n']: c = char['\n']; will = 'read_save'; break;
                    case char['r']: c = char['\r']; will = 'read_save'; break;
                    case char['t']: c = char['\t']; will = 'read_save'; break;
                    case char['v']: c = char['\v']; will = 'read_save'; break;
                    case char['x']: c = readhexaesc(ls); will = 'read_save'; break;
                    case char['u']: utf8esc(ls); will = 'no_save'; break;
                    case char['\n']: case char['\r']:
                        inclinenumber(ls); c = char['\n']; will = 'only_save'; break;
                    case char['\\']: case char['"']: case char['\'']:
                        c = ls.current; will = 'read_save'; break;
                    case lzio.EOZ: will = 'no_save'; break;  /* will raise an error next loop */
                    case char['z']: {  /* zap following span of spaces */
                        lzio.luaZ_buffremove(ls.buff, 1);  /* remove '\\' */
                        next(ls);  /* skip the 'z' */
                        while (ljstype.lisspace(ls.current)) {
                            if (currIsNewline(ls)) inclinenumber(ls);
                            else next(ls);
                        }
                        will = 'no_save'; break;
                    }
                    default: {
                        esccheck(ls, ljstype.lisdigit(ls.current), defs.to_luastring("invalid escape sequence", true));
                        c = readdecesc(ls);  /* digital escape '\ddd' */
                        will = 'only_save'; break;
                    }
                }

                if (will === 'read_save')
                    next(ls);

                if (will === 'read_save' || will === 'only_save') {
                    lzio.luaZ_buffremove(ls.buff, 1);  /* remove '\\' */
                    save(ls, c);
                }

                break;
            }
            default:
                save_and_next(ls);
        }
    }
    save_and_next(ls);  /* skip delimiter */

    seminfo.ts = luaX_newstring(ls, ls.buff.buffer.subarray(1, ls.buff.n-1));
};

const token_to_index = Object.create(null); /* don't want to return true for e.g. 'hasOwnProperty' */
luaX_tokens.forEach((e, i)=>token_to_index[lstring.luaS_hash(defs.to_luastring(e))] = i);

const isreserved = function(w) {
    let kidx = token_to_index[lstring.luaS_hashlongstr(w)];
    return kidx !== void 0 && kidx <= 22;
};

const llex = function(ls, seminfo) {
    lzio.luaZ_resetbuffer(ls.buff);
    for (;;) {
        assert(typeof ls.current == "number");
        switch (ls.current) {
            case char['\n']: case char['\r']: {  /* line breaks */
                inclinenumber(ls);
                break;
            }
            case char[' ']: case char['\f']: case char['\t']: case char['\v']: {  /* spaces */
                next(ls);
                break;
            }
            case char['-']: {  /* '-' or '--' (comment) */
                next(ls);
                if (ls.current !== char['-']) return char['-'];
                /* else is a comment */
                next(ls);
                if (ls.current === char['[']) {  /* long comment? */
                    let sep = skip_sep(ls);
                    lzio.luaZ_resetbuffer(ls.buff);  /* 'skip_sep' may dirty the buffer */
                    if (sep >= 0) {
                        read_long_string(ls, null, sep);  /* skip long comment */
                        lzio.luaZ_resetbuffer(ls.buff);  /* previous call may dirty the buff. */
                        break;
                    }
                }

                /* else short comment */
                while (!currIsNewline(ls) && ls.current !== lzio.EOZ)
                    next(ls);  /* skip until end of line (or end of file) */
                break;
            }
            case char['[']: {  /* long string or simply '[' */
                let sep = skip_sep(ls);
                if (sep >= 0) {
                    read_long_string(ls, seminfo, sep);
                    return R.TK_STRING;
                } else if (sep !== -1)  /* '[=...' missing second bracket */
                    lexerror(ls, defs.to_luastring("invalid long string delimiter", true), R.TK_STRING);
                return char['['];
            }
            case char['=']: {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_EQ;
                else return char['='];
            }
            case char['<']: {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_LE;
                else if (check_next1(ls, '<')) return R.TK_SHL;
                else return char['<'];
            }
            case char['>']: {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_GE;
                else if (check_next1(ls, '>')) return R.TK_SHR;
                else return char['>'];
            }
            case char['/']: {
                next(ls);
                if (check_next1(ls, '/')) return R.TK_IDIV;
                else return char['/'];
            }
            case char['~']: {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_NE;
                else return char['~'];
            }
            case char[':']: {
                next(ls);
                if (check_next1(ls, ':')) return R.TK_DBCOLON;
                else return char[':'];
            }
            case char['"']: case char['\'']: {  /* short literal strings */
                read_string(ls, ls.current, seminfo);
                return R.TK_STRING;
            }
            case char['.']: {  /* '.', '..', '...', or number */
                save_and_next(ls);
                if (check_next1(ls, '.')) {
                    if (check_next1(ls, '.'))
                        return R.TK_DOTS;   /* '...' */
                    else return R.TK_CONCAT;   /* '..' */
                }
                else if (!ljstype.lisdigit(ls.current)) return char['.'];
                else return read_numeral(ls, seminfo);
            }
            case char['0']: case char['1']: case char['2']: case char['3']: case char['4']:
            case char['5']: case char['6']: case char['7']: case char['8']: case char['9']: {
                return read_numeral(ls, seminfo);
            }
            case lzio.EOZ: {
                return R.TK_EOS;
            }
            default: {
                if (ljstype.lislalpha(ls.current)) {  /* identifier or reserved word? */
                    do {
                        save_and_next(ls);
                    } while (ljstype.lislalnum(ls.current));
                    let ts = luaX_newstring(ls, lzio.luaZ_buffer(ls.buff));
                    seminfo.ts = ts;
                    let kidx = token_to_index[lstring.luaS_hashlongstr(ts)];
                    if (kidx !== void 0 && kidx <= 22)  /* reserved word? */
                        return kidx + FIRST_RESERVED;
                    else
                        return R.TK_NAME;
                } else {  /* single-char tokens (+ - / ...) */
                    let c = ls.current;
                    next(ls);
                    return c;
                }
            }
        }
    }
};

const luaX_next = function(ls) {
    ls.lastline = ls.linenumber;
    if (ls.lookahead.token !== R.TK_EOS) {  /* is there a look-ahead token? */
        ls.t.token = ls.lookahead.token;  /* use this one */
        ls.t.seminfo.i = ls.lookahead.seminfo.i;
        ls.t.seminfo.r = ls.lookahead.seminfo.r;
        ls.t.seminfo.ts = ls.lookahead.seminfo.ts; // TODO ?
        ls.lookahead.token = R.TK_EOS;  /* and discharge it */
    } else
        ls.t.token = llex(ls, ls.t.seminfo);  /* read next token */
};

const luaX_lookahead = function(ls) {
    assert(ls.lookahead.token === R.TK_EOS);
    ls.lookahead.token = llex(ls, ls.lookahead.seminfo);
    return ls.lookahead.token;
};

module.exports.FIRST_RESERVED   = FIRST_RESERVED;
module.exports.LUA_ENV          = LUA_ENV;
module.exports.LexState         = LexState;
module.exports.RESERVED         = RESERVED;
module.exports.isreserved       = isreserved;
module.exports.luaX_lookahead   = luaX_lookahead;
module.exports.luaX_newstring   = luaX_newstring;
module.exports.luaX_next        = luaX_next;
module.exports.luaX_setinput    = luaX_setinput;
module.exports.luaX_syntaxerror = luaX_syntaxerror;
module.exports.luaX_token2str   = luaX_token2str;
module.exports.luaX_tokens      = luaX_tokens;
