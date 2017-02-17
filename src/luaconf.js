/*jshint esversion: 6 */
"use strict";

/*
@@ LUAI_MAXSTACK limits the size of the Lua stack.
** CHANGE it if you need a different limit. This limit is arbitrary;
** its only purpose is to stop Lua from consuming unlimited stack
** space (and to reserve some numbers for pseudo-indices).
*/
const LUAI_MAXSTACK = 1000000;

module.exports.LUAI_MAXSTACK = LUAI_MAXSTACK;