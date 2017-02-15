/*jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lobject = require('./lobject.js');
const TValue  = lobject.TValue;
const Table   = lobject.Table;
const ldo     = require('./ldo.js');
const lstate  = require('./lstate.js');
const lua     = require('./lua.js');
const CT      = lua.constant_types;


const TMS = {
    TM_INDEX:    "__index",
    TM_NEWINDEX: "__newindex",
    TM_GC:       "__gc",
    TM_MODE:     "__mode",
    TM_LEN:      "__len",
    TM_EQ:       "__eq",  /* last tag method with fast access */
    TM_ADD:      "__add",
    TM_SUB:      "__sub",
    TM_MUL:      "__mul",
    TM_MOD:      "__mod",
    TM_POW:      "__pow",
    TM_DIV:      "__div",
    TM_IDIV:     "__idiv",
    TM_BAND:     "__band",
    TM_BOR:      "__bor",
    TM_BXOR:     "__bxor",
    TM_SHL:      "__shl",
    TM_SHR:      "__shr",
    TM_UNM:      "__unm",
    TM_BNOT:     "__bnot",
    TM_LT:       "__lt",
    TM_LE:       "__le",
    TM_CONCAT:   "__concat",
    TM_CALL:     "__call",
    TM_N:        26
};

const luaT_callTM = function(L, f, p1, p2, p3, hasres) {
    let result = p3;
    let func = L.top;

    L.stack[L.top] = f;      /* push function (assume EXTRA_STACK) */
    L.stack[L.top + 1] = p1; /* 1st argument */
    L.stack[L.top + 2] = p2; /* 2nd argument */
    L.top += 3;

    if (!hasres)  /* no result? 'p3' is third argument */
        L.stack[L.top++] = p3;  /* 3rd argument */

    if (L.ci.callstatus & lstate.CIST_LUA)
        ldo.luaD_call(L, func, hasres);
    else
        ldo.luaD_callnoyield(L, func, hasres);

    if (hasres) {
        assert(typeof result === "number");
        L.stack[result] = L.stack[--L.top];
    }
};

const luaT_callbinTM = function(L, p1, p2, res, event) {
    let tm = luaT_gettmbyobj(L, p1, event);
    if (tm.ttisnil())
        tm = luaT_gettmbyobj(L, p2, event);
    if (tm.ttisnil()) return false;
    luaT_callTM(L, tm, p1, p2, res, 1);
    return true;
};

const luaT_trybinTM = function(L, p1, p2, res, event) {
    if (!luaT_callbinTM(L, p1, p2, res, event)) {
        throw new Error("TM error"); // TODO: luaG_error
    }
};

const luaT_callorderTM = function(L, p1, p2, event) {
    if (!luaT_callbinTM(L, p1, p2, L.top, event))
        return -1;
    else
        return !L.stack[L.top].l_isfalse() ? 1 : 0;
};

const luaT_gettmbyobj = function(L, o, event) {
    let mt;
    switch(o.ttnov()) {
        case CT.LUA_TTABLE:
        case CT.LUA_TTUSERDATA:
            mt = o.metatable;
            break;
        default:
            // TODO: mt = G(L)->mt[ttnov(o)];
    }

    return mt ? mt.__index(mt, event) : ldo.nil;
};

module.exports.TMS              = TMS;
module.exports.luaT_callTM      = luaT_callTM;
module.exports.luaT_callbinTM   = luaT_callbinTM;
module.exports.luaT_trybinTM    = luaT_trybinTM;
module.exports.luaT_callorderTM = luaT_callorderTM;
module.exports.luaT_gettmbyobj  = luaT_gettmbyobj;