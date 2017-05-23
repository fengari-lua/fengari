"use strict";

global.WEB = false;

const lua     = require('../../src/lua.js');
const lauxlib = require('../../src/lauxlib.js');
const ljstype = require('../../src/ljstype.js');

const delimits = [" ", "\t", "\n", ",", ";"].map(e => e.charCodeAt(0));

const skip = function(pc) {
    for (;;) {
        if (pc.script[pc.offset] !== 0 && pc.offset < pc.script.length && delimits.indexOf(pc.script[pc.offset]) >= 0)
            pc.offset++;
        else if (pc.script[pc.offset] === '#'.charCodeAt(0)) {
            while (pc.script[pc.offset] !== '\n'.charCodeAt(0) && pc.script[pc.offset] !== 0 && pc.offset < pc.script.length)
                pc.offset++;
        } else break;
    }
};

const getnum = function(L, L1, pc) {
    let res = 0;
    let sig = 1;
    skip(pc);
    if (pc.script[pc.offset] === '.'.charCodeAt(0)) {
        res = lua.lua_tointeger(L1, -1);
        lua.lua_pop(L1, 1);
        pc.offset++;
        return res;
    } else if (pc.script[pc.offset] === '*'.charCodeAt(0)) {
        res = lua.lua_gettop(L1);
        pc.offset++;
        return res;
    }
    else if (pc.script[pc.offset] === '-'.charCodeAt(0)) {
        sig = -1;
        pc.offset++;
    }
    if (!ljstype.lisdigit(pc.script[pc.offset]))
        lauxlib.luaL_error(L, lua.to_luastring("number expected (%s)"), pc.script);
    while (ljstype.lisdigit(pc.script[pc.offset])) res = res*10 + pc.script[pc.offset++] - '0'.charCodeAt(0);
    return sig*res;
};

const getstring = function(L, buff, pc) {
    let i = 0;
    skip(pc);
    if (pc.script[pc.offset] === '"'.charCodeAt(0) || pc.script[pc.offset] === '\''.charCodeAt(0)) {  /* quoted string? */
        let quote = pc.script[pc.offset++];
        while (pc.script[pc.offset] !== quote) {
            if (pc.script[pc.offset] === 0 || pc.offset >= pc.script.length)
                lauxlib.luaL_error(L, lua.to_luastring("unfinished string in JS script", true));
            buff[i++] = pc.script[pc.offset++];
        }
        pc.offset++;
    } else {
        while (pc.script[pc.offset] !== 0 && pc.offset < pc.script.length && delimits.indexOf(pc.script[pc.offset]) < 0)
          buff[i++] = pc.script[pc.offset++];
    }
    buff.length = i;
    return buff;
};

const getindex = function(L, L1, pc) {
    skip(pc);
    switch (pc.script[pc.offset++]) {
        case 'R'.charCodeAt(0): return lua.LUA_REGISTRYINDEX;
        case 'G'.charCodeAt(0): return lauxlib.luaL_error(L, lua.to_luastring("deprecated index 'G'", true));
        case 'U'.charCodeAt(0): return lua.lua_upvalueindex(getnum(L, L1, pc));
        default: pc.offset--; return getnum(L, L1, pc);
    }
};

const codes = ["OK", "YIELD", "ERRRUN", "ERRSYNTAX", "ERRMEM", "ERRGCMM", "ERRERR"].map(e => lua.to_luastring(e));

const pushcode = function(L, code) {
    lua.lua_pushstring(L, codes[code]);
};

const printstack = function(L) {
    let n = lua.lua_gettop(L);
    for (let i = 1; i <= n; i++) {
        console.log("${i}: %{lua.to_jsstring(lauxlib.luaL_tolstring(L, i, null))}\n");
        lua.lua_pop(L, 1);
    }
    console.log("");
};

/*
** arithmetic operation encoding for 'arith' instruction
** LUA_OPIDIV  -> \
** LUA_OPSHL   -> <
** LUA_OPSHR   -> >
** LUA_OPUNM   -> _
** LUA_OPBNOT  -> !
*/
const ops = "+-*%^/\\&|~<>_!".split('').map(e => e.charCodeAt(0));

const runJS = function(L, L1, pc) {
    let buff = [];
    let status = 0;  
    if (!pc || pc.length === 0) return lauxlib.luaL_error(L, "attempt to runJS empty script");
    for (;;) {
        let inst = lua.to_jsstring(getstring(L, buff, pc));
        if (inst.length === 0) return 0;
        else if (inst === "absindex") {
            lua.lua_pushnumber(1, lua.lua_absindex(1, getindex(L, L1, pc)));
        } else if (inst === "append") {
            let t = getindex(L, L1, pc);
            let i = lua.lua_rawlen(1, t);
            lua.lua_rawseti(1, t, i + 1);
        } else if (inst === "arith") {
            let op;
            skip(pc);
            op = ops.indexOf(pc[0]);
            lua.lua_arith(1, op);
        } else if (inst === "call") {
            let narg = getnum(L, L1, pc);
            let nres = getnum(L, L1, pc);
            lua.lua_call(1, narg, nres);
        } else if (inst === "callk") {
            let narg = getnum(L, L1, pc);
            let nres = getnum(L, L1, pc);
            let i = getindex(L, L1, pc);
            lua.lua_callk(1, narg, nres, i, Cfunck);
        } else if (inst === "checkstack") {
            let sz = getnum(L, L1, pc);
            let msg = getstring(L, buff, pc);
            if (msg.length === 0)
                msg = null;  /* to test 'luaL_checkstack' with no message */
            lauxlib.luaL_checkstack(1, sz, msg);
        } else if (inst === "compare") {
            let opt = getstring(L, buff, pc);  /* EQ, LT, or LE */
            let op = (opt[0] === 'E'.charCodeAt(0)) ? lua.LUA_OPEQ
                                                    : (opt[1] === 'T'.charCodeAt(0)) ? lua.LUA_OPLT : lua.LUA_OPLE;
            let a = getindex(L, L1, pc);
            let b = getindex(L, L1, pc);
            lua.lua_pushboolean(1, lua.lua_compare(1, a, b, op));
        } else if (inst === "concat") {
            lua.lua_concat(1, getnum(L, L1, pc));
        } else if (inst === "copy") {
            let f = getindex(L, L1, pc);
            lua.lua_copy(1, f, getindex(L, L1, pc));
        } else if (inst === "func2num") {
            let func = lua.lua_tocfunction(1, getindex(L, L1, pc));
            lua.lua_pushnumber(1, NaN); // TOODO
        } else if (inst === "getfield") {
            let t = getindex(L, L1, pc);
            lua.lua_getfield(1, t, getstring(L, buff, pc));
        } else if (inst === "getglobal") {
            lua.lua_getglobal(1, getstring(L, buff, pc));
        } else if (inst === "getmetatable") {
            if (lua.lua_getmetatable(1, getindex(L, L1, pc)) === 0)
                lua.lua_pushnil(1);
        } else if (inst === "gettable") {
            lua.lua_gettable(1, getindex(L, L1, pc));
        } else if (inst === "gettop") {
            lua.lua_pushinteger(1, lua.lua_gettop(1));
        } else if (inst === "gsub") {
            let a = getnum(L, L1, pc);
            let b = getnum(L, L1, pc);
            let c = getnum(L, L1, pc);
            lauxlib.luaL_gsub(1, lua.lua_tostring(1, a), lua.lua_tostring(1, b), lua.lua_tostring(1, c));
        } else if (inst === "insert") {
            lua.lua_insert(1, getnum(L, L1, pc));
        } else if (inst === "iscfunction") {
            lua.lua_pushboolean(1, lua.lua_iscfunction(1, getindex(L, L1, pc)));
        } else if (inst === "isfunction") {
            lua.lua_pushboolean(1, lua.lua_isfunction(1, getindex(L, L1, pc)));
        } else if (inst === "isnil") {
            lua.lua_pushboolean(1, lua.lua_isnil(1, getindex(L, L1, pc)));
        } else if (inst === "isnull") {
            lua.lua_pushboolean(1, lua.lua_isnone(1, getindex(L, L1, pc)));
        } else if (inst === "isnumber") {
            lua.lua_pushboolean(1, lua.lua_isnumber(1, getindex(L, L1, pc)));
        } else if (inst === "isstring") {
            lua.lua_pushboolean(1, lua.lua_isstring(1, getindex(L, L1, pc)));
        } else if (inst === "istable") {
            lua.lua_pushboolean(1, lua.lua_istable(1, getindex(L, L1, pc)));
        } else if (inst === "isudataval") {
            lua.lua_pushboolean(1, lua.lua_islightuserdata(1, getindex(L, L1, pc)));
        } else if (inst === "isuserdata") {
            lua.lua_pushboolean(1, lua.lua_isuserdata(1, getindex(L, L1, pc)));
        } else if (inst === "len") {
            lua.lua_len(1, getindex(L, L1, pc));
        } else if (inst === "Llen") {
            lua.lua_pushinteger(1, lauxlib.luaL_len(1, getindex(L, L1, pc)));
        } else if (inst === "loadfile") {
          lauxlib.luaL_loadfile(1, lauxlib.luaL_checkstring(1, getnum(L, L1, pc)));
        } else if (inst === "loadstring") {
          let s = lauxlib.luaL_checkstring(1, getnum(L, L1, pc));
          lauxlib.luaL_loadstring(1, s);
        } else if (inst === "newmetatable") {
            lua.lua_pushboolean(1, lauxlib.luaL_newmetatable(1, getstring(L, buff, pc)));
        } else if (inst === "newtable") {
            lua.lua_newtable(1);
        } else if (inst === "newthread") {
            lua.lua_newthread(1);
        } else if (inst === "newuserdata") {
            lua.lua_newuserdata(L1, getnum(L, L1, pc));
        } else if (inst === "next") {
            lua.lua_next(L1, -2);
        } else if (inst === "objsize") {
            lua.lua_pushinteger(L1, lua.lua_rawlen(L1, getindex(L, L1, pc)));
        } else if (inst === "pcall") {
            let narg = getnum(L, L1, pc);
            let nres = getnum(L, L1, pc);
            status = lua.lua_pcall(L1, narg, nres, getnum(L, L1, pc));
        } else if (inst === "pcallk") {
            let narg = getnum(L, L1, pc);
            let nres = getnum(L, L1, pc);
            let i = getindex(L, L1, pc);
            status = lua.lua_pcallk(L1, narg, nres, 0, i, Cfunck);
        } else if (inst === "pop") {
            lua.lua_pop(L1, getnum(L, L1, pc));
        } else if (inst === "print") {
            let n = getnum(L, L1, pc);
            if (n !== 0) {
                console.log(`${lauxlib.luaL_tojsstring(L1, n, null)}\n`);
                lua.lua_pop(L1, 1);
            }
            else printstack(L1);
        } else if (inst === "pushbool") {
            lua.lua_pushboolean(L1, getnum(L, L1, pc));
        } else if (inst === "pushcclosure") {
            lua.lua_pushcclosure(L1, testC, getnum(L, L1, pc));
        } else if (inst === "pushint") {
            lua.lua_pushinteger(L1, getnum(L, L1, pc));
        } else if (inst === "pushnil") {
            lua.lua_pushnil(L1);
        } else if (inst === "pushnum") {
            lua.lua_pushnumber(L1, getnum(L, L1, pc));
        } else if (inst === "pushstatus") {
          pushcode(L1, status);
        } else if (inst === "pushstring") {
            lua.lua_pushstring(L1, getstring(L, buff, pc));
        } else if (inst === "pushupvalueindex") {
            lua.lua_pushinteger(L1, lua.lua_upvalueindex(getnum(L, L1, pc)));
        } else if (inst === "pushvalue") {
            lua.lua_pushvalue(L1, getindex(L, L1, pc));
        } else if (inst === "rawgeti") {
          let t = getindex(L, L1, pc);
            lua.lua_rawgeti(L1, t, getnum(L, L1, pc));
        } else if (inst === "rawgetp") {
          let t = getindex(L, L1, pc);
            lua.lua_rawgetp(L1, t, getnum(L, L1, pc));
        } else if (inst === "rawsetp") {
          let t = getindex(L, L1, pc);
            lua.lua_rawsetp(L1, t, getnum(L, L1, pc));
        } else if (inst === "remove") {
            lua.lua_remove(L1, getnum(L, L1, pc));
        } else if (inst === "replace") {
            lua.lua_replace(L1, getindex(L, L1, pc));
        } else if (inst === "resume") {
            let i = getindex(L, L1, pc);
            status = lua.lua_resume(lua.lua_tothread(L1, i), L, getnum(L, L1, pc));
        } else if (inst === "return") {
            let n = getnum(L, L1, pc);
            if (L1 != L) {
                let i;
                for (i = 0; i < n; i++)
                  lua.lua_pushstring(L, lua.lua_tostring(L1, -(n - i)));
            }
            return n;
        } else if (inst === "rotate") {
            let i = getindex(L, L1, pc);
            lua.lua_rotate(L1, i, getnum(L, L1, pc));
        } else if (inst === "setfield") {
            let t = getindex(L, L1, pc);
            lua.lua_setfield(L1, t, getstring(L, buff, pc));
        } else if (inst === "setglobal") {
            lua.lua_setglobal(L1, getstring(L, buff, pc));
        } else if (inst === "sethook") {
            let mask = getnum(L, L1, pc);
            let count = getnum(L, L1, pc);
            sethookaux(L1, mask, count, getstring(L, buff, pc));
        } else if (inst === "setmetatable") {
            lua.lua_setmetatable(L1, getindex(L, L1, pc));
        } else if (inst === "settable") {
            lua.lua_settable(L1, getindex(L, L1, pc));
        } else if (inst === "settop") {
            lua.lua_settop(L1, getnum(L, L1, pc));
        } else if (inst === "testudata") {
          let i = getindex(L, L1, pc);
            lua.lua_pushboolean(L1, lauxlib.luaL_testudata(L1, i, getstring(L, buff, pc)) !== null);
        } else if (inst === "error") {
            lua.lua_error(L1);
        } else if (inst === "throw") {
            throw new Error();
        } else if (inst === "tobool") {
            lua.lua_pushboolean(L1, lua.lua_toboolean(L1, getindex(L, L1, pc)));
        } else if (inst === "tocfunction") {
            lua.lua_pushcfunction(L1, lua.lua_tocfunction(L1, getindex(L, L1, pc)));
        } else if (inst === "tointeger") {
            lua.lua_pushinteger(L1, lua.lua_tointeger(L1, getindex(L, L1, pc)));
        } else if (inst === "tonumber") {
            lua.lua_pushnumber(L1, lua.lua_tonumber(L1, getindex(L, L1, pc)));
        } else if (inst === "topointer") {
            lua.lua_pushnumber(L1, lua.lua_topointer(L1, getindex(L, L1, pc)));
        } else if (inst === "tostring") {
            let s = lua.lua_tostring(L1, getindex(L, L1, pc));
            let s1 = lua.lua_pushstring(L1, s);
            lua.lua_longassert((s === null && s1 === null) || s.join('|') === s1.join('|'));
        } else if (inst === "type") {
            lua.lua_pushstring(L1, lauxlib.luaL_typename(L1, getnum(L, L1, pc)));
        } else if (inst === "xmove") {
            let f = getindex(L, L1, pc);
            let t = getindex(L, L1, pc);
            let fs = (f === 0) ? L1 : lua.lua_tothread(L1, f);
            let ts = (t === 0) ? L1 : lua.lua_tothread(L1, t);
            let n = getnum(L, L1, pc);
            if (n === 0) n = lua.lua_gettop(fs);
            lua.lua_xmove(fs, ts, n);
        } else if (inst === "yield") {
            return lua.lua_yield(L1, getnum(L, L1, pc));
        } else if (inst === "yieldk") {
            let nres = getnum(L, L1, pc);
            let i = getindex(L, L1, pc);
            return lua.lua_yieldk(L1, nres, i, Cfunck);
        } else lauxlib.luaL_error(L, lua.to_luastring("unknown instruction %s"), buff);
      }
      return 0;
};

const tpanic = function(L) {
    console.error(`PANIC: unprotected error in call to Lua API (${lua.lua_tojsstring(L, -1)})\n`);
    return process.exit(1);  /* do not return to Lua */
};

const newuserdata = function(L) {
    lua.lua_newuserdata(L, lauxlib.luaL_checkinteger(L, 1));
    return 1;
};

/*
** C hook that runs the C script stored in registry.C_HOOK[L]
*/
const Chook = function(L, ar) {
    let scpt;
    let events = ["call", "ret", "line", "count", "tailcall"].map(e => lua.to_luastring(e));
    lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring("JS_HOOK", true));
    lua.lua_pushlightuserdata(L, L);
    lua.lua_gettable(L, -2);  /* get C_HOOK[L] (script saved by sethookaux) */
    scpt = lua.lua_tostring(L, -1);  /* not very religious (string will be popped) */
    lua.lua_pop(L, 2);  /* remove C_HOOK and script */
    lua.lua_pushstring(L, events[ar.event]);  /* may be used by script */
    lua.lua_pushinteger(L, ar.currentline);  /* may be used by script */
    runJS(L, L, { script: scpt, offset: 0 });  /* run script from C_HOOK[L] */
};


/*
** sets 'registry.C_HOOK[L] = scpt' and sets 'Chook' as a hook
*/
const sethookaux = function(L, mask, count, scpt) {
    if (scpt.length <= 0) {  /* no script? */
        lua.lua_sethook(L, null, 0, 0);  /* turn off hooks */
        return;
    }
    lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring("JS_HOOK", true));  /* get C_HOOK table */
    if (!lua.lua_istable(L, -1)) {  /* no hook table? */
        lua.lua_pop(L, 1);  /* remove previous value */
        lua.lua_newtable(L);  /* create new C_HOOK table */
        lua.lua_pushvalue(L, -1);
        lua.lua_setfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring("JS_HOOK", true));  /* register it */
    }
    lua.lua_pushlightuserdata(L, L);
    lua.lua_pushstring(L, scpt);
    lua.lua_settable(L, -3);  /* C_HOOK[L] = script */
    lua.lua_sethook(L, Chook, mask, count);
};

const sethook = function(L) {
    if (lua.lua_isnoneornil(L, 1))
        lua.lua_sethook(L, null, 0, 0);  /* turn off hooks */
    else {
        const scpt = lauxlib.luaL_checkstring(L, 1);
        const smask = lauxlib.luaL_checkstring(L, 2);
        let count = lauxlib.luaL_optinteger(L, 3, 0);
        let mask = 0;
        if (smask.indexOf('c'.charCodeAt(0)) >= 0) mask |= lua.LUA_MASKCALL;
        if (smask.indexOf('r'.charCodeAt(0)) >= 0) mask |= lua.LUA_MASKRET;
        if (smask.indexOf('l'.charCodeAt(0)) >= 0) mask |= lua.LUA_MASKLINE;
        if (count > 0) mask |= lua.LUA_MASKCOUNT;
        sethookaux(L, mask, count, scpt);
    }
    return 0;
};

const Cfunck = function(L, status, ctx) {
    pushcode(L, status);
    lua.lua_setglobal(L, "status");
    lua.lua_pushinteger(L, ctx);
    lua.lua_setglobal(L, "ctx");
    return runJS(L, L, lua.lua_tostring(L, ctx));
};

const coresume = function(L) {
    let status;
    let co = lua.lua_tothread(L, 1);
    lauxlib.luaL_argcheck(L, co, 1, lua.to_luastring("coroutine expected", true));
    status = lua.lua_resume(co, L, 0);
    if (status != lua.LUA_OK && status !== lua.LUA_YIELD) {
        lua.lua_pushboolean(L, 0);
        lua.lua_insert(L, -2);
        return 2;  /* return false + error message */
    }
    else {
        lua.lua_pushboolean(L, 1);
        return 1;
    }
};

const tests_funcs = {
    "newuserdata": newuserdata,
    "resume": coresume,
    "sethook": sethook
};

const luaB_opentests = function(L) {
    lua.lua_atpanic(L, tpanic);
    lauxlib.luaL_newlib(L, tests_funcs);
    return 1;
};

const luaopen_tests = function(L) {
    lauxlib.luaL_requiref(L, lua.to_luastring("T"), luaB_opentests, 1);
    lua.lua_pop(L, 1); /* remove lib */
};

module.exports.luaopen_tests = luaopen_tests;
