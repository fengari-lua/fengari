# fengari
🐺 φεγγάρι - A Lua VM written in JS ES6 targeting the browser

## So far

- [x] Parse bytecode
- [ ] Opcodes
    - [x] ...
    - [ ] `OP_CONCAT`
- [ ] Basic types representation:
    - [x] nil
    - [x] boolean
    - [ ] number (32-bit ?)
        - [ ] integer
        - [ ] float
    - [ ] string (8-bit clean)
    - [ ] table
    - [ ] function
    - [ ] userdata
    - [ ] thread
- [ ] Tag Methods
    - [ ] `__index`
    - [ ] `__newindex`
    - [x] `__gc` (unavailable)
    - [ ] `__mode`
    - [ ] `__len`
    - [ ] `__eq`
    - [ ] `__add`
    - [ ] `__sub`
    - [ ] `__mul`
    - [ ] `__mod`
    - [ ] `__pow`
    - [ ] `__div`
    - [ ] `__idiv`
    - [ ] `__band`
    - [ ] `__bor`
    - [ ] `__bxor`
    - [ ] `__shl`
    - [ ] `__shr`
    - [ ] `__unm`
    - [ ] `__bnot`
    - [ ] `__lt`
    - [ ] `__le`
    - [ ] `__concat`
    - [ ] `__call`
- [ ] Debug (errors)
- [ ] C API
- [ ] stdlib
- [ ] DOM API binding
- [ ] Parse Lua
- [ ] Generate bytecode

## References

- [Source code for Lua 5.3](lua.org/source/5.3/)
- [Lua 5.2 Bytecode and Virtual Machine](http://files.catwell.info/misc/mirror/lua-5.2-bytecode-vm-dirk-laurie/lua52vm.html)
- [Lua 5.3 Bytecode Reference](http://the-ravi-programming-language.readthedocs.io/en/latest/lua_bytecode_reference.html)
- [A No-Frills Introduction to Lua 5.1 VM Instructions](http://luaforge.net/docman/83/98/ANoFrillsIntroToLua51VMInstructions.pdf)