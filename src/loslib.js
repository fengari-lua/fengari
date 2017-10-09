"use strict";

const lua      = require('./lua.js');
const lauxlib  = require('./lauxlib.js');

const strftime = require('strftime');

/* options for ANSI C 89 (only 1-char options) */
const L_STRFTIMEC89 = lua.to_luastring("aAbBcdHIjmMpSUwWxXyYZ%", true);

/* options for ISO C 99 and POSIX */
const L_STRFTIMEC99 = lua.to_luastring("aAbBcCdDeFgGhHIjmMnprRStTuUVwWxXyYzZ%||EcECExEXEyEYOdOeOHOIOmOMOSOuOUOVOwOWOy", true);  /* two-char options */

/* options for Windows */
const L_STRFTIMEWIN = lua.to_luastring("aAbBcdHIjmMpSUwWxXyYzZ%||#c#x#d#H#I#j#m#M#S#U#w#W#y#Y", true);  /* two-char options */

// const LUA_STRFTIMEOPTIONS = L_STRFTIMEWIN;
const LUA_STRFTIMEOPTIONS = L_STRFTIMEC89;
// const LUA_STRFTIMEOPTIONS = L_STRFTIMEC99;

const setfield = function(L, key, value) {
    lua.lua_pushinteger(L, value);
    lua.lua_setfield(L, -2, lua.to_luastring(key, true));
};

const setallfields = function(L, time, utc) {
    setfield(L, "sec",   !utc ? time.getSeconds()  : time.getUTCSeconds());
    setfield(L, "min",   !utc ? time.getMinutes()  : time.getUTCMinutes());
    setfield(L, "hour",  !utc ? time.getHours()    : time.getUTCHours());
    setfield(L, "day",   !utc ? time.getDate()     : time.getUTCDate());
    setfield(L, "month", !utc ? time.getMonth()    : time.getUTCMonth());
    setfield(L, "year",  !utc ? time.getFullYear() : time.getUTCFullYear());
    setfield(L, "wday",  !utc ? time.getDay()      : time.getUTCDay());
    let now = new Date();
    setfield(L, "yday", Math.floor((now - (new Date(now.getFullYear(), 0, 0))) / (1000 * 60 * 60 * 24)));
    // setboolfield(L, "isdst", time.get);
};

const L_MAXDATEFIELD = (Number.MAX_SAFE_INTEGER / 2);

const getfield = function(L, key, d, delta) {
    let t = lua.lua_getfield(L, -1, lua.to_luastring(key, true));  /* get field and its type */
    let res = lua.lua_tointegerx(L, -1);
    if (res === false) {  /* field is not an integer? */
        if (t !== lua.LUA_TNIL)  /* some other value? */
            return lauxlib.luaL_error(L, lua.to_luastring("field '%s' is not an integer"), key);
        else if (d < 0)  /* absent field; no default? */
            return lauxlib.luaL_error(L, lua.to_luastring("field '%s' missing in date table"), key);
        res = d;
    }
    else {
        if (!(-L_MAXDATEFIELD <= res && res <= L_MAXDATEFIELD))
            return lauxlib.luaL_error(L, lua.to_luastring("field '%s' is out-of-bound"), key);
        res -= delta;
    }
    lua.lua_pop(L, 1);
    return res;
};

const checkoption = function(L, conv, buff) {
    let option = LUA_STRFTIMEOPTIONS;
    let oplen = 1;  /* length of options being checked */
    for (; option.length > 0 && oplen <= conv.length; option = option.slice(oplen)) {
        if (option[0] === '|'.charCodeAt(0))  /* next block? */
            oplen++;  /* will check options with next length (+1) */
        else if (lua.to_jsstring(conv.slice(0, oplen)) === lua.to_jsstring(option.slice(0, oplen))) {  /* match? */
            buff.push(...conv.slice(0, oplen)); /* copy valid option to buffer */
            return conv.slice(oplen);  /* return next item */
        }
    }
    lauxlib.luaL_argerror(L, 1, lua.lua_pushliteral(L, `invalid conversion specifier '%${conv}'`, conv));
};

/* maximum size for an individual 'strftime' item */
const SIZETIMEFMT = 250;


const os_date = function(L) {
    let s = lauxlib.luaL_optlstring(L, 1, "%c");
    let t = lauxlib.luaL_opt(L, l_checktime, 2, new Date().getTime() / 1000) * 1000;
    let stm = new Date(t);
    let utc = false;
    if (s[0] === '!'.charCodeAt(0)) {  /* UTC? */
        utc = true;
        s = s.slice(1);  /* skip '!' */
    }

    if (stm === null)  /* invalid date? */
        lauxlib.luaL_error(L, lua.to_luastring("time result cannot be represented in this installation", true));

    if (lua.to_jsstring(s) === "*t") {
        lua.lua_createtable(L, 0, 9);  /* 9 = number of fields */
        setallfields(L, stm, utc);
    } else {
        let cc;  /* buffer for individual conversion specifiers */
        let b = [];
        while (s.length > 0) {
            cc = ['%'.charCodeAt(0)];

            if (s[0] !== '%'.charCodeAt(0)) {  /* not a conversion specifier? */
                b.push(s[0]);
                s = s.slice(1);
            } else {
                s = s.slice(1);  /* skip '%' */
                s = checkoption(L, s, cc);  /* copy specifier to 'cc' */
                b.push(...(lua.to_luastring(strftime(lua.to_jsstring(cc), stm))));
            }
        }
        lua.lua_pushstring(L, b);
    }
    return 1;
};

const os_time = function(L) {
    let t = new Date();
    if (!lua.lua_isnoneornil(L, 1))  /* called with arg */{
        lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);  /* make sure table is at the top */
        lua.lua_settop(L, 1);
        t.setSeconds(getfield(L, "sec", 0, 0));
        t.setMinutes(getfield(L, "min", 0, 0));
        t.setHours(getfield(L, "hour", 12, 0));
        t.setDate(getfield(L, "day", -1, 0));
        t.setMonth(getfield(L, "month", -1, 1));
        t.setFullYear(getfield(L, "year", -1, 0));
        setallfields(L, t);
    }

    lua.lua_pushinteger(L, Math.floor(t / 1000));
    return 1;
};

const l_checktime = function(L, arg) {
    let t = lauxlib.luaL_checkinteger(L, arg);
    // lauxlib.luaL_argcheck(L, t, arg, lua.to_luastring("time out-of-bounds"));
    return t;
};

const os_difftime = function(L) {
    let t1 = l_checktime(L, 1);
    let t2 = l_checktime(L, 2);
    lua.lua_pushnumber(L, new Date(t1) - new Date(t2));
    return 1;
};

const syslib = {
    "date": os_date,
    "difftime": os_difftime,
    "time": os_time
};

// Only with Node
if (!WEB) {
    const fs = require('fs');
    const tmp = require('tmp');
    const child_process = require('child_process');

    syslib.exit = function(L) {
        let status;
        if (lua.lua_isboolean(L, 1))
            status = (lua.lua_toboolean(L, 1) ? 0 : 1);
        else
            status = lauxlib.luaL_optinteger(L, 1, 0);
        if (lua.lua_toboolean(L, 2))
            lua.lua_close(L);
        if (L) process.exit(status);  /* 'if' to avoid warnings for unreachable 'return' */
        return 0;
    };

    syslib.getenv = function(L) {
        lua.lua_pushliteral(L, process.env[lua.to_jsstring(lauxlib.luaL_checkstring(L, 1))]);  /* if NULL push nil */
        return 1;
    };

    syslib.clock = function(L) {
        lua.lua_pushnumber(L, process.uptime());
        return 1;
    };

    // TODO: on POSIX system, should create the file
    const lua_tmpname = function() {
        return tmp.tmpNameSync();
    };

    syslib.remove = function(L) {
        let filename = lauxlib.luaL_checkstring(L, 1);
        try {
            if (fs.lstatSync(lua.to_jsstring(filename)).isDirectory()) {
                fs.rmdirSync(lua.to_jsstring(filename));
            } else {
                fs.unlinkSync(lua.to_jsstring(filename));
            }
        } catch (e) {
            return lauxlib.luaL_fileresult(L, false, filename, e);
        }
        return lauxlib.luaL_fileresult(L, true);
    };

    syslib.rename = function(L) {
        let fromname = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
        let toname = lua.to_jsstring(lauxlib.luaL_checkstring(L, 2));
        try {
            fs.renameSync(fromname, toname);
        } catch (e) {
            return lauxlib.luaL_fileresult(L, false, false, e);
        }
        return lauxlib.luaL_fileresult(L, true);
    };

    syslib.tmpname = function(L) {
        let name = lua_tmpname();
        if (!name)
            return lauxlib.luaL_error(L, lua.to_luastring("unable to generate a unique filename"));
        lua.lua_pushstring(L, lua.to_luastring(name));
        return 1;
    };

    syslib.execute = function(L) {
        let cmd = lauxlib.luaL_optstring(L, 1, null);
        if (cmd !== null) {
            try {
                child_process.execSync(
                    lua.to_jsstring(cmd),
                    {
                        stdio: [process.stdin, process.stdout, process.stderr]
                    }
                );
            } catch (e) {
                return lauxlib.luaL_execresult(L, e);
            }

            return lauxlib.luaL_execresult(L, null);
        } else {
            try {
                child_process.execSync(
                    lua.to_jsstring(cmd),
                    {
                        stdio: [process.stdin, process.stdout, process.stderr]
                    }
                );
                lua.lua_pushboolean(L, 1);
            } catch (e) {
                lua.lua_pushboolean(L, 0);
            }

            return 1;
        }
    };
}

const luaopen_os = function(L) {
    lauxlib.luaL_newlib(L, syslib);
    return 1;
};

module.exports.luaopen_os = luaopen_os;
