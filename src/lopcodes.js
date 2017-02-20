/*jshint esversion: 6 */
"use strict";

const OpCodes = [
    "OP_MOVE",
    "OP_LOADK",
    "OP_LOADKX",
    "OP_LOADBOOL",
    "OP_LOADNIL",
    "OP_GETUPVAL",
    "OP_GETTABUP",
    "OP_GETTABLE",
    "OP_SETTABUP",
    "OP_SETUPVAL",
    "OP_SETTABLE",
    "OP_NEWTABLE",
    "OP_SELF",
    "OP_ADD",
    "OP_SUB",
    "OP_MUL",
    "OP_MOD",
    "OP_POW",
    "OP_DIV",
    "OP_IDIV",
    "OP_BAND",
    "OP_BOR",
    "OP_BXOR",
    "OP_SHL",
    "OP_SHR",
    "OP_UNM",
    "OP_BNOT",
    "OP_NOT",
    "OP_LEN",
    "OP_CONCAT",
    "OP_JMP",
    "OP_EQ",
    "OP_LT",
    "OP_LE",
    "OP_TEST",
    "OP_TESTSET",
    "OP_CALL",
    "OP_TAILCALL",
    "OP_RETURN",
    "OP_FORLOOP",
    "OP_FORPREP",
    "OP_TFORCALL",
    "OP_TFORLOOP",
    "OP_SETLIST",
    "OP_CLOSURE",
    "OP_VARARG",
    "OP_EXTRAARG"
];

/*
** masks for instruction properties. The format is:
** bits 0-1: op mode
** bits 2-3: C arg mode
** bits 4-5: B arg mode
** bit 6: instruction set register A
** bit 7: operator is a test (next instruction must be a jump)
*/
const OpArgN = 0;  /* argument is not used */
const OpArgU = 1;  /* argument is used */
const OpArgR = 2;  /* argument is a register or a jump offset */
const OpArgK = 3;  /* argument is a constant or register/constant */

/* basic instruction format */
const iABC  = 0;
const iABx  = 1;
const iAsBx = 2;
const iAx   = 3;

const luaP_opmodes = [
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,   /* OP_MOVE */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgN << 2 | iABx,   /* OP_LOADK */
    0 << 7 | 1 << 6 | OpArgN << 4 | OpArgN << 2 | iABx,   /* OP_LOADKX */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,   /* OP_LOADBOOL */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,   /* OP_LOADNIL */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,   /* OP_GETUPVAL */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgK << 2 | iABC,   /* OP_GETTABUP */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgK << 2 | iABC,   /* OP_GETTABLE */
    0 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_SETTABUP */
    0 << 7 | 0 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,   /* OP_SETUPVAL */
    0 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_SETTABLE */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,   /* OP_NEWTABLE */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgK << 2 | iABC,   /* OP_SELF */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_ADD */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_SUB */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_MUL */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_MOD */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_POW */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_DIV */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_IDIV */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_BAND */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_BOR */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_BXOR */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_SHL */
    0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_SHR */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,   /* OP_UNM */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,   /* OP_BNOT */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,   /* OP_NOT */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,   /* OP_LEN */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgR << 2 | iABC,   /* OP_CONCAT */
    0 << 7 | 0 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,  /* OP_JMP */
    1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_EQ */
    1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_LT */
    1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,   /* OP_LE */
    1 << 7 | 0 << 6 | OpArgN << 4 | OpArgU << 2 | iABC,   /* OP_TEST */
    1 << 7 | 1 << 6 | OpArgR << 4 | OpArgU << 2 | iABC,   /* OP_TESTSET */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,   /* OP_CALL */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,   /* OP_TAILCALL */
    0 << 7 | 0 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,   /* OP_RETURN */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,  /* OP_FORLOOP */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,  /* OP_FORPREP */
    0 << 7 | 0 << 6 | OpArgN << 4 | OpArgU << 2 | iABC,   /* OP_TFORCALL */
    0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,  /* OP_TFORLOOP */
    0 << 7 | 0 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,   /* OP_SETLIST */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABx,   /* OP_CLOSURE */
    0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,   /* OP_VARARG */
    0 << 7 | 0 << 6 | OpArgU << 4 | OpArgU << 2 | iAx     /* OP_EXTRAARG */
];

const testAMode = function(m) {
    return luaP_opmodes[m] & (1 << 6);
};

const SIZE_C     = 9;
const SIZE_B     = 9;
const SIZE_Bx    = (SIZE_C + SIZE_B);
const SIZE_A     = 8;
const SIZE_Ax    = (SIZE_C + SIZE_B + SIZE_A);
const SIZE_OP    = 6;
const POS_OP     = 0;
const POS_A      = (POS_OP + SIZE_OP);
const POS_C      = (POS_A + SIZE_A);
const POS_B      = (POS_C + SIZE_C);
const POS_Bx     = POS_C;
const POS_Ax     = POS_A;
const MAXARG_Bx  = ((1 << SIZE_Bx) - 1);
const MAXARG_sBx = (MAXARG_Bx >> 1); /* 'sBx' is signed */
const MAXARG_Ax  = ((1<<SIZE_Ax)-1);
const MAXARG_A   = ((1 << SIZE_A) - 1);
const MAXARG_B   = ((1 << SIZE_B) - 1);
const MAXARG_C   = ((1 << SIZE_C) - 1);

const BITRK      = (1 << (SIZE_B - 1));

const ISK = function (x) {
    return x & BITRK;
};

const INDEXK = function (r) {
    return r & ~BITRK;
};

/* number of list items to accumulate before a SETLIST instruction */
const LFIELDS_PER_FLUSH = 50;

module.exports.OpCodes           = OpCodes;
module.exports.SIZE_C            = SIZE_C;
module.exports.SIZE_B            = SIZE_B;
module.exports.SIZE_Bx           = SIZE_Bx;
module.exports.SIZE_A            = SIZE_A;
module.exports.SIZE_Ax           = SIZE_Ax;
module.exports.SIZE_OP           = SIZE_OP;
module.exports.POS_OP            = POS_OP;
module.exports.POS_A             = POS_A;
module.exports.POS_C             = POS_C;
module.exports.POS_B             = POS_B;
module.exports.POS_Bx            = POS_Bx;
module.exports.POS_Ax            = POS_Ax;
module.exports.MAXARG_Bx         = MAXARG_Bx;
module.exports.MAXARG_sBx        = MAXARG_sBx;
module.exports.MAXARG_Ax         = MAXARG_Ax;
module.exports.MAXARG_A          = MAXARG_A;
module.exports.MAXARG_B          = MAXARG_B;
module.exports.MAXARG_C          = MAXARG_C;
module.exports.BITRK             = BITRK;
module.exports.ISK               = ISK;
module.exports.INDEXK            = INDEXK;
module.exports.LFIELDS_PER_FLUSH = LFIELDS_PER_FLUSH;
module.exports.testAMode         = testAMode;