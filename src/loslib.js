"use strict";

const lua     = require('./lua.js');
const lauxlib = require('./lauxlib.js');
const llimit  = require('./llimit.js');

const setfield = function(L, key, value) {
    lua.lua_pushinteger(L, value);
    lua.lua_setfield(L, -2, lua.to_luastring(key, true));
};

const setallfields = function(L, time) {
    setfield(L, "sec", time.getSeconds());
    setfield(L, "min", time.getMinutes());
    setfield(L, "hour", time.getHours());
    setfield(L, "day", time.getDate());
    setfield(L, "month", time.getMonth());
    setfield(L, "year", time.getFullYear());
    setfield(L, "wday", time.getDay());
    let now = new Date();
    setfield(L, "yday", Math.floor((now - (new Date(now.getFullYear(), 0, 0))) / (1000 * 60 * 60 * 24)));
    // setboolfield(L, "isdst", time.get);
};

const L_MAXDATEFIELD = (llimit.MAX_INT / 2);

const getfield = function(L, key, d, delta) {
    let t = lua.lua_getfield(L, -1, lua.to_luastring(key, true));  /* get field and its type */
    let res = lua.lua_tointegerx(L, -1);
    if (res === false) {  /* field is not an integer? */
        if (t !== lua.LUA_TNIL)  /* some other value? */
            return lauxlib.luaL_error(L, lua.to_luastring(`field '${key}' is not an integer`), true);
        else if (d < 0)  /* absent field; no default? */
            return lauxlib.luaL_error(L, lua.to_luastring(`field '${key}' missing in date table`), true);
        res = d;
    }
    else {
        if (!(-L_MAXDATEFIELD <= res && res <= L_MAXDATEFIELD))
            return lauxlib.luaL_error(L, lua.to_luastring(`field '${key}' is out-of-bound`), true);
        res -= delta;
    }
    lua.lua_pop(L, 1);
    return res;
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
    "time": os_time,
    "difftime": os_difftime
};

// Only with Node
if (process && process.exit && process.env && process.uptime) {
    const os_exit = function(L) {
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

    const os_getenv = function(L) {
        lua.lua_pushliteral(L, process.env[lua.to_jsstring(lauxlib.luaL_checkstring(L, 1))]);  /* if NULL push nil */
        return 1;
    };

    const os_clock = function(L) {
        lua.lua_pushnumber(L, process.uptime());
        return 1;
    };

    syslib.clock = os_clock;
    syslib.exit = os_exit;
    syslib.getenv = os_getenv;
}


// Only with Node
if (typeof require === "function") {

    let fs = false;
    let tmp = false;
    let child_process = false;
    try {
        fs = require('fs');
        tmp = require('tmp');
        child_process = require('child_process');
    } catch (e) {}

    if (fs && tmp) {
        // TODO: on POSIX system, should create the file
        const lua_tmpname = function() {
            return tmp.tmpNameSync();
        };

        const os_remove = function(L) {
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

        const os_rename = function(L) {
            let fromname = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            let toname = lua.to_jsstring(lauxlib.luaL_checkstring(L, 2));
            try {
                fs.renameSync(fromname, toname);
            } catch (e) {
                return lauxlib.luaL_fileresult(L, false, false, e);
            }
            return lauxlib.luaL_fileresult(L, true);
        };

        const os_tmpname = function(L) {
            let name = lua_tmpname();
            if (!name)
                return lauxlib.luaL_error(L, lua.to_luastring("unable to generate a unique filename"));
            lua.lua_pushstring(L, lua.to_luastring(name));
            return 1;
        };

        syslib.remove = os_remove;
        syslib.rename = os_rename;
        syslib.tmpname = os_tmpname;
    }

    if (child_process) {
        const os_execute = function(L) {
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
                    return lauxlib.luaL_execresult(L, false, e);
                }

                return lauxlib.luaL_execresult(L, true);
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

        syslib.execute = os_execute;
    }

}

const luaopen_os = function(L) {
    lauxlib.luaL_newlib(L, syslib);
    return 1;
};

module.exports.luaopen_os = luaopen_os;
