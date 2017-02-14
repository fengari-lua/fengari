/*jshint esversion: 6 */
"use strict";

const test     = require('tape');
const beautify = require('js-beautify').js_beautify;

const VM       = require("../src/lvm.js");
const OC       = require('../src/lopcodes.js');

const getState = require("./tests.js").getState;


test('__index, __newindex: with actual table', function (t) {
    let luaCode = `
        local t = {yo=1}
        return t.yo, t.lo
    `, L;
    
    t.plan(3);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
        VM.luaV_execute(L);
    }, "Program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        null,
        "Program output is correct"
    );

    t.strictEqual(
        L.stack[L.top - 2].value,
        1,
        "Program output is correct"
    );
});


test('__index: with non table', function (t) {
    let luaCode = `
        local t = "a string"
        return t.yo
    `, L;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");

    t.throws(function () {
        VM.luaV_execute(L);
    }, "Program executed with expected error");
});


test('__newindex: with non table', function (t) {
    let luaCode = `
        local t = "a string"
        t.yo = "hello"
    `, L;
    
    t.plan(2);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");

    t.throws(function () {
        VM.luaV_execute(L);
    }, "Program executed with expected error");
});


test('__index function in metatable', function (t) {
    let luaCode = `
        local mt = {
            __index = function (table, key)
                return "__index"
            end
        }

        local t = {}

        -- setmetatable(t, mt)

        return t.yo
    `, L;
    
    t.plan(8);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");


    // main <hello.lua:0,0> (7 instructions at 0x7fe6b4403050)
    // 0+ params, 3 slots, 1 upvalue, 2 locals, 2 constants, 1 function
    //         1       [1]     NEWTABLE        0 0 1
    //         2       [4]     CLOSURE         1 0     ; 0x7fe6b4403290
    //         3       [4]     SETTABLE        0 -1 1  ; "__index" -
    //         4       [7]     NEWTABLE        1 0 0
    //         5       [9]     GETTABLE        2 1 -2  ; "yo"            <=== We stop here
    //         6       [9]     RETURN          2 2
    //         7       [9]     RETURN          0 1
    //
    // function <hello.lua:2,4> (3 instructions at 0x7fe6b4403290)
    // 2 params, 3 slots, 0 upvalues, 2 locals, 1 constant, 0 functions
    //         1       [3]     LOADK           2 -1    ; "__index"
    //         2       [3]     RETURN          2 2
    //         3       [4]     RETURN          0 1

    t.strictEqual(
        OC.OpCodes[L.stack[0].p.code[4].opcode],
        "OP_GETTABLE",
        "Correct opcode marked as breakpoint"
    );

    t.comment("We set a breakpoint")
    L.stack[0].p.code[4].breakpoint = true;

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "First part of the program executed without errors");

    t.strictEqual(
        OC.OpCodes[L.ci.u.l.savedpc[L.ci.pcOff - 1].opcode],
        "OP_GETTABLE",
        "Stopped at correct opcode"
    );

    t.comment("We unset the breakpoint and correct pcOff");
    L.ci.pcOff--;
    L.stack[0].p.code[4].breakpoint = false;

    t.ok(
        L.stack[2].ttistable() && !L.stack[2].value.hash.get("__index"),
        "t is on stack at 2"
    );

    t.ok(
        L.stack[1].ttistable() && L.stack[1].value.hash.get("__index"),
        "mt is on stack at 1"
    );

    t.comment("We manually set t's metatable to mt");
    L.stack[2].metatable = L.stack[1];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Second part of the program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        "__index",
        "Program output is correct"
    );
});


test('__newindex function in metatable', function (t) {
    let luaCode = `
        local mt = {
            __newindex = function (table, key, value)
                return "__newindex"
            end
        }

        local t = {}

        -- setmetatable(t, mt)

        t.yo = "hello"

        return t.yo
    `, L;
    
    t.plan(8);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");


    // main <hello.lua:0,0> (8 instructions at 0x7faadcf00ac0)
    // 0+ params, 3 slots, 1 upvalue, 2 locals, 3 constants, 1 function
    //         1       [1]     NEWTABLE        0 0 1
    //         2       [4]     CLOSURE         1 0     ; 0x7faadcf00d10
    //         3       [4]     SETTABLE        0 -1 1  ; "__newindex" -
    //         4       [7]     NEWTABLE        1 0 0
    //         5       [11]    SETTABLE        1 -2 -3 ; "yo" "hello"   <=== We stop here
    //         6       [13]    GETTABLE        2 1 -2  ; "yo"
    //         7       [13]    RETURN          2 2
    //         8       [13]    RETURN          0 1
    //
    // function <hello.lua:2,4> (3 instructions at 0x7faadcf00d10)
    // 3 params, 4 slots, 0 upvalues, 3 locals, 1 constant, 0 functions
    //         1       [3]     LOADK           3 -1    ; "__newindex"
    //         2       [3]     RETURN          3 2
    //         3       [4]     RETURN          0 1

    t.strictEqual(
        OC.OpCodes[L.stack[0].p.code[4].opcode],
        "OP_SETTABLE",
        "Correct opcode marked as breakpoint"
    );

    t.comment("We set a breakpoint")
    L.stack[0].p.code[4].breakpoint = true;

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "First part of the program executed without errors");

    t.strictEqual(
        OC.OpCodes[L.ci.u.l.savedpc[L.ci.pcOff - 1].opcode],
        "OP_SETTABLE",
        "Stopped at correct opcode"
    );

    t.comment("We unset the breakpoint and correct pcOff");
    L.ci.pcOff--;
    L.stack[0].p.code[4].breakpoint = false;

    t.ok(
        L.stack[2].ttistable() && !L.stack[2].value.hash.get("__newindex"),
        "t is on stack at 2"
    );

    t.ok(
        L.stack[1].ttistable() && L.stack[1].value.hash.get("__newindex"),
        "mt is on stack at 1"
    );

    t.comment("We manually set t's metatable to mt");
    L.stack[2].metatable = L.stack[1];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Second part of the program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        null,
        "Program output is correct"
    );
});


test('__index table in metatable', function (t) {
    let luaCode = `
        local mmt = {
            yo = "hello"
        }

        local mt = {
            __index = mmt
        }

        local t = {}

        -- setmetatable(t, mt)

        return t.yo
    `, L;
    
    t.plan(8);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");


    // main <hello.lua:0,0> (8 instructions at 0x7fb57cc03210)
    // 0+ params, 4 slots, 1 upvalue, 3 locals, 3 constants, 0 functions
    //         1       [1]     NEWTABLE        0 0 1
    //         2       [2]     SETTABLE        0 -1 -2 ; "yo" "hello"
    //         3       [4]     NEWTABLE        1 0 1
    //         4       [5]     SETTABLE        1 -3 0  ; "__index" -
    //         5       [7]     NEWTABLE        2 0 0
    //         6       [9]     GETTABLE        3 2 -1  ; "yo"             <=== We stop here
    //         7       [9]     RETURN          3 2
    //         8       [9]     RETURN          0 1

    t.strictEqual(
        OC.OpCodes[L.stack[0].p.code[5].opcode],
        "OP_GETTABLE",
        "Correct opcode marked as breakpoint"
    );

    t.comment("We set a breakpoint")
    L.stack[0].p.code[5].breakpoint = true;

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "First part of the program executed without errors");

    t.strictEqual(
        OC.OpCodes[L.ci.u.l.savedpc[L.ci.pcOff - 1].opcode],
        "OP_GETTABLE",
        "Stopped at correct opcode"
    );

    t.comment("We unset the breakpoint and correct pcOff");
    L.ci.pcOff--;
    L.stack[0].p.code[5].breakpoint = false;

    t.ok(
        L.stack[3].ttistable() && !L.stack[3].value.hash.get("__index"),
        "t is on stack at 3"
    );

    t.ok(
        L.stack[2].ttistable() && L.stack[2].value.hash.get("__index"),
        "mt is on stack at 2"
    );

    t.comment("We manually set t's metatable to mt");
    L.stack[3].metatable = L.stack[2];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Second part of the program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        "hello",
        "Program output is correct"
    );
});


test('__newindex table in metatable', function (t) {
    let luaCode = `
        local mmt = {
            yo = "hello"
        }

        local mt = {
            __newindex = mmt
        }

        local t = {}

        -- setmetatable(t, mt)

        t.yo = "world"

        return t.yo, mmt.yo
    `, L;
    
    t.plan(9);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");


    // main <hello.lua:0,0> (10 instructions at 0x7fba6a403210)
    // 0+ params, 5 slots, 1 upvalue, 3 locals, 4 constants, 0 functions
    //         1       [1]     NEWTABLE        0 0 1
    //         2       [2]     SETTABLE        0 -1 -2 ; "yo" "hello"
    //         3       [5]     NEWTABLE        1 0 1
    //         4       [6]     SETTABLE        1 -3 0  ; "__newindex" -
    //         5       [9]     NEWTABLE        2 0 0
    //         6       [13]    SETTABLE        2 -1 -4 ; "yo" "world"      <=== We stop here
    //         7       [15]    GETTABLE        3 2 -1  ; "yo"
    //         8       [15]    GETTABLE        4 0 -1  ; "yo"
    //         9       [15]    RETURN          3 3
    //         10      [15]    RETURN          0 1

    t.strictEqual(
        OC.OpCodes[L.stack[0].p.code[5].opcode],
        "OP_SETTABLE",
        "Correct opcode marked as breakpoint"
    );

    t.comment("We set a breakpoint")
    L.stack[0].p.code[5].breakpoint = true;

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "First part of the program executed without errors");

    t.strictEqual(
        OC.OpCodes[L.ci.u.l.savedpc[L.ci.pcOff - 1].opcode],
        "OP_SETTABLE",
        "Stopped at correct opcode"
    );

    t.comment("We unset the breakpoint and correct pcOff");
    L.ci.pcOff--;
    L.stack[0].p.code[5].breakpoint = false;

    t.ok(
        L.stack[3].ttistable() && !L.stack[3].value.hash.get("__newindex"),
        "t is on stack at 3"
    );

    t.ok(
        L.stack[2].ttistable() && L.stack[2].value.hash.get("__newindex"),
        "mt is on stack at 2"
    );

    t.comment("We manually set t's metatable to mt");
    L.stack[3].metatable = L.stack[2];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Second part of the program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        "world",
        "Program output is correct"
    );

    t.strictEqual(
        L.stack[L.top - 2].value,
        null,
        "Program output is correct"
    );
});


test('__index table with own metatable', function (t) {
    let luaCode = `
        local mmmt = {
            __index = function (t, k)
                return "hello"
            end
        }

        local mmt = {
            yoo = "bye"
        }

        -- setmetatable(mmt, mmmt)

        local mt = {
            __index = mmt
        }

        -- setmetatable(mt, mmt)

        local t = {}

        -- setmetatable(t, mt)

        return t.yo
    `, L;
    
    t.plan(6);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");


    // main <hello.lua:0,0> (11 instructions at 0x7f96e3403210)
    // 0+ params, 5 slots, 1 upvalue, 4 locals, 3 constants, 1 function
    //         1       [1]     NEWTABLE        0 0 1
    //         2       [4]     CLOSURE         1 0     ; 0x7f96e3403440
    //         3       [4]     SETTABLE        0 -1 1  ; "__index" -
    //         4       [7]     NEWTABLE        1 0 1
    //         5       [8]     SETTABLE        1 -2 -3 ; "yo" "bye"
    //         6       [13]    NEWTABLE        2 0 1                     <=== We stop here
    //         7       [14]    SETTABLE        2 -1 1  ; "__index" -
    //         8       [17]    NEWTABLE        3 0 0                     <=== We stop here
    //         9       [21]    GETTABLE        4 3 -2  ; "yo"            <=== We stop here
    //         10      [21]    RETURN          4 2
    //         11      [21]    RETURN          0 1
    // 
    // function <hello.lua:2,4> (3 instructions at 0x7f96e3403440)
    // 2 params, 3 slots, 0 upvalues, 2 locals, 1 constant, 0 functions
    //         1       [3]     LOADK           2 -1    ; "hello"
    //         2       [3]     RETURN          2 2
    //         3       [4]     RETURN          0 1

    L.stack[0].p.code[5].breakpoint = true;
    L.stack[0].p.code[7].breakpoint = true;
    L.stack[0].p.code[8].breakpoint = true;

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "First part of the program executed without errors");

    L.ci.pcOff--;
    L.stack[0].p.code[5].breakpoint = false;

    t.comment("We manually set mmt's metatable to mmmt");
    L.stack[2].metatable = L.stack[1];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Second part of the program executed without errors");

    L.ci.pcOff--;
    L.stack[0].p.code[7].breakpoint = false;

    t.comment("We manually set mt's metatable to mmt");
    L.stack[3].metatable = L.stack[2];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Third part of the program executed without errors");

    L.ci.pcOff--;
    L.stack[0].p.code[8].breakpoint = false;

    t.comment("We manually set t's metatable to mt");
    L.stack[4].metatable = L.stack[3];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Fourth part of the program executed without errors");

    t.strictEqual(
        L.stack[L.top - 1].value,
        "hello",
        "Program output is correct"
    );
});


test('__newindex table with own metatable', function (t) {
    let luaCode = `
        local up = nil

        local mmmt = {
            __newindex = function (t, k, v)
                up = v
            end
        }

        local mmt = {}

        -- setmetatable(mmt, mmmt)

        local mt = {
            __newindex = mmt
        }

        -- setmetatable(mt, mmt)

        local t = {}

        -- setmetatable(t, mt)

        t.yo = "hello"

        return t.yo, up
    `, L;
    
    t.plan(7);

    t.comment("Running following code: \n" + luaCode);

    t.doesNotThrow(function () {
        L = getState(luaCode);
    }, "Bytecode parsed without errors");


    // main <hello.lua:0,0> (13 instructions at 0x7ff6ed500640)
    // 0+ params, 7 slots, 1 upvalue, 5 locals, 3 constants, 1 function
    //         1       [1]     LOADNIL         0 0
    //         2       [3]     NEWTABLE        1 0 1
    //         3       [6]     CLOSURE         2 0     ; 0x7ff6ed5007f0
    //         4       [6]     SETTABLE        1 -1 2  ; "__newindex" -
    //         5       [9]     NEWTABLE        2 0 0
    //         6       [13]    NEWTABLE        3 0 1                     <=== We stop here
    //         7       [14]    SETTABLE        3 -1 2  ; "__newindex" -
    //         8       [19]    NEWTABLE        4 0 0                     <=== We stop here
    //         9       [23]    SETTABLE        4 -2 -3 ; "yo" "hello"    <=== We stop here
    //         10      [25]    GETTABLE        5 4 -2  ; "yo"
    //         11      [25]    MOVE            6 0
    //         12      [25]    RETURN          5 3
    //         13      [25]    RETURN          0 1
    //
    // function <hello.lua:4,6> (2 instructions at 0x7ff6ed5007f0)
    // 3 params, 3 slots, 1 upvalue, 3 locals, 0 constants, 0 functions
    //         1       [5]     SETUPVAL        2 0     ; up
    //         2       [6]     RETURN          0 1

    L.stack[0].p.code[5].breakpoint = true;
    L.stack[0].p.code[7].breakpoint = true;
    L.stack[0].p.code[8].breakpoint = true;

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "First part of the program executed without errors");

    L.ci.pcOff--;
    L.stack[0].p.code[5].breakpoint = false;

    t.comment("We manually set mmt's metatable to mmmt");
    L.stack[2].metatable = L.stack[1];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Second part of the program executed without errors");

    L.ci.pcOff--;
    L.stack[0].p.code[7].breakpoint = false;

    t.comment("We manually set mt's metatable to mmt");
    L.stack[3].metatable = L.stack[2];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Third part of the program executed without errors");

    L.ci.pcOff--;
    L.stack[0].p.code[8].breakpoint = false;

    t.comment("We manually set t's metatable to mt");
    L.stack[4].metatable = L.stack[3];

    t.doesNotThrow(function () {
        VM.luaV_execute(L);
    }, "Fourth part of the program executed without errors");

    t.strictEqual(
        L.stack[L.top - 2].value,
        "hello",
        "Program output is correct"
    );

    t.strictEqual(
        L.stack[L.top - 1].value,
        null,
        "Program output is correct"
    );
});