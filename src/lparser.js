"use strict";

const assert = require('assert');

const lcode    = require('./lcode.js');
const lfunc    = require('./lfunc.js');
const llex     = require('./llex.js');
const llimit   = require('./llimit.js');
const lobject  = require('./lobject.js');
const lopcode  = require('./lopcode.js');
const lua      = require('./lua.js');
const BinOpr   = lcode.BinOpr;
const CT       = lua.constants_type;
const OpCodesI = lopcode.OpCodesI;
const Proto    = lfunc.Proto;
const R        = llex.RESERVED;
const TValue   = lobject.TValue;
const Table    = lobject.Table;
const UnOpr    = lcode.UnOpr;
const UpVal    = lfunc.UpVal;

const MAXVARS = 200;

const hasmultret = function(k) {
    return k == expkind.VCALL || k == expkind.VVARARG;
};

class BlockCnt {
    constructor() {
        this.previous = null;  /* chain */
        this.firstlabel = NaN; /* index of first label in this block */
        this.firstgoto = NaN;  /* index of first pending goto in this block */
        this.nactvar = NaN;    /* # active locals outside the block */
        this.upval = NaN;      /* true if some variable in the block is an upvalue */
        this.isloop = NaN;     /* true if 'block' is a loop */
    }
}

const expkind = {
    VVOID: 0,        /* when 'expdesc' describes the last expression a list,
                        this kind means an empty list (so, no expression) */
    VNIL: 1,         /* constant nil */
    VTRUE: 2,        /* constant true */
    VFALSE: 3,       /* constant false */
    VK: 4,           /* constant in 'k'; info = index of constant in 'k' */
    VKFLT: 5,        /* floating constant; nval = numerical float value */
    VKINT: 6,        /* integer constant; nval = numerical integer value */
    VNONRELOC: 7,    /* expression has its value in a fixed register;
                        info = result register */
    VLOCAL: 8,       /* local variable; info = local register */
    VUPVAL: 9,       /* upvalue variable; info = index of upvalue in 'upvalues' */
    VINDEXED: 10,    /* indexed variable;
                        ind.vt = whether 't' is register or upvalue;
                        ind.t = table register or upvalue;
                        ind.idx = key's R/K index */
    VJMP: 11,        /* expression is a test/comparison;
                        info = pc of corresponding jump instruction */
    VRELOCABLE: 12,  /* expression can put result in any register;
                        info = instruction pc */
    VCALL: 13,       /* expression is a function call; info = instruction pc */
    VVARARG: 14      /* vararg expression; info = instruction pc */
};

class expdesc {
    constructor() {
        this.k = NaN;
        this.u = {
            ival: NaN,    /* for VKINT */
            nval: NaN,    /* for VKFLT */
            info: NaN,    /* for generic use */
            ind: {        /* for indexed variables (VINDEXED) */
                idx: NaN, /* index (R/K) */
                t: NaN,   /* table (register or upvalue) */
                vt: NaN   /* whether 't' is register (VLOCAL) or upvalue (VUPVAL) */
            }
        };
        this.t = NaN;     /* patch list of 'exit when true' */
        this.f = NaN;     /* patch list of 'exit when false' */
    }
}

class FuncState {
    constructor() {
        this.f = null;         /* current function header */
        this.prev = null;      /* enclosing function */
        this.ls = null;        /* lexical state */
        this.bl = null;        /* chain of current blocks */
        this.pc = NaN;         /* next position to code (equivalent to 'ncode') */
        this.lasttarget = NaN; /* 'label' of last 'jump label' */
        this.jpc = NaN;        /* list of pending jumps to 'pc' */
        this.nk = NaN;         /* number of elements in 'k' */
        this.np = NaN;         /* number of elements in 'p' */
        this.firstlocal = NaN; /* index of first local var (in Dyndata array) */
        this.nlocvars = NaN;   /* number of elements in 'f->locvars' */
        this.nactvar = NaN;    /* number of active local variables */
        this.nups = NaN;       /* number of upvalues */
        this.freereg = NaN;    /* first free register */
    }
}

const semerror = function(ls, msg) {
    ls.t.token = 0;  /* remove "near <token>" from final message */
    llex.luaX_syntaxerror(ls, msg);
};

const error_expected = function(ls, token) {
    llex.luaX_syntaxerror(ls, `${llex.luaX_token2str(ls, token)} expected`);
};

const errorlimit = function(fs, limit, what) {
    let L = fs.ls.L;
    let line = fs.f.linedefined;
    let where = (line === 0) ? "main function" : `function at line ${line}`;
    let msg = `too many ${what} (limit is ${limit}) in ${where}`;
    llex.luaX_syntaxerror(fs.ls, msg);
};

const checklimit = function(fs, v, l, what) {
    if (v > l) errorlimit(fs, l, what);
};

const testnext = function(ls, c) {
    if (ls.t.token === c) {
        llex.luaX_next(ls);
        return true;
    }

    return false;
};

const check = function(ls, c) {
    if (ls.t.token !== c)
        error_expected(ls, c);
};

const checknext = function(ls, c) {
    check(ls, c);
    llex.luaX_next(ls);
};

const check_condition = function(ls, c, msg) {
    if (!c)
        llex.luaX_syntaxerror(ls, msg);
};

const check_match = function(ls, what, who, where) {
    if (!testnext(ls, what)) {
        if (where === ls.linenumber)
            error_expected(ls, what);
        else
            llex.luaX_syntaxerror(ls,
                `${llex.luaX_token2str(ls, what)} expected (to close ${llex.luaX_token2str(ls, who)} at line ${where}`);
    }
};

const str_checkname = function(ls) {
    check(ls, R.TK_NAME);
    let ts = ls.t.seminfo.ts;
    llex.luaX_next(ls);
    return ts;
};

const init_exp = function(e, k, i) {
    e.f = e.t = lcode.NO_JUMP;
    e.k = k;
    e.u.info = i;
};

const codestring = function(ls, e, s) {
    init_exp(e, expkind.VK, lcode.luaK_stringK(ls.fs, s));
};

const checkname = function(ls, e) {
    codestring(ls, e, str_checkname(ls));
};

const getlocvar = function(fs, i) {
    let idx = fs.ls.dyd.actvar.arr[fs.firstlocal + i].idx;
    assert(idx < fs.nlocvars);
    return fs.f.locvars[idx];
};

const removevars = function(fs, tolevel) {
    fs.ls.dyd.actvar.n -= fs.nactvar - tolevel;
    while (fs.nactvar > tolevel)
        getlocvar(fs, --fs.nactvar).endpc = fs.pc;
};

const newupvalue = function(fs, name, v) {
    let f = fs.f;
    checklimit(fs, fs.nups + 1, lfunc.MAXUPVAL, "upvalues");
    f.upvalues[fs.nups] = new UpVal(fs.ls.L);
    f.upvalues[fs.nups].instack = v.k === expkind.VLOCAL;
    f.upvalues[fs.nups].idx = v.u.info;
    f.upvalues[fs.nups].name = name;
    return fs.nups++;
};

const enterlevel = function(ls) {
    let L = ls.L;
    ++L.nCcalls;
    checklimit(ls.fs, L.nCcalls, llimit.LUAI_MAXCCALLS, "JS levels");
};

const leavelevel = function(ls) {
    return ls.L.nCcalls--;
};

const closegoto = function(ls, g, label) {
    let fs = ls.fs;
    let gl = ls.dyd.gt;
    let gt = gl.arr[g];
    assert(gt.name === label.name);
    if (gt.nactvar < label.nactvar) {
        let vname = getlocvar(fs, gt.nactvar).varname;
        semerror(ls, `<goto ${gt.name}> at line ${gt.line} jumps into the scope of local '${vname}'`);
    }
    lcode.luaK_patchlist(fs, gt.pc, label.pc);
    /* remove goto from pending list */
    for (let i = g; i < gl.n - 1; i++)
        gl.arr[i] = gl.arr[i + 1];
    gl.n--;
};

/*
** try to close a goto with existing labels; this solves backward jumps
*/
const findlabel = function(ls, g) {
    let bl = ls.fs.bl;
    let dyd = ls.dyd;
    let gt = dyd.gt.arr[g];
    /* check labels in current block for a match */
    for (let i = bl.firstlabel; i < dyd.label.n; i++) {
        let lb = dyd.label.arr[i];
        if (lb.name === gt.name) {  /* correct label? */
            if (gt.nactvar > lb.nactvar && (bl.upval || dyd.label.n > bl.firstlabel))
                lcode.luaK_patchclose(ls.fs, gt.pc, lb.nactvar);
            closegoto(ls, g, lb);  /* close it */
            return true;
        }
    }
    return false;  /* label not found; cannot close goto */
};

const newlabelentry = function(ls, l, name, line, pc) {
    let n = l.n;
    l.arr[n].name = name;
    l.arr[n].line = line;
    l.arr[n].nactvar = ls.fs.nactvar;
    l.arr[n].pc = pc;
    l.n = n + 1;
    return n;
};

/*
** check whether new label 'lb' matches any pending gotos in current
** block; solves forward jumps
*/
const findgotos = function(ls, lb) {
    let gl = ls.dyd.gt;
    let i = ls.fs.bl.firstgoto;
    while (i < gl.n) {
        if (gl.arr[i].name === lb.name)
            closegoto(ls, i, lb);
        else
            i++;
    }
};

/*
** export pending gotos to outer level, to check them against
** outer labels; if the block being exited has upvalues, and
** the goto exits the scope of any variable (which can be the
** upvalue), close those variables being exited.
*/
const movegotosout = function(fs, bl) {
    let i = bl.firstgoto;
    let gl = fs.ls.dydy.gt;
    /* correct pending gotos to current block and try to close it
       with visible labels */
    while (i < gl.n) {
        let gt = gl.arr[i];
        if (gt.nactvar > bl.nactvar) {
            if (bl.upval)
                lcode.luaK_patchclose(fs, gt.pc, bl.nactvar);
            gt.nactvar = bl.nactvar;
        }
        if (!findlabel(fs.ls, i))
            i++;  /* move to next one */
    }
};

const enterblock = function(fs, bl, isloop) {
    bl.isloop = isloop;
    bl.nactvar = fs.nactvar;
    bl.firstlabel = fs.ls.dyd.label.n;
    bl.firstgoto = fs.ls.dyd.gt.n;
    bl.upval = 0;
    bl.previous = fs.bl;
    fs.bl = bl;
    assert(fs.freereg === fs.nactvar);
};

/*
** create a label named 'break' to resolve break statements
*/
const breaklabel = function(ls) {
    let n = new TValue(CT.LUA_TLNGSTR, "break");
    let l = newlabelentry(ls, ls.dyd.label, n, 0, ls.fs.pc);
    findgotos(ls, ls.dyd.label.arr[l]);
};

/*
** generates an error for an undefined 'goto'; choose appropriate
** message when label name is a reserved word (which can only be 'break')
*/
const undefgoto = function(ls, gt) {
    const msg = llex.isreserved(gt.name)
                ? `<${gt.name}> at line ${gt.line} not inside a loop`
                : `no visible label '${gt.name}' for <goto> at line ${gt.line}`;
    semerror(ls, msg);
};

const open_func = function(ls, fs, bl) {
    this.f = new Proto();
    fs.prev = ls.fs;  /* linked list of funcstates */
    fs.ls = ls;
    ls.fs = fs;
    fs.pc = 0;
    fs.lasttarget = 0;
    fs.jpc = lcode.NO_JUMP;
    fs.freereg = 0;
    fs.nk = 0;
    fs.np = 0;
    fs.nups = 0;
    fs.nlocvars = 0;
    fs.nactvar = 0;
    fs.firstlocal = ls.dyd.actvar.n;
    fs.bl = null;
    let f = new Proto();
    f = fs.f;
    f.source = ls.source;
    f.maxstacksize = 2;  /* registers 0/1 are always valid */
    enterblock(fs, bl, false);
};

const leaveblock = function(fs) {
    let bl = fs.bl;
    let ls = fs.ls;
    if (bl.previous && bl.upval) {
        /* create a 'jump to here' to close upvalues */
        let j = lcode.luaK_jump(fs);
        lcode.luaK_patchclose(fs, j , bl.nactvar);
        lcode.luaK_patchtohere(fs, j);
    }

    if (bl.isloop)
        breaklabel(ls);  /* close pending breaks */

    fs.bl = bl.previous;
    removevars(fs, bl.nactvar);
    assert(bl.nactvar === fs.nactvar);
    fs.freereg = fs.nactvar;  /* free registers */
    ls.dyd.label.n = bl.firstlabel;  /* remove local labels */
    if (bl.previous)  /* inner block? */
        movegotosout(fs, bl);  /* update pending gotos to outer block */
    else if (bl.firstgoto < ls.dyd.gt.n)  /* pending gotos in outer block? */
        undefgoto(ls, ls.dyd.gt.arr[bl.firstgoto]);  /* error */
};

const close_func = function(ls) {
    let L = ls.L;
    let fs = ls.fs;
    let f = fs.f;
    lcode.luaK_ret(fs, 0, 0);  /* final return */
    leaveblock(fs);
    ls.fs = fs.prev;
};

/*============================================================*/
/* GRAMMAR RULES */
/*============================================================*/

const block_follow = function(ls, withuntil) {
    switch (ls.t.token) {
        case R.TK_ELSE: case R.TK_ELSEIF:
        case R.TK_END: case R.TK_EOS:
            return true;
        case R.TK_UNTIL: return withuntil;
        default: return false;
    }
};

const statlist = function(ls) {
    /* statlist -> { stat [';'] } */
    while (!block_follow(ls, 1)) {
        if (ls.t.token === R.TK_RETURN) {
            statement(ls);
            return;  /* 'return' must be last statement */
        }
        statement(ls);
    }
};

const yindex = function(ls, v) {
    /* index -> '[' expr ']' */
    llex.luaX_next(ls);  /* skip the '[' */
    expr(ls, v);
    lcode.luaK_exp2val(ls.fs, v);
    checknext(ls, ']');
};

/*
** {======================================================================
** Rules for Constructors
** =======================================================================
*/

class ConsControl {
    constructor() {
        this.v = new expdesc(); /* last list item read */
        this.t = new expdesc(); /* table descriptor */
        this.nh = NaN;          /* total number of 'record' elements */
        this.na = NaN;          /* total number of array elements */
        this.tostore = NaN;     /* number of array elements pending to be stored */
    }
}

const recfield = function(ls, cc) {
    /* recfield -> (NAME | '['exp1']') = exp1 */
    let fs = ls.fs;
    let reg = ls.fs.freereg;
    let key = new expdesc();
    let val = new expdesc();

    if (ls.t.token === R.TK_NAME) {
        checklimit(fs, cc.nh, Number.MAX_SAFE_INTEGER, "items in a constructor");
        checkname(ls, key);
    } else  /* ls->t.token == '[' */
        yindex(ls, key);
    cc.nh++;
    checknext(ls, '=');
    let rkkey = lcode.luaK_exp2RK(fs, key);
    expr(ls, val);
    lcode.luaK_codeABC(fs, OpCodesI.OP_SETTABLE, cc.t.u.info, rkkey, lcode.luaK_exp2RK(fs, val));
    fs.freereg = reg;  /* free registers */
};

const closelistfield = function(fs, cc) {
    if (cc.v.k === expkind.VVOID) return;  /* there is no list item */
    lcode.luaK_exp2nextreg(fs, cc.v);
    cc.v.k = expkind.VVOID;
    if (cc.tostore === lopcode.LFIELDS_PER_FLUSH) {
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, cc.tostore);  /* flush */
        cc.tostore = 0;  /* no more items pending */
    }
};

const lastlistfield = function(fs, cc) {
    if (cc.tostore === 0) return;
    if (hasmultret(cc.v.k)) {
        lcode.luaK_setmultret(fs, cc.v);
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, lua.LUA_MULTRET);
        cc.na--;  /* do not count last expression (unknown number of elements) */
    } else {
        if (cc.v.k !== expkind.VVOID)
            lcode.luaK_exp2nextreg(fs, cc.v);
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, cc.tostore);
    }
};

const listfield = function(ls, cc) {
    /* listfield -> exp */
    expr(ls, cc.v);
    checklimit(ls.fs, cc.na, Number.MAX_SAFE_INTEGER, "items in a constructor");
    cc.na++;
    cc.tostore++;
};

const field = function(ls, cc) {
    /* field -> listfield | recfield */
    switch (ls.t.token) {
        case R.TK_NAME: {  /* may be 'listfield' or 'recfield' */
            if (llex.luaX_lookahead(ls) !== '=')  /* expression? */
                listfield(ls, cc);
            else
                recfield(ls, cc);
            break;
        }
        case '[': {
            recfield(ls, cc);
            break;
        }
        default: {
            listfield(ls, cc);
            break;
        }
    }
};

const constructor = function(ls, t) {
    /* constructor -> '{' [ field { sep field } [sep] ] '}'
       sep -> ',' | ';' */
    let fs = ls.fs;
    let line = ls.linenumber;
    let pc = lcode.luaK_codeABC(fs, OpCodesI.OP_NEWTABLE, 0, 0, 0);
    let cc = new ConsControl();
    cc.na = cc.nh = cc.tostore = 0;
    cc.t = t;
    init_exp(t, expkind.VRELOCABLE, pc);
    init_exp(cc.v, expkind.VVOID, 0);  /* no value (yet) */
    lcode.luaK_exp2nextreg(ls.fs, t);  /* fix it at stack top */
    checknext(ls, '{');
    do {
        assert(cc.v.k === expkind.VVOID || cc.tostore > 0);
        if (ls.t.token === '}') break;
        closelistfield(fs, cc);
        field(ls, cc);
    } while (testnext(ls, ',') || testnext(ls, ';'));
    check_match(ls, '}', '{', line);
    lastlistfield(fs, cc);
    lopcode.SETARG_B(fs.f.code[pc], lobject.luaO_int2fb(cc.na));  /* set initial array size */
    lopcode.SETARG_C(fs.f.code[pc], lobject.luaO_int2fb(cc.nh));  /* set initial table size */
};

/*
** {======================================================================
** Expression parsing
** =======================================================================
*/

const simpleexp = function(ls, v) {
    /* simpleexp -> FLT | INT | STRING | NIL | TRUE | FALSE | ... |
       constructor | FUNCTION body | suffixedexp */
    switch (ls.t.token) {
        case R.TK_FLT: {
            init_exp(v, expkind.VFLT, 0);
            v.u.nval = ls.t.seminfo.r;
            break;
        }
        case R.TK_INT: {
            init_exp(v, expkind.VKINT, 0);
            v.u.ival = ls.t.seminfo.i;
            break;
        }
        case R.TK_STRING: {
            codestring(ls, v, ls.t.seminfo.ts);
            break;
        }
        case R.TK_NIL: {
            init_exp(v, expkind.VNIL, 0);
            break;
        }
        case R.TK_TRUE: {
            init_exp(v, expkind.VTRUE, 0);
            break;
        }
        case R.TK_FALSE: {
            init_exp(v, expkind.VFALSE, 0);
            break;
        }
        case R.TK_DOTS: {  /* vararg */
            let fs = ls.fs;
            check_condition(ls, fs.f.is_vararg, "cannot use '...' outside a vararg function");
            init_exp(v, expkind.VVARARG, lcode.luaK_codeABC(fs, OpCodesI.OP_VARARG, 0, 1, 0));
            break;
        }
        case '{': {  /* constructor */
            constructor(ls, v);
            return;
        }
        case R.TK_FUNCTION: {
            llex.luaX_next(ls);
            body(ls, v, 0, ls.linenumber);
            return;
        }
        default: {
            suffixedexp(ls, v);
            return;
        }
    }
    llex.luaX_next(ls);
};

const getunopr = function(op) {
    switch (op) {
        case R.TK_NOT: return UnOpr.OPR_NOT;
        case '-':      return UnOpr.OPR_MINUS;
        case '~':      return UnOpr.OPR_BNOT;
        case '#':      return UnOpr.OPR_LEN;
        default:       return UnOpr.OPR_NOUNOPR;
    }
};

const getbinopr = function(op) {
    switch (op) {
        case '+':         return BinOpr.OPR_ADD;
        case '-':         return BinOpr.OPR_SUB;
        case '*':         return BinOpr.OPR_MUL;
        case '%':         return BinOpr.OPR_MOD;
        case '^':         return BinOpr.OPR_POW;
        case '/':         return BinOpr.OPR_DIV;
        case R.TK_IDIV:   return BinOpr.OPR_IDIV;
        case '&':         return BinOpr.OPR_BAND;
        case '|':         return BinOpr.OPR_BOR;
        case '~':         return BinOpr.OPR_BXOR;
        case R.TK_SHL:    return BinOpr.OPR_SHL;
        case R.TK_SHR:    return BinOpr.OPR_SHR;
        case R.TK_CONCAT: return BinOpr.OPR_CONCAT;
        case R.TK_NE:     return BinOpr.OPR_NE;
        case R.TK_EQ:     return BinOpr.OPR_EQ;
        case '<':         return BinOpr.OPR_LT;
        case R.TK_LE:     return BinOpr.OPR_LE;
        case '>':         return BinOpr.OPR_GT;
        case R.TK_GE:     return BinOpr.OPR_GE;
        case R.TK_AND:    return BinOpr.OPR_AND;
        case R.TK_OR:     return BinOpr.OPR_OR;
        default:          return BinOpr.OPR_NOBINOPR;
    }
};

const priority = [  /* ORDER OPR */
    {left: 10, right: 10}, {left: 10, right: 10},     /* '+' '-' */
    {left: 11, right: 11}, {left: 11, right: 11},     /* '*' '%' */
    {left: 14, right: 13},               /* '^' (right associative) */
    {left: 11, right: 11}, {left: 11, right: 11},     /* '/' '//' */
    {left: 6, right: 6}, {left: 4, right: 4}, {left: 5, right: 5}, /* '&' '|' '~' */
    {left: 7, right: 7}, {left: 7, right: 7},         /* '<<' '>>' */
    {left: 9, right: 8},                 /* '..' (right associative) */
    {left: 3, right: 3}, {left: 3, right: 3}, {left: 3, right: 3}, /* ==, <, <= */
    {left: 3, right: 3}, {left: 3, right: 3}, {left: 3, right: 3}, /* ~=, >, >= */
    {left: 2, right: 2}, {left: 1, right: 1}          /* and, or */
];

const UNARY_PRIORITY = 12;

/*
** subexpr -> (simpleexp | unop subexpr) { binop subexpr }
** where 'binop' is any binary operator with a priority higher than 'limit'
*/
const subexpr = function(ls, v, limit) {
    enterlevel(ls);
    let uop = getunopr(ls.t.token);
    if (uop !== UnOpr.OPR_NOUNOPR) {
        let line = ls.linenumber;
        llex.luaX_next(ls);
        subexpr(ls, v, UNARY_PRIORITY);
        lcode.luaK_prefix(ls.fs, uop, v, line);
    } else
        simpleexp(ls, v);
    /* expand while operators have priorities higher than 'limit' */
    let op = getbinopr(ls.t.token);
    while (op !== BinOpr.OPR_NOBINOPR && priority[op].left > limit) {
        let v2 = new expdesc();
        let line = ls.linenumber;
        llex.luaX_next(ls);
        lcode.luaK_infix(ls.fs, op, v);
        /* read sub-expression with higher priority */
        let nextop = subexpr(ls, v2, priority[op].right);
        lcode.luaK_posfix(ls.fs, op, v, v2, line);
        op = nextop;
    }
    leavelevel(ls);
    return op;  /* return first untreated operator */
};

const expr = function(ls, v) {
    subexpr(ls, v, 0);
};

const test_then_block = function(ls, escapelist) {
    /* test_then_block -> [IF | ELSEIF] cond THEN block */
    let bl = new BlockCnt();
    let fs = ls.fs;
    let v = new expdesc();
    let jf;  /* instruction to skip 'then' code (if condition is false) */

    llex.luaX_next(ls);  /* skip IF or ELSEIF */
    expr(ls, v);  /* read condition */
    checknext(ls, R.TK_THEN);

    if (ls.t.token === R.TK_GOTO || ls.t.token === R.TK_BREAK) {
        lcode.luaK_goiffalse(ls.fs, v);  /* will jump to label if condition is true */
        enterblock(fs, bl, false);  /* must enter block before 'goto' */
        gotostat(ls, v.t);   /* handle goto/break */
        skipnoopstat(ls);  /* skip other no-op statements */
        if (block_follow(ls, 0)) {  /* 'goto' is the entire block? */
            leaveblock(fs);
            return;  /* and that is it */
        } else  /* must skip over 'then' part if condition is false */
            jf = lcode.luaK_jump(fs);
    } else {  /* regular case (not goto/break) */
        lcode.luaK_goiftrue(ls.fs, v);  /* skip over block if condition is false */
        enterblock(fs, bl, false);
        jf = v.f;
    }

    statlist(ls);  /* 'then' part */
    leaveblock(fs);
    if (ls.t.token === R.TK_ELSE || ls.t.token === R.TK_ELSEIF)  /* followed by 'else'/'elseif'? */
        escapelist = lcode.luaK_concat(fs, escapelist, lcode.luaK_jump(fs));  /* must jump over it */
    lcode.luaK_patchtohere(fs, jf);
};

const ifstat = function(ls, line) {
    /* ifstat -> IF cond THEN block {ELSEIF cond THEN block} [ELSE block] END */
    let fs = ls.fs;
    let escapelist = lcode.NO_JUMP;  /* exit list for finished parts */
    test_then_block(ls, escapelist);  /* IF cond THEN block */
    while (ls.t.token === R.TK_ELSEIF)
        test_then_block(ls, escapelist);  /* ELSEIF cond THEN block */
    if (testnext(ls, R.TK_ELSE))
        block(ls);  /* 'else' part */
    check_match(ls, R.TK_END, R.TK_IF, line);
    lcode.luaK_patchtohere(fs, escapelist);  /* patch escape list to 'if' end */
};

const statement = function(ls) {
    let line = ls.linenumber;  /* may be needed for error messages */
    enterlevel(ls);
    switch(ls.t.token) {
        case ';': {  /* stat -> ';' (empty statement) */
            llex.luaX_next(ls);  /* skip ';' */
            break;
        }
        case R.TK_IF: {  /* stat -> ifstat */
            ifstat(ls, line);
            break;
        }
        case R.TK_WHILE: {  /* stat -> whilestat */
            whilestat(ls, line);
            break;
        }
        case R.TK_DO: {  /* stat -> DO block END */
            llex.luaX_next(ls);  /* skip DO */
            block(ls);
            check_match(ls, R.TK_END, R.TK_DO, line);
            break;
        }
        case R.TK_FOR: {  /* stat -> forstat */
            forstat(ls, line);
            break;
        }
        case R.TK_REPEAT: {  /* stat -> repeatstat */
            repeatstat(ls, line);
            break;
        }
        case R.TK_FUNCTION: {  /* stat -> funcstat */
            funcstat(ls, line);
            break;
        }
        case R.TK_LOCAL: {  /* stat -> localstat */
            llex.luaX_next(ls);  /* skip LOCAL */
            if (testnext(ls, R.TK_FUNCTION))  /* local function? */
                localfunc(ls);
            else
                localstat(ls);
            break;
        }
        case R.TK_DBCOLON: {  /* stat -> label */
            llex.luaX_next(ls);  /* skip double colon */
            labelstat(ls, str_checkname(ls), line);
            break;
        }
        case R.TK_RETURN: {  /* skip double colon */
            llex.luaX_next(ls);  /* skip RETURN */
            retstat(ls);
            break;
        }
        case R.TK_BREAK:   /* stat -> breakstat */
        case R.TK_GOTO: {  /* stat -> 'goto' NAME */
            gotostat(ls, lcode.luaK_jump(ls.fs));
            break;
        }
        default: {  /* stat -> func | assignment */
            exprstat(ls);
            break;
        }
    }

    assert(ls.fs.f.maxstacksize >= ls.fs.freereg && ls.fs.freereg >= ls.fs.nactvar);
    ls.fs.freereg = ls.fs.nactvar;  /* free registers */
    leavelevel(ls);
};

/*
** compiles the main function, which is a regular vararg function with an
** upvalue named LUA_ENV
*/
const mainfunc = function(ls, fs) {
    let bl = new BlockCnt();
    let v = new expdesc();
    open_func(ls, fs, bl);
    fs.f.is_vararg = true;  /* main function is always declared vararg */
    init_exp(v, expkind.VLOCAL, 0);  /* create and... */
    newupvalue(fs, ls.envn, v);  /* ...set environment upvalue */
    llex.luaX_next(ls);  /* read first token */
    statlist(ls);  /* parse main body */
    check(ls, R.TK_EOS);
    close_func(ls);
};

const luaY_parser = function(L, z, buff, dyd, name, firstchar) {
    let lexstate = new llex.LexState();
    let funcstate = new FuncState();
    let cl = lfunc.luaF_newLclosure(L, 1);  /* create main closure */
    L.stack[L.top++] = cl;
    lexstate.h = new Table();  /* create table for scanner */
    L.stack[L.top++] = lexstate.h;
    funcstate.f = cl.p = new Proto(L);
    funcstate.f.source = new TValue(CT.LUA_TLNGSTR, name);
    lexstate.buff = buff;
    lexstate.dyd = dyd;
    dyd.actvar.n = dyd.gt.n = dyd.label.n = 0;
    llex.luaX_setinput(L, lexstate, z, funcstate.f.source, firstchar);
    mainfunc(lexstate, funcstate);
    assert(!funcstate.prev && funcstate.nups === 1 && !lexstate.fs);
    /* all scopes should be correctly finished */
    assert(dyd.actvar.n === 0 && dyd.gt.n === 0 && dyd.label.n === 0);
    L.top--;  /* remove scanner's table */
    return cl;  /* closure is on the stack, too */
};


module.exports.luaY_parser = luaY_parser;