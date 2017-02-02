/*jshint esversion: 6 */
"use strict";

class lua_State {

    constructor() {
        // CommonHeader;
        // unsigned short nci;  /* number of items in 'ci' list */
        // lu_byte status;
        // StkId top;  /* first free slot in the stack */
        // global_State *l_G;
        // CallInfo *ci;  /* call info for current function */
        // const Instruction *oldpc;  /* last pc traced */
        // StkId stack_last;  /* last free slot in the stack */
        // StkId stack;  /* stack base */
        // UpVal *openupval;  /* list of open upvalues in this stack */
        // GCObject *gclist;
        // struct lua_State *twups;   list of threads with open upvalues 
        // struct lua_longjmp *errorJmp;  /* current error recover point */
        // CallInfo base_ci;  /* CallInfo for first level (C calling Lua) */
        // volatile lua_Hook hook;
        // ptrdiff_t errfunc;  /* current error handling function (stack index) */
        // int stacksize;
        // int basehookcount;
        // int hookcount;
        // unsigned short nny;  /* number of non-yieldable calls in stack */
        // unsigned short nCcalls;  /* number of nested C calls */
        // l_signalT hookmask;
        // lu_byte allowhook;
    }

}

module.exports = {
    lua_State: lua_State
};