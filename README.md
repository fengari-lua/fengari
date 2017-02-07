# fengari
🐺 φεγγάρι - A Lua VM written in JS ES6 targeting the browser

## So far

- [x] Parse bytecode
- [ ] VM
    - [x] OP_MOVE
    - [x] OP_LOADK
    - [ ] OP_LOADKX
    - [x] OP_LOADBOOL
    - [x] OP_LOADNIL
    - [ ] OP_GETUPVAL
    - [ ] OP_GETTABUP
    - [ ] OP_GETTABLE
    - [ ] OP_SETTABUP
    - [ ] OP_SETUPVAL
    - [ ] OP_SETTABLE
    - [ ] OP_NEWTABLE
    - [ ] OP_SELF
    - [x] OP_ADD
    - [x] OP_SUB
    - [x] OP_MUL
    - [x] OP_MOD
    - [x] OP_POW
    - [x] OP_DIV
    - [x] OP_IDIV
    - [x] OP_BAND
    - [x] OP_BOR
    - [x] OP_BXOR
    - [x] OP_SHL
    - [x] OP_SHR
    - [x] OP_UNM
    - [x] OP_BNOT
    - [x] OP_NOT
    - [ ] OP_LEN
    - [ ] OP_CONCAT
    - [ ] OP_JMP
    - [ ] OP_EQ
    - [ ] OP_LT
    - [ ] OP_LE
    - [ ] OP_TEST
    - [ ] OP_TESTSET
    - [x] OP_CALL
    - [x] OP_TAILCALL
    - [x] OP_RETURN
    - [ ] OP_FORLOOP
    - [ ] OP_FORPREP
    - [ ] OP_TFORCALL
    - [ ] OP_TFORLOOP
    - [ ] OP_SETLIST
    - [x] OP_CLOSURE
    - [x] OP_VARARG
    - [x] OP_EXTRAARG
- [ ] C API
- [ ] stdlib
- [ ] Parse Lua
- [ ] Generate bytecode

## References

- [Source code for Lua 5.3](lua.org/source/5.3/)
- [Lua 5.2 Bytecode and Virtual Machine](http://files.catwell.info/misc/mirror/lua-5.2-bytecode-vm-dirk-laurie/lua52vm.html)
- [Lua 5.3 Bytecode Reference](http://the-ravi-programming-language.readthedocs.io/en/latest/lua_bytecode_reference.html)
- [A No-Frills Introduction to Lua 5.1 VM Instructions](http://luaforge.net/docman/83/98/ANoFrillsIntroToLua51VMInstructions.pdf)