/* jshint esversion: 6 */
"use strict";

const assert   = require('assert');

const lopcode  = require('./lopcode.js');
const llex     = require('./llex.js');
const lcode    = require('./lcode.js');
const OpCodesI = lopcode.OpCodesI;

/*
** Marks the end of a patch list. It is an invalid value both as an absolute
** address, and as a list link (would link an element to itself).
*/
const NO_JUMP = -1;

/*
** Gets the destination address of a jump instruction. Used to traverse
** a list of jumps.
*/
const getjump = function(fs, pc) {
    let offset = fs.f.code[pc].sBx;
    if (offset === NO_JUMP)  /* point to itself represents end of list */
        return NO_JUMP;  /* end of list */
    else
        return pc + 1 + offset;  /* turn offset into absolute position */
};

/*
** Fix jump instruction at position 'pc' to jump to 'dest'.
** (Jump addresses are relative in Lua)
*/
const fixjump = function(fs, pc, dest) {
    let jmp = fs.f.code[pc];
    let offset = dest - (pc + 1);
    assert(dest !== NO_JUMP);
    if (Math.abs(offset) > lopcode.MAXARG_sBx)
        llex.luaX_syntaxerror(fs.ls, "control structure too long");
    lopcode.SETARG_sBx(jmp, offset);
};

/*
** Concatenate jump-list 'l2' into jump-list 'l1'
*/
const luaK_concat = function(fs, l1, l2) {
    if (l2 === NO_JUMP) return;  /* nothing to concatenate? */
    else if (l1 === NO_JUMP)  /* no original list? */
        l1[0] = l2;
    else {
        let list = l1[0];
        let next = getjump(fs, list);
        while (next !== NO_JUMP) {  /* find last element */
            list = next;
            next = getjump(fs, list);
        }
        fixjump(fs, list, l2);
    }
};

/*
** Create a jump instruction and return its position, so its destination
** can be fixed later (with 'fixjump'). If there are jumps to
** this position (kept in 'jpc'), link them all together so that
** 'patchlistaux' will fix all them directly to the final destination.
*/
const luaK_jump = function (fs) {
    let jpc = fs.jpc;  /* save list of jumps to here */
    fs.jpc = NO_JUMP;  /* no more jumps to here */
    let j = luaK_codeAsBx(fs, OpCodesI.OP_JMP, 0, NO_JUMP);
    luaK_concat(fs, j, jpc);  /* keep them on hold */
    return j;
};

/*
** Code a 'return' instruction
*/
const luaK_ret = function(fs, first, nret) {
    luaK_codeABC(fs, OpCodesI.OP_RETURN, first, nret + 1, 0);
};

/*
** returns current 'pc' and marks it as a jump target (to avoid wrong
** optimizations with consecutive instructions not in the same basic block).
*/
const luaK_getlabel = function(fs) {
    fs.lasttarget = fs.pc;
    return fs.pc;
};

/*
** Returns the position of the instruction "controlling" a given
** jump (that is, its condition), or the jump itself if it is
** unconditional.
*/
const getjumpcontrol = function(fs, pc) {
    if (pc >= 1 && lopcode.testTMode(fs.f.code[pc - 1].opcode))
        return fs.f.code[pc - 1];
    else
        return fs.f.code[pc];
};

/*
** Patch destination register for a TESTSET instruction.
** If instruction in position 'node' is not a TESTSET, return 0 ("fails").
** Otherwise, if 'reg' is not 'NO_REG', set it as the destination
** register. Otherwise, change instruction to a simple 'TEST' (produces
** no register value)
*/
const patchtestreg = function(fs, node, reg) {
    let i = getjumpcontrol(fs, node);
    if (i.opcode !== OpCodesI.OP_TESTSET)
        return false;  /* cannot patch other instructions */
    if (reg !== lopcode.NO_REG && reg !== i.B)
        lopcode.SETARG_A(i, reg);
    else {
        /* no register to put value or register already has the value;
           change instruction to simple test */
        i = lopcode.CREATE_ABC(OpCodesI.OP_TEST, i.B, 0, i.C);
    }
    return true;
};

/*
** Traverse a list of tests, patching their destination address and
** registers: tests producing values jump to 'vtarget' (and put their
** values in 'reg'), other tests jump to 'dtarget'.
*/
const patchlistaux = function(fs, list, vtarget, reg, dtarget) {
    while (list !== NO_JUMP) {
        let next = getjump(fs, list);
        if (patchtestreg(fs, list, reg))
            fixjump(fs, list, vtarget);
        else
            fixjump(fs, list, dtarget);  /* jump to default target */
        list = next;
    }
};

/*
** Add elements in 'list' to list of pending jumps to "here"
** (current position)
*/
const luaK_patchtohere = function(fs, list) {
    luaK_getlabel(fs);  /* mark "here" as a jump target */
    luaK_concat(fs, fs.jpc, list);
};

/*
** Path all jumps in 'list' to jump to 'target'.
** (The assert means that we cannot fix a jump to a forward address
** because we only know addresses once code is generated.)
*/
const luaK_patchlist = function(fs, list, target) {
    if (target === fs.pc)  /* 'target' is current position? */
        luaK_patchtohere(fs, list);  /* add list to pending jumps */
    else {
        assert(target < fs.pc);
        patchlistaux(fs, list, target, lopcode.NO_REG, target);
    }
};

/*
** Path all jumps in 'list' to close upvalues up to given 'level'
** (The assertion checks that jumps either were closing nothing
** or were closing higher levels, from inner blocks.)
*/
const luaK_patchclose = function(fs, list, level) {
    level++;  /* argument is +1 to reserve 0 as non-op */
    for (; list !== NO_JUMP; list = getjump(fs, list)) {
        let ins = fs.f.code[list];
        assert(ins.opcode === OpCodesI.OP_JMP && (ins.A === 0 || i.A >= level);
        lopcode.SETARG_A(ins, level);
    }
};

/*
** Emit instruction 'i', checking for array sizes and saving also its
** line information. Return 'i' position.
*/
const luaK_code = function(fs, i) {
    let f = fs.f;
    lcode.dischargejpc(fs);  /* 'pc' will change */
    /* put new instruction in code array */
    f.code[fs.pc] = i;
    f.lineinfo[fs.pc] = fs.ls.lastline;
    return fs.pc++;
};

/*
** Format and emit an 'iABC' instruction. (Assertions check consistency
** of parameters versus opcode.)
*/
const luaK_codeABC = function(fs, o, a, b, c) {
    assert(lopcode.getOpMode(o) == lopcode.iABC);
    assert(lopcode.getBMode(o) != lopcode.OpArgN || b === 0);
    assert(lopcode.getCMode(o) != lopcode.OpArgN || c === 0);
    assert(a <= lopcode.MAXARG_A && b <= lopcode.MAXARG_B && c <= lopcode.MAXARG_C);
    return luaK_code(fs, lopcode.CREATE_ABC(o, a, b, c));
};

/*
** Format and emit an 'iABx' instruction.
*/
const luaK_codeABx = function(fs, o, a, bc) {
    lua_assert(lopcode.getOpMode(o) == lopcode.iABx || getOpMode(o) == lopcode.iAsBx);
    lua_assert(lopcode.getCMode(o) == lopcode.OpArgN);
    lua_assert(a <= lopcode.MAXARG_A && bc <= lopcode.MAXARG_Bx);
    return luaK_code(fs, lopcode.CREATE_ABx(o, a, bc));
};

const luaK_codeAsBx = function(fs,o,A,sBx) {
    return luaK_codeABx(fs, o, A, (sBx) + lopcode.MAXARG_sBx);
};

module.exports.NO_JUMP          = NO_JUMP;
module.exports.luaK_codeABx     = luaK_codeABx;
module.exports.luaK_codeAsBx    = luaK_codeAsBx;
module.exports.luaK_getlabel    = luaK_getlabel;
module.exports.luaK_jump        = luaK_jump;
module.exports.luaK_patchclose  = luaK_patchclose;
module.exports.luaK_patchlist   = luaK_patchlist;
module.exports.luaK_patchtohere = luaK_patchtohere;
module.exports.luaK_ret         = luaK_ret;