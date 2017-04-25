[![Build Status](https://travis-ci.org/giann/fengari.svg?branch=master)](https://travis-ci.org/giann/fengari) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
    <img src="https://github.com/giann/fengari/raw/master/logo.png" alt="Fengari" width="304" height="304">
</p>

# fengari
🐺 φεγγάρι - The Lua VM written in JS ES6 targeting the browser

## So far

- [x] Lexing/Parsing
- [x] Parse bytecode
- [x] Opcodes
- [x] Basic types representation:
- [x] Tag Methods
- [ ] Standard library
    - [x] Base lib
    - [x] Coroutine
    - [x] Debug
    - [x] Math
    - [x] String
    - [x] Table
    - [x] utf8
    - [ ] Package
    - [ ] os
    - [ ] io
        - [ ] `io.stdin`
        - [ ] `io.stdout`
        - [ ] `io.stderr`
        - [ ] `io.flush()`
        - [ ] `io.input()`
        - [ ] `io.lines()`
        - [ ] `io.open()`
        - [ ] `io.output()`
        - [ ] `io.popen()`
        - [ ] `io.read()`
        - [ ] `io.tmpfile()`
        - [ ] `io.type()`
        - [ ] `io.write()`
        - [ ] `io.close()`
        - [ ] `file:flush()`
        - [ ] `file:lines()`
        - [ ] `file:read()`
        - [ ] `file:read()`
        - [ ] `file:setvbuf()`
        - [ ] `file:write()`
        - [ ] `file:__gc()`
        - [ ] `file:__tostring()`
- [ ] C API
    - [x] ...
    - [ ] lua_arith
    - [ ] lua_close
    - [ ] lua_isboolean
    - [ ] lua_islightuserdata
    - [ ] lua_pushfstring
    - [ ] lua_pushvfstring
    - [ ] lua_rawseti
    - [ ] lua_register
    - [ ] lua_setallocf
    - [ ] lua_tocfunction
- [ ] Auxiliary library
    - [x] ...
    - [ ] luaL_addsize
    - [ ] luaL_checkoption
    - [ ] luaL_checkversion
    - [ ] luaL_dofile
    - [ ] luaL_dostring
    - [ ] luaL_execresult
    - [ ] luaL_gsub
    - [ ] luaL_newlibtable
    - [ ] luaL_optnumber
    - [ ] luaL_prepbuffer
    - [ ] luaL_pushresultsize
    - [ ] luaL_ref
    - [ ] luaL_unref
- [ ] Run [Lua test suite](https://github.com/lua/tests)
    - [x] constructs.lua (`_soft`)
    - [x] locals.lua
    - [x] strings.lua
    - [ ] all.lua
    - [ ] big.lua
    - [ ] checktable.lua
    - [ ] errors.lua
    - [ ] gc.lua
    - [ ] literals.lua
    - [ ] math.lua
    - [ ] sort.lua
    - [ ] utf8.lua
    - [ ] api.lua
    - [ ] bitwise.lua
    - [ ] closure.lua
    - [ ] coroutine.lua
    - [ ] events.lua
    - [ ] goto.lua
    - [ ] nextvar.lua
    - [ ] vararg.lua
    - [ ] attrib.lua
    - [ ] calls.lua
    - [ ] code.lua
    - [ ] db.lua
    - [ ] files.lua
    - [ ] heavy.lua
    - [ ] main.lua
    - [ ] pm.lua
    - [ ] tpack.lua
    - [ ] verybig.lua
- [ ] DOM API binding

## References

- [Source code for Lua 5.3](lua.org/source/5.3/)
- [Lua 5.2 Bytecode and Virtual Machine](http://files.catwell.info/misc/mirror/lua-5.2-bytecode-vm-dirk-laurie/lua52vm.html)
- [Lua 5.3 Bytecode Reference](http://the-ravi-programming-language.readthedocs.io/en/latest/lua_bytecode_reference.html)
- [A No-Frills Introduction to Lua 5.1 VM Instructions](http://luaforge.net/docman/83/98/ANoFrillsIntroToLua51VMInstructions.pdf)
