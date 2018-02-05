/* @preserve
MIT License

Copyright © 2017-2018 Benoit Giannangeli
Copyright © 2017-2018 Daurnimator
Copyright © 1994–2017 Lua.org, PUC-Rio.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use strict";

const core = require("./fengaricore.js");

module.exports.FENGARI_AUTHORS         = core.FENGARI_AUTHORS;
module.exports.FENGARI_COPYRIGHT       = core.FENGARI_COPYRIGHT;
module.exports.FENGARI_RELEASE         = core.FENGARI_RELEASE;
module.exports.FENGARI_VERSION         = core.FENGARI_VERSION;
module.exports.FENGARI_VERSION_MAJOR   = core.FENGARI_VERSION_MAJOR;
module.exports.FENGARI_VERSION_MINOR   = core.FENGARI_VERSION_MINOR;
module.exports.FENGARI_VERSION_NUM     = core.FENGARI_VERSION_NUM;
module.exports.FENGARI_VERSION_RELEASE = core.FENGARI_VERSION_RELEASE;

module.exports.luastring_eq      = core.luastring_eq;
module.exports.luastring_indexOf = core.luastring_indexOf;
module.exports.luastring_of      = core.luastring_of;
module.exports.to_jsstring       = core.to_jsstring;
module.exports.to_luastring      = core.to_luastring;
module.exports.to_uristring      = core.to_uristring;

const lua      = require('./lua.js');
const lauxlib  = require('./lauxlib.js');
const lualib   = require('./lualib.js');

module.exports.lua     = lua;
module.exports.lauxlib = lauxlib;
module.exports.lualib  = lualib;
