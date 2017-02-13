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