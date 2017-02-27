/* jshint esversion: 6 */
"use strict";

const assert = require('assert');

const lua     = require('./lua.js');
const llex    = require('./llex.js');
const lfunc   = require('./lfunc.js');
const lobject = require('./lobject.js');
const lcode   = require('./lcode.js');
const R       = llex.RESERVED;
const TValue  = lobject.TValue;
const CT      = lua.constants_type;
const Table   = lobject.Table;
const Proto   = lfunc.Proto;
const UpVal   = lfunc.UpVal;

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

const check = function(ls, c) {
    if (ls.t.token !== c)
        error_expected(ls, c);
};

const init_exp = function(e, k, i) {
    e.f = e.t = lcode.NO_JUMP;
    e.k = k;
    e.u.info = i;
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