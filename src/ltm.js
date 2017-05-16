/*jshint esversion: 6 */
"use strict";

const defs    = require('./defs.js');

if (defs.LUA_USE_ASSERT) var assert  = require('assert');

const lobject = require('./lobject.js');
const ldo     = require('./ldo.js');
const lstate  = require('./lstate.js');
const lstring = require('./lstring.js');
const ltable  = require('./ltable.js');
const ldebug  = require('./ldebug.js');
const lvm     = require('./lvm.js');
const CT      = defs.constant_types;

const luaT_typenames_ = [
    "no value",
    "nil",
    "boolean",
    "userdata",
    "number",
    "string",
    "table",
    "function",
    "userdata",
    "thread",
    "proto" /* this last case is used for tests only */
].map(e => defs.to_luastring(e));

const ttypename = function(t) {
    return luaT_typenames_[t + 1];
};


/*
* WARNING: if you change the order of this enumeration,
* grep "ORDER TM" and "ORDER OP"
*/
const TMS = {
    TM_INDEX:    0,
    TM_NEWINDEX: 1,
    TM_GC:       2,
    TM_MODE:     3,
    TM_LEN:      4,
    TM_EQ:       5,  /* last tag method with fast access */
    TM_ADD:      6,
    TM_SUB:      7,
    TM_MUL:      8,
    TM_MOD:      9,
    TM_POW:     10,
    TM_DIV:     11,
    TM_IDIV:    12,
    TM_BAND:    13 ,
    TM_BOR:     14,
    TM_BXOR:    15,
    TM_SHL:     16,
    TM_SHR:     17,
    TM_UNM:     18,
    TM_BNOT:    19,
    TM_LT:      20,
    TM_LE:      21,
    TM_CONCAT:  22,
    TM_CALL:    23,
    TM_N:       24  /* number of elements in the enum */
};

const luaT_init = function(L) {
    L.l_G.tmname[TMS.TM_INDEX]    = new lstring.luaS_new(L, defs.to_luastring("__index", true));
    L.l_G.tmname[TMS.TM_NEWINDEX] = new lstring.luaS_new(L, defs.to_luastring("__newindex", true));
    L.l_G.tmname[TMS.TM_GC]       = new lstring.luaS_new(L, defs.to_luastring("__gc", true));
    L.l_G.tmname[TMS.TM_MODE]     = new lstring.luaS_new(L, defs.to_luastring("__mode", true));
    L.l_G.tmname[TMS.TM_LEN]      = new lstring.luaS_new(L, defs.to_luastring("__len", true));
    L.l_G.tmname[TMS.TM_EQ]       = new lstring.luaS_new(L, defs.to_luastring("__eq", true));
    L.l_G.tmname[TMS.TM_ADD]      = new lstring.luaS_new(L, defs.to_luastring("__add", true));
    L.l_G.tmname[TMS.TM_SUB]      = new lstring.luaS_new(L, defs.to_luastring("__sub", true));
    L.l_G.tmname[TMS.TM_MUL]      = new lstring.luaS_new(L, defs.to_luastring("__mul", true));
    L.l_G.tmname[TMS.TM_MOD]      = new lstring.luaS_new(L, defs.to_luastring("__mod", true));
    L.l_G.tmname[TMS.TM_POW]      = new lstring.luaS_new(L, defs.to_luastring("__pow", true));
    L.l_G.tmname[TMS.TM_DIV]      = new lstring.luaS_new(L, defs.to_luastring("__div", true));
    L.l_G.tmname[TMS.TM_IDIV]     = new lstring.luaS_new(L, defs.to_luastring("__idiv", true));
    L.l_G.tmname[TMS.TM_BAND]     = new lstring.luaS_new(L, defs.to_luastring("__band", true));
    L.l_G.tmname[TMS.TM_BOR]      = new lstring.luaS_new(L, defs.to_luastring("__bor", true));
    L.l_G.tmname[TMS.TM_BXOR]     = new lstring.luaS_new(L, defs.to_luastring("__bxor", true));
    L.l_G.tmname[TMS.TM_SHL]      = new lstring.luaS_new(L, defs.to_luastring("__shl", true));
    L.l_G.tmname[TMS.TM_SHR]      = new lstring.luaS_new(L, defs.to_luastring("__shr", true));
    L.l_G.tmname[TMS.TM_UNM]      = new lstring.luaS_new(L, defs.to_luastring("__unm", true));
    L.l_G.tmname[TMS.TM_BNOT]     = new lstring.luaS_new(L, defs.to_luastring("__bnot", true));
    L.l_G.tmname[TMS.TM_LT]       = new lstring.luaS_new(L, defs.to_luastring("__lt", true));
    L.l_G.tmname[TMS.TM_LE]       = new lstring.luaS_new(L, defs.to_luastring("__le", true));
    L.l_G.tmname[TMS.TM_CONCAT]   = new lstring.luaS_new(L, defs.to_luastring("__concat", true));
    L.l_G.tmname[TMS.TM_CALL]     = new lstring.luaS_new(L, defs.to_luastring("__call", true));
};

/*
** Return the name of the type of an object. For tables and userdata
** with metatable, use their '__name' metafield, if present.
*/
const luaT_objtypename = function(L, o) {
    let mt;
    if ((o.ttistable() && (mt = o.value.metatable) !== null) ||
        (o.ttisfulluserdata() && (mt = o.value.metatable) !== null)) {
        let name = ltable.luaH_getstr(mt, defs.to_luastring('__name', true));
        if (name.ttisstring())
            return name.svalue();
    }
    return ttypename(o.ttnov());
};

const luaT_callTM = function(L, f, p1, p2, p3, hasres) {
    let result = p3;
    let func = L.top;

    L.stack[L.top] = new lobject.TValue(f.type, f.value); /* push function (assume EXTRA_STACK) */
    L.stack[L.top + 1] = new lobject.TValue(p1.type, p1.value); /* 1st argument */
    L.stack[L.top + 2] = new lobject.TValue(p2.type, p2.value); /* 2nd argument */
    L.top += 3;

    if (!hasres)  /* no result? 'p3' is third argument */
        L.stack[L.top++] = new lobject.TValue(p3.type, p3.value);  /* 3rd argument */

    if (L.ci.callstatus & lstate.CIST_LUA)
        ldo.luaD_call(L, func, hasres);
    else
        ldo.luaD_callnoyield(L, func, hasres);

    if (hasres) {
        if (defs.LUA_USE_ASSERT) assert(typeof result === "number");
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
        switch (event) {
            case TMS.TM_CONCAT:
                ldebug.luaG_concaterror(L, p1, p2);
            case TMS.TM_BAND: case TMS.TM_BOR: case TMS.TM_BXOR:
            case TMS.TM_SHL: case TMS.TM_SHR: case TMS.TM_BNOT: {
                let n1 = lvm.tonumber(p1);
                let n2 = lvm.tonumber(p2);
                if (n1 !== false && n2 !== false)
                    ldebug.luaG_tointerror(L, p1, p2);
                else
                    ldebug.luaG_opinterror(L, p1, p2, defs.to_luastring("perform bitwise operation on", true));
            }
            default:
                ldebug.luaG_opinterror(L, p1, p2, defs.to_luastring("perform arithmetic on", true));
        }
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
        case CT.LUA_TUSERDATA:
            mt = o.value.metatable;
            break;
        default:
            mt = L.l_G.mt[o.ttnov()];
    }

    return mt ? ltable.luaH_getstr(mt, L.l_G.tmname[event]) : lobject.luaO_nilobject;
};

module.exports.TMS              = TMS;
module.exports.luaT_callTM      = luaT_callTM;
module.exports.luaT_callbinTM   = luaT_callbinTM;
module.exports.luaT_trybinTM    = luaT_trybinTM;
module.exports.luaT_callorderTM = luaT_callorderTM;
module.exports.luaT_gettmbyobj  = luaT_gettmbyobj;
module.exports.luaT_init        = luaT_init;
module.exports.luaT_objtypename = luaT_objtypename;
module.exports.ttypename        = ttypename;
