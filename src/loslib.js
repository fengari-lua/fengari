"use strict";

const {
    LUA_TNIL,
    LUA_TTABLE,
    lua_close,
    lua_createtable,
    lua_getfield,
    lua_isboolean,
    lua_isnoneornil,
    lua_pop,
    lua_pushboolean,
    lua_pushfstring,
    lua_pushinteger,
    lua_pushliteral,
    lua_pushnil,
    lua_pushnumber,
    lua_pushstring,
    lua_setfield,
    lua_settop,
    lua_toboolean,
    lua_tointegerx
} = require('./lua.js');
const {
    luaL_Buffer,
    luaL_addchar,
    luaL_addstring,
    // luaL_argcheck,
    luaL_argerror,
    luaL_buffinit,
    luaL_checkinteger,
    luaL_checkstring,
    luaL_checktype,
    luaL_error,
    luaL_execresult,
    luaL_fileresult,
    luaL_newlib,
    luaL_opt,
    luaL_optinteger,
    luaL_optlstring,
    luaL_optstring,
    luaL_pushresult
} = require('./lauxlib.js');
const {
    luastring_eq,
    luastring_indexOf,
    to_jsstring,
    to_luastring
} = require("./fengaricore.js");

const strftime = require('strftime');

/* options for ANSI C 89 (only 1-char options) */
const L_STRFTIMEC89 = to_luastring("aAbBcdHIjmMpSUwWxXyYZ%");
const LUA_STRFTIMEOPTIONS = L_STRFTIMEC89;

/* options for ISO C 99 and POSIX */
// const L_STRFTIMEC99 = to_luastring("aAbBcCdDeFgGhHIjmMnprRStTuUVwWxXyYzZ%||EcECExEXEyEYOdOeOHOIOmOMOSOuOUOVOwOWOy");  /* two-char options */
// const LUA_STRFTIMEOPTIONS = L_STRFTIMEC99;

/* options for Windows */
// const L_STRFTIMEWIN = to_luastring("aAbBcdHIjmMpSUwWxXyYzZ%||#c#x#d#H#I#j#m#M#S#U#w#W#y#Y");  /* two-char options */
// const LUA_STRFTIMEOPTIONS = L_STRFTIMEWIN;


const setfield = function(L, key, value) {
    lua_pushinteger(L, value);
    lua_setfield(L, -2, to_luastring(key, true));
};

const setallfields = function(L, time, utc) {
    setfield(L, "sec",   utc ? time.getUTCSeconds()  : time.getSeconds());
    setfield(L, "min",   utc ? time.getUTCMinutes()  : time.getMinutes());
    setfield(L, "hour",  utc ? time.getUTCHours()    : time.getHours());
    setfield(L, "day",   utc ? time.getUTCDate()     : time.getDate());
    setfield(L, "month", (utc ? time.getUTCMonth()   : time.getMonth()) + 1);
    setfield(L, "year",  utc ? time.getUTCFullYear() : time.getFullYear());
    setfield(L, "wday",  (utc ? time.getUTCDay()     : time.getDay()) + 1);
    setfield(L, "yday", Math.floor((time - (new Date(time.getFullYear(), 0, 0 /* shortcut to correct day by one */))) / 86400000));
    // setboolfield(L, "isdst", time.get);
};

const L_MAXDATEFIELD = (Number.MAX_SAFE_INTEGER / 2);

const getfield = function(L, key, d, delta) {
    let t = lua_getfield(L, -1, to_luastring(key, true));  /* get field and its type */
    let res = lua_tointegerx(L, -1);
    if (res === false) {  /* field is not an integer? */
        if (t !== LUA_TNIL)  /* some other value? */
            return luaL_error(L, to_luastring("field '%s' is not an integer"), key);
        else if (d < 0)  /* absent field; no default? */
            return luaL_error(L, to_luastring("field '%s' missing in date table"), key);
        res = d;
    }
    else {
        if (!(-L_MAXDATEFIELD <= res && res <= L_MAXDATEFIELD))
            return luaL_error(L, to_luastring("field '%s' is out-of-bound"), key);
        res -= delta;
    }
    lua_pop(L, 1);
    return res;
};

const checkoption = function(L, conv, i, buff) {
    let option = LUA_STRFTIMEOPTIONS;
    let o = 0;
    let oplen = 1;  /* length of options being checked */
    for (; o < option.length && oplen <= (conv.length - i); o += oplen) {
        if (option[o] === '|'.charCodeAt(0))  /* next block? */
            oplen++;  /* will check options with next length (+1) */
        else if (luastring_eq(conv.subarray(i, i+oplen), option.subarray(o, o+oplen))) {  /* match? */
            buff.set(conv.subarray(i, i+oplen)); /* copy valid option to buffer */
            return i + oplen;  /* return next item */
        }
    }
    luaL_argerror(L, 1,
        lua_pushfstring(L, to_luastring("invalid conversion specifier '%%%s'"), conv));
};

/* maximum size for an individual 'strftime' item */
// const SIZETIMEFMT = 250;


const os_date = function(L) {
    let s = luaL_optlstring(L, 1, "%c");
    let t = luaL_opt(L, l_checktime, 2, new Date().getTime() / 1000) * 1000;
    let stm = new Date(t);
    let utc = false;
    let i = 0;
    if (s[i] === '!'.charCodeAt(0)) {  /* UTC? */
        utc = true;
        i++;  /* skip '!' */
    }
    if (s[i] === "*".charCodeAt(0) && s[i+1] === "t".charCodeAt(0)) {
        lua_createtable(L, 0, 9);  /* 9 = number of fields */
        setallfields(L, stm, utc);
    } else {
        let cc = new Uint8Array(4);
        cc[0] = "%".charCodeAt(0);
        let b = new luaL_Buffer();
        luaL_buffinit(L, b);
        while (i < s.length) {
            if (s[i] !== '%'.charCodeAt(0)) {  /* not a conversion specifier? */
                luaL_addchar(b, s[i++]);
            } else {
                i++;  /* skip '%' */
                i = checkoption(L, s, i, cc.subarray(1));  /* copy specifier to 'cc' */
                let len = luastring_indexOf(cc, 0);
                if (len !== -1)
                    cc = cc.subarray(0, len);
                let buff = strftime(to_jsstring(cc), stm);
                luaL_addstring(b, to_luastring(buff));
            }
        }
        luaL_pushresult(b);
    }
    return 1;
};

const os_time = function(L) {
    let t;
    if (lua_isnoneornil(L, 1))  /* called without args? */
        t = new Date();  /* get current time */
    else {
        luaL_checktype(L, 1, LUA_TTABLE);
        lua_settop(L, 1);  /* make sure table is at the top */
        t = new Date(
            getfield(L, "year", -1, 0),
            getfield(L, "month", -1, 1),
            getfield(L, "day", -1, 0),
            getfield(L, "hour", 12, 0),
            getfield(L, "min", 0, 0),
            getfield(L, "sec", 0, 0)
        );
        setallfields(L, t);
    }

    lua_pushinteger(L, Math.floor(t / 1000));
    return 1;
};

const l_checktime = function(L, arg) {
    let t = luaL_checkinteger(L, arg);
    // luaL_argcheck(L, t, arg, "time out-of-bounds");
    return t;
};

const os_difftime = function(L) {
    let t1 = l_checktime(L, 1);
    let t2 = l_checktime(L, 2);
    lua_pushnumber(L, t1 - t2);
    return 1;
};

const syslib = {
    "date": os_date,
    "difftime": os_difftime,
    "time": os_time
};

if (typeof process === "undefined") {
    syslib.clock = function(L) {
        lua_pushnumber(L, performance.now()/1000);
        return 1;
    };
} else {
    /* Only with Node */
    const fs = require('fs');
    const tmp = require('tmp');
    const child_process = require('child_process');

    syslib.exit = function(L) {
        let status;
        if (lua_isboolean(L, 1))
            status = (lua_toboolean(L, 1) ? 0 : 1);
        else
            status = luaL_optinteger(L, 1, 0);
        if (lua_toboolean(L, 2))
            lua_close(L);
        if (L) process.exit(status);  /* 'if' to avoid warnings for unreachable 'return' */
        return 0;
    };

    syslib.getenv = function(L) {
        let key = luaL_checkstring(L, 1);
        key = to_jsstring(key); /* https://github.com/nodejs/node/issues/16961 */
        if (Object.prototype.hasOwnProperty.call(process.env, key)) {
            lua_pushliteral(L, process.env[key]);
        } else {
            lua_pushnil(L);
        }
        return 1;
    };

    syslib.clock = function(L) {
        lua_pushnumber(L, process.uptime());
        return 1;
    };

    const lua_tmpname = function() {
        return tmp.tmpNameSync();
    };

    syslib.remove = function(L) {
        let filename = luaL_checkstring(L, 1);
        try {
            fs.unlinkSync(filename);
        } catch (e) {
            if (e.code === 'EISDIR') {
                try {
                    fs.rmdirSync(filename);
                } catch (e) {
                    return luaL_fileresult(L, false, filename, e);
                }
            } else {
                return luaL_fileresult(L, false, filename, e);
            }
        }
        return luaL_fileresult(L, true);
    };

    syslib.rename = function(L) {
        let fromname = luaL_checkstring(L, 1);
        let toname = luaL_checkstring(L, 2);
        try {
            fs.renameSync(fromname, toname);
        } catch (e) {
            return luaL_fileresult(L, false, false, e);
        }
        return luaL_fileresult(L, true);
    };

    syslib.tmpname = function(L) {
        let name = lua_tmpname();
        if (!name)
            return luaL_error(L, to_luastring("unable to generate a unique filename"));
        lua_pushstring(L, to_luastring(name));
        return 1;
    };

    syslib.execute = function(L) {
        let cmd = luaL_optstring(L, 1, null);
        if (cmd !== null) {
            try {
                child_process.execSync(
                    cmd,
                    {
                        stdio: [process.stdin, process.stdout, process.stderr]
                    }
                );
            } catch (e) {
                return luaL_execresult(L, e);
            }

            return luaL_execresult(L, null);
        } else {
            /* Assume a shell is available.
               If it's good enough for musl it's good enough for us.
               http://git.musl-libc.org/cgit/musl/tree/src/process/system.c?id=ac45692a53a1b8d2ede329d91652d43c1fb5dc8d#n22
            */
            lua_pushboolean(L, 1);
            return 1;
        }
    };
}

const luaopen_os = function(L) {
    luaL_newlib(L, syslib);
    return 1;
};

module.exports.luaopen_os = luaopen_os;
