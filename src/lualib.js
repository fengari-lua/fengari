/*jshint esversion: 6 */
"use strict";

const assert = require('assert');
const lua    = require('./lua.js');


const LUA_VERSUFFIX = "_" + lua.LUA_VERSION_MAJOR + "_" + lua.LUA_VERSION_MINOR;


module.exports.LUA_VERSUFFIX = LUA_VERSUFFIX;