#!/usr/bin/env node
"use strict";

const lua          = require('../../src/lua.js');
const lauxlib      = require('../../src/lauxlib.js');
const readlineSync = require('readline-sync');

const stdin = lua.to_luastring("=stdin");
const _PROMPT = lua.to_luastring("_PROMPT");
const _PROMPT2 = lua.to_luastring("_PROMPT2");

const report = function(L, status) {
    if (status !== lua.LUA_OK) {
        lauxlib.lua_writestringerror(`${lua.lua_tojsstring(L, -1)}\n`);
        lua.lua_pop(L, 1);
    }
    return status;
};

const docall = function(L, narg, nres) {
    let status = lua.lua_pcall(L, narg, nres, 0);
    return status;
};

const dochunk = function(L, status) {
    if (status === lua.LUA_OK) {
        status = docall(L, 0, 0);
    }
    return report(L, status);
};

const dofile = function(L, name) {
    return dochunk(L, lauxlib.luaL_loadfile(L, lua.to_luastring(name)));
};

const dostring = function(L, s, name) {
    let buffer = lua.to_luastring(s);
    return dochunk(L, lauxlib.luaL_loadbuffer(L, buffer, buffer.length, lua.to_luastring(name)));
};

const dolibrary = function(L, name) {
    lua.lua_getglobal(L, lua.to_luastring("require"));
    lua.lua_pushliteral(L, name);
    let status = docall(L, 1, 1);  /* call 'require(name)' */
    if (status === lua.LUA_OK)
        lua.lua_setglobal(L, lua.to_luastring(name));  /* global[name] = require return */
    return report(L, status);
};

let progname = process.argv[1];

const print_usage = function(badoption) {
    lauxlib.lua_writestringerror(`${progname}: `);
    if (badoption[1] === "e" || badoption[1] === "l")
        lauxlib.lua_writestringerror(`'${badoption}' needs argument\n`);
    else
        lauxlib.lua_writestringerror(`'unrecognized option '${badoption}'\n`);
    lauxlib.lua_writestringerror(
        `usage: ${progname} [options] [script [args]]\n` +
        "Available options are:\n" +
        "  -e stat  execute string 'stat'\n" +
        "  -i       enter interactive mode after executing 'script'\n" +
        "  -l name  require library 'name'\n" +
        "  -v       show version information\n" +
        "  -E       ignore environment variables\n" +
        "  --       stop handling options\n" +
        "  -        stop handling options and execute stdin\n"
    );
};

const L = lauxlib.luaL_newstate();

let script = 2; // Where to start args from
let has_E = false;
let has_i = false;
let has_v = false;
let has_e = false;

(function() {
    let i;
    for (i = 2; i<process.argv.length; i++) {
        script = i;
        if (process.argv[i][0] != "-") {
            return;
        }
        switch(process.argv[i][1]) {
        case '-':
            if (process.argv[i][2]) {
                print_usage(process.argv[script]);
                return process.exit(1);
            }
            script = i + 1;
            return;
        case void 0: /* script name is '-' */
            return;
        case 'E':
            has_E = true;
            break;
        case 'i':
            has_i = true;
            /* (-i implies -v) */
            /* falls through */
        case 'v':
            if (process.argv[i].length > 2) {
                /* invalid option */
                print_usage(process.argv[script]);
                return process.exit(1);
            }
            has_v = true;
            break;
        case 'e':
            has_e = true;
            /* falls through */
        case 'l':  /* both options need an argument */
            if (process.argv[i].length < 3) {  /* no concatenated argument? */
                i++;  /* try next 'process.argv' */
                if (process.argv.length <= i || process.argv[i][0] === '-') {
                    /* no next argument or it is another option */
                    print_usage(process.argv[script]);
                    return process.exit(1);
                }
            }
            break;
        default:  /* invalid option */
            print_usage(process.argv[script]);
            return process.exit(1);
        }
    }
    script = i;
})();

if (has_v)
    console.log(lua.FENGARI_COPYRIGHT);

if (has_E) {
    /* signal for libraries to ignore env. vars. */
    lua.lua_pushboolean(L, 1);
    lua.lua_setfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring("LUA_NOENV"));
}

/* open standard libraries */
lauxlib.luaL_openlibs(L);

/* create table 'arg' */
lua.lua_createtable(L, process.argv.length - (script + 1), script + 1);
for (let i = 0; i < process.argv.length; i++) {
    lua.lua_pushliteral(L, process.argv[i]);
    lua.lua_seti(L, -2, i - script); /* TODO: rawseti */
}
lua.lua_setglobal(L, lua.to_luastring("arg"));

if (!has_E) {
    /* run LUA_INIT */
    let name = "LUA_INIT"+lua.LUA_VERSUFFIX;
    let init = process.env[name];
    if (!init) {
        name = "LUA_INIT";
        init = process.env[name];
    }
    if (init) {
        let status;
        if (init[0] === '@') {
            status = dofile(L, init.substring(1));
        } else {
            status = dostring(L, init, name);
        }
        if (status !== lua.LUA_OK) {
            return process.exit(1);
        }
    }
}

/* execute arguments -e and -l */
for (let i = 1; i < script; i++) {
    let option = process.argv[i][1];
    if (option == 'e' || option == 'l') {
        let extra = process.argv[i].substring(2); /* both options need an argument */
        if (extra.length === 0)
            extra = process.argv[++i];
        let status;
        if (option == 'e') {
            status = dostring(L, extra, "=(command line)");
        } else {
            status = dolibrary(L, extra);
        }
        if (status !== lua.LUA_OK) {
            return process.exit(1);
        }
    }
}

const pushargs = function(L) {
    if (lua.lua_getglobal(L, lua.to_luastring("arg")) !== lua.LUA_TTABLE)
        lauxlib.luaL_error(L, lua.to_luastring("'arg' is not a table"));
    let n = lauxlib.luaL_len(L, -1);
    lauxlib.luaL_checkstack(L, n+3, lua.to_luastring("too many arguments to script"));
    let i;
    for (i=1; i<=n; i++)
        lua.lua_rawgeti(L, -i, i);
    lua.lua_remove(L, -i);
    return n;
};

const handle_script = function(L, argv) {
    let fname = argv[0];
    let status;
    if (fname === "-" && argv[-1] !== "--")
        fname = null;  /* stdin */
    else
        fname = lua.to_luastring(fname);
    status = lauxlib.luaL_loadfile(L, fname);
    if (status === lua.LUA_OK) {
        let n = pushargs(L); /* push arguments to script */
        status = docall(L, n, lua.LUA_MULTRET);
    }
    return report(L, status);
};

const doREPL = function(L) {
    for (;;) {
        lua.lua_getglobal(L, _PROMPT);
        let input = readlineSync.prompt({
            prompt: lua.lua_tojsstring(L, -1) || '> '
        });
        lua.lua_pop(L, 1);

        if (input.length === 0)
            continue;

        let status;
        {
            let buffer = lua.to_luastring("return " + input);
            status = lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin);
        }
        if (status !== lua.LUA_OK) {
            lua.lua_pop(L, 1);
            let buffer = lua.to_luastring(input);
            if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin) === lua.LUA_OK) {
                status = lua.LUA_OK;
            }
        }
        while (status === lua.LUA_ERRSYNTAX && lua.lua_tojsstring(L, -1).endsWith("<eof>")) {
            /* continuation */
            lua.lua_pop(L, 1);
            lua.lua_getglobal(L, _PROMPT2);
            input += "\n" + readlineSync.prompt({
                prompt: lua.lua_tojsstring(L, -1) || '>> '
            });
            lua.lua_pop(L, 1);
            let buffer = lua.to_luastring(input);
            status = lauxlib.luaL_loadbuffer(L, buffer, buffer.length, stdin);
        }
        if (status === lua.LUA_OK) {
            status = docall(L, 0, lua.LUA_MULTRET);
        }
        if (status === lua.LUA_OK) {
            let n = lua.lua_gettop(L);
            if (n > 0) {  /* any result to be printed? */
                lua.lua_getglobal(L, lua.to_luastring("print"));
                lua.lua_insert(L, 1);
                if (lua.lua_pcall(L, n, 0, 0) != lua.LUA_OK) {
                    lauxlib.lua_writestringerror(`error calling 'print' (${lua.lua_tojsstring(L, -1)})\n`);
                }
            }
        } else {
            report(L, status);
        }
        lua.lua_settop(L, 0);  /* remove eventual returns */
    }
};

if (script < process.argv.length &&  /* execute main script (if there is one) */
    handle_script(L, process.argv.slice(script)) !== lua.LUA_OK) {
    /* success */
} else if (has_i) {
    doREPL(L);
} else if (script == process.argv.length && !has_e && !has_v) {  /* no arguments? */
    if (process.stdin.isTTY) {  /* running in interactive mode? */
        console.log(lua.FENGARI_COPYRIGHT);
        doREPL(L);  /* do read-eval-print loop */
    } else {
        dofile(L, null);
    }
}
