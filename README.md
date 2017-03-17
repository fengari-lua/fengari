[![Build Status](https://travis-ci.org/giann/fengari.svg?branch=master)](https://travis-ci.org/giann/fengari) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
    <img src="https://github.com/giann/fengari/raw/master/logo.png" alt="Fengari" width="304" height="304">
</p>

# fengari
🐺 φεγγάρι - A Lua VM written in JS ES6 targeting the browser

## So far

- [x] Lexing/Parsing
- [x] Parse bytecode
- [x] Opcodes
- [ ] Basic types representation:
    - [x] nil
    - [x] boolean
    - [x] table
        - [ ] weak table
    - [x] function
    - [x] string (8-bit clean)
    - [ ] number (32-bit ?)
        - [ ] integer
        - [ ] float
    - [ ] userdata
- [x] Tag Methods
- [ ] C API
    - [x] ...
    - [ ] lua_arith
    - [ ] lua_close
    - [ ] lua_gethook
    - [ ] lua_gethookcount
    - [ ] lua_gethookmask
    - [ ] lua_geti
    - [ ] lua_getinfo
    - [ ] lua_getlocal
    - [ ] lua_getstack
    - [ ] lua_getupvalue
    - [ ] lua_getuservalue
    - [ ] lua_isboolean
    - [ ] lua_iscfunction
    - [ ] lua_isfunction
    - [ ] lua_islightuserdata
    - [ ] lua_isthread
    - [ ] lua_isuserdata
    - [ ] lua_newuserdata
    - [ ] lua_pcallk
    - [ ] lua_pushfstring
    - [ ] lua_pushlightuserdata
    - [ ] lua_pushvfstring
    - [ ] lua_rawgetp
    - [ ] lua_rawseti
    - [ ] lua_rawsetp
    - [ ] lua_register
    - [ ] lua_setallocf
    - [ ] lua_sethook
    - [ ] lua_setlocal
    - [ ] lua_setuservalue
    - [ ] lua_tocfunction
    - [ ] lua_touserdata
    - [ ] lua_upvalueid
    - [ ] lua_upvaluejoin
- [ ] Auxiliary library
    - [x] ...
    - [ ] luaL_addsize
    - [ ] luaL_checkoption
    - [ ] luaL_checkudata
    - [ ] luaL_checkversion
    - [ ] luaL_dofile
    - [ ] luaL_dostring
    - [ ] luaL_execresult
    - [ ] luaL_fileresult
    - [ ] luaL_getmetatable
    - [ ] luaL_gsub
    - [ ] luaL_loadfile
    - [ ] luaL_loadfilex
    - [ ] luaL_newlibtable
    - [ ] luaL_newmetatable
    - [ ] luaL_optnumber
    - [ ] luaL_optstring
    - [ ] luaL_prepbuffer
    - [ ] luaL_pushresultsize
    - [ ] luaL_ref
    - [ ] luaL_setmetatable
    - [ ] luaL_testudata
    - [ ] luaL_traceback
    - [ ] luaL_unref
- [ ] Standard library
    - [ ] Base lib
        - [x] ...
        - [x] load
        - [ ] dofile
        - [ ] loadfile
    - [x] Coroutine
    - [x] Table
    - [x] Math
    - [x] utf8
    - [ ] String
        - [x] string.byte
        - [x] string.char
        - [x] string.dump
        - [x] string.format
        - [x] string.len
        - [x] string.lower
        - [x] string.rep
        - [x] string.reverse
        - [x] string.sub
        - [x] string.upper
        - [ ] string.find
        - [ ] string.gmatch
        - [ ] string.gsub
        - [ ] string.match
        - [ ] string.pack
        - [ ] string.packsize
        - [ ] string.unpack
    - [ ] Package
    - [ ] os
    - [ ] io
    - [ ] Debug
- [ ] Run [Lua test suite](https://github.com/lua/tests)
- [ ] DOM API binding

## References

- [Source code for Lua 5.3](lua.org/source/5.3/)
- [Lua 5.2 Bytecode and Virtual Machine](http://files.catwell.info/misc/mirror/lua-5.2-bytecode-vm-dirk-laurie/lua52vm.html)
- [Lua 5.3 Bytecode Reference](http://the-ravi-programming-language.readthedocs.io/en/latest/lua_bytecode_reference.html)
- [A No-Frills Introduction to Lua 5.1 VM Instructions](http://luaforge.net/docman/83/98/ANoFrillsIntroToLua51VMInstructions.pdf)