/*jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const defs    = require('./defs.js');
const lobject = require('./lobject.js');
const ldo     = require('./ldo.js');
const lstate  = require('./lstate.js');
const lstring = require('./lstring.js');
const ltable  = require('./ltable.js');
const ldebug  = require('./ldebug.js');
const lvm     = require('./lvm.js');
const CT      = defs.constant_types;


const TMS = {
    TM_INDEX:    defs.to_luastring("__index", true),
    TM_NEWINDEX: defs.to_luastring("__newindex", true),
    TM_GC:       defs.to_luastring("__gc", true),
    TM_MODE:     defs.to_luastring("__mode", true),
    TM_LEN:      defs.to_luastring("__len", true),
    TM_EQ:       defs.to_luastring("__eq", true),  /* last tag method with fast access */
    TM_ADD:      defs.to_luastring("__add", true),
    TM_SUB:      defs.to_luastring("__sub", true),
    TM_MUL:      defs.to_luastring("__mul", true),
    TM_MOD:      defs.to_luastring("__mod", true),
    TM_POW:      defs.to_luastring("__pow", true),
    TM_DIV:      defs.to_luastring("__div", true),
    TM_IDIV:     defs.to_luastring("__idiv", true),
    TM_BAND:     defs.to_luastring("__band", true),
    TM_BOR:      defs.to_luastring("__bor", true),
    TM_BXOR:     defs.to_luastring("__bxor", true),
    TM_SHL:      defs.to_luastring("__shl", true),
    TM_SHR:      defs.to_luastring("__shr", true),
    TM_UNM:      defs.to_luastring("__unm", true),
    TM_BNOT:     defs.to_luastring("__bnot", true),
    TM_LT:       defs.to_luastring("__lt", true),
    TM_LE:       defs.to_luastring("__le", true),
    TM_CONCAT:   defs.to_luastring("__concat", true),
    TM_CALL:     defs.to_luastring("__call", true)
};

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

const luaT_init = function(L) {
    L.l_G.tmname = [];
    for (let event in TMS)
        L.l_G.tmname.push(new lobject.TValue(CT.LUA_TLNGSTR, lstring.luaS_new(L, TMS[event])));
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
            return name.value;
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

    return mt ? ltable.luaH_getstr(mt, event) : lobject.luaO_nilobject;
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
