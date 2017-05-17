[![Build Status](https://travis-ci.org/fengari-lua/fengari.svg?branch=master)](https://travis-ci.org/fengari-lua/fengari) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
    <img src="https://github.com/fengari-lua/fengari/raw/master/logo.png" alt="Fengari" width="304" height="304">
</p>


# fengari

🐺 φεγγάρι - The Lua VM written in JS ES6 for Node and the browser


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
    - [x] os (~~`os.setlocale()`~~)
    - [x] Package
    - [ ] io
        - [x] `file:__tostring()`
        - [x] `file:flush()`
        - [x] `file:write()`
        - [x] `io.close()`
        - [x] `io.stderr`
        - [x] `io.stdin`
        - [x] `io.stdout`
        - [x] `io.type()`
        - [x] `io.write()`
        - [x] `io.flush()`
        - [ ] `io.input()`: partially implemented
        - [ ] `io.lines()`
        - [ ] `io.open()`
        - [ ] `io.output()`: partially implemented
        - [ ] `io.popen()`
        - [ ] `io.read()`
        - [ ] `io.tmpfile()`
        - [ ] `file:lines()`
        - [ ] `file:read()`
        - [ ] `file:setvbuf()`
        - [ ] `file:__gc()`
- [x] C API
- [x] Auxiliary library
- [ ] Run [Lua test suite](https://github.com/lua/tests)
    - [x] `calls.lua`
    - [x] `constructs.lua` (`_soft`)
    - [x] `events.lua`
    - [x] `literals.lua`
    - [x] `locals.lua`
    - [x] `strings.lua`
    - [x] `vararg.lua`
    - [ ] `api.lua`
    - [ ] `attrib.lua`
    - [ ] `big.lua`
    - [ ] `bitwise.lua`
    - [ ] `closure.lua`
    - [ ] `code.lua`
    - [ ] `coroutine.lua`
    - [ ] `db.lua`
    - [ ] `errors.lua`
    - [ ] `goto.lua`
    - [ ] `math.lua`
    - [ ] `nextvar.lua`
    - [ ] `pm.lua`
    - [ ] `sort.lua`
    - [ ] `tpack.lua`
    - [ ] `utf8.lua`
    - [ ] `verybig.lua`
- [ ] DOM API binding: [https://github.com/fengari-lua/fengari-interop](https://github.com/fengari-lua/fengari-interop)


## Extensions

### `dv = lua_todataview(L, idx)`

Equivalent to `lua_tolstring` but returns a [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) instead of a string.


### `str = lua_toljsstring(L, idx)`

Equivalent to `lua_tolstring` but returns the string as a JavaScript string (as if `to_jsstring()` was called on the result).


### `lua_tojsstring(L, idx)`

Alias for `lua_toljsstring`.


### `lua_pushjsfunction(L, func)`

Alias for `lua_pushcfunction`.


### `lua_pushjsclosure(L, func, n)`

Alias for `lua_pushcclosure`.


### `lua_atnativeerror(L, func)`

Sets a function to be called if a native JavaScript error is thrown across a lua pcall.
The function will be run as if it were a message handler (see https://www.lua.org/manual/5.3/manual.html#2.3).
The current message handler will be run after the native error handler returns.


### `b = lua_isproxy(p, L)`

Returns a boolean `b` indicating whether `p` is a proxy (See `lua_toproxy`).
If `L` is non-null, only returns `true` if `p` belongs to the same global state.


### `p = lua_toproxy(L, idx)`

Returns a JavaScript object `p` that holds a reference to the lua value at the stack index `idx`.
This object can be called with a lua_State to push the value onto that state's stack.

This example would be an inefficient way to write `lua_pushvalue(L, 1)`:

```js
var p = lua_toproxy(L, 1);
p(L);
````


## References

- [Source code for Lua 5.3](lua.org/source/5.3/)
- [Lua 5.2 Bytecode and Virtual Machine](http://files.catwell.info/misc/mirror/lua-5.2-bytecode-vm-dirk-laurie/lua52vm.html)
- [Lua 5.3 Bytecode Reference](http://the-ravi-programming-language.readthedocs.io/en/latest/lua_bytecode_reference.html)
- [A No-Frills Introduction to Lua 5.1 VM Instructions](http://luaforge.net/docman/83/98/ANoFrillsIntroToLua51VMInstructions.pdf)
