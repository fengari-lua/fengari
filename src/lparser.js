"use strict";

const assert = require('assert');

const defs     = require('./defs.js');
const lcode    = require('./lcode.js');
const lfunc    = require('./lfunc.js');
const llex     = require('./llex.js');
const llimit   = require('./llimit.js');
const lobject  = require('./lobject.js');
const lopcodes = require('./lopcodes.js');
const lstring  = require('./lstring.js');
const ltable   = require('./ltable.js');
const BinOpr   = lcode.BinOpr;
const OpCodesI = lopcodes.OpCodesI;
const Proto    = lfunc.Proto;
const R        = llex.RESERVED;
const TValue   = lobject.TValue;
const UnOpr    = lcode.UnOpr;
const char     = defs.char;

const MAXVARS = 200;

const hasmultret = function(k) {
    return k === expkind.VCALL || k === expkind.VVARARG;
};

const eqstr = function(a, b) {
    /* TODO: use plain equality as strings are cached */
    return lstring.luaS_eqlngstr(a, b);
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

const vkisvar = function(k) {
    return expkind.VLOCAL <= k && k <= expkind.VINDEXED;
};

const vkisinreg = function(k) {
    return k === expkind.VNONRELOC || k === expkind.VLOCAL;
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

    to(e) { // Copy e content to this, cf. luaK_posfix
        this.k = e.k;
        this.u = e.u;
        this.t = e.t;
        this.f = e.f;
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

    /* description of active local variable */
class Vardesc {
    constructor() {
        this.idx = NaN;  /* variable index in stack */
    }
}


/* description of pending goto statements and label statements */
class Labeldesc {
    constructor() {
        this.name = null;  /* label identifier */
        this.pc = NaN;  /* position in code */
        this.line = NaN;  /* line where it appeared */
        this.nactvar = NaN;  /* local level where it appears in current block */
    }
}


/* list of labels or gotos */
class Labellist {
    constructor() {
        this.arr = []; /* array */
        this.n = NaN;  /* number of entries in use */
        this.size = NaN;  /* array size */
    }
}

/* dynamic structures used by the parser */
class Dyndata {
    constructor() {
        this.actvar = {  /* list of active local variables */
            arr: [],
            n: NaN,
            size: NaN
        };
        this.gt = new Labellist();
        this.label = new Labellist();
    }
}

const semerror = function(ls, msg) {
    ls.t.token = 0;  /* remove "near <token>" from final message */
    llex.luaX_syntaxerror(ls, msg);
};

const error_expected = function(ls, token) {
    llex.luaX_syntaxerror(ls, lobject.luaO_pushfstring(ls.L, defs.to_luastring("%s expected", true), llex.luaX_token2str(ls, token)));
};

const errorlimit = function(fs, limit, what) {
    let L = fs.ls.L;
    let line = fs.f.linedefined;
    let where = (line === 0) ? "main function" : `function at line ${line}`;
    let msg = `too many ${what} (limit is ${limit}) in ${where}`;
    llex.luaX_syntaxerror(fs.ls, defs.to_luastring(msg));
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
            llex.luaX_syntaxerror(ls, lobject.luaO_pushfstring(ls.L,
                defs.to_luastring("%s expected (to close %s at line %d)"),
                    llex.luaX_token2str(ls, what), llex.luaX_token2str(ls, who), where));
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

const registerlocalvar = function(ls, varname) {
    let fs = ls.fs;
    let f = fs.f;
    f.locvars[fs.nlocvars] = new lobject.LocVar();
    f.locvars[fs.nlocvars].varname = varname;
    return fs.nlocvars++;
};

const new_localvar = function(ls, name) {
    let fs = ls.fs;
    let dyd = ls.dyd;
    let reg = registerlocalvar(ls, name);
    checklimit(fs, dyd.actvar.n + 1 - fs.firstlocal, MAXVARS, defs.to_luastring("local variables", true));
    dyd.actvar.arr[dyd.actvar.n] = new Vardesc();
    dyd.actvar.arr[dyd.actvar.n].idx = reg;
    dyd.actvar.n++;
};

const new_localvarliteral = function(ls, name) {
    new_localvar(ls, llex.luaX_newstring(ls, defs.to_luastring(name, true)));
};

const getlocvar = function(fs, i) {
    let idx = fs.ls.dyd.actvar.arr[fs.firstlocal + i].idx;
    assert(idx < fs.nlocvars);
    return fs.f.locvars[idx];
};

const adjustlocalvars = function(ls, nvars) {
    let fs = ls.fs;
    fs.nactvar = fs.nactvar + nvars;
    for (; nvars; nvars--)
        getlocvar(fs, fs.nactvar - nvars).startpc = fs.pc;
};

const removevars = function(fs, tolevel) {
    fs.ls.dyd.actvar.n -= fs.nactvar - tolevel;
    while (fs.nactvar > tolevel)
        getlocvar(fs, --fs.nactvar).endpc = fs.pc;
};

const searchupvalue = function(fs, name) {
    let up = fs.f.upvalues;
    for (let i = 0; i < fs.nups; i++) {
        if (eqstr(up[i].name, name))
            return i;
    }
    return -1;  /* not found */
};

const newupvalue = function(fs, name, v) {
    let f = fs.f;
    checklimit(fs, fs.nups + 1, lfunc.MAXUPVAL, defs.to_luastring("upvalues", true));
    f.upvalues[fs.nups] = {
        instack: v.k === expkind.VLOCAL,
        idx: v.u.info,
        name: name
    };
    return fs.nups++;
};

const searchvar = function(fs, n) {
    for (let i = fs.nactvar - 1; i >= 0; i--) {
        if (eqstr(n, getlocvar(fs, i).varname))
            return i;
    }

    return -1;
};

/*
** Mark block where variable at given level was defined
** (to emit close instructions later).
*/
const markupval = function(fs, level) {
    let bl = fs.bl;
    while (bl.nactvar > level)
        bl = bl.previous;
    bl.upval = 1;
};

/*
** Find variable with given name 'n'. If it is an upvalue, add this
** upvalue into all intermediate functions.
*/
const singlevaraux = function(fs, n, vr, base) {
    if (fs === null)  /* no more levels? */
        init_exp(vr, expkind.VVOID, 0);  /* default is global */
    else {
        let v = searchvar(fs, n);  /* look up locals at current level */
        if (v >= 0) {  /* found? */
            init_exp(vr, expkind.VLOCAL, v);  /* variable is local */
            if (!base)
                markupval(fs, v);  /* local will be used as an upval */
        } else {  /* not found as local at current level; try upvalues */
            let idx = searchupvalue(fs, n);  /* try existing upvalues */
            if (idx < 0) {  /* not found? */
                singlevaraux(fs.prev, n, vr, 0);  /* try upper levels */
                if (vr.k === expkind.VVOID)  /* not found? */
                    return;  /* it is a global */
                /* else was LOCAL or UPVAL */
                idx = newupvalue(fs, n, vr);  /* will be a new upvalue */
            }
            init_exp(vr, expkind.VUPVAL, idx);  /* new or old upvalue */
        }
    }
};

const singlevar = function(ls, vr) {
    let varname = str_checkname(ls);
    let fs = ls.fs;
    singlevaraux(fs, varname, vr, 1);
    if (vr.k === expkind.VVOID) {  /* global name? */
        let key = new expdesc();
        singlevaraux(fs, ls.envn, vr, 1);  /* get environment variable */
        assert(vr.k !== expkind.VVOID);  /* this one must exist */
        codestring(ls, key, varname);  /* key is variable name */
        lcode.luaK_indexed(fs, vr, key);  /* env[varname] */
    }
};

const adjust_assign = function(ls, nvars, nexps, e) {
    let fs = ls.fs;
    let extra = nvars - nexps;
    if (hasmultret(e.k)) {
        extra++;  /* includes call itself */
        if (extra < 0) extra = 0;
        lcode.luaK_setreturns(fs, e, extra);  /* last exp. provides the difference */
        if (extra > 1) lcode.luaK_reserveregs(fs, extra - 1);
    } else {
        if (e.k !== expkind.VVOID) lcode.luaK_exp2nextreg(fs, e);  /* close last expression */
        if (extra > 0) {
            let reg = fs.freereg;
            lcode.luaK_reserveregs(fs, extra);
            lcode.luaK_nil(fs, reg, extra);
        }
    }
    if (nexps > nvars)
        ls.fs.freereg -= nexps - nvars;  /* remove extra values */
};

const enterlevel = function(ls) {
    let L = ls.L;
    ++L.nCcalls;
    checklimit(ls.fs, L.nCcalls, llimit.LUAI_MAXCCALLS, defs.to_luastring("JS levels", true));
};

const leavelevel = function(ls) {
    return ls.L.nCcalls--;
};

const closegoto = function(ls, g, label) {
    let fs = ls.fs;
    let gl = ls.dyd.gt;
    let gt = gl.arr[g];
    assert(eqstr(gt.name, label.name));
    if (gt.nactvar < label.nactvar) {
        let vname = getlocvar(fs, gt.nactvar).varname;
        let msg = lobject.luaO_pushfstring(ls.L, defs.to_luastring("<goto %s> at line %d jumps into the scope of local '%s'"),
            gt.name, gt.line, vname);
        semerror(ls, msg);
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
        if (eqstr(lb.name, gt.name)) {  /* correct label? */
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
    l.arr[n] = new Labeldesc();
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
        if (eqstr(gl.arr[i].name, lb.name))
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
    let gl = fs.ls.dyd.gt;
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
    let n = lstring.luaS_newliteral(ls.L, "break");
    let l = newlabelentry(ls, ls.dyd.label, n, 0, ls.fs.pc);
    findgotos(ls, ls.dyd.label.arr[l]);
};

/*
** generates an error for an undefined 'goto'; choose appropriate
** message when label name is a reserved word (which can only be 'break')
*/
const undefgoto = function(ls, gt) {
    let msg = llex.isreserved(gt.name)
              ? "<%s> at line %d not inside a loop"
              : "no visible label '%s' for <goto> at line %d";
    msg = lobject.luaO_pushfstring(ls.L, defs.to_luastring(msg), gt.name, gt.line);
    semerror(ls, msg);
};

/*
** adds a new prototype into list of prototypes
*/
const addprototype = function(ls) {
    let L = ls.L;
    let clp = new Proto(L);
    let fs = ls.fs;
    let f = fs.f;  /* prototype of current function */
    f.p[fs.np++] = clp;
    return clp;
};

/*
** codes instruction to create new closure in parent function.
*/
const codeclosure = function(ls, v) {
    let fs = ls.fs.prev;
    init_exp(v, expkind.VRELOCABLE, lcode.luaK_codeABx(fs, OpCodesI.OP_CLOSURE, 0, fs.np -1));
    lcode.luaK_exp2nextreg(fs, v);  /* fix it at the last register */
};

const open_func = function(ls, fs, bl) {
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
    let f = new Proto(ls.L);
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

const fieldsel = function(ls, v) {
    /* fieldsel -> ['.' | ':'] NAME */
    let fs = ls.fs;
    let key = new expdesc();
    lcode.luaK_exp2anyregup(fs, v);
    llex.luaX_next(ls);  /* skip the dot or colon */
    checkname(ls, key);
    lcode.luaK_indexed(fs, v, key);
};

const yindex = function(ls, v) {
    /* index -> '[' expr ']' */
    llex.luaX_next(ls);  /* skip the '[' */
    expr(ls, v);
    lcode.luaK_exp2val(ls.fs, v);
    checknext(ls, char[']']);
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
        checklimit(fs, cc.nh, llimit.MAX_INT, defs.to_luastring("items in a constructor", true));
        checkname(ls, key);
    } else  /* ls->t.token === '[' */
        yindex(ls, key);
    cc.nh++;
    checknext(ls, char['=']);
    let rkkey = lcode.luaK_exp2RK(fs, key);
    expr(ls, val);
    lcode.luaK_codeABC(fs, OpCodesI.OP_SETTABLE, cc.t.u.info, rkkey, lcode.luaK_exp2RK(fs, val));
    fs.freereg = reg;  /* free registers */
};

const closelistfield = function(fs, cc) {
    if (cc.v.k === expkind.VVOID) return;  /* there is no list item */
    lcode.luaK_exp2nextreg(fs, cc.v);
    cc.v.k = expkind.VVOID;
    if (cc.tostore === lopcodes.LFIELDS_PER_FLUSH) {
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, cc.tostore);  /* flush */
        cc.tostore = 0;  /* no more items pending */
    }
};

const lastlistfield = function(fs, cc) {
    if (cc.tostore === 0) return;
    if (hasmultret(cc.v.k)) {
        lcode.luaK_setmultret(fs, cc.v);
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, defs.LUA_MULTRET);
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
    checklimit(ls.fs, cc.na, llimit.MAX_INT, defs.to_luastring("items in a constructor", true));
    cc.na++;
    cc.tostore++;
};

const field = function(ls, cc) {
    /* field -> listfield | recfield */
    switch (ls.t.token) {
        case R.TK_NAME: {  /* may be 'listfield' or 'recfield' */
            if (llex.luaX_lookahead(ls) !== char['='])  /* expression? */
                listfield(ls, cc);
            else
                recfield(ls, cc);
            break;
        }
        case char['[']: {
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
    checknext(ls, char['{']);
    do {
        assert(cc.v.k === expkind.VVOID || cc.tostore > 0);
        if (ls.t.token === char['}']) break;
        closelistfield(fs, cc);
        field(ls, cc);
    } while (testnext(ls, char[',']) || testnext(ls, char[';']));
    check_match(ls, char['}'], char['{'], line);
    lastlistfield(fs, cc);
    lopcodes.SETARG_B(fs.f.code[pc], lobject.luaO_int2fb(cc.na));  /* set initial array size */
    lopcodes.SETARG_C(fs.f.code[pc], lobject.luaO_int2fb(cc.nh));  /* set initial table size */
};

/* }====================================================================== */

const parlist = function(ls) {
    /* parlist -> [ param { ',' param } ] */
    let fs = ls.fs;
    let f = fs.f;
    let nparams = 0;
    f.is_vararg = 0;
    if (ls.t.token !== char[')']) {  /* is 'parlist' not empty? */
        do {
            switch (ls.t.token) {
                case R.TK_NAME: {  /* param -> NAME */
                    new_localvar(ls, str_checkname(ls));
                    nparams++;
                    break;
                }
                case R.TK_DOTS: {  /* param -> '...' */
                    llex.luaX_next(ls);
                    f.is_vararg = 1;  /* declared vararg */
                    break;
                }
                default: llex.luaX_syntaxerror(ls, defs.to_luastring("<name> or '...' expected", true));
            }
        } while(!f.is_vararg && testnext(ls, char[',']));
    }
    adjustlocalvars(ls, nparams);
    f.numparams = fs.nactvar;
    lcode.luaK_reserveregs(fs, fs.nactvar);  /* reserve register for parameters */
};

const body = function(ls, e, ismethod, line) {
    /* body ->  '(' parlist ')' block END */
    let new_fs = new FuncState();
    let bl = new BlockCnt();
    new_fs.f = addprototype(ls);
    new_fs.f.linedefined = line;
    open_func(ls, new_fs, bl);
    checknext(ls, char['(']);
    if (ismethod) {
        new_localvarliteral(ls, "self");  /* create 'self' parameter */
        adjustlocalvars(ls, 1);
    }
    parlist(ls);
    checknext(ls, char[')']);
    statlist(ls);
    new_fs.f.lastlinedefined = ls.linenumber;
    check_match(ls, R.TK_END, R.TK_FUNCTION, line);
    codeclosure(ls, e);
    close_func(ls);
};

const explist = function(ls, v) {
    /* explist -> expr { ',' expr } */
    let n = 1;  /* at least one expression */
    expr(ls, v);
    while (testnext(ls, char[','])) {
        lcode.luaK_exp2nextreg(ls.fs, v);
        expr(ls, v);
        n++;
    }
    return n;
};

const funcargs = function(ls, f, line) {
    let fs = ls.fs;
    let args = new expdesc();
    switch (ls.t.token) {
        case char['(']: {  /* funcargs -> '(' [ explist ] ')' */
            llex.luaX_next(ls);
            if (ls.t.token === char[')'])  /* arg list is empty? */
                args.k = expkind.VVOID;
            else {
                explist(ls, args);
                lcode.luaK_setmultret(fs, args);
            }
            check_match(ls, char[')'], char['('], line);
            break;
        }
        case char['{']: {  /* funcargs -> constructor */
            constructor(ls, args);
            break;
        }
        case R.TK_STRING: {  /* funcargs -> STRING */
            codestring(ls, args, ls.t.seminfo.ts);
            llex.luaX_next(ls);  /* must use 'seminfo' before 'next' */
            break;
        }
        default: {
            llex.luaX_syntaxerror(ls, defs.to_luastring("function arguments expected", true));
        }
    }
    assert(f.k === expkind.VNONRELOC);
    let nparams;
    let base = f.u.info;  /* base register for call */
    if (hasmultret(args.k))
        nparams = defs.LUA_MULTRET;  /* open call */
    else {
        if (args.k !== expkind.VVOID)
            lcode.luaK_exp2nextreg(fs, args);  /* close last argument */
        nparams = fs.freereg - (base+1);
    }
    init_exp(f, expkind.VCALL, lcode.luaK_codeABC(fs, OpCodesI.OP_CALL, base, nparams+1, 2));
    lcode.luaK_fixline(fs, line);
    fs.freereg = base + 1; /* call remove function and arguments and leaves (unless changed) one result */
};

/*
** {======================================================================
** Expression parsing
** =======================================================================
*/

const primaryexp = function(ls, v) {
    /* primaryexp -> NAME | '(' expr ')' */
    switch (ls.t.token) {
        case char['(']: {
            let line = ls.linenumber;
            llex.luaX_next(ls);
            expr(ls, v);
            check_match(ls, char[')'], char['('], line);
            lcode.luaK_dischargevars(ls.fs, v);
            return;
        }
        case R.TK_NAME: {
            singlevar(ls, v);
            return;
        }
        default: {
            llex.luaX_syntaxerror(ls, defs.to_luastring("unexpected symbol", true));
        }
    }
};

const suffixedexp = function(ls, v) {
    /* suffixedexp ->
       primaryexp { '.' NAME | '[' exp ']' | ':' NAME funcargs | funcargs } */
    let fs = ls.fs;
    let line = ls.linenumber;
    primaryexp(ls, v);
    for (;;) {
        switch (ls.t.token) {
            case char['.']: {  /* fieldsel */
                fieldsel(ls, v);
                break;
            }
            case char['[']: {  /* '[' exp1 ']' */
                let key = new expdesc();
                lcode.luaK_exp2anyregup(fs, v);
                yindex(ls, key);
                lcode.luaK_indexed(fs, v, key);
                break;
            }
            case char[':']: {  /* ':' NAME funcargs */
                let key = new expdesc();
                llex.luaX_next(ls);
                checkname(ls, key);
                lcode.luaK_self(fs, v, key);
                funcargs(ls, v, line);
                break;
            }
            case char['(']: case R.TK_STRING: case char['{']: {  /* funcargs */
                lcode.luaK_exp2nextreg(fs, v);
                funcargs(ls, v, line);
                break;
            }
            default: return;
        }
    }
};

const simpleexp = function(ls, v) {
    /* simpleexp -> FLT | INT | STRING | NIL | TRUE | FALSE | ... |
       constructor | FUNCTION body | suffixedexp */
    switch (ls.t.token) {
        case R.TK_FLT: {
            init_exp(v, expkind.VKFLT, 0);
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
            check_condition(ls, fs.f.is_vararg, defs.to_luastring("cannot use '...' outside a vararg function", true));
            init_exp(v, expkind.VVARARG, lcode.luaK_codeABC(fs, OpCodesI.OP_VARARG, 0, 1, 0));
            break;
        }
        case char['{']: {  /* constructor */
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
        case R.TK_NOT:  return UnOpr.OPR_NOT;
        case char['-']: return UnOpr.OPR_MINUS;
        case char['~']: return UnOpr.OPR_BNOT;
        case char['#']: return UnOpr.OPR_LEN;
        default:        return UnOpr.OPR_NOUNOPR;
    }
};

const getbinopr = function(op) {
    switch (op) {
        case char['+']:   return BinOpr.OPR_ADD;
        case char['-']:   return BinOpr.OPR_SUB;
        case char['*']:   return BinOpr.OPR_MUL;
        case char['%']:   return BinOpr.OPR_MOD;
        case char['^']:   return BinOpr.OPR_POW;
        case char['/']:   return BinOpr.OPR_DIV;
        case R.TK_IDIV:   return BinOpr.OPR_IDIV;
        case char['&']:   return BinOpr.OPR_BAND;
        case char['|']:   return BinOpr.OPR_BOR;
        case char['~']:   return BinOpr.OPR_BXOR;
        case R.TK_SHL:    return BinOpr.OPR_SHL;
        case R.TK_SHR:    return BinOpr.OPR_SHR;
        case R.TK_CONCAT: return BinOpr.OPR_CONCAT;
        case R.TK_NE:     return BinOpr.OPR_NE;
        case R.TK_EQ:     return BinOpr.OPR_EQ;
        case char['<']:   return BinOpr.OPR_LT;
        case R.TK_LE:     return BinOpr.OPR_LE;
        case char['>']:   return BinOpr.OPR_GT;
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

/* }==================================================================== */



/*
** {======================================================================
** Rules for Statements
** =======================================================================
*/

const block = function(ls) {
    /* block -> statlist */
    let fs = ls.fs;
    let bl = new BlockCnt();
    enterblock(fs, bl, 0);
    statlist(ls);
    leaveblock(fs);
};

/*
** structure to chain all variables in the left-hand side of an
** assignment
*/
class LHS_assign {
    constructor() {
        this.prev = null;
        this.v = new expdesc();  /* variable (global, local, upvalue, or indexed) */
    }
}

/*
** check whether, in an assignment to an upvalue/local variable, the
** upvalue/local variable is begin used in a previous assignment to a
** table. If so, save original upvalue/local value in a safe place and
** use this safe copy in the previous assignment.
*/
const check_conflict = function(ls, lh, v) {
    let fs = ls.fs;
    let extra = fs.freereg;  /* eventual position to save local variable */
    let conflict = false;
    for (; lh; lh = lh.prev) {  /* check all previous assignments */
        if (lh.v.k === expkind.VINDEXED) {  /* assigning to a table? */
            /* table is the upvalue/local being assigned now? */
            if (lh.v.u.ind.vt === v.k && lh.v.u.ind.t === v.u.info) {
                conflict = true;
                lh.v.u.ind.vt = expkind.VLOCAL;
                lh.v.u.ind.t = extra;  /* previous assignment will use safe copy */
            }
            /* index is the local being assigned? (index cannot be upvalue) */
            if (v.k === expkind.VLOCAL && lh.v.u.ind.idx === v.u.info) {
                conflict = true;
                lh.v.u.ind.idx = extra;  /* previous assignment will use safe copy */
            }
        }
    }
    if (conflict) {
        /* copy upvalue/local value to a temporary (in position 'extra') */
        let op = v.k === expkind.VLOCAL ? OpCodesI.OP_MOVE : OpCodesI.OP_GETUPVAL;
        lcode.luaK_codeABC(fs, op, extra, v.u.info, 0);
        lcode.luaK_reserveregs(fs, 1);
    }
};

const assignment = function(ls, lh, nvars) {
    let e = new expdesc();
    check_condition(ls, vkisvar(lh.v.k), defs.to_luastring("syntax error", true));
    if (testnext(ls, char[','])) {  /* assignment -> ',' suffixedexp assignment */
        let nv = new LHS_assign();
        nv.prev = lh;
        suffixedexp(ls, nv.v);
        if (nv.v.k !== expkind.VINDEXED)
            check_conflict(ls, lh, nv.v);
        checklimit(ls.fs, nvars + ls.L.nCcalls, llimit.LUAI_MAXCCALLS, defs.to_luastring("JS levels", true));
        assignment(ls, nv, nvars + 1);
    } else {  /* assignment -> '=' explist */
        checknext(ls, char['=']);
        let nexps = explist(ls, e);
        if (nexps !== nvars)
            adjust_assign(ls, nvars, nexps, e);
        else {
            lcode.luaK_setoneret(ls.fs, e);  /* close last expression */
            lcode.luaK_storevar(ls.fs, lh.v, e);
            return;  /* avoid default */
        }
    }
    init_exp(e, expkind.VNONRELOC, ls.fs.freereg-1);  /* default assignment */
    lcode.luaK_storevar(ls.fs, lh.v, e);
};

const cond = function(ls) {
    /* cond -> exp */
    let v = new expdesc();
    expr(ls, v);  /* read condition */
    if (v.k === expkind.VNIL) v.k = expkind.VFALSE;  /* 'falses' are all equal here */
    lcode.luaK_goiftrue(ls.fs, v);
    return v.f;
};

const gotostat = function(ls, pc) {
    let line = ls.linenumber;
    let label;
    if (testnext(ls, R.TK_GOTO))
        label = str_checkname(ls);
    else {
        llex.luaX_next(ls);  /* skip break */
        label = lstring.luaS_newliteral(ls.L, "break");
    }
    let g = newlabelentry(ls, ls.dyd.gt, label, line, pc);
    findlabel(ls, g);  /* close it if label already defined */
};

/* check for repeated labels on the same block */
const checkrepeated = function(fs, ll, label) {
    for (let i = fs.bl.firstlabel; i < ll.n; i++) {
        if (eqstr(label, ll.arr[i].name)) {
            semerror(fs.ls, defs.to_luastring(`label '${label.jsstring()}' already defined on line ${ll.arr[i].line}`));
        }
    }
};

/* skip no-op statements */
const skipnoopstat = function(ls) {
    while (ls.t.token === char[';'] || ls.t.token === R.TK_DBCOLON)
        statement(ls);
};

const labelstat = function(ls, label, line) {
    /* label -> '::' NAME '::' */
    let fs = ls.fs;
    let ll = ls.dyd.label;
    let l;  /* index of new label being created */
    checkrepeated(fs, ll, label);  /* check for repeated labels */
    checknext(ls, R.TK_DBCOLON);  /* skip double colon */
    /* create new entry for this label */
    l = newlabelentry(ls, ll, label, line, lcode.luaK_getlabel(fs));
    skipnoopstat(ls);  /* skip other no-op statements */
    if (block_follow(ls, 0)) {  /* label is last no-op statement in the block? */
        /* assume that locals are already out of scope */
        ll.arr[l].nactvar = fs.bl.nactvar;
    }
    findgotos(ls, ll.arr[l]);
};

const whilestat = function(ls, line) {
    /* whilestat -> WHILE cond DO block END */
    let fs = ls.fs;
    let bl = new BlockCnt();
    llex.luaX_next(ls);  /* skip WHILE */
    let whileinit = lcode.luaK_getlabel(fs);
    let condexit = cond(ls);
    enterblock(fs, bl, 1);
    checknext(ls, R.TK_DO);
    block(ls);
    lcode.luaK_jumpto(fs, whileinit);
    check_match(ls, R.TK_END, R.TK_WHILE, line);
    leaveblock(fs);
    lcode.luaK_patchtohere(fs, condexit);  /* false conditions finish the loop */
};

const repeatstat = function(ls, line) {
    /* repeatstat -> REPEAT block UNTIL cond */
    let fs = ls.fs;
    let repeat_init = lcode.luaK_getlabel(fs);
    let bl1 = new BlockCnt();
    let bl2 = new BlockCnt();
    enterblock(fs, bl1, 1);  /* loop block */
    enterblock(fs, bl2, 0);  /* scope block */
    llex.luaX_next(ls);  /* skip REPEAT */
    statlist(ls);
    check_match(ls, R.TK_UNTIL, R.TK_REPEAT, line);
    let condexit = cond(ls);  /* read condition (inside scope block) */
    if (bl2.upval)  /* upvalues? */
        lcode.luaK_patchclose(fs, condexit, bl2.nactvar);
    leaveblock(fs);  /* finish scope */
    lcode.luaK_patchlist(fs, condexit, repeat_init);  /* close the loop */
    leaveblock(fs);  /* finish loop */
};

const exp1 = function(ls) {
    let e = new expdesc();
    expr(ls, e);
    lcode.luaK_exp2nextreg(ls.fs, e);
    assert(e.k === expkind.VNONRELOC);
    let reg = e.u.info;
    return reg;
};

const forbody = function(ls, base, line, nvars, isnum) {
    /* forbody -> DO block */
    let bl = new BlockCnt();
    let fs = ls.fs;
    let endfor;
    adjustlocalvars(ls, 3);  /* control variables */
    checknext(ls, R.TK_DO);
    let prep = isnum ? lcode.luaK_codeAsBx(fs, OpCodesI.OP_FORPREP, base, lcode.NO_JUMP) : lcode.luaK_jump(fs);
    enterblock(fs, bl, 0);  /* scope for declared variables */
    adjustlocalvars(ls, nvars);
    lcode.luaK_reserveregs(fs, nvars);
    block(ls);
    leaveblock(fs);  /* end of scope for declared variables */
    lcode.luaK_patchtohere(fs, prep);
    if (isnum)  /* end of scope for declared variables */
        endfor = lcode.luaK_codeAsBx(fs, OpCodesI.OP_FORLOOP, base, lcode.NO_JUMP);
    else {  /* generic for */
        lcode.luaK_codeABC(fs, OpCodesI.OP_TFORCALL, base, 0, nvars);
        lcode.luaK_fixline(fs, line);
        endfor = lcode.luaK_codeAsBx(fs, OpCodesI.OP_TFORLOOP, base + 2, lcode.NO_JUMP);
    }
    lcode.luaK_patchlist(fs, endfor, prep + 1);
    lcode.luaK_fixline(fs, line);
};

const fornum = function(ls, varname, line) {
    /* fornum -> NAME = exp1,exp1[,exp1] forbody */
    let fs = ls.fs;
    let base = fs.freereg;
    new_localvarliteral(ls, "(for index)");
    new_localvarliteral(ls, "(for limit)");
    new_localvarliteral(ls, "(for step)");
    new_localvar(ls, varname);
    checknext(ls, char['=']);
    exp1(ls);  /* initial value */
    checknext(ls, char[',']);
    exp1(ls);  /* limit */
    if (testnext(ls, char[',']))
        exp1(ls);  /* optional step */
    else {  /* default step = 1 */
        lcode.luaK_codek(fs, fs.freereg, lcode.luaK_intK(fs, 1));
        lcode.luaK_reserveregs(fs, 1);
    }
    forbody(ls, base, line, 1, 1);
};

const forlist = function(ls, indexname) {
    /* forlist -> NAME {,NAME} IN explist forbody */
    let fs = ls.fs;
    let e = new expdesc();
    let nvars = 4;  /* gen, state, control, plus at least one declared var */
    let base = fs.freereg;
    /* create control variables */
    new_localvarliteral(ls, "(for generator)");
    new_localvarliteral(ls, "(for state)");
    new_localvarliteral(ls, "(for control)");
    /* create declared variables */
    new_localvar(ls, indexname);
    while (testnext(ls, char[','])) {
        new_localvar(ls, str_checkname(ls));
        nvars++;
    }
    checknext(ls, R.TK_IN);
    let line = ls.linenumber;
    adjust_assign(ls, 3, explist(ls, e), e);
    lcode.luaK_checkstack(fs, 3);  /* extra space to call generator */
    forbody(ls, base, line, nvars - 3, 0);
};

const forstat = function(ls, line) {
    /* forstat -> FOR (fornum | forlist) END */
    let fs = ls.fs;
    let bl = new BlockCnt();
    enterblock(fs, bl, 1);  /* scope for loop and control variables */
    llex.luaX_next(ls);  /* skip 'for' */
    let varname = str_checkname(ls);  /* first variable name */
    switch (ls.t.token) {
        case char['=']: fornum(ls, varname, line); break;
        case char[',']: case R.TK_IN: forlist(ls, varname); break;
        default: llex.luaX_syntaxerror(ls, defs.to_luastring("'=' or 'in' expected", true));
    }
    check_match(ls, R.TK_END, R.TK_FOR, line);
    leaveblock(fs);  /* loop scope ('break' jumps to this point) */
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

    return escapelist;
};

const ifstat = function(ls, line) {
    /* ifstat -> IF cond THEN block {ELSEIF cond THEN block} [ELSE block] END */
    let fs = ls.fs;
    let escapelist = lcode.NO_JUMP;  /* exit list for finished parts */
    escapelist = test_then_block(ls, escapelist);  /* IF cond THEN block */
    while (ls.t.token === R.TK_ELSEIF)
        escapelist = test_then_block(ls, escapelist);  /* ELSEIF cond THEN block */
    if (testnext(ls, R.TK_ELSE))
        block(ls);  /* 'else' part */
    check_match(ls, R.TK_END, R.TK_IF, line);
    lcode.luaK_patchtohere(fs, escapelist);  /* patch escape list to 'if' end */
};

const localfunc = function(ls) {
    let b = new expdesc();
    let fs = ls.fs;
    new_localvar(ls, str_checkname(ls));  /* new local variable */
    adjustlocalvars(ls, 1);  /* enter its scope */
    body(ls, b, 0, ls.linenumber);  /* function created in next register */
    /* debug information will only see the variable after this point! */
    getlocvar(fs, b.u.info).startpc = fs.pc;
};

const localstat = function(ls) {
    /* stat -> LOCAL NAME {',' NAME} ['=' explist] */
    let nvars = 0;
    let nexps;
    let e = new expdesc();
    do {
        new_localvar(ls, str_checkname(ls));
        nvars++;
    } while (testnext(ls, char[',']));
    if (testnext(ls, char['=']))
        nexps = explist(ls, e);
    else {
        e.k = expkind.VVOID;
        nexps = 0;
    }
    adjust_assign(ls, nvars, nexps, e);
    adjustlocalvars(ls, nvars);
};

const funcname = function(ls, v) {
    /* funcname -> NAME {fieldsel} [':' NAME] */
    let ismethod = 0;
    singlevar(ls, v);
    while (ls.t.token === char['.'])
        fieldsel(ls, v);
    if (ls.t.token === char[':']) {
        ismethod = 1;
        fieldsel(ls, v);
    }
    return ismethod;
};

const funcstat = function(ls, line) {
    /* funcstat -> FUNCTION funcname body */
    let v = new expdesc();
    let b = new expdesc();
    llex.luaX_next(ls);  /* skip FUNCTION */
    let ismethod = funcname(ls, v);
    body(ls, b, ismethod, line);
    lcode.luaK_storevar(ls.fs, v, b);
    lcode.luaK_fixline(ls.fs, line);  /* definition "happens" in the first line */
};

const exprstat= function(ls) {
    /* stat -> func | assignment */
    let fs = ls.fs;
    let v = new LHS_assign();
    suffixedexp(ls, v.v);
    if (ls.t.token === char['='] || ls.t.token === char[',']) { /* stat . assignment ? */
        v.prev = null;
        assignment(ls, v, 1);
    }
    else {  /* stat -> func */
        check_condition(ls, v.v.k === expkind.VCALL, defs.to_luastring("syntax error", true));
        lopcodes.SETARG_C(lcode.getinstruction(fs, v.v), 1);  /* call statement uses no results */
    }
};

const retstat = function(ls) {
    /* stat -> RETURN [explist] [';'] */
    let fs = ls.fs;
    let e = new expdesc();
    let first, nret;  /* registers with returned values */
    if (block_follow(ls, 1) || ls.t.token === char[';'])
        first = nret = 0;  /* return no values */
    else {
        nret = explist(ls, e);  /* optional return values */
        if (hasmultret(e.k)) {
            lcode.luaK_setmultret(fs, e);
            if (e.k === expkind.VCALL && nret === 1) {  /* tail call? */
                lopcodes.SET_OPCODE(lcode.getinstruction(fs, e), OpCodesI.OP_TAILCALL);
                assert(lcode.getinstruction(fs, e).A === fs.nactvar);
            }
            first = fs.nactvar;
            nret = defs.LUA_MULTRET;  /* return all values */
        } else {
            if (nret === 1)  /* only one single value? */
                first = lcode.luaK_exp2anyreg(fs, e);
            else {
                lcode.luaK_exp2nextreg(fs, e);  /* values must go to the stack */
                first = fs.nactvar;  /* return all active values */
                assert(nret === fs.freereg - first);
            }
        }
    }
    lcode.luaK_ret(fs, first, nret);
    testnext(ls, char[';']);  /* skip optional semicolon */
};

const statement = function(ls) {
    let line = ls.linenumber;  /* may be needed for error messages */
    enterlevel(ls);
    switch(ls.t.token) {
        case char[';']: {  /* stat -> ';' (empty statement) */
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
    L.stack[L.top++] = new TValue(defs.CT.LUA_TLCL, cl);
    lexstate.h = ltable.luaH_new(L);  /* create table for scanner */
    L.stack[L.top++] = lexstate.h;
    funcstate.f = cl.p = new Proto(L);
    funcstate.f.source = lstring.luaS_new(L, name);
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


module.exports.Dyndata     = Dyndata;
module.exports.expkind     = expkind;
module.exports.expdesc     = expdesc;
module.exports.luaY_parser = luaY_parser;
module.exports.vkisinreg   = vkisinreg;
