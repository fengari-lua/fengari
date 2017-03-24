"use strict";

const assert   = require('assert');

const lapi     = require('./lapi.js');
const lauxlib  = require('./lauxlib.js');
const ldebug   = require('./ldebug.js');
const ldo      = require('./ldo.js');
const ljstype  = require('./ljstype');
const lobject  = require('./lobject');
const lua      = require('./lua.js');
const TValue   = lobject.TValue;
const CT       = lua.constant_types;
const TS       = lua.thread_status;

const FIRST_RESERVED = 257;

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

const NUM_RESERVED = Object.keys(RESERVED).length;

class MBuffer {
    constructor(L, data, reader) {
        this.L = L;
        this.data = data;
        this.n = 0;
        this.buffer = null;
        this.off = 0;
        this.reader = reader ? reader : null;

        if (!this.reader) {
            this.buffer = typeof data === "string" ? data.split('') : (data ? data : []);
            this.n = this.buffer instanceof DataView ? this.buffer.byteLength : this.buffer.length;
            this.off = 0;
        }
    }

    getc() {
        if (this.buffer instanceof DataView)
            return this.n-- > 0 ? this.buffer.getUint8(this.off++, true) : this.fill();

        return this.n-- > 0 ? this.buffer[this.off++] : this.fill();
    }

    fill() {
        if (this.reader) {
            this.buffer = this.reader(this.L, this.data);
            this.buffer = typeof this.buffer === "string" ? this.buffer.split('') : this.buffer;
            if (this.buffer === null)
                return -1;
            this.n = this.buffer instanceof DataView ? this.buffer.byteLength - 1 : this.buffer.length - 1;
            this.off = 0;
        } else return -1;

        if (this.buffer instanceof DataView)
            return this.buffer.getUint8(this.off++, true);

        return this.buffer[this.off++];
    }
}

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
        this.z = new MBuffer();
        this.buff = new MBuffer();  /* buffer for tokens */
        this.h = null;  /* to avoid collection/reuse strings */
        this.dyd = null;  /* dynamic structures used by the parser */
        this.source = null;  /* current source name */
        this.envn = null;  /* environment variable name */
    }
}

const save = function(ls, c) {
    let b = ls.buff;
    if (b.n + 1 > b.buffer.length) {
        if (b.buffer.length >= Number.MAX_SAFE_INTEGER/2)
            lexerror(ls, "lexical element too long", 0);
    }
    b.buffer[b.n++] = c;
};

const luaX_token2str = function(ls, token) {
    if (typeof token === "string" || token < FIRST_RESERVED) {  /* single-byte symbols? */
        return `'${typeof token === "string" ? token : String.fromCharCode(token)}'`;
    } else {
        let s = luaX_tokens[token - FIRST_RESERVED];
        if (token < R.TK_EOS)  /* fixed format (symbols and reserved words)? */
            return `'${s}'`;
        else  /* names, strings, and numerals */
            return s;
    }
};

const currIsNewline = function(ls) {
    return ls.current === '\n' || ls.current === '\r';
};

const next = function(ls) {
    ls.current = ls.z.getc();
};

const save_and_next = function(ls) {
    save(ls, ls.current);
    next(ls);
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
    if (++ls.linenumber >= Number.MAX_SAFE_INTEGER)
        lexerror(ls, "chunk has too many lines", 0);
};

const luaX_setinput = function(L, ls, z, source, firstchar) {
    ls.t = {
        token: 0,
        seminfo: {
            i: NaN,
            r: NaN,
            ts: null
        }
    };
    ls.L = L;
    ls.current = firstchar;
    ls.lookahead = {
        token: R.TK_EOS,
        seminfo: {
            i: NaN,
            r: NaN,
            ts: null
        }
    };
    ls.z = z;
    ls.fs = null;
    ls.linenumber = 1;
    ls.lastline = 1;
    ls.source = source;
    ls.envn = L.l_G.intern(lua.to_luastring("_ENV"));
};

const check_next1 = function(ls, c) {
    if (ls.current === c) {
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
    if (ls.current === set.charAt(0) || ls.current === set.charAt(1)) {
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
    if (first === '0' && check_next2(ls, "xX"))  /* hexadecimal? */
        expo = "Pp";

    for (;;) {
        if (check_next2(ls, expo))  /* exponent part? */
            check_next2(ls, "-+");  /* optional exponent sign */
        if (ljstype.lisxdigit(ls.current))
            save_and_next(ls);
        else if (ls.current === '.')
            save_and_next(ls);
        else break;
    }

    save(ls, '\0');

    let obj = lobject.luaO_str2num(ls.buff.buffer);
    if (obj === false)  /* format error? */
        lexerror(ls, "malformed number", R.TK_FLT);
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
            save(ls, '\0');
            return `'${ls.buff.buffer.join('')}'`;
        default:
            return luaX_token2str(ls, token);
    }
};

const lexerror = function(ls, msg, token) {
    msg = ldebug.luaG_addinfo(ls.L, msg, ls.source, ls.linenumber);
    if (token)
        lapi.lua_pushstring(ls.L, `${msg instanceof TValue ? msg.value : msg} near ${txtToken(ls, token)}`);
    ldo.luaD_throw(ls.L, TS.LUA_ERRSYNTAX);
};

const luaX_syntaxerror = function(ls, msg) {
    msg = msg instanceof TValue ? msg.value : msg;
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
    assert(s === '[' || s === ']');
    save_and_next(ls);
    while (ls.current === '=') {
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
            case -1: {  /* error */
                let what = seminfo ? "string" : "comment";
                let msg = `unfinished long ${what} (starting at line ${line})`;
                lexerror(ls, msg, R.TK_EOS);
                break;
            }
            case ']': {
                if (skip_sep(ls) === sep) {
                    save_and_next(ls);  /* skip 2nd ']' */
                    skip = true;
                }
                break;
            }
            case '\n': case '\r': {
                save(ls, '\n');
                inclinenumber(ls);
                if (!seminfo) {
                    ls.buff.n = 0;
                    ls.buff.buffer = [];
                }
                break;
            }
            default: {
                if (seminfo) save_and_next(ls);
                else next(ls);
            }
        }
    }

    if (seminfo)
        seminfo.ts = new TValue(
            CT.LUA_TLNGSTR,
            lua.to_luastring(
                ls.buff.buffer
                    .slice(2 + sep, 2 + sep - 2 * (2 + sep))
                    .join('')
            )
        );
};

const esccheck = function(ls, c, msg) {
    if (!c) {
        if (ls.current !== -1)
            save_and_next(ls);  /* add current to buffer for error message */
        lexerror(ls, msg, R.TK_STRING);
    }
};

const gethexa = function(ls) {
    save_and_next(ls);
    esccheck(ls, ljstype.lisxdigit(ls.current), "hexadecimal digit expected");
    return lobject.luaO_hexavalue(ls.current);
};

const readhexaesc = function(ls) {
    let r = gethexa(ls);
    r = (r << 4) + gethexa(ls);
    ls.buff.n -= 2;  /* remove saved chars from buffer */
    return r;
};

const readutf8desc = function(ls) {
    let i = 4;  /* chars to be removed: '\', 'u', '{', and first digit */
    save_and_next(ls);  /* skip 'u' */
    esccheck(ls, ls.current === '{', "missing '{'");
    let r = gethexa(ls);  /* must have at least one digit */

    save_and_next(ls);
    while (ljstype.lisxdigit(ls.current)) {
        i++;
        r = (r << 4) + lobject.luaO_hexavalue(ls.current);
        esccheck(ls, r <= 0x10FFFF, "UTF-8 value too large");
        save_and_next(ls);
    }
    esccheck(ls, ls.current === '}', "missing '}'");
    next(ls);  /* skip '}' */
    ls.buff.n -= i;  /* remove saved chars from buffer */
    return r;
};

const utf8esc = function(ls) {
    let buff = new Array(lobject.UTF8BUFFSZ);
    let n = lobject.luaO_utf8esc(buff, readutf8desc(ls));
    for (; n > 0; n--)  /* add 'buff' to string */
        save(ls, buff[lobject.UTF8BUFFSZ - n]);
};

const readdecesc = function(ls) {
    let r = 0;  /* result accumulator */
    let i;
    for (i = 0; i < 3 && ljstype.lisdigit(ls.current); i++) {  /* read up to 3 digits */
        r = 10 * r + parseInt(ls.current);
        save_and_next(ls);
    }
    esccheck(ls, r <= 255, "decimal escape too large");
    ls.buff.n -= i;  /* remove read digits from buffer */
    return r;
};

const read_string = function(ls, del, seminfo) {
    save_and_next(ls);  /* keep delimiter (for error messages) */

    while (ls.current !== del) {
        switch (ls.current) {
            case -1:
                lexerror(ls, "unfinished string", R.TK_EOS);
                break;
            case '\n':
            case '\r':
                lexerror(ls, "unfinished string", R.TK_STRING);
                break;
            case '\\': {  /* escape sequences */
                save_and_next(ls);  /* keep '\\' for error messages */
                let will;
                let c;
                switch(ls.current) {
                    case 'a': c = '\a'; will = 'read_save'; break;
                    case 'b': c = '\b'; will = 'read_save'; break;
                    case 'f': c = '\f'; will = 'read_save'; break;
                    case 'n': c = '\n'; will = 'read_save'; break;
                    case 'r': c = '\r'; will = 'read_save'; break;
                    case 't': c = '\t'; will = 'read_save'; break;
                    case 'v': c = '\v'; will = 'read_save'; break;
                    case 'x': c = readhexaesc(ls); will = 'read_save'; break;
                    case 'u': utf8esc(ls); will = 'read_save'; break;
                    case '\n': case '\r':
                        inclinenumber(ls); c = '\n'; will = 'only_save'; break;
                    case '\\': case '\"': case '\'':
                        c = ls.current; will = 'read_save'; break;
                    case -1: will = 'read_save'; break;  /* will raise an error next loop */
                    case 'z': {  /* zap following span of spaces */
                        ls.buff.n -= 1;  /* remove '\\' */
                        next(ls);  /* skip the 'z' */
                        while (ljstype.lisspace(ls.current)) {
                            if (currIsNewline(ls)) inclinenumber(ls);
                            else next(ls);
                        }
                        will = 'no_save'; break;
                    }
                    default: {
                        esccheck(ls, ljstype.lisdigit(ls.current), "invalid escape sequence");
                        c = readdecesc(ls);  /* digital escape '\ddd' */
                        will = 'only_save'; break;
                    }
                }

                if (will === 'read_save')
                    next(ls);
                
                if (will === 'read_save' || will === 'only_save') {
                    ls.buff.n -= 1;  /* remove '\\' */
                    save(ls, c);
                }

                break;
            }
            default:
                save_and_next(ls);
        }
    }
    save_and_next(ls);  /* skip delimiter */

    seminfo.ts = new TValue(
        CT.LUA_TLNGSTR,
        ls.buff.buffer
            .slice(1, ls.buff.n-1)
            .map(e => typeof e === "string" ? lua.to_luastring(e) : [e])
            .reduce((acc, e) => acc = acc.concat(e), [])  /* Hex value must not be converted */
    );
};

const isreserved = function(w) {
    return luaX_tokens.slice(0, 22).indexOf(w) >= 0;
};

const llex = function(ls, seminfo) {
    ls.buff.n = 0;
    ls.buff.buffer = [];

    for (;;) {
        switch (ls.current) {
            case '\n': case '\r': {  /* line breaks */
                inclinenumber(ls);
                break;
            }
            case ' ': case '\f': case '\t': case '\v': {  /* spaces */
                next(ls);
                break;
            }
            case '-': {  /* '-' or '--' (comment) */
                next(ls);
                if (ls.current !== '-') return '-';
                /* else is a comment */
                next(ls);
                if (ls.current === '[') {  /* long comment? */
                    let sep = skip_sep(ls);
                    ls.buff.n = 0;  /* 'skip_sep' may dirty the buffer */
                    ls.buff.buffer = [];
                    if (sep >= 0) {
                        read_long_string(ls, null, sep);  /* skip long comment */
                        ls.buff.n = 0;  /* previous call may dirty the buff. */
                        ls.buff.buffer = [];
                        break;
                    }
                }

                /* else short comment */
                while (!currIsNewline(ls) && ls.current !== -1)
                    next(ls);  /* skip until end of line (or end of file) */
                break;
            }
            case '[': {  /* long string or simply '[' */
                let sep = skip_sep(ls);
                if (sep >= 0) {
                    read_long_string(ls, seminfo, sep);
                    return R.TK_STRING;
                } else if (sep !== -1)  /* '[=...' missing second bracket */
                    lexerror(ls, "invalid long string delimiter", R.TK_STRING);
                return '[';
            }
            case '=': {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_EQ;
                else return '=';
            }
            case '<': {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_LE;
                else if (check_next1(ls, '<')) return R.TK_SHL;
                else return '<';
            }
            case '>': {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_GE;
                else if (check_next1(ls, '>')) return R.TK_SHR;
                else return '>';
            }
            case '/': {
                next(ls);
                if (check_next1(ls, '/')) return R.TK_IDIV;
                else return '/';
            }
            case '~': {
                next(ls);
                if (check_next1(ls, '=')) return R.TK_NE;
                else return '~';
            }
            case ':': {
                next(ls);
                if (check_next1(ls, ':')) return R.TK_DBCOLON;
                else return ':';
            }
            case '"': case '\'': {  /* short literal strings */
                read_string(ls, ls.current, seminfo);
                return R.TK_STRING;
            }
            case '.': {  /* '.', '..', '...', or number */
                save_and_next(ls);
                if (check_next1(ls, '.')) {
                    if (check_next1(ls, '.'))
                        return R.TK_DOTS;   /* '...' */
                    else return R.TK_CONCAT;   /* '..' */
                }
                else if (!ljstype.lisdigit(ls.current)) return '.';
                else return read_numeral(ls, seminfo);
            }
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9': {
                return read_numeral(ls, seminfo);
            }
            case -1: {
                return R.TK_EOS;
            }
            default: {
                if (ljstype.lislalpha(ls.current)) {  /* identifier or reserved word? */
                    do {
                        save_and_next(ls);
                    } while (ljstype.lislalnum(ls.current));

                    let ts = new TValue(CT.LUA_TLNGSTR, lua.to_luastring(ls.buff.buffer.join('')));
                    seminfo.ts = ts;
                    let kidx = luaX_tokens.slice(0, 22).indexOf(ts.jsstring());
                    if (kidx >= 0)  /* reserved word? */
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
module.exports.LexState         = LexState;
module.exports.MBuffer          = MBuffer;
module.exports.RESERVED         = RESERVED;
module.exports.isreserved       = isreserved;
module.exports.luaX_lookahead   = luaX_lookahead;
module.exports.luaX_next        = luaX_next;
module.exports.luaX_setinput    = luaX_setinput;
module.exports.luaX_syntaxerror = luaX_syntaxerror;
module.exports.luaX_token2str   = luaX_token2str;
module.exports.luaX_tokens      = luaX_tokens;
