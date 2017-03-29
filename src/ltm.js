/*jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lobject = require('./lobject.js');
const TValue  = lobject.TValue;
const Table   = lobject.Table;
const ldo     = require('./ldo.js');
const lstate  = require('./lstate.js');
const lua     = require('./lua.js');
const ldebug  = require('./ldebug.js');
const lvm     = require('./lvm.js');
const CT      = lua.constant_types;


const TMS = {
    TM_INDEX:    lua.to_luastring("__index"),
    TM_NEWINDEX: lua.to_luastring("__newindex"),
    TM_GC:       lua.to_luastring("__gc"),
    TM_MODE:     lua.to_luastring("__mode"),
    TM_LEN:      lua.to_luastring("__len"),
    TM_EQ:       lua.to_luastring("__eq"),  /* last tag method with fast access */
    TM_ADD:      lua.to_luastring("__add"),
    TM_SUB:      lua.to_luastring("__sub"),
    TM_MUL:      lua.to_luastring("__mul"),
    TM_MOD:      lua.to_luastring("__mod"),
    TM_POW:      lua.to_luastring("__pow"),
    TM_DIV:      lua.to_luastring("__div"),
    TM_IDIV:     lua.to_luastring("__idiv"),
    TM_BAND:     lua.to_luastring("__band"),
    TM_BOR:      lua.to_luastring("__bor"),
    TM_BXOR:     lua.to_luastring("__bxor"),
    TM_SHL:      lua.to_luastring("__shl"),
    TM_SHR:      lua.to_luastring("__shr"),
    TM_UNM:      lua.to_luastring("__unm"),
    TM_BNOT:     lua.to_luastring("__bnot"),
    TM_LT:       lua.to_luastring("__lt"),
    TM_LE:       lua.to_luastring("__le"),
    TM_CONCAT:   lua.to_luastring("__concat"),
    TM_CALL:     lua.to_luastring("__call")
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
];

const ttypename = function(t) {
    return luaT_typenames_[t + 1];
};

const luaT_init = function(L) {
    L.l_G.tmname = [];
    for (let event in TMS)
        L.l_G.tmname.push(L.l_G.intern(TMS[event]));
};

/*
** Return the name of the type of an object. For tables and userdata
** with metatable, use their '__name' metafield, if present.
*/
const luaT_objtypename = function(L, o) {
    if ((o.ttistable() && o.metatable !== null) || (o.ttisfulluserdata() && o.metatable !== null)) {
        let name = o.__index(o, lua.to_luastring('__name'));
        if (name.ttisstring())
            return name.jsstring();
    }

    return ttypename(o.ttnov());
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
                    ldebug.luaG_opinterror(L, p1, p2, lua.to_luastring("perform bitwise operation on"));
            }
            default:
                ldebug.luaG_opinterror(L, p1, p2, lua.to_luastring("perform arithmetic on"));
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
        case CT.LUA_TTUSERDATA:
            mt = o.metatable;
            break;
        default:
            mt = L.l_G.mt[o.ttnov()];
    }

    return mt ? mt.__index(mt, event) : lobject.luaO_nilobject;
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
