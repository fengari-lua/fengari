(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["fengari"] = factory();
	else
		root["fengari"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 18);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = __webpack_require__(32);
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = function () {
  return function foo() {}.name === 'foo';
}();
function pToString(obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' + name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' + self.operator + ' ' + truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

    // 7.3 If the expected value is a RegExp object, the actual value is
    // equivalent if it is also a RegExp object with the same source and
    // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;

    // 7.4. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
  } else if ((actual === null || (typeof actual === 'undefined' ? 'undefined' : _typeof(actual)) !== 'object') && (expected === null || (typeof expected === 'undefined' ? 'undefined' : _typeof(expected)) !== 'object')) {
    return strict ? actual === expected : actual == expected;

    // If both values are instances of typed arrays, wrap their underlying
    // ArrayBuffers in a Buffer each to increase performance
    // This optimization requires the arrays to have the same type as checked by
    // Object.prototype.toString (aka pToString). Never perform binary
    // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
    // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) && pToString(actual) === pToString(expected) && !(actual instanceof Float32Array || actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer), new Uint8Array(expected.buffer)) === 0;

    // 7.5 For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || { actual: [], expected: [] };

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs) return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length) return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i]) return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects)) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') + (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if (isUnwantedException && userProvidedMessage && expectedException(actual, expected) || isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if (shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function (block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function (block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function (err) {
  if (err) throw err;
};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);
var luaconf = __webpack_require__(9);

// To avoid charCodeAt everywhere
var char = [];
for (var i = 0; i < 127; i++) {
    char[String.fromCharCode(i)] = i;
}module.exports.char = char;

/* mark for precompiled code ('<esc>Lua') */
var LUA_SIGNATURE = "\x1bLua";

var LUA_VERSION_MAJOR = "5";
var LUA_VERSION_MINOR = "3";
var LUA_VERSION_NUM = 503;
var LUA_VERSION_RELEASE = "4";

var LUA_VERSION = "Lua " + LUA_VERSION_MAJOR + "." + LUA_VERSION_MINOR;
var LUA_RELEASE = LUA_VERSION + "." + LUA_VERSION_RELEASE;
var LUA_COPYRIGHT = LUA_RELEASE + "  Copyright (C) 1994-2017 Lua.org, PUC-Rio";
var LUA_AUTHORS = "R. Ierusalimschy, L. H. de Figueiredo, W. Celes";

var FENGARI_VERSION_MAJOR = "0";
var FENGARI_VERSION_MINOR = "0";
var FENGARI_VERSION_NUM = 1;
var FENGARI_VERSION_RELEASE = "1";

var FENGARI_VERSION = "Fengari " + FENGARI_VERSION_MAJOR + "." + FENGARI_VERSION_MINOR;
var FENGARI_RELEASE = FENGARI_VERSION + "." + FENGARI_VERSION_RELEASE;
var FENGARI_AUTHORS = "B. Giannangeli, Daurnimator";
var FENGARI_COPYRIGHT = FENGARI_RELEASE + "  Copyright (C) 2017 " + FENGARI_AUTHORS + "\nBased on: " + LUA_COPYRIGHT;

var LUA_VERSUFFIX = "_" + LUA_VERSION_MAJOR + "_" + LUA_VERSION_MINOR;

var LUA_INIT_VAR = "LUA_INIT";
var LUA_INITVARVERSION = LUA_INIT_VAR + LUA_VERSUFFIX;

var thread_status = {
    LUA_OK: 0,
    LUA_YIELD: 1,
    LUA_ERRRUN: 2,
    LUA_ERRSYNTAX: 3,
    LUA_ERRMEM: 4,
    LUA_ERRGCMM: 5,
    LUA_ERRERR: 6
};

var constant_types = {
    LUA_TNONE: -1,
    LUA_TNIL: 0,
    LUA_TBOOLEAN: 1,
    LUA_TLIGHTUSERDATA: 2,
    LUA_TNUMBER: 3,
    LUA_TSTRING: 4,
    LUA_TTABLE: 5,
    LUA_TFUNCTION: 6,
    LUA_TUSERDATA: 7,
    LUA_TTHREAD: 8,
    LUA_NUMTAGS: 9
};

constant_types.LUA_TSHRSTR = constant_types.LUA_TSTRING | 0 << 4; /* short strings */
constant_types.LUA_TLNGSTR = constant_types.LUA_TSTRING | 1 << 4; /* long strings */

constant_types.LUA_TNUMFLT = constant_types.LUA_TNUMBER | 0 << 4; /* float numbers */
constant_types.LUA_TNUMINT = constant_types.LUA_TNUMBER | 1 << 4; /* integer numbers */

constant_types.LUA_TLCL = constant_types.LUA_TFUNCTION | 0 << 4; /* Lua closure */
constant_types.LUA_TLCF = constant_types.LUA_TFUNCTION | 1 << 4; /* light C function */
constant_types.LUA_TCCL = constant_types.LUA_TFUNCTION | 2 << 4; /* C closure */

var CT = constant_types;

/*
** Comparison and arithmetic functions
*/

var LUA_OPADD = 0; /* ORDER TM, ORDER OP */
var LUA_OPSUB = 1;
var LUA_OPMUL = 2;
var LUA_OPMOD = 3;
var LUA_OPPOW = 4;
var LUA_OPDIV = 5;
var LUA_OPIDIV = 6;
var LUA_OPBAND = 7;
var LUA_OPBOR = 8;
var LUA_OPBXOR = 9;
var LUA_OPSHL = 10;
var LUA_OPSHR = 11;
var LUA_OPUNM = 12;
var LUA_OPBNOT = 13;

var LUA_OPEQ = 0;
var LUA_OPLT = 1;
var LUA_OPLE = 2;

var LUA_MINSTACK = 20;

var LUA_REGISTRYINDEX = -luaconf.LUAI_MAXSTACK - 1000;

var lua_upvalueindex = function lua_upvalueindex(i) {
    return LUA_REGISTRYINDEX - i;
};

/* predefined values in the registry */
var LUA_RIDX_MAINTHREAD = 1;
var LUA_RIDX_GLOBALS = 2;
var LUA_RIDX_LAST = LUA_RIDX_GLOBALS;

var lua_Debug = function lua_Debug() {
    _classCallCheck(this, lua_Debug);

    this.event = NaN;
    this.name = null; /* (n) */
    this.namewhat = null; /* (n) 'global', 'local', 'field', 'method' */
    this.what = null; /* (S) 'Lua', 'C', 'main', 'tail' */
    this.source = null; /* (S) */
    this.currentline = NaN; /* (l) */
    this.linedefined = NaN; /* (S) */
    this.lastlinedefined = NaN; /* (S) */
    this.nups = NaN; /* (u) number of upvalues */
    this.nparams = NaN; /* (u) number of parameters */
    this.isvararg = NaN; /* (u) */
    this.istailcall = NaN; /* (t) */
    this.short_src = null; /* (S) */
    /* private part */
    this.i_ci = null; /* active function */
};

var is_luastring = function is_luastring(s) {
    return Array.isArray(s);
};

var to_jsstring = function to_jsstring(value, from, to) {
    assert(is_luastring(value), "jsstring expect a array of bytes");

    var u0 = void 0,
        u1 = void 0,
        u2 = void 0,
        u3 = void 0,
        u4 = void 0,
        u5 = void 0;
    var idx = 0;
    value = value.slice(from ? from : 0, to);

    var str = '';
    while (1) {
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
        u0 = value[idx++];
        if (u0 === 0) {
            str += "\0";continue;
        } // Lua string embed '\0'
        if (!u0) return str;
        if (!(u0 & 0x80)) {
            str += String.fromCharCode(u0);continue;
        }
        u1 = value[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);continue;
        }
        u2 = value[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
            u3 = value[idx++] & 63;
            if ((u0 & 0xF8) == 0xF0) {
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
            } else {
                u4 = value[idx++] & 63;
                if ((u0 & 0xFC) == 0xF8) {
                    u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
                } else {
                    u5 = value[idx++] & 63;
                    u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
                }
            }
        }
        if (u0 < 0x10000) {
            str += String.fromCharCode(u0);
        } else {
            var ch = u0 - 0x10000;
            str += String.fromCharCode(0xD800 | ch >> 10, 0xDC00 | ch & 0x3FF);
        }
    }
};

var to_luastring_cache = {};

var to_luastring = function to_luastring(str, cache) {
    assert(typeof str === "string", "to_luastring expect a js string");

    if (cache) {
        var cached = to_luastring_cache[str];
        if (is_luastring(cached)) return cached;
    }

    var outU8Array = [];
    var outIdx = 0;
    for (var _i = 0; _i < str.length; ++_i) {
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
        var u = str.codePointAt(_i);
        if (u >= 0xD800) _i++; // If it was a surrogate pair it used up two bytes
        if (u <= 0x7F) {
            outU8Array[outIdx++] = u;
        } else if (u <= 0x7FF) {
            outU8Array[outIdx++] = 0xC0 | u >> 6;
            outU8Array[outIdx++] = 0x80 | u & 63;
        } else if (u <= 0xFFFF) {
            outU8Array[outIdx++] = 0xE0 | u >> 12;
            outU8Array[outIdx++] = 0x80 | u >> 6 & 63;
            outU8Array[outIdx++] = 0x80 | u & 63;
        } else if (u <= 0x1FFFFF) {
            outU8Array[outIdx++] = 0xF0 | u >> 18;
            outU8Array[outIdx++] = 0x80 | u >> 12 & 63;
            outU8Array[outIdx++] = 0x80 | u >> 6 & 63;
            outU8Array[outIdx++] = 0x80 | u & 63;
        } else if (u <= 0x3FFFFFF) {
            outU8Array[outIdx++] = 0xF8 | u >> 24;
            outU8Array[outIdx++] = 0x80 | u >> 18 & 63;
            outU8Array[outIdx++] = 0x80 | u >> 12 & 63;
            outU8Array[outIdx++] = 0x80 | u >> 6 & 63;
            outU8Array[outIdx++] = 0x80 | u & 63;
        } else {
            outU8Array[outIdx++] = 0xFC | u >> 30;
            outU8Array[outIdx++] = 0x80 | u >> 24 & 63;
            outU8Array[outIdx++] = 0x80 | u >> 18 & 63;
            outU8Array[outIdx++] = 0x80 | u >> 12 & 63;
            outU8Array[outIdx++] = 0x80 | u >> 6 & 63;
            outU8Array[outIdx++] = 0x80 | u & 63;
        }
    }
    // Null-terminate the pointer to the buffer.
    // outU8Array[outIdx] = 0;

    if (cache) to_luastring_cache[str] = outU8Array;
    return outU8Array;
};

/*
** Event codes
*/
var LUA_HOOKCALL = 0;
var LUA_HOOKRET = 1;
var LUA_HOOKLINE = 2;
var LUA_HOOKCOUNT = 3;
var LUA_HOOKTAILCALL = 4;

/*
** Event masks
*/
var LUA_MASKCALL = 1 << LUA_HOOKCALL;
var LUA_MASKRET = 1 << LUA_HOOKRET;
var LUA_MASKLINE = 1 << LUA_HOOKLINE;
var LUA_MASKCOUNT = 1 << LUA_HOOKCOUNT;

/*
** LUA_PATH_SEP is the character that separates templates in a path.
** LUA_PATH_MARK is the string that marks the substitution points in a
** template.
** LUA_EXEC_DIR in a Windows path is replaced by the executable's
** directory.
*/
var LUA_PATH_SEP = ";";
module.exports.LUA_PATH_SEP = LUA_PATH_SEP;

var LUA_PATH_MARK = "?";
module.exports.LUA_PATH_MARK = LUA_PATH_MARK;

var LUA_EXEC_DIR = "!";
module.exports.LUA_EXEC_DIR = LUA_EXEC_DIR;

/*
@@ LUA_PATH_DEFAULT is the default path that Lua uses to look for
** Lua libraries.
@@ LUA_CPATH_DEFAULT is the default path that Lua uses to look for
** C libraries.
** CHANGE them if your machine has a non-conventional directory
** hierarchy or if you want to install your libraries in
** non-conventional directories.
*/
var LUA_VDIR = LUA_VERSION_MAJOR + "." + LUA_VERSION_MINOR;
module.exports.LUA_VDIR = LUA_VDIR;

if (true) {
    var LUA_DIRSEP = "/";
    module.exports.LUA_DIRSEP = LUA_DIRSEP;

    var LUA_LDIR = "./lua/" + LUA_VDIR + "/";
    module.exports.LUA_LDIR = LUA_LDIR;

    var LUA_CDIR = "./lua/" + LUA_VDIR + "/";
    module.exports.LUA_CDIR = LUA_CDIR;

    var LUA_PATH_DEFAULT = LUA_LDIR + "?.lua;" + LUA_LDIR + "?/init.lua;" + LUA_CDIR + "?.lua;" + LUA_CDIR + "?/init.lua;" + "./?.lua;./?/init.lua";
    module.exports.LUA_PATH_DEFAULT = LUA_PATH_DEFAULT;

    var LUA_CPATH_DEFAULT = LUA_CDIR + "?.js;" + LUA_CDIR + "loadall.js;./?.js";
    module.exports.LUA_CPATH_DEFAULT = LUA_CPATH_DEFAULT;
} else if (require('os').platform() === 'win32') {
    var _LUA_DIRSEP = "\\";
    module.exports.LUA_DIRSEP = _LUA_DIRSEP;

    /*
    ** In Windows, any exclamation mark ('!') in the path is replaced by the
    ** path of the directory of the executable file of the current process.
    */
    var _LUA_LDIR = "!\\lua\\";
    module.exports.LUA_LDIR = _LUA_LDIR;

    var _LUA_CDIR = "!\\";
    module.exports.LUA_CDIR = _LUA_CDIR;

    var LUA_SHRDIR = "!\\..\\share\\lua\\" + LUA_VDIR + "\\";
    module.exports.LUA_SHRDIR = LUA_SHRDIR;

    var _LUA_PATH_DEFAULT = _LUA_LDIR + "?.lua;" + _LUA_LDIR + "?\\init.lua;" + _LUA_CDIR + "?.lua;" + _LUA_CDIR + "?\\init.lua;" + LUA_SHRDIR + "?.lua;" + LUA_SHRDIR + "?\\init.lua;" + ".\\?.lua;.\\?\\init.lua";
    module.exports.LUA_PATH_DEFAULT = _LUA_PATH_DEFAULT;

    var _LUA_CPATH_DEFAULT = _LUA_CDIR + "?.dll;" + _LUA_CDIR + "..\\lib\\lua\\" + LUA_VDIR + "\\?.dll;" + _LUA_CDIR + "loadall.dll;.\\?.dll";
    module.exports.LUA_CPATH_DEFAULT = _LUA_CPATH_DEFAULT;
} else {
    var _LUA_DIRSEP2 = "/";
    module.exports.LUA_DIRSEP = _LUA_DIRSEP2;

    var LUA_ROOT = "/usr/local/";
    module.exports.LUA_ROOT = LUA_ROOT;

    var _LUA_LDIR2 = LUA_ROOT + "share/lua/" + LUA_VDIR + "/";
    module.exports.LUA_LDIR = _LUA_LDIR2;

    var _LUA_CDIR2 = LUA_ROOT + "lib/lua/" + LUA_VDIR + "/";
    module.exports.LUA_CDIR = _LUA_CDIR2;

    var _LUA_PATH_DEFAULT2 = _LUA_LDIR2 + "?.lua;" + _LUA_LDIR2 + "?/init.lua;" + _LUA_CDIR2 + "?.lua;" + _LUA_CDIR2 + "?/init.lua;" + "./?.lua;./?/init.lua";
    module.exports.LUA_PATH_DEFAULT = _LUA_PATH_DEFAULT2;

    var _LUA_CPATH_DEFAULT2 = _LUA_CDIR2 + "?.so;" + _LUA_CDIR2 + "loadall.so;./?.so";
    module.exports.LUA_CPATH_DEFAULT = _LUA_CPATH_DEFAULT2;
}

module.exports.CT = CT;
module.exports.FENGARI_AUTHORS = FENGARI_AUTHORS;
module.exports.FENGARI_COPYRIGHT = FENGARI_COPYRIGHT;
module.exports.FENGARI_RELEASE = FENGARI_RELEASE;
module.exports.FENGARI_VERSION = FENGARI_VERSION;
module.exports.FENGARI_VERSION_MAJOR = FENGARI_VERSION_MAJOR;
module.exports.FENGARI_VERSION_MINOR = FENGARI_VERSION_MINOR;
module.exports.FENGARI_VERSION_NUM = FENGARI_VERSION_NUM;
module.exports.FENGARI_VERSION_RELEASE = FENGARI_VERSION_RELEASE;
module.exports.LUA_AUTHORS = LUA_AUTHORS;
module.exports.LUA_COPYRIGHT = LUA_COPYRIGHT;
module.exports.LUA_HOOKCALL = LUA_HOOKCALL;
module.exports.LUA_HOOKCOUNT = LUA_HOOKCOUNT;
module.exports.LUA_HOOKLINE = LUA_HOOKLINE;
module.exports.LUA_HOOKRET = LUA_HOOKRET;
module.exports.LUA_HOOKTAILCALL = LUA_HOOKTAILCALL;
module.exports.LUA_INITVARVERSION = LUA_INITVARVERSION;
module.exports.LUA_INIT_VAR = LUA_INIT_VAR;
module.exports.LUA_MASKCALL = LUA_MASKCALL;
module.exports.LUA_MASKCOUNT = LUA_MASKCOUNT;
module.exports.LUA_MASKLINE = LUA_MASKLINE;
module.exports.LUA_MASKRET = LUA_MASKRET;
module.exports.LUA_MINSTACK = LUA_MINSTACK;
module.exports.LUA_MULTRET = -1;
module.exports.LUA_OPADD = LUA_OPADD;
module.exports.LUA_OPBAND = LUA_OPBAND;
module.exports.LUA_OPBNOT = LUA_OPBNOT;
module.exports.LUA_OPBOR = LUA_OPBOR;
module.exports.LUA_OPBXOR = LUA_OPBXOR;
module.exports.LUA_OPDIV = LUA_OPDIV;
module.exports.LUA_OPEQ = LUA_OPEQ;
module.exports.LUA_OPIDIV = LUA_OPIDIV;
module.exports.LUA_OPLE = LUA_OPLE;
module.exports.LUA_OPLT = LUA_OPLT;
module.exports.LUA_OPMOD = LUA_OPMOD;
module.exports.LUA_OPMUL = LUA_OPMUL;
module.exports.LUA_OPPOW = LUA_OPPOW;
module.exports.LUA_OPSHL = LUA_OPSHL;
module.exports.LUA_OPSHR = LUA_OPSHR;
module.exports.LUA_OPSUB = LUA_OPSUB;
module.exports.LUA_OPUNM = LUA_OPUNM;
module.exports.LUA_REGISTRYINDEX = LUA_REGISTRYINDEX;
module.exports.LUA_RELEASE = LUA_RELEASE;
module.exports.LUA_RIDX_GLOBALS = LUA_RIDX_GLOBALS;
module.exports.LUA_RIDX_LAST = LUA_RIDX_LAST;
module.exports.LUA_RIDX_MAINTHREAD = LUA_RIDX_MAINTHREAD;
module.exports.LUA_SIGNATURE = LUA_SIGNATURE;
module.exports.LUA_VERSION = LUA_VERSION;
module.exports.LUA_VERSION_MAJOR = LUA_VERSION_MAJOR;
module.exports.LUA_VERSION_MINOR = LUA_VERSION_MINOR;
module.exports.LUA_VERSION_NUM = LUA_VERSION_NUM;
module.exports.LUA_VERSION_RELEASE = LUA_VERSION_RELEASE;
module.exports.LUA_VERSUFFIX = LUA_VERSUFFIX;
module.exports.constant_types = constant_types;
module.exports.lua_Debug = lua_Debug;
module.exports.lua_upvalueindex = lua_upvalueindex;
module.exports.thread_status = thread_status;
module.exports.is_luastring = is_luastring;
module.exports.to_jsstring = to_jsstring;
module.exports.to_luastring = to_luastring;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defs = __webpack_require__(1);
var lapi = __webpack_require__(17);
var ldebug = __webpack_require__(10);
var ldo = __webpack_require__(6);
var lstate = __webpack_require__(12);

module.exports.FENGARI_AUTHORS = defs.FENGARI_AUTHORS;
module.exports.FENGARI_COPYRIGHT = defs.FENGARI_COPYRIGHT;
module.exports.FENGARI_RELEASE = defs.FENGARI_RELEASE;
module.exports.FENGARI_VERSION = defs.FENGARI_VERSION;
module.exports.FENGARI_VERSION_MAJOR = defs.FENGARI_VERSION_MAJOR;
module.exports.FENGARI_VERSION_MINOR = defs.FENGARI_VERSION_MINOR;
module.exports.FENGARI_VERSION_NUM = defs.FENGARI_VERSION_NUM;
module.exports.FENGARI_VERSION_RELEASE = defs.FENGARI_VERSION_RELEASE;
module.exports.LUA_AUTHORS = defs.LUA_AUTHORS;
module.exports.LUA_COPYRIGHT = defs.LUA_COPYRIGHT;
module.exports.LUA_ERRERR = defs.thread_status.LUA_ERRERR;
module.exports.LUA_ERRGCMM = defs.thread_status.LUA_ERRGCMM;
module.exports.LUA_ERRMEM = defs.thread_status.LUA_ERRMEM;
module.exports.LUA_ERRRUN = defs.thread_status.LUA_ERRRUN;
module.exports.LUA_ERRSYNTAX = defs.thread_status.LUA_ERRSYNTAX;
module.exports.LUA_HOOKCALL = defs.LUA_HOOKCALL;
module.exports.LUA_HOOKCOUNT = defs.LUA_HOOKCOUNT;
module.exports.LUA_HOOKLINE = defs.LUA_HOOKLINE;
module.exports.LUA_HOOKRET = defs.LUA_HOOKRET;
module.exports.LUA_HOOKTAILCALL = defs.LUA_HOOKTAILCALL;
module.exports.LUA_INITVARVERSION = defs.LUA_INITVARVERSION;
module.exports.LUA_INIT_VAR = defs.LUA_INIT_VAR;
module.exports.LUA_MASKCALL = defs.LUA_MASKCALL;
module.exports.LUA_MASKCOUNT = defs.LUA_MASKCOUNT;
module.exports.LUA_MASKLINE = defs.LUA_MASKLINE;
module.exports.LUA_MASKRET = defs.LUA_MASKRET;
module.exports.LUA_MINSTACK = defs.LUA_MINSTACK;
module.exports.LUA_MULTRET = defs.LUA_MULTRET;
module.exports.LUA_NUMTAGS = defs.LUA_NUMTAGS;
module.exports.LUA_OK = defs.thread_status.LUA_OK;
module.exports.LUA_OPADD = defs.LUA_OPADD;
module.exports.LUA_OPBAND = defs.LUA_OPBAND;
module.exports.LUA_OPBNOT = defs.LUA_OPBNOT;
module.exports.LUA_OPBOR = defs.LUA_OPBOR;
module.exports.LUA_OPBXOR = defs.LUA_OPBXOR;
module.exports.LUA_OPDIV = defs.LUA_OPDIV;
module.exports.LUA_OPEQ = defs.LUA_OPEQ;
module.exports.LUA_OPIDIV = defs.LUA_OPIDIV;
module.exports.LUA_OPLE = defs.LUA_OPLE;
module.exports.LUA_OPLT = defs.LUA_OPLT;
module.exports.LUA_OPMOD = defs.LUA_OPMOD;
module.exports.LUA_OPMUL = defs.LUA_OPMUL;
module.exports.LUA_OPPOW = defs.LUA_OPPOW;
module.exports.LUA_OPSHL = defs.LUA_OPSHL;
module.exports.LUA_OPSHR = defs.LUA_OPSHR;
module.exports.LUA_OPSUB = defs.LUA_OPSUB;
module.exports.LUA_OPUNM = defs.LUA_OPUNM;
module.exports.LUA_REGISTRYINDEX = defs.LUA_REGISTRYINDEX;
module.exports.LUA_RELEASE = defs.LUA_RELEASE;
module.exports.LUA_RIDX_GLOBALS = defs.LUA_RIDX_GLOBALS;
module.exports.LUA_RIDX_LAST = defs.LUA_RIDX_LAST;
module.exports.LUA_RIDX_MAINTHREAD = defs.LUA_RIDX_MAINTHREAD;
module.exports.LUA_SIGNATURE = defs.LUA_SIGNATURE;
module.exports.LUA_TNONE = defs.CT.LUA_TNONE;
module.exports.LUA_TNIL = defs.CT.LUA_TNIL;
module.exports.LUA_TBOOLEAN = defs.CT.LUA_TBOOLEAN;
module.exports.LUA_TLIGHTUSERDATA = defs.CT.LUA_TLIGHTUSERDATA;
module.exports.LUA_TNUMBER = defs.CT.LUA_TNUMBER;
module.exports.LUA_TSTRING = defs.CT.LUA_TSTRING;
module.exports.LUA_TTABLE = defs.CT.LUA_TTABLE;
module.exports.LUA_TFUNCTION = defs.CT.LUA_TFUNCTION;
module.exports.LUA_TUSERDATA = defs.CT.LUA_TUSERDATA;
module.exports.LUA_TTHREAD = defs.CT.LUA_TTHREAD;
module.exports.LUA_VERSION = defs.LUA_VERSION;
module.exports.LUA_VERSION_MAJOR = defs.LUA_VERSION_MAJOR;
module.exports.LUA_VERSION_MINOR = defs.LUA_VERSION_MINOR;
module.exports.LUA_VERSION_NUM = defs.LUA_VERSION_NUM;
module.exports.LUA_VERSION_RELEASE = defs.LUA_VERSION_RELEASE;
module.exports.LUA_VERSUFFIX = defs.LUA_VERSUFFIX;
module.exports.LUA_YIELD = defs.thread_status.LUA_YIELD;
module.exports.lua_Debug = defs.lua_Debug;
module.exports.lua_upvalueindex = defs.lua_upvalueindex;
module.exports.to_jsstring = defs.to_jsstring;
module.exports.to_luastring = defs.to_luastring;
module.exports.LUA_CDIR = defs.LUA_CDIR;
module.exports.LUA_CPATH_DEFAULT = defs.LUA_CPATH_DEFAULT;
module.exports.LUA_EXEC_DIR = defs.LUA_EXEC_DIR;
module.exports.LUA_LDIR = defs.LUA_LDIR;
module.exports.LUA_PATH_DEFAULT = defs.LUA_PATH_DEFAULT;
module.exports.LUA_PATH_MARK = defs.LUA_PATH_MARK;
module.exports.LUA_PATH_SEP = defs.LUA_PATH_SEP;
module.exports.LUA_ROOT = defs.LUA_ROOT;
module.exports.LUA_SHRDIR = defs.LUA_SHRDIR;
module.exports.LUA_VDIR = defs.LUA_VDIR;
module.exports.LUA_DIRSEP = defs.LUA_DIRSEP;
module.exports.lua_absindex = lapi.lua_absindex;
module.exports.lua_arith = lapi.lua_arith;
module.exports.lua_atpanic = lapi.lua_atpanic;
module.exports.lua_atnativeerror = lapi.lua_atnativeerror;
module.exports.lua_call = lapi.lua_call;
module.exports.lua_callk = lapi.lua_callk;
module.exports.lua_checkstack = lapi.lua_checkstack;
module.exports.lua_close = lstate.lua_close;
module.exports.lua_compare = lapi.lua_compare;
module.exports.lua_concat = lapi.lua_concat;
module.exports.lua_copy = lapi.lua_copy;
module.exports.lua_createtable = lapi.lua_createtable;
module.exports.lua_dump = lapi.lua_dump;
module.exports.lua_error = lapi.lua_error;
module.exports.lua_gc = lapi.lua_gc;
module.exports.lua_getallocf = lapi.lua_getallocf;
module.exports.lua_getextraspace = lapi.lua_getextraspace;
module.exports.lua_getfield = lapi.lua_getfield;
module.exports.lua_getglobal = lapi.lua_getglobal;
module.exports.lua_gethook = ldebug.lua_gethook;
module.exports.lua_gethookcount = ldebug.lua_gethookcount;
module.exports.lua_gethookmask = ldebug.lua_gethookmask;
module.exports.lua_geti = lapi.lua_geti;
module.exports.lua_getinfo = ldebug.lua_getinfo;
module.exports.lua_getlocal = ldebug.lua_getlocal;
module.exports.lua_getmetatable = lapi.lua_getmetatable;
module.exports.lua_getstack = ldebug.lua_getstack;
module.exports.lua_gettable = lapi.lua_gettable;
module.exports.lua_gettop = lapi.lua_gettop;
module.exports.lua_getupvalue = lapi.lua_getupvalue;
module.exports.lua_getuservalue = lapi.lua_getuservalue;
module.exports.lua_insert = lapi.lua_insert;
module.exports.lua_isboolean = lapi.lua_isboolean;
module.exports.lua_iscfunction = lapi.lua_iscfunction;
module.exports.lua_isfunction = lapi.lua_isfunction;
module.exports.lua_isinteger = lapi.lua_isinteger;
module.exports.lua_islightuserdata = lapi.lua_islightuserdata;
module.exports.lua_isnil = lapi.lua_isnil;
module.exports.lua_isnone = lapi.lua_isnone;
module.exports.lua_isnoneornil = lapi.lua_isnoneornil;
module.exports.lua_isnumber = lapi.lua_isnumber;
module.exports.lua_isproxy = lapi.lua_isproxy;
module.exports.lua_isstring = lapi.lua_isstring;
module.exports.lua_istable = lapi.lua_istable;
module.exports.lua_isthread = lapi.lua_isthread;
module.exports.lua_isuserdata = lapi.lua_isuserdata;
module.exports.lua_isyieldable = ldo.lua_isyieldable;
module.exports.lua_len = lapi.lua_len;
module.exports.lua_load = lapi.lua_load;
module.exports.lua_newstate = lstate.lua_newstate;
module.exports.lua_newtable = lapi.lua_newtable;
module.exports.lua_newthread = lstate.lua_newthread;
module.exports.lua_newuserdata = lapi.lua_newuserdata;
module.exports.lua_next = lapi.lua_next;
module.exports.lua_pcall = lapi.lua_pcall;
module.exports.lua_pcallk = lapi.lua_pcallk;
module.exports.lua_pop = lapi.lua_pop;
module.exports.lua_pushboolean = lapi.lua_pushboolean;
module.exports.lua_pushcclosure = lapi.lua_pushcclosure;
module.exports.lua_pushcfunction = lapi.lua_pushcfunction;
module.exports.lua_pushfstring = lapi.lua_pushfstring;
module.exports.lua_pushglobaltable = lapi.lua_pushglobaltable;
module.exports.lua_pushinteger = lapi.lua_pushinteger;
module.exports.lua_pushjsclosure = lapi.lua_pushjsclosure;
module.exports.lua_pushjsfunction = lapi.lua_pushjsfunction;
module.exports.lua_pushlightuserdata = lapi.lua_pushlightuserdata;
module.exports.lua_pushliteral = lapi.lua_pushliteral;
module.exports.lua_pushlstring = lapi.lua_pushlstring;
module.exports.lua_pushnil = lapi.lua_pushnil;
module.exports.lua_pushnumber = lapi.lua_pushnumber;
module.exports.lua_pushstring = lapi.lua_pushstring;
module.exports.lua_pushthread = lapi.lua_pushthread;
module.exports.lua_pushvalue = lapi.lua_pushvalue;
module.exports.lua_pushvfstring = lapi.lua_pushvfstring;
module.exports.lua_rawequal = lapi.lua_rawequal;
module.exports.lua_rawget = lapi.lua_rawget;
module.exports.lua_rawgeti = lapi.lua_rawgeti;
module.exports.lua_rawgetp = lapi.lua_rawgetp;
module.exports.lua_rawlen = lapi.lua_rawlen;
module.exports.lua_rawset = lapi.lua_rawset;
module.exports.lua_rawseti = lapi.lua_rawseti;
module.exports.lua_rawsetp = lapi.lua_rawsetp;
module.exports.lua_register = lapi.lua_register;
module.exports.lua_remove = lapi.lua_remove;
module.exports.lua_replace = lapi.lua_replace;
module.exports.lua_resume = ldo.lua_resume;
module.exports.lua_rotate = lapi.lua_rotate;
module.exports.lua_setallof = ldo.lua_setallof;
module.exports.lua_setfield = lapi.lua_setfield;
module.exports.lua_setglobal = lapi.lua_setglobal;
module.exports.lua_sethook = ldebug.lua_sethook;
module.exports.lua_seti = lapi.lua_seti;
module.exports.lua_setlocal = ldebug.lua_setlocal;
module.exports.lua_setmetatable = lapi.lua_setmetatable;
module.exports.lua_settable = lapi.lua_settable;
module.exports.lua_settop = lapi.lua_settop;
module.exports.lua_setupvalue = lapi.lua_setupvalue;
module.exports.lua_setuservalue = lapi.lua_setuservalue;
module.exports.lua_status = lapi.lua_status;
module.exports.lua_stringtonumber = lapi.lua_stringtonumber;
module.exports.lua_toboolean = lapi.lua_toboolean;
module.exports.lua_todataview = lapi.lua_todataview;
module.exports.lua_tointeger = lapi.lua_tointeger;
module.exports.lua_tointegerx = lapi.lua_tointegerx;
module.exports.lua_tojsstring = lapi.lua_tojsstring;
module.exports.lua_toljsstring = lapi.lua_toljsstring;
module.exports.lua_tolstring = lapi.lua_tolstring;
module.exports.lua_tonumber = lapi.lua_tonumber;
module.exports.lua_tonumberx = lapi.lua_tonumberx;
module.exports.lua_topointer = lapi.lua_topointer;
module.exports.lua_toproxy = lapi.lua_toproxy;
module.exports.lua_tostring = lapi.lua_tostring;
module.exports.lua_tothread = lapi.lua_tothread;
module.exports.lua_touserdata = lapi.lua_touserdata;
module.exports.lua_type = lapi.lua_type;
module.exports.lua_typename = lapi.lua_typename;
module.exports.lua_upvalueid = lapi.lua_upvalueid;
module.exports.lua_upvaluejoin = lapi.lua_upvaluejoin;
module.exports.lua_version = lapi.lua_version;
module.exports.lua_xmove = lapi.lua_xmove;
module.exports.lua_yield = ldo.lua_yield;
module.exports.lua_yieldk = ldo.lua_yieldk;
module.exports.lua_tocfunction = lapi.lua_tocfunction;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var ljstype = __webpack_require__(20);
var ldebug = __webpack_require__(10);
var ldo = __webpack_require__(6);
var lfunc = __webpack_require__(11);
var lstate = __webpack_require__(12);
var lstring = __webpack_require__(8);
var ltable = __webpack_require__(7);
var luaconf = __webpack_require__(9);
var lvm = __webpack_require__(14);
var llimit = __webpack_require__(4);
var ltm = __webpack_require__(13);
var CT = defs.constant_types;
var char = defs.char;

var LUA_TPROTO = CT.LUA_NUMTAGS;
var LUA_TDEADKEY = CT.LUA_NUMTAGS + 1;

var TValue = function () {
    function TValue(type, value) {
        _classCallCheck(this, TValue);

        this.type = type;
        this.value = value;
    }

    /* type tag of a TValue (bits 0-3 for tags + variant bits 4-5) */


    _createClass(TValue, [{
        key: 'ttype',
        value: function ttype() {
            return this.type & 0x3F;
        }

        /* type tag of a TValue with no variants (bits 0-3) */

    }, {
        key: 'ttnov',
        value: function ttnov() {
            return this.type & 0x0F;
        }
    }, {
        key: 'checktag',
        value: function checktag(t) {
            return this.type === t;
        }
    }, {
        key: 'checktype',
        value: function checktype(t) {
            return this.ttnov() === t;
        }
    }, {
        key: 'ttisnumber',
        value: function ttisnumber() {
            return this.checktype(CT.LUA_TNUMBER);
        }
    }, {
        key: 'ttisfloat',
        value: function ttisfloat() {
            return this.checktag(CT.LUA_TNUMFLT);
        }
    }, {
        key: 'ttisinteger',
        value: function ttisinteger() {
            return this.checktag(CT.LUA_TNUMINT);
        }
    }, {
        key: 'ttisnil',
        value: function ttisnil() {
            return this.checktag(CT.LUA_TNIL);
        }
    }, {
        key: 'ttisboolean',
        value: function ttisboolean() {
            return this.checktag(CT.LUA_TBOOLEAN);
        }
    }, {
        key: 'ttislightuserdata',
        value: function ttislightuserdata() {
            return this.checktag(CT.LUA_TLIGHTUSERDATA);
        }
    }, {
        key: 'ttisstring',
        value: function ttisstring() {
            return this.checktype(CT.LUA_TSTRING);
        }
    }, {
        key: 'ttisshrstring',
        value: function ttisshrstring() {
            return this.checktag(CT.LUA_TSHRSTR);
        }
    }, {
        key: 'ttislngstring',
        value: function ttislngstring() {
            return this.checktag(CT.LUA_TLNGSTR);
        }
    }, {
        key: 'ttistable',
        value: function ttistable() {
            return this.checktag(CT.LUA_TTABLE);
        }
    }, {
        key: 'ttisfunction',
        value: function ttisfunction() {
            return this.checktype(CT.LUA_TFUNCTION);
        }
    }, {
        key: 'ttisclosure',
        value: function ttisclosure() {
            return (this.type & 0x1F) === CT.LUA_TFUNCTION;
        }
    }, {
        key: 'ttisCclosure',
        value: function ttisCclosure() {
            return this.checktag(CT.LUA_TCCL);
        }
    }, {
        key: 'ttisLclosure',
        value: function ttisLclosure() {
            return this.checktag(CT.LUA_TLCL);
        }
    }, {
        key: 'ttislcf',
        value: function ttislcf() {
            return this.checktag(CT.LUA_TLCF);
        }
    }, {
        key: 'ttisfulluserdata',
        value: function ttisfulluserdata() {
            return this.checktag(CT.LUA_TUSERDATA);
        }
    }, {
        key: 'ttisthread',
        value: function ttisthread() {
            return this.checktag(CT.LUA_TTHREAD);
        }
    }, {
        key: 'ttisdeadkey',
        value: function ttisdeadkey() {
            return this.checktag(LUA_TDEADKEY);
        }
    }, {
        key: 'l_isfalse',
        value: function l_isfalse() {
            return this.ttisnil() || this.ttisboolean() && this.value === false;
        }
    }, {
        key: 'setfltvalue',
        value: function setfltvalue(x) {
            this.type = CT.LUA_TNUMFLT;
            this.value = x;
        }
    }, {
        key: 'chgfltvalue',
        value: function chgfltvalue(x) {
            assert(this.type == CT.LUA_TNUMFLT);
            this.value = x;
        }
    }, {
        key: 'setivalue',
        value: function setivalue(x) {
            this.type = CT.LUA_TNUMINT;
            this.value = x;
        }
    }, {
        key: 'chgivalue',
        value: function chgivalue(x) {
            assert(this.type == CT.LUA_TNUMINT);
            this.value = x;
        }
    }, {
        key: 'setnilvalue',
        value: function setnilvalue() {
            this.type = CT.LUA_TNIL;
            this.value = void 0;
        }
    }, {
        key: 'setfvalue',
        value: function setfvalue(x) {
            this.type = CT.LUA_TLCF;
            this.value = x;
        }
    }, {
        key: 'setpvalue',
        value: function setpvalue(x) {
            this.type = CT.LUA_TLIGHTUSERDATA;
            this.value = x;
        }
    }, {
        key: 'setbvalue',
        value: function setbvalue(x) {
            this.type = CT.LUA_TBOOLEAN;
            this.value = x;
        }
    }, {
        key: 'setsvalue',
        value: function setsvalue(x) {
            this.type = CT.LUA_TLNGSTR; /* LUA_TSHRSTR? */
            this.value = x;
        }
    }, {
        key: 'setuvalue',
        value: function setuvalue(x) {
            this.type = CT.LUA_TUSERDATA;
            this.value = x;
        }
    }, {
        key: 'setthvalue',
        value: function setthvalue(x) {
            this.type = CT.LUA_TTHREAD;
            this.value = x;
        }
    }, {
        key: 'setclLvalue',
        value: function setclLvalue(x) {
            this.type = CT.LUA_TLCL;
            this.value = x;
        }
    }, {
        key: 'setclCvalue',
        value: function setclCvalue(x) {
            this.type = CT.LUA_TCCL;
            this.value = x;
        }
    }, {
        key: 'sethvalue',
        value: function sethvalue(x) {
            this.type = CT.LUA_TTABLE;
            this.value = x;
        }
    }, {
        key: 'setdeadvalue',
        value: function setdeadvalue() {
            this.type = LUA_TDEADKEY;
            this.value = null;
        }
    }, {
        key: 'setfrom',
        value: function setfrom(tv) {
            /* in lua C source setobj2t is often used for this */
            this.type = tv.type;
            this.value = tv.value;
        }
    }, {
        key: 'tsvalue',
        value: function tsvalue() {
            assert(this.ttisstring());
            return this.value;
        }
    }, {
        key: 'svalue',
        value: function svalue() {
            return this.tsvalue().getstr();
        }
    }, {
        key: 'vslen',
        value: function vslen() {
            return this.tsvalue().tsslen();
        }
    }, {
        key: 'jsstring',
        value: function jsstring(from, to) {
            return defs.to_jsstring(this.svalue(), from, to);
        }
    }]);

    return TValue;
}();

var pushobj2s = function pushobj2s(L, tv) {
    L.stack[L.top++] = new TValue(tv.type, tv.value);
};
var pushsvalue2s = function pushsvalue2s(L, ts) {
    L.stack[L.top++] = new TValue(CT.LUA_TLNGSTR, ts);
};
/* from stack to (same) stack */
var setobjs2s = function setobjs2s(L, newidx, oldidx) {
    L.stack[newidx].setfrom(L.stack[oldidx]);
};
/* to stack (not from same stack) */
var setobj2s = function setobj2s(L, newidx, oldtv) {
    L.stack[newidx].setfrom(oldtv);
};
var setsvalue2s = function setsvalue2s(L, newidx, ts) {
    L.stack[newidx].setsvalue(ts);
};

var luaO_nilobject = new TValue(CT.LUA_TNIL, null);
Object.freeze(luaO_nilobject);
module.exports.luaO_nilobject = luaO_nilobject;

var LClosure = function LClosure(L, n) {
    _classCallCheck(this, LClosure);

    this.id = L.l_G.id_counter++;

    this.p = null;
    this.nupvalues = n;
    this.upvals = new Array(n); /* list of upvalues as UpVals. initialised in luaF_initupvals */
};

var CClosure = function CClosure(L, f, n) {
    _classCallCheck(this, CClosure);

    this.id = L.l_G.id_counter++;

    this.f = f;
    this.nupvalues = n;
    this.upvalue = new Array(n); /* list of upvalues as TValues */
    while (n--) {
        this.upvalue[n] = new TValue(CT.LUA_TNIL, null);
    }
};

var Udata = function Udata(L, size) {
    _classCallCheck(this, Udata);

    this.id = L.l_G.id_counter++;

    this.metatable = null;
    this.uservalue = new TValue(CT.LUA_TNIL, null);
    this.len = size;
    this.data = Object.create(null); // ignores size argument
};

/*
** Description of a local variable for function prototypes
** (used for debug information)
*/


var LocVar = function LocVar() {
    _classCallCheck(this, LocVar);

    this.varname = null;
    this.startpc = NaN; /* first point where variable is active */
    this.endpc = NaN; /* first point where variable is dead */
};

var RETS = defs.to_luastring("...", true);
var PRE = defs.to_luastring("[string \"");
var POS = defs.to_luastring("\"]");

var luaO_chunkid = function luaO_chunkid(source, bufflen) {
    var l = source.length;
    var out = void 0;
    if (source[0] === char['=']) {
        /* 'literal' source */
        if (l < bufflen) /* small enough? */
            out = source.slice(1);else {
            /* truncate it */
            out = source.slice(1, bufflen);
        }
    } else if (source[0] === char['@']) {
        /* file name */
        if (l <= bufflen) /* small enough? */
            out = source.slice(1);else {
            /* add '...' before rest of name */
            bufflen -= RETS.length;
            out = RETS.concat(source.slice(1 + l - bufflen));
        }
    } else {
        /* string; format as [string "source"] */
        var nli = source.indexOf(char['\n']); /* find first new line (if any) */
        out = PRE; /* add prefix */
        bufflen -= PRE.length + RETS.length + POS.length + 1; /* save space for prefix+suffix+'\0' */
        if (l < bufflen && nli === -1) {
            /* small one-line source? */
            out = out.concat(source, POS); /* keep it */
        } else {
            if (nli !== -1) l = nli; /* stop at first newline */
            if (l > bufflen) l = bufflen;
            out = out.concat(source.slice(0, l), RETS, POS);
        }
    }
    return out;
};

var luaO_hexavalue = function luaO_hexavalue(c) {
    if (ljstype.lisdigit(c)) return c - char['0'];else return String.fromCharCode(c).toLowerCase().charCodeAt(0) - char['a'] + 10;
};

var UTF8BUFFSZ = 8;

var luaO_utf8desc = function luaO_utf8desc(buff, x) {
    var n = 1; /* number of bytes put in buffer (backwards) */
    assert(x <= 0x10FFFF);
    if (x < 0x80) /* ascii? */
        buff[UTF8BUFFSZ - 1] = x;else {
        /* need continuation bytes */
        var mfb = 0x3f; /* maximum that fits in first byte */
        do {
            buff[UTF8BUFFSZ - n++] = 0x80 | x & 0x3f;
            x >>= 6; /* remove added bits */
            mfb >>= 1; /* now there is one less bit available in first byte */
        } while (x > mfb); /* still needs continuation byte? */
        buff[UTF8BUFFSZ - n] = ~mfb << 1 | x; /* add first byte */
    }
    return n;
};

/* maximum number of significant digits to read (to avoid overflows
   even with single floats) */
var MAXSIGDIG = 30;

/*
** convert an hexadecimal numeric string to a number, following
** C99 specification for 'strtod'
*/
var lua_strx2number = function lua_strx2number(s) {
    var i = 0;
    var dot = char[luaconf.lua_getlocaledecpoint()];
    var r = 0.0; /* result (accumulator) */
    var sigdig = 0; /* number of significant digits */
    var nosigdig = 0; /* number of non-significant digits */
    var e = 0; /* exponent correction */
    var neg = void 0; /* 1 if number is negative */
    var hasdot = false; /* true after seen a dot */
    while (ljstype.lisspace(s[i])) {
        i++;
    } /* skip initial spaces */
    if (neg = s[i] === char['-']) i++; /* check signal */
    else if (s[i] === char['+']) i++;
    if (!(s[i] === char['0'] && (s[i + 1] === char['x'] || s[i + 1] === char['X']))) /* check '0x' */
        return null; /* invalid format (no '0x') */
    for (i += 2;; i++) {
        /* skip '0x' and read numeral */
        if (s[i] === dot) {
            if (hasdot) break; /* second dot? stop loop */
            else hasdot = true;
        } else if (ljstype.lisxdigit(s[i])) {
            if (sigdig === 0 && s[i] === char['0']) /* non-significant digit (zero)? */
                nosigdig++;else if (++sigdig <= MAXSIGDIG) /* can read it without overflow? */
                r = r * 16 + luaO_hexavalue(s[i]);else e++; /* too many digits; ignore, but still count for exponent */
            if (hasdot) e--; /* decimal digit? correct exponent */
        } else break; /* neither a dot nor a digit */
    }

    if (nosigdig + sigdig === 0) /* no digits? */
        return null; /* invalid format */
    e *= 4; /* each digit multiplies/divides value by 2^4 */
    if (s[i] === char['p'] || s[i] === char['P']) {
        /* exponent part? */
        var exp1 = 0; /* exponent value */
        var neg1 = void 0; /* exponent signal */
        i++; /* skip 'p' */
        if (neg1 = s[i] === char['-']) i++; /* signal */
        else if (s[i] === char['+']) i++;
        if (!ljstype.lisdigit(s[i])) return null; /* invalid; must have at least one digit */
        while (ljstype.lisdigit(s[i])) {
            /* read exponent */
            exp1 = exp1 * 10 + s[i++] - char['0'];
        }if (neg1) exp1 = -exp1;
        e += exp1;
    }
    if (neg) r = -r;
    while (ljstype.lisspace(s[i])) {
        i++;
    } /* skip trailing spaces */
    return i === s.length ? luaconf.ldexp(r, e) : null; /* Only valid if nothing left is s*/
};

var lua_str2number = function lua_str2number(s) {
    /* parseFloat ignores trailing junk, validate with regex first */
    var str = defs.to_jsstring(s);
    if (!/^[\t\v\f \n\r]*[\+\-]?([0-9]+\.?[0-9]*|\.[0-9]*)([eE][\+\-]?[0-9]+)?[\t\v\f \n\r]*$/.test(str)) return null;
    var flt = parseFloat(str);
    return !isNaN(flt) ? flt : null;
};

var l_str2dloc = function l_str2dloc(s, mode) {
    return mode === 'x' ? lua_strx2number(s) : lua_str2number(s);
};

var l_str2d = function l_str2d(s) {
    var pidx = /[.xXnN]/g.exec(String.fromCharCode.apply(String, _toConsumableArray(s)));
    pidx = pidx ? pidx.index : null;
    var pmode = pidx ? s[pidx] : null;
    var mode = pmode ? String.fromCharCode(pmode).toLowerCase() : 0;
    if (mode === 'n') /* reject 'inf' and 'nan' */
        return null;
    var end = l_str2dloc(s, mode); /* try to convert */
    if (end === null) {/* failed? may be a different locale */
        // throw new Error("Locale not available to handle number"); // TODO
    }
    return end;
};

var MAXBY10 = Math.floor(llimit.MAX_INT / 10);
var MAXLASTD = llimit.MAX_INT % 10;

var l_str2int = function l_str2int(s) {
    var i = 0;
    var a = 0;
    var empty = true;
    var neg = void 0;

    while (ljstype.lisspace(s[i])) {
        i++;
    } /* skip initial spaces */
    if (neg = s[i] === char['-']) i++;else if (s[i] === char['+']) i++;
    if (s[i] === char['0'] && (s[i + 1] === char['x'] || s[i + 1] === char['X'])) {
        /* hex? */
        i += 2; /* skip '0x' */

        for (; ljstype.lisxdigit(s[i]); i++) {
            a = a * 16 + luaO_hexavalue(s[i]) | 0;
            empty = false;
        }
    } else {
        /* decimal */
        for (; ljstype.lisdigit(s[i]); i++) {
            var d = s[i] - char['0'];
            if (a >= MAXBY10 && (a > MAXBY10 || d > MAXLASTD + neg)) /* overflow? */
                return null; /* do not accept it (as integer) */
            a = a * 10 + d | 0;
            empty = false;
        }
    }
    while (ljstype.lisspace(s[i])) {
        i++;
    } /* skip trailing spaces */
    if (empty || i !== s.length) return null; /* something wrong in the numeral */
    else {
            return (neg ? -a : a) | 0;
        }
};

var luaO_str2num = function luaO_str2num(s) {
    var s2i = l_str2int(s);

    if (s2i !== null) {
        /* try as an integer */
        return new TValue(CT.LUA_TNUMINT, s2i);
    } else {
        /* else try as a float */
        s2i = l_str2d(s);

        if (s2i !== null) {
            return new TValue(CT.LUA_TNUMFLT, s2i);
        } else return false; /* conversion failed */
    }
};

var luaO_utf8esc = function luaO_utf8esc(x) {
    var buff = [];
    var n = 1; /* number of bytes put in buffer (backwards) */
    assert(x <= 0x10ffff);
    if (x < 0x80) /* ascii? */
        buff[UTF8BUFFSZ - 1] = x;else {
        /* need continuation bytes */
        var mfb = 0x3f; /* maximum that fits in first byte */
        do {
            /* add continuation bytes */
            buff[UTF8BUFFSZ - n++] = 0x80 | x & 0x3f;
            x >>= 6; /* remove added bits */
            mfb >>= 1; /* now there is one less bit available in first byte */
        } while (x > mfb); /* still needs continuation byte? */
        buff[UTF8BUFFSZ - n] = ~mfb << 1 | x; /* add first byte */
    }
    return {
        buff: buff,
        n: n
    };
};

/* this currently returns new TValue instead of modifying */
var luaO_tostring = function luaO_tostring(L, obj) {
    var buff = void 0;
    if (obj.ttisinteger()) buff = defs.to_luastring(luaconf.lua_integer2str(obj.value));else {
        var str = luaconf.lua_number2str(obj.value);
        buff = defs.to_luastring(str);
        // Assume no LUA_COMPAT_FLOATSTRING
        if (/^[-0123456789]+$/.test(str)) {
            /* looks like an int? */
            buff.push(char[luaconf.lua_getlocaledecpoint()]);
            buff.push(char['0']); /* adds '.0' to result */
        }
    }
    obj.setsvalue(lstring.luaS_bless(L, buff));
};

var pushstr = function pushstr(L, str) {
    ldo.luaD_inctop(L);
    setsvalue2s(L, L.top - 1, lstring.luaS_new(L, str));
};

var luaO_pushvfstring = function luaO_pushvfstring(L, fmt, argp) {
    var n = 0;
    var i = 0;
    var a = 0;
    var e = void 0;
    while (1) {
        e = fmt.indexOf(char['%'], i);
        if (e == -1) break;
        pushstr(L, fmt.slice(i, e));
        switch (fmt[e + 1]) {
            case char['s']:
                var s = argp[a++];
                if (s === null) s = defs.to_luastring("(null)", true);
                pushstr(L, s);
                break;
            case char['c']:
                var buff = argp[a++];
                if (ljstype.lisprint(buff)) pushstr(L, [buff]);else luaO_pushfstring(L, defs.to_luastring("<\\%d>", true), buff);
                break;
            case char['d']:
            case char['I']:
                ldo.luaD_inctop(L);
                L.stack[L.top - 1].setivalue(argp[a++]);
                luaO_tostring(L, L.stack[L.top - 1]);
                break;
            case char['f']:
                ldo.luaD_inctop(L);
                L.stack[L.top - 1].setfltvalue(argp[a++]);
                luaO_tostring(L, L.stack[L.top - 1]);
                break;
            case char['p']:
                var v = argp[a++];
                if (v instanceof lstate.lua_State || v instanceof ltable.Table || v instanceof Udata || v instanceof LClosure || v instanceof CClosure || v instanceof lfunc.UpVal) {
                    pushstr(L, defs.to_luastring("0x" + v.id.toString(16)));
                } else {
                    /* user provided object. no id available */
                    pushstr(L, defs.to_luastring("<id NYI>"));
                }
                break;
            case char['U']:
                pushstr(L, defs.to_luastring(String.fromCodePoint(argp[a++])));
                break;
            case char['%']:
                pushstr(L, [char['%']]);
                break;
            default:
                {
                    ldebug.luaG_runerror(L, defs.to_luastring("invalid option '%%%c' to 'lua_pushfstring'"), fmt[e + 1]);
                }
        }
        n += 2;
        i = e + 2;
    }
    ldo.luaD_checkstack(L, 1);
    pushstr(L, fmt.slice(i));
    if (n > 0) lvm.luaV_concat(L, n + 1);
    return L.stack[L.top - 1].svalue();
};

var luaO_pushfstring = function luaO_pushfstring(L, fmt) {
    for (var _len = arguments.length, argp = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        argp[_key - 2] = arguments[_key];
    }

    return luaO_pushvfstring(L, fmt, argp);
};

/*
** converts an integer to a "floating point byte", represented as
** (eeeeexxx), where the real value is (1xxx) * 2^(eeeee - 1) if
** eeeee !== 0 and (xxx) otherwise.
*/
var luaO_int2fb = function luaO_int2fb(x) {
    var e = 0; /* exponent */
    if (x < 8) return x;
    while (x >= 8 << 4) {
        /* coarse steps */
        x = x + 0xf >> 4; /* x = ceil(x / 16) */
        e += 4;
    }
    while (x >= 8 << 1) {
        /* fine steps */
        x = x + 1 >> 1; /* x = ceil(x / 2) */
        e++;
    }
    return e + 1 << 3 | x - 8;
};

var intarith = function intarith(L, op, v1, v2) {
    switch (op) {
        case defs.LUA_OPADD:
            return v1 + v2 | 0;
        case defs.LUA_OPSUB:
            return v1 - v2 | 0;
        case defs.LUA_OPMUL:
            return Math.imul(v1, v2);
        case defs.LUA_OPMOD:
            return lvm.luaV_mod(L, v1, v2);
        case defs.LUA_OPIDIV:
            return lvm.luaV_div(L, v1, v2);
        case defs.LUA_OPBAND:
            return v1 & v2;
        case defs.LUA_OPBOR:
            return v1 | v2;
        case defs.LUA_OPBXOR:
            return v1 ^ v2;
        case defs.LUA_OPSHL:
            return lvm.luaV_shiftl(v1, v2);
        case defs.LUA_OPSHR:
            return lvm.luaV_shiftl(v1, -v2);
        case defs.LUA_OPUNM:
            return 0 - v1 | 0;
        case defs.LUA_OPBNOT:
            return ~0 ^ v1;
        default:
            assert(0);
    }
};

var numarith = function numarith(L, op, v1, v2) {
    switch (op) {
        case defs.LUA_OPADD:
            return v1 + v2;
        case defs.LUA_OPSUB:
            return v1 - v2;
        case defs.LUA_OPMUL:
            return v1 * v2;
        case defs.LUA_OPDIV:
            return v1 / v2;
        case defs.LUA_OPPOW:
            return Math.pow(v1, v2);
        case defs.LUA_OPIDIV:
            return Math.floor(v1 / v2);
        case defs.LUA_OPUNM:
            return -v1;
        case defs.LUA_OPMOD:
            return llimit.luai_nummod(L, v1, v2);
        default:
            assert(0);
    }
};

var luaO_arith = function luaO_arith(L, op, p1, p2, p3) {
    var res = typeof p3 === "number" ? L.stack[p3] : p3; /* FIXME */

    switch (op) {
        case defs.LUA_OPBAND:case defs.LUA_OPBOR:case defs.LUA_OPBXOR:
        case defs.LUA_OPSHL:case defs.LUA_OPSHR:
        case defs.LUA_OPBNOT:
            {
                /* operate only on integers */
                var i1 = void 0,
                    i2 = void 0;
                if ((i1 = lvm.tointeger(p1)) !== false && (i2 = lvm.tointeger(p2)) !== false) {
                    res.setivalue(intarith(L, op, i1, i2));
                    return;
                } else break; /* go to the end */
            }
        case defs.LUA_OPDIV:case defs.LUA_OPPOW:
            {
                /* operate only on floats */
                var n1 = void 0,
                    n2 = void 0;
                if ((n1 = lvm.tonumber(p1)) !== false && (n2 = lvm.tonumber(p2)) !== false) {
                    res.setfltvalue(numarith(L, op, n1, n2));
                    return;
                } else break; /* go to the end */
            }
        default:
            {
                /* other operations */
                var _n = void 0,
                    _n2 = void 0;
                if (p1.ttisinteger() && p2.ttisinteger()) {
                    res.setivalue(intarith(L, op, p1.value, p2.value));
                    return;
                } else if ((_n = lvm.tonumber(p1)) !== false && (_n2 = lvm.tonumber(p2)) !== false) {
                    res.setfltvalue(numarith(L, op, _n, _n2));
                    return;
                } else break; /* go to the end */
            }
    }
    /* could not perform raw operation; try metamethod */
    assert(L !== null); /* should not fail when folding (compile time) */
    ltm.luaT_trybinTM(L, p1, p2, p3, op - defs.LUA_OPADD + ltm.TMS.TM_ADD);
};

module.exports.CClosure = CClosure;
module.exports.LClosure = LClosure;
module.exports.LUA_TDEADKEY = LUA_TDEADKEY;
module.exports.LUA_TPROTO = LUA_TPROTO;
module.exports.LocVar = LocVar;
module.exports.TValue = TValue;
module.exports.Udata = Udata;
module.exports.UTF8BUFFSZ = UTF8BUFFSZ;
module.exports.luaO_arith = luaO_arith;
module.exports.luaO_chunkid = luaO_chunkid;
module.exports.luaO_hexavalue = luaO_hexavalue;
module.exports.luaO_int2fb = luaO_int2fb;
module.exports.luaO_pushfstring = luaO_pushfstring;
module.exports.luaO_pushvfstring = luaO_pushvfstring;
module.exports.luaO_str2num = luaO_str2num;
module.exports.luaO_tostring = luaO_tostring;
module.exports.luaO_utf8desc = luaO_utf8desc;
module.exports.luaO_utf8esc = luaO_utf8esc;
module.exports.numarith = numarith;
module.exports.pushobj2s = pushobj2s;
module.exports.pushsvalue2s = pushsvalue2s;
module.exports.setobjs2s = setobjs2s;
module.exports.setobj2s = setobj2s;
module.exports.setsvalue2s = setsvalue2s;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LUAI_MAXCCALLS = 200;
module.exports.LUAI_MAXCCALLS = LUAI_MAXCCALLS;
var LUA_MAXINTEGER = 2147483647;
module.exports.LUA_MAXINTEGER = LUA_MAXINTEGER;
var LUA_MININTEGER = -2147483648;
module.exports.LUA_MININTEGER = LUA_MININTEGER;

var luai_nummod = function luai_nummod(L, a, b) {
    var m = a % b;
    if (m * b < 0) m += b;
    return m;
};
module.exports.luai_nummod = luai_nummod;

// If later integers are more than 32bit, LUA_MAXINTEGER will then be != MAX_INT
var MAX_INT = 2147483647;
module.exports.MAX_INT = MAX_INT;
var MIN_INT = -2147483648;
module.exports.MIN_INT = MIN_INT;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lua = __webpack_require__(2);

/* key, in the registry, for table of loaded modules */
var LUA_LOADED_TABLE = "_LOADED";

/* key, in the registry, for table of preloaded loaders */
var LUA_PRELOAD_TABLE = "_PRELOAD";

var LUA_FILEHANDLE = lua.to_luastring("FILE*", true);

var LUAL_NUMSIZES = 4 * 16 + 8;

var luaL_Buffer = function luaL_Buffer() {
    _classCallCheck(this, luaL_Buffer);

    this.b = null;
    this.L = null;
};

var LEVELS1 = 10; /* size of the first part of the stack */
var LEVELS2 = 11; /* size of the second part of the stack */

/*
** search for 'objidx' in table at index -1.
** return 1 + string at top if find a good name.
*/
var findfield = function findfield(L, objidx, level) {
    if (level === 0 || !lua.lua_istable(L, -1)) return 0; /* not found */

    lua.lua_pushnil(L); /* start 'next' loop */

    while (lua.lua_next(L, -2)) {
        /* for each pair in table */
        if (lua.lua_type(L, -2) === lua.LUA_TSTRING) {
            /* ignore non-string keys */
            if (lua.lua_rawequal(L, objidx, -1)) {
                /* found object? */
                lua.lua_pop(L, 1); /* remove value (but keep name) */
                return 1;
            } else if (findfield(L, objidx, level - 1)) {
                /* try recursively */
                lua.lua_remove(L, -2); /* remove table (but keep name) */
                lua.lua_pushliteral(L, ".");
                lua.lua_insert(L, -2); /* place '.' between the two names */
                lua.lua_concat(L, 3);
                return 1;
            }
        }
        lua.lua_pop(L, 1); /* remove value */
    }

    return 0; /* not found */
};

/*
** Search for a name for a function in all loaded modules
*/
var pushglobalfuncname = function pushglobalfuncname(L, ar) {
    var top = lua.lua_gettop(L);
    lua.lua_getinfo(L, ['f'.charCodeAt(0)], ar); /* push function */
    lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring(LUA_LOADED_TABLE, true));
    if (findfield(L, top + 1, 2)) {
        var name = lua.lua_tostring(L, -1);
        if (lua.to_jsstring(name).startsWith("_G.")) {
            /* name start with '_G.'? */
            lua.lua_pushstring(L, name.slice(3)); /* push name without prefix */
            lua.lua_remove(L, -2); /* remove original name */
        }
        lua.lua_copy(L, -1, top + 1); /* move name to proper place */
        lua.lua_pop(L, 2); /* remove pushed values */
        return 1;
    } else {
        lua.lua_settop(L, top); /* remove function and global table */
        return 0;
    }
};

var pushfuncname = function pushfuncname(L, ar) {
    if (pushglobalfuncname(L, ar)) {
        /* try first a global name */
        lua.lua_pushfstring(L, lua.to_luastring("function '%s'"), lua.lua_tostring(L, -1));
        lua.lua_remove(L, -2); /* remove name */
    } else if (ar.namewhat.length !== 0) /* is there a name from code? */
        lua.lua_pushfstring(L, lua.to_luastring("%s '%s'"), ar.namewhat, ar.name); /* use it */
    else if (ar.what && ar.what[0] === 'm'.charCodeAt(0)) /* main? */
            lua.lua_pushliteral(L, "main chunk");else if (ar.what && ar.what[0] === 'L'.charCodeAt(0)) /* for Lua functions, use <file:line> */
            lua.lua_pushfstring(L, lua.to_luastring("function <%s:%d>"), ar.short_src, ar.linedefined);else /* nothing left... */
            lua.lua_pushliteral(L, "?");
};

var lastlevel = function lastlevel(L) {
    var ar = new lua.lua_Debug();
    var li = 1;
    var le = 1;
    /* find an upper bound */
    while (lua.lua_getstack(L, le, ar)) {
        li = le;le *= 2;
    }
    /* do a binary search */
    while (li < le) {
        var m = Math.floor((li + le) / 2);
        if (lua.lua_getstack(L, m, ar)) li = m + 1;else le = m;
    }
    return le - 1;
};

var luaL_traceback = function luaL_traceback(L, L1, msg, level) {
    var ar = new lua.lua_Debug();
    var top = lua.lua_gettop(L);
    var last = lastlevel(L1);
    var n1 = last - level > LEVELS1 + LEVELS2 ? LEVELS1 : -1;
    if (msg) lua.lua_pushfstring(L, lua.to_luastring("%s\n"), msg);
    luaL_checkstack(L, 10, null);
    lua.lua_pushliteral(L, "stack traceback:");
    while (lua.lua_getstack(L1, level++, ar)) {
        if (n1-- === 0) {
            /* too many levels? */
            lua.lua_pushliteral(L, "\n\t..."); /* add a '...' */
            level = last - LEVELS2 + 1; /* and skip to last ones */
        } else {
            lua.lua_getinfo(L1, lua.to_luastring("Slnt", true), ar);
            lua.lua_pushfstring(L, lua.to_luastring("\n\t%s:"), ar.short_src);
            if (ar.currentline > 0) lua.lua_pushliteral(L, ar.currentline + ":");
            lua.lua_pushliteral(L, " in ");
            pushfuncname(L, ar);
            if (ar.istailcall) lua.lua_pushliteral(L, "\n\t(...tail calls..)");
            lua.lua_concat(L, lua.lua_gettop(L) - top);
        }
    }
    lua.lua_concat(L, lua.lua_gettop(L) - top);
};

var panic = function panic(L) {
    throw new Error("PANIC: unprotected error in call to Lua API (" + lua.lua_tojsstring(L, -1) + ")");
};

var luaL_argerror = function luaL_argerror(L, arg, extramsg) {
    var ar = new lua.lua_Debug();

    if (!lua.lua_getstack(L, 0, ar)) /* no stack frame? */
        return luaL_error(L, lua.to_luastring("bad argument #%d (%s)"), arg, extramsg);

    lua.lua_getinfo(L, ['n'.charCodeAt(0)], ar);

    if (lua.to_jsstring(ar.namewhat) === "method") {
        arg--; /* do not count 'self' */
        if (arg === 0) /* error is in the self argument itself? */
            return luaL_error(L, lua.to_luastring("calling '%s' on bad self (%s)"), ar.name, extramsg);
    }

    if (ar.name === null) ar.name = pushglobalfuncname(L, ar) ? lua.lua_tostring(L, -1) : ["?".charCodeAt(0)];

    return luaL_error(L, lua.to_luastring("bad argument #%d to '%s' (%s)"), arg, ar.name, extramsg);
};

var typeerror = function typeerror(L, arg, tname) {
    var typearg = void 0;
    if (luaL_getmetafield(L, arg, lua.to_luastring("__name", true)) === lua.LUA_TSTRING) typearg = lua.lua_tostring(L, -1);else if (lua.lua_type(L, arg) === lua.LUA_TLIGHTUSERDATA) typearg = lua.to_luastring("light userdata", true);else typearg = luaL_typename(L, arg);

    var msg = lua.lua_pushfstring(L, lua.to_luastring("%s expected, got %s"), tname, typearg);
    return luaL_argerror(L, arg, msg);
};

var luaL_where = function luaL_where(L, level) {
    var ar = new lua.lua_Debug();
    if (lua.lua_getstack(L, level, ar)) {
        lua.lua_getinfo(L, lua.to_luastring("Sl", true), ar);
        if (ar.currentline > 0) {
            lua.lua_pushfstring(L, lua.to_luastring("%s:%d: "), ar.short_src, ar.currentline);
            return;
        }
    }
    lua.lua_pushstring(L, []);
};

var luaL_error = function luaL_error(L, fmt) {
    luaL_where(L, 1);

    for (var _len = arguments.length, argp = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        argp[_key - 2] = arguments[_key];
    }

    lua.lua_pushvfstring(L, fmt, argp);
    lua.lua_concat(L, 2);
    return lua.lua_error(L);
};

/* Unlike normal lua, we pass in an error object */
var luaL_fileresult = function luaL_fileresult(L, stat, fname, e) {
    if (stat) {
        lua.lua_pushboolean(L, 1);
        return 1;
    } else {
        lua.lua_pushnil(L);
        if (fname) lua.lua_pushstring(L, lua.to_luastring(lua.to_jsstring(fname) + ": " + e.message));else lua.lua_pushstring(L, lua.to_luastring(e.message));
        lua.lua_pushinteger(L, -e.errno);
        return 3;
    }
};

/* Unlike normal lua, we pass in an error object */
var luaL_execresult = function luaL_execresult(L, e) {
    var what = void 0,
        stat = void 0;
    if (e === null) {
        lua.lua_pushboolean(L, 1);
        lua.lua_pushliteral(L, "exit");
        lua.lua_pushinteger(L, 0);
        return 3;
    } else if (e.status) {
        what = "exit";
        stat = e.status;
    } else if (e.signal) {
        what = "signal";
        stat = e.signal;
    } else {
        /* XXX: node seems to have e.errno as a string instead of a number */
        return luaL_fileresult(L, 0, null, e);
    }
    lua.lua_pushnil(L);
    lua.lua_pushliteral(L, what);
    lua.lua_pushinteger(L, stat);
    return 3;
};

var luaL_getmetatable = function luaL_getmetatable(L, n) {
    return lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, n);
};

var luaL_newmetatable = function luaL_newmetatable(L, tname) {
    if (luaL_getmetatable(L, tname) !== lua.LUA_TNIL) /* name already in use? */
        return 0; /* leave previous value on top, but return 0 */
    lua.lua_pop(L, 1);
    lua.lua_createtable(L, 0, 2); /* create metatable */
    lua.lua_pushstring(L, tname);
    lua.lua_setfield(L, -2, lua.to_luastring("__name")); /* metatable.__name = tname */
    lua.lua_pushvalue(L, -1);
    lua.lua_setfield(L, lua.LUA_REGISTRYINDEX, tname); /* registry.name = metatable */
    return 1;
};

var luaL_setmetatable = function luaL_setmetatable(L, tname) {
    luaL_getmetatable(L, tname);
    lua.lua_setmetatable(L, -2);
};

var luaL_testudata = function luaL_testudata(L, ud, tname) {
    var p = lua.lua_touserdata(L, ud);
    if (p !== null) {
        /* value is a userdata? */
        if (lua.lua_getmetatable(L, ud)) {
            /* does it have a metatable? */
            luaL_getmetatable(L, tname); /* get correct metatable */
            if (!lua.lua_rawequal(L, -1, -2)) /* not the same? */
                p = null; /* value is a userdata with wrong metatable */
            lua.lua_pop(L, 2); /* remove both metatables */
            return p;
        }
    }
    return null; /* value is not a userdata with a metatable */
};

var luaL_checkudata = function luaL_checkudata(L, ud, tname) {
    var p = luaL_testudata(L, ud, tname);
    if (p === null) typeerror(L, ud, tname);
    return p;
};

var luaL_checkoption = function luaL_checkoption(L, arg, def, lst) {
    var name = def ? luaL_optstring(L, arg, def) : luaL_checkstring(L, arg);
    for (var i = 0; lst[i]; i++) {
        if (lst[i].join('|') === name.join('|')) return i;
    }return luaL_argerror(L, arg, lua.lua_pushfstring(L, lua.to_luastring("invalid option '%s'"), name));
};

var tag_error = function tag_error(L, arg, tag) {
    typeerror(L, arg, lua.lua_typename(L, tag));
};

var luaL_newstate = function luaL_newstate() {
    var L = lua.lua_newstate();
    if (L) lua.lua_atpanic(L, panic);
    return L;
};

var luaL_typename = function luaL_typename(L, i) {
    return lua.lua_typename(L, lua.lua_type(L, i));
};

var luaL_argcheck = function luaL_argcheck(L, cond, arg, extramsg) {
    if (!cond) luaL_argerror(L, arg, extramsg);
};

var luaL_checkany = function luaL_checkany(L, arg) {
    if (lua.lua_type(L, arg) === lua.LUA_TNONE) luaL_argerror(L, arg, lua.to_luastring("value expected", true));
};

var luaL_checktype = function luaL_checktype(L, arg, t) {
    if (lua.lua_type(L, arg) !== t) tag_error(L, arg, t);
};

var luaL_checkstring = function luaL_checkstring(L, n) {
    return luaL_checklstring(L, n, null);
};

var luaL_checklstring = function luaL_checklstring(L, arg) {
    var s = lua.lua_tolstring(L, arg);
    if (s === null || s === undefined) tag_error(L, arg, lua.LUA_TSTRING);
    return s;
};

var luaL_optlstring = function luaL_optlstring(L, arg, def) {
    if (lua.lua_type(L, arg) <= 0) {
        return def;
    } else return luaL_checklstring(L, arg);
};

var luaL_optstring = luaL_optlstring;

var interror = function interror(L, arg) {
    if (lua.lua_isnumber(L, arg)) luaL_argerror(L, arg, lua.to_luastring("number has no integer representation", true));else tag_error(L, arg, lua.LUA_TNUMBER);
};

var luaL_checknumber = function luaL_checknumber(L, arg) {
    var d = lua.lua_tonumberx(L, arg);
    if (d === false) tag_error(L, arg, lua.LUA_TNUMBER);
    return d;
};

var luaL_optnumber = function luaL_optnumber(L, arg, def) {
    return luaL_opt(L, luaL_checknumber, arg, def);
};

var luaL_checkinteger = function luaL_checkinteger(L, arg) {
    var d = lua.lua_tointegerx(L, arg);
    if (d === false) interror(L, arg);
    return d;
};

var luaL_optinteger = function luaL_optinteger(L, arg, def) {
    return luaL_opt(L, luaL_checkinteger, arg, def);
};

var luaL_prepbuffsize = function luaL_prepbuffsize(B, sz) {
    return B;
};

var luaL_buffinit = function luaL_buffinit(L, B) {
    B.L = L;
    B.b = [];
};

var luaL_buffinitsize = function luaL_buffinitsize(L, B, sz) {
    luaL_buffinit(L, B);
    return B;
};

var LUAL_BUFFERSIZE = 8192;

var luaL_prepbuffer = function luaL_prepbuffer(B) {
    return luaL_prepbuffsize(B, LUAL_BUFFERSIZE);
};

var luaL_addlstring = function luaL_addlstring(B, s, l) {
    B.b = B.b.concat(s.slice(0, l));
};

var luaL_addstring = luaL_addlstring;

var luaL_pushresult = function luaL_pushresult(B) {
    var L = B.L;
    lua.lua_pushstring(L, B.b);
};

var luaL_addchar = function luaL_addchar(B, c) {
    B.b.push(c);
};

var luaL_addsize = function luaL_addsize(B, s) {
    B.n += s;
};

var luaL_pushresultsize = function luaL_pushresultsize(B, sz) {
    luaL_addsize(B, sz);
    luaL_pushresult(B);
};

var luaL_addvalue = function luaL_addvalue(B) {
    var L = B.L;
    var s = lua.lua_tostring(L, -1);
    // TODO: buffonstack ? necessary ?
    luaL_addstring(B, s);
    lua.lua_remove(L, -1);
};

var luaL_opt = function luaL_opt(L, f, n, d) {
    return lua.lua_type(L, n) <= 0 ? d : f(L, n);
};

var getS = function getS(L, ud) {
    var s = ud.string;
    ud.string = null;
    return s;
};

var luaL_loadbufferx = function luaL_loadbufferx(L, buff, size, name, mode) {
    return lua.lua_load(L, getS, { string: buff }, name, mode);
};

var luaL_loadbuffer = function luaL_loadbuffer(L, s, sz, n) {
    return luaL_loadbufferx(L, s, sz, n, null);
};

var luaL_loadstring = function luaL_loadstring(L, s) {
    return luaL_loadbuffer(L, s, s.length, s);
};

var luaL_dostring = function luaL_dostring(L, s) {
    return luaL_loadstring(L, s) || lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0);
};

var luaL_getmetafield = function luaL_getmetafield(L, obj, event) {
    if (!lua.lua_getmetatable(L, obj)) return lua.LUA_TNIL;else {
        lua.lua_pushstring(L, event);
        var tt = lua.lua_rawget(L, -2);
        if (tt === lua.LUA_TNIL) lua.lua_pop(L, 2);
        return tt;
    }
};

var luaL_callmeta = function luaL_callmeta(L, obj, event) {
    obj = lua.lua_absindex(L, obj);
    if (luaL_getmetafield(L, obj, event) === lua.LUA_TNIL) return false;

    lua.lua_pushvalue(L, obj);
    lua.lua_call(L, 1, 1);

    return true;
};

var luaL_len = function luaL_len(L, idx) {
    lua.lua_len(L, idx);
    var l = lua.lua_tointegerx(L, -1);
    if (l === false) luaL_error(L, lua.to_luastring("object length is not an integer", true));
    lua.lua_pop(L, 1); /* remove object */
    return l;
};

var luaL_tolstring = function luaL_tolstring(L, idx) {
    if (luaL_callmeta(L, idx, lua.to_luastring("__tostring", true))) {
        if (!lua.lua_isstring(L, -1)) luaL_error(L, lua.to_luastring("'__tostring' must return a string", true));
    } else {
        var t = lua.lua_type(L, idx);
        switch (t) {
            case lua.LUA_TNUMBER:
                {
                    if (lua.lua_isinteger(L, idx)) lua.lua_pushfstring(L, lua.to_luastring("%I"), lua.lua_tointeger(L, idx));else lua.lua_pushfstring(L, lua.to_luastring("%f"), lua.lua_tonumber(L, idx));
                    break;
                }
            case lua.LUA_TSTRING:
                lua.lua_pushvalue(L, idx);
                break;
            case lua.LUA_TBOOLEAN:
                lua.lua_pushliteral(L, lua.lua_toboolean(L, idx) ? "true" : "false");
                break;
            case lua.LUA_TNIL:
                lua.lua_pushliteral(L, "nil");
                break;
            default:
                var tt = luaL_getmetafield(L, idx, lua.to_luastring("__name", true));
                var kind = tt === lua.LUA_TSTRING ? lua.lua_tostring(L, -1) : luaL_typename(L, idx);
                lua.lua_pushfstring(L, lua.to_luastring("%s: %p"), kind, lua.lua_topointer(L, idx));
                if (tt !== lua.LUA_TNIL) lua.lua_remove(L, -2);
                break;
        }
    }

    return lua.lua_tolstring(L, -1);
};

/*
** Stripped-down 'require': After checking "loaded" table, calls 'openf'
** to open a module, registers the result in 'package.loaded' table and,
** if 'glb' is true, also registers the result in the global table.
** Leaves resulting module on the top.
*/
var luaL_requiref = function luaL_requiref(L, modname, openf, glb) {
    luaL_getsubtable(L, lua.LUA_REGISTRYINDEX, lua.to_luastring(LUA_LOADED_TABLE));
    lua.lua_getfield(L, -1, modname); /* LOADED[modname] */
    if (!lua.lua_toboolean(L, -1)) {
        /* package not already loaded? */
        lua.lua_pop(L, 1); /* remove field */
        lua.lua_pushcfunction(L, openf);
        lua.lua_pushstring(L, modname); /* argument to open function */
        lua.lua_call(L, 1, 1); /* call 'openf' to open module */
        lua.lua_pushvalue(L, -1); /* make copy of module (call result) */
        lua.lua_setfield(L, -3, modname); /* LOADED[modname] = module */
    }
    lua.lua_remove(L, -2); /* remove LOADED table */
    if (glb) {
        lua.lua_pushvalue(L, -1); /* copy of module */
        lua.lua_setglobal(L, modname); /* _G[modname] = module */
    }
};

var find_subarray = function find_subarray(arr, subarr, from_index) {
    var i = from_index >>> 0,
        sl = subarr.length,
        l = arr.length + 1 - sl;

    loop: for (; i < l; i++) {
        for (var j = 0; j < sl; j++) {
            if (arr[i + j] !== subarr[j]) continue loop;
        }return i;
    }
    return -1;
};

var luaL_gsub = function luaL_gsub(L, s, p, r) {
    var wild = void 0;
    var b = [];
    while ((wild = find_subarray(s, p)) >= 0) {
        b.push.apply(b, _toConsumableArray(s.slice(0, wild))); /* push prefix */
        b.push.apply(b, _toConsumableArray(r)); /* push replacement in place of pattern */
        s = s.slice(wild + p.length); /* continue after 'p' */
    }
    b.push.apply(b, _toConsumableArray(s)); /* push last suffix */
    lua.lua_pushstring(L, b);
    return lua.lua_tostring(L, -1);
};

/*
** ensure that stack[idx][fname] has a table and push that table
** into the stack
*/
var luaL_getsubtable = function luaL_getsubtable(L, idx, fname) {
    if (lua.lua_getfield(L, idx, fname) === lua.LUA_TTABLE) return true; /* table already there */
    else {
            lua.lua_pop(L, 1); /* remove previous result */
            idx = lua.lua_absindex(L, idx);
            lua.lua_newtable(L);
            lua.lua_pushvalue(L, -1); /* copy to be left at top */
            lua.lua_setfield(L, idx, fname); /* assign new table to field */
            return false; /* false, because did not find table there */
        }
};

/*
** set functions from list 'l' into table at top - 'nup'; each
** function gets the 'nup' elements at the top as upvalues.
** Returns with only the table at the stack.
*/
var luaL_setfuncs = function luaL_setfuncs(L, l, nup) {
    luaL_checkstack(L, nup, lua.to_luastring("too many upvalues", true));
    for (var lib in l) {
        /* fill the table with given functions */
        for (var i = 0; i < nup; i++) {
            /* copy upvalues to the top */
            lua.lua_pushvalue(L, -nup);
        }lua.lua_pushcclosure(L, l[lib], nup); /* closure with those upvalues */
        lua.lua_setfield(L, -(nup + 2), lua.to_luastring(lib));
    }
    lua.lua_pop(L, nup); /* remove upvalues */
};

/*
** Ensures the stack has at least 'space' extra slots, raising an error
** if it cannot fulfill the request. (The error handling needs a few
** extra slots to format the error message. In case of an error without
** this extra space, Lua will generate the same 'stack overflow' error,
** but without 'msg'.)
*/
var luaL_checkstack = function luaL_checkstack(L, space, msg) {
    if (!lua.lua_checkstack(L, space)) {
        if (msg) luaL_error(L, lua.to_luastring("stack overflow (%s)"), msg);else luaL_error(L, lua.to_luastring('stack overflow', true));
    }
};

var luaL_newlibtable = function luaL_newlibtable(L) {
    lua.lua_createtable(L);
};

var luaL_newlib = function luaL_newlib(L, l) {
    lua.lua_createtable(L);
    luaL_setfuncs(L, l, 0);
};

/* predefined references */
var LUA_NOREF = -2;
var LUA_REFNIL = -1;

var luaL_ref = function luaL_ref(L, t) {
    var ref = void 0;
    if (lua.lua_isnil(L, -1)) {
        lua.lua_pop(L, 1); /* remove from stack */
        return LUA_REFNIL; /* 'nil' has a unique fixed reference */
    }
    t = lua.lua_absindex(L, t);
    lua.lua_rawgeti(L, t, 0); /* get first free element */
    ref = lua.lua_tointeger(L, -1); /* ref = t[freelist] */
    lua.lua_pop(L, 1); /* remove it from stack */
    if (ref !== 0) {
        /* any free element? */
        lua.lua_rawgeti(L, t, ref); /* remove it from list */
        lua.lua_rawseti(L, t, 0); /* (t[freelist] = t[ref]) */
    } else /* no free elements */
        ref = lua.lua_rawlen(L, t) + 1; /* get a new reference */
    lua.lua_rawseti(L, t, ref);
    return ref;
};

var luaL_unref = function luaL_unref(L, t, ref) {
    if (ref >= 0) {
        t = lua.lua_absindex(L, t);
        lua.lua_rawgeti(L, t, 0);
        lua.lua_rawseti(L, t, ref); /* t[ref] = t[freelist] */
        lua.lua_pushinteger(L, ref);
        lua.lua_rawseti(L, t, 0); /* t[freelist] = ref */
    }
};

var errfile = function errfile(L, what, fnameindex, error) {
    var serr = error.message;
    var filename = lua.lua_tostring(L, fnameindex).slice(1);
    lua.lua_pushstring(L, lua.to_luastring("cannot " + what + " " + lua.to_jsstring(filename) + ": " + serr));
    lua.lua_remove(L, fnameindex);
    return lua.LUA_ERRFILE;
};

var getc = void 0;

var utf8_bom = [0XEF, 0XBB, 0XBF]; /* UTF-8 BOM mark */
var skipBOM = function skipBOM(lf) {
    lf.n = 0;
    var c = void 0;
    var p = 0;
    do {
        c = getc(lf);
        if (c === null || c !== utf8_bom[p]) return c;
        p++;
        lf.buff[lf.n++] = c; /* to be read by the parser */
    } while (p < utf8_bom.length);
    lf.n = 0; /* prefix matched; discard it */
    return getc(lf); /* return next character */
};

/*
** reads the first character of file 'f' and skips an optional BOM mark
** in its beginning plus its first line if it starts with '#'. Returns
** true if it skipped the first line.  In any case, '*cp' has the
** first "valid" character of the file (after the optional BOM and
** a first-line comment).
*/
var skipcomment = function skipcomment(lf) {
    var c = skipBOM(lf);
    if (c === '#'.charCodeAt(0)) {
        /* first line is a comment (Unix exec. file)? */
        do {
            /* skip first line */
            c = getc(lf);
        } while (c && c !== '\n'.charCodeAt(0));

        return {
            skipped: true,
            c: getc(lf) /* skip end-of-line, if present */
        };
    } else {
        return {
            skipped: false,
            c: c
        };
    }
};

var luaL_loadfilex = void 0;

var LoadF = function LoadF() {
    _classCallCheck(this, LoadF);

    this.n = NaN; /* number of pre-read characters */
    this.f = null; /* file being read */
    this.buff =  true ? new Array(1024) : new Buffer(1024); /* area for reading file */
    this.pos = 0; /* current position in file */
    this.err = void 0;
};

if (true) {
    var getF = function getF(L, ud) {
        var lf = ud;

        if (lf.f !== null && lf.n > 0) {
            /* are there pre-read characters to be read? */
            var bytes = lf.n; /* return them (chars already in buffer) */
            lf.n = 0; /* no more pre-read characters */
            lf.f = lf.f.slice(lf.pos); /* we won't use lf.buff anymore */
            return lf.buff.slice(0, bytes);
        }

        var f = lf.f;
        lf.f = null;
        return f;
    };

    getc = function getc(lf) {
        return lf.pos < lf.f.length ? lf.f[lf.pos++] : null;
    };

    luaL_loadfilex = function luaL_loadfilex(L, filename, mode) {
        var lf = new LoadF();
        var fnameindex = lua.lua_gettop(L) + 1; /* index of filename on the stack */
        if (filename === null) {
            throw new Error("Can't read stdin in the browser");
        } else {
            lua.lua_pushfstring(L, lua.to_luastring("@%s"), filename);

            var jsfilename = lua.to_jsstring(filename);
            var xhr = new XMLHttpRequest();
            xhr.open("GET", jsfilename, false);
            // TODO: find a way to load bytes instead of js string
            xhr.send();

            if (xhr.status >= 200 && xhr.status <= 299) {
                /* TODO: Synchronous xhr alway return a js string */
                lf.f = lua.to_luastring(xhr.response);
            } else {
                lf.err = xhr.status;
                return errfile(L, "open", fnameindex, { message: xhr.status + ": " + xhr.statusText });
            }
        }
        var com = skipcomment(lf);
        /* check for signature first, as we don't want to add line number corrections in binary case */
        if (com.c === lua.LUA_SIGNATURE.charCodeAt(0) && filename) {/* binary file? */
            /* no need to re-open in node.js */
        } else if (com.skipped) {
            /* read initial portion */
            lf.buff[lf.n++] = '\n'.charCodeAt(0); /* add line to correct line numbers */
        }
        if (com.c !== null) lf.buff[lf.n++] = com.c; /* 'c' is the first character of the stream */
        var status = lua.lua_load(L, getF, lf, lua.lua_tostring(L, -1), mode);
        var readstatus = lf.err;
        if (readstatus) {
            lua.lua_settop(L, fnameindex); /* ignore results from 'lua_load' */
            return errfile(L, "read", fnameindex, readstatus);
        }
        lua.lua_remove(L, fnameindex);
        return status;
    };
} else {
    var fs = require('fs');

    var _getF = function _getF(L, ud) {
        var lf = ud;
        var bytes = 0;
        if (lf.n > 0) {
            /* are there pre-read characters to be read? */
            bytes = lf.n; /* return them (chars already in buffer) */
            lf.n = 0; /* no more pre-read characters */
        } else {
            /* read a block from file */
            lf.buff.fill(0);
            try {
                bytes = fs.readSync(lf.f, lf.buff, 0, lf.buff.length, lf.pos); /* read block */
            } catch (e) {
                lf.err = e;
                bytes = 0;
            }
            lf.pos += bytes;
        }
        if (bytes > 0) return lf.buff.slice(0, bytes); /* slice on a node.js Buffer is 'free' */
        else return null;
    };

    getc = function getc(lf) {
        var b = new Buffer(1);
        var bytes = fs.readSync(lf.f, b, 0, 1, lf.pos);
        lf.pos += bytes;
        return bytes > 0 ? b.readUInt8() : null;
    };

    luaL_loadfilex = function luaL_loadfilex(L, filename, mode) {
        var lf = new LoadF();
        var fnameindex = lua.lua_gettop(L) + 1; /* index of filename on the stack */
        if (filename === null) {
            lua.lua_pushliteral(L, "=stdin");
            lf.f = process.stdin.fd;
        } else {
            lua.lua_pushfstring(L, lua.to_luastring("@%s"), filename);
            try {
                var jsfilename = lua.to_jsstring(filename);
                lf.f = fs.openSync(jsfilename, "r");
                if (!fs.fstatSync(lf.f).isFile()) throw new Error(jsfilename + " is not a readable file");
            } catch (e) {
                return errfile(L, "open", fnameindex, e);
            }
        }
        var com = skipcomment(lf);
        /* check for signature first, as we don't want to add line number corrections in binary case */
        if (com.c === lua.LUA_SIGNATURE.charCodeAt(0) && filename) {/* binary file? */
            /* no need to re-open in node.js */
        } else if (com.skipped) {
            /* read initial portion */
            lf.buff[lf.n++] = '\n'.charCodeAt(0); /* add line to correct line numbers */
        }
        if (com.c !== null) lf.buff[lf.n++] = com.c; /* 'c' is the first character of the stream */
        var status = lua.lua_load(L, _getF, lf, lua.lua_tostring(L, -1), mode);
        var readstatus = lf.err;
        if (filename) try {
            fs.closeSync(lf.f);
        } catch (e) {} /* close file (even in case of errors) */
        if (readstatus) {
            lua.lua_settop(L, fnameindex); /* ignore results from 'lua_load' */
            return errfile(L, "read", fnameindex, readstatus);
        }
        lua.lua_remove(L, fnameindex);
        return status;
    };
}

var luaL_loadfile = function luaL_loadfile(L, filename) {
    return luaL_loadfilex(L, filename, null);
};

var luaL_dofile = function luaL_dofile(L, filename) {
    return luaL_loadfile(L, filename) || lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0);
};

var lua_writestringerror = function lua_writestringerror(s) {
    if (true) {
        process.stderr.write(s);
    } else {
        console.error(s);
    }
};

var luaL_checkversion = function luaL_checkversion(L) {
    var ver = lua.LUA_VERSION_NUM;
    var sz = LUAL_NUMSIZES;
    var v = lua.lua_version(L);
    if (sz != LUAL_NUMSIZES) /* check numeric types */
        luaL_error(L, lua.to_luastring("core and library have incompatible numeric types"));
    if (v != lua.lua_version(null)) luaL_error(L, lua.to_luastring("multiple Lua VMs detected"));else if (v !== ver) luaL_error(L, lua.to_luastring("version mismatch: app. needs %f, Lua core provides %f"), ver, v);
};

module.exports.LUA_FILEHANDLE = LUA_FILEHANDLE;
module.exports.LUA_LOADED_TABLE = LUA_LOADED_TABLE;
module.exports.LUA_NOREF = LUA_NOREF;
module.exports.LUA_PRELOAD_TABLE = LUA_PRELOAD_TABLE;
module.exports.LUA_REFNIL = LUA_REFNIL;
module.exports.luaL_Buffer = luaL_Buffer;
module.exports.luaL_addchar = luaL_addchar;
module.exports.luaL_addlstring = luaL_addlstring;
module.exports.luaL_addsize = luaL_addsize;
module.exports.luaL_addstring = luaL_addstring;
module.exports.luaL_addvalue = luaL_addvalue;
module.exports.luaL_argcheck = luaL_argcheck;
module.exports.luaL_argerror = luaL_argerror;
module.exports.luaL_buffinit = luaL_buffinit;
module.exports.luaL_buffinitsize = luaL_buffinitsize;
module.exports.luaL_callmeta = luaL_callmeta;
module.exports.luaL_checkany = luaL_checkany;
module.exports.luaL_checkinteger = luaL_checkinteger;
module.exports.luaL_checklstring = luaL_checklstring;
module.exports.luaL_checknumber = luaL_checknumber;
module.exports.luaL_checkoption = luaL_checkoption;
module.exports.luaL_checkstack = luaL_checkstack;
module.exports.luaL_checkstring = luaL_checkstring;
module.exports.luaL_checktype = luaL_checktype;
module.exports.luaL_checkudata = luaL_checkudata;
module.exports.luaL_checkversion = luaL_checkversion;
module.exports.luaL_dofile = luaL_dofile;
module.exports.luaL_dostring = luaL_dostring;
module.exports.luaL_error = luaL_error;
module.exports.luaL_execresult = luaL_execresult;
module.exports.luaL_fileresult = luaL_fileresult;
module.exports.luaL_getmetafield = luaL_getmetafield;
module.exports.luaL_getmetatable = luaL_getmetatable;
module.exports.luaL_getsubtable = luaL_getsubtable;
module.exports.luaL_gsub = luaL_gsub;
module.exports.luaL_len = luaL_len;
module.exports.luaL_loadbuffer = luaL_loadbuffer;
module.exports.luaL_loadbufferx = luaL_loadbufferx;
module.exports.luaL_loadfile = luaL_loadfile;
module.exports.luaL_loadfilex = luaL_loadfilex;
module.exports.luaL_loadstring = luaL_loadstring;
module.exports.luaL_newlib = luaL_newlib;
module.exports.luaL_newlibtable = luaL_newlibtable;
module.exports.luaL_newmetatable = luaL_newmetatable;
module.exports.luaL_newstate = luaL_newstate;
module.exports.luaL_opt = luaL_opt;
module.exports.luaL_optinteger = luaL_optinteger;
module.exports.luaL_optlstring = luaL_optlstring;
module.exports.luaL_optnumber = luaL_optnumber;
module.exports.luaL_optstring = luaL_optstring;
module.exports.luaL_prepbuffer = luaL_prepbuffer;
module.exports.luaL_prepbuffsize = luaL_prepbuffsize;
module.exports.luaL_pushresult = luaL_pushresult;
module.exports.luaL_pushresultsize = luaL_pushresultsize;
module.exports.luaL_ref = luaL_ref;
module.exports.luaL_requiref = luaL_requiref;
module.exports.luaL_setfuncs = luaL_setfuncs;
module.exports.luaL_setmetatable = luaL_setmetatable;
module.exports.luaL_testudata = luaL_testudata;
module.exports.luaL_tolstring = luaL_tolstring;
module.exports.luaL_traceback = luaL_traceback;
module.exports.luaL_typename = luaL_typename;
module.exports.luaL_unref = luaL_unref;
module.exports.luaL_where = luaL_where;
module.exports.lua_writestringerror = lua_writestringerror;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var lapi = __webpack_require__(17);
var ldebug = __webpack_require__(10);
var lfunc = __webpack_require__(11);
var llimit = __webpack_require__(4);
var lobject = __webpack_require__(3);
var lopcodes = __webpack_require__(15);
var lparser = __webpack_require__(21);
var lstate = __webpack_require__(12);
var lstring = __webpack_require__(8);
var ltm = __webpack_require__(13);
var luaconf = __webpack_require__(9);
var lundump = __webpack_require__(36);
var lvm = __webpack_require__(14);
var lzio = __webpack_require__(16);

var CT = defs.constant_types;
var TS = defs.thread_status;

var adjust_top = function adjust_top(L, newtop) {
    if (L.top < newtop) {
        while (L.top < newtop) {
            L.stack[L.top++] = new lobject.TValue(CT.LUA_TNIL, null);
        }
    } else {
        while (L.top > newtop) {
            delete L.stack[--L.top];
        }
    }
};

var seterrorobj = function seterrorobj(L, errcode, oldtop) {
    var current_top = L.top;

    /* extend stack so that L.stack[oldtop] is sure to exist */
    while (L.top < oldtop + 1) {
        L.stack[L.top++] = new lobject.TValue(CT.LUA_TNIL, null);
    }switch (errcode) {
        case TS.LUA_ERRMEM:
            {
                lobject.setsvalue2s(L, oldtop, lstring.luaS_newliteral(L, "not enough memory"));
                break;
            }
        case TS.LUA_ERRERR:
            {
                lobject.setsvalue2s(L, oldtop, lstring.luaS_newliteral(L, "error in error handling"));
                break;
            }
        default:
            {
                lobject.setobjs2s(L, oldtop, current_top - 1);
            }
    }

    while (L.top > oldtop + 1) {
        delete L.stack[--L.top];
    }
};

var ERRORSTACKSIZE = luaconf.LUAI_MAXSTACK + 200;

var luaD_reallocstack = function luaD_reallocstack(L, newsize) {
    assert(newsize <= luaconf.LUAI_MAXSTACK || newsize == ERRORSTACKSIZE);
    assert(L.stack_last == L.stack.length - lstate.EXTRA_STACK);
    L.stack.length = newsize;
    L.stack_last = newsize - lstate.EXTRA_STACK;
};

var luaD_growstack = function luaD_growstack(L, n) {
    var size = L.stack.length;
    if (size > luaconf.LUAI_MAXSTACK) luaD_throw(L, TS.LUA_ERRERR);else {
        var needed = L.top + n + lstate.EXTRA_STACK;
        var newsize = 2 * size;
        if (newsize > luaconf.LUAI_MAXSTACK) newsize = luaconf.LUAI_MAXSTACK;
        if (newsize < needed) newsize = needed;
        if (newsize > luaconf.LUAI_MAXSTACK) {
            /* stack overflow? */
            luaD_reallocstack(L, ERRORSTACKSIZE);
            ldebug.luaG_runerror(L, defs.to_luastring("stack overflow", true));
        } else luaD_reallocstack(L, newsize);
    }
};

var luaD_checkstack = function luaD_checkstack(L, n) {
    if (L.stack_last - L.top <= n) luaD_growstack(L, n);
};

var stackinuse = function stackinuse(L) {
    var lim = L.top;
    for (var ci = L.ci; ci !== null; ci = ci.previous) {
        if (lim < ci.top) lim = ci.top;
    }
    assert(lim <= L.stack_last);
    return lim + 1; /* part of stack in use */
};

var luaD_shrinkstack = function luaD_shrinkstack(L) {
    var inuse = stackinuse(L);
    var goodsize = inuse + Math.floor(inuse / 8) + 2 * lstate.EXTRA_STACK;
    if (goodsize > luaconf.LUAI_MAXSTACK) goodsize = luaconf.LUAI_MAXSTACK; /* respect stack limit */
    if (L.stack.length > luaconf.LUAI_MAXSTACK) /* had been handling stack overflow? */
        lstate.luaE_freeCI(L); /* free all CIs (list grew because of an error) */
    /* if thread is currently not handling a stack overflow and its
     good size is smaller than current size, shrink its stack */
    if (inuse <= luaconf.LUAI_MAXSTACK - lstate.EXTRA_STACK && goodsize < L.stack.length) luaD_reallocstack(L, goodsize);
};

var luaD_inctop = function luaD_inctop(L) {
    luaD_checkstack(L, 1);
    L.stack[L.top++] = new lobject.TValue(CT.LUA_TNIL, null);
};

/*
** Prepares a function call: checks the stack, creates a new CallInfo
** entry, fills in the relevant information, calls hook if needed.
** If function is a JS function, does the call, too. (Otherwise, leave
** the execution ('luaV_execute') to the caller, to allow stackless
** calls.) Returns true iff function has been executed (JS function).
*/
var luaD_precall = function luaD_precall(L, off, nresults) {
    var func = L.stack[off];

    switch (func.type) {
        case CT.LUA_TCCL:
        case CT.LUA_TLCF:
            {
                var f = func.type === CT.LUA_TCCL ? func.value.f : func.value;

                luaD_checkstack(L, defs.LUA_MINSTACK);
                var ci = lstate.luaE_extendCI(L);
                ci.funcOff = off;
                ci.nresults = nresults;
                ci.func = func;
                ci.top = L.top + defs.LUA_MINSTACK;
                assert(ci.top <= L.stack_last);
                ci.callstatus = 0;
                if (L.hookmask & defs.LUA_MASKCALL) luaD_hook(L, defs.LUA_HOOKCALL, -1);
                var n = f(L); /* do the actual call */

                assert(typeof n == "number" && n >= 0 && (n | 0) === n, "invalid return value from JS function (expected integer)");
                assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");

                luaD_poscall(L, ci, L.top - n, n);

                return true;
            }
        case CT.LUA_TLCL:
            {
                var base = void 0;
                var p = func.value.p;
                var _n = L.top - off - 1;
                var fsize = p.maxstacksize;
                luaD_checkstack(L, fsize);
                if (p.is_vararg) {
                    base = adjust_varargs(L, p, _n);
                } else {
                    for (; _n < p.numparams; _n++) {
                        L.stack[L.top++] = new lobject.TValue(CT.LUA_TNIL, null);
                    } // complete missing arguments
                    base = off + 1;
                }

                var _ci = lstate.luaE_extendCI(L);
                _ci.funcOff = off;
                _ci.nresults = nresults;
                _ci.func = func;
                _ci.l_base = base;
                _ci.top = base + fsize;
                adjust_top(L, _ci.top);
                _ci.l_code = p.code;
                _ci.l_savedpc = 0;
                _ci.callstatus = lstate.CIST_LUA;
                if (L.hookmask & defs.LUA_MASKCALL) callhook(L, _ci);
                return false;
            }
        default:
            luaD_checkstack(L, 1);
            tryfuncTM(L, off, func);
            return luaD_precall(L, off, nresults);
    }
};

var luaD_poscall = function luaD_poscall(L, ci, firstResult, nres) {
    var wanted = ci.nresults;

    if (L.hookmask & (defs.LUA_MASKRET | defs.LUA_MASKLINE)) {
        if (L.hookmask & defs.LUA_MASKRET) luaD_hook(L, defs.LUA_HOOKRET, -1);
        L.oldpc = ci.previous.l_savedpc; /* 'oldpc' for caller function */
    }

    var res = ci.funcOff;
    L.ci = ci.previous;
    L.ci.next = null;
    return moveresults(L, firstResult, res, nres, wanted);
};

var moveresults = function moveresults(L, firstResult, res, nres, wanted) {
    switch (wanted) {
        case 0:
            break;
        case 1:
            {
                if (nres === 0) L.stack[res].setnilvalue();else {
                    lobject.setobjs2s(L, res, firstResult); /* move it to proper place */
                }
                break;
            }
        case defs.LUA_MULTRET:
            {
                for (var i = 0; i < nres; i++) {
                    lobject.setobjs2s(L, res + i, firstResult + i);
                }for (var _i = L.top; _i >= res + nres; _i--) {
                    delete L.stack[_i];
                }L.top = res + nres;
                return false;
            }
        default:
            {
                var _i2 = void 0;
                if (wanted <= nres) {
                    for (_i2 = 0; _i2 < wanted; _i2++) {
                        lobject.setobjs2s(L, res + _i2, firstResult + _i2);
                    }
                } else {
                    for (_i2 = 0; _i2 < nres; _i2++) {
                        lobject.setobjs2s(L, res + _i2, firstResult + _i2);
                    }for (; _i2 < wanted; _i2++) {
                        if (res + _i2 >= L.top) L.stack[res + _i2] = new lobject.TValue(CT.LUAT_NIL, null);else L.stack[res + _i2].setnilvalue();
                    }
                }
                break;
            }
    }
    var newtop = res + wanted; /* top points after the last result */
    for (var _i3 = L.top; _i3 >= newtop; _i3--) {
        delete L.stack[_i3];
    }L.top = newtop;
    return true;
};

/*
** Call a hook for the given event. Make sure there is a hook to be
** called. (Both 'L->hook' and 'L->hookmask', which triggers this
** function, can be changed asynchronously by signals.)
*/
var luaD_hook = function luaD_hook(L, event, line) {
    var hook = L.hook;
    if (hook && L.allowhook) {
        /* make sure there is a hook */
        var ci = L.ci;
        var top = L.top;
        var ci_top = ci.top;
        var ar = new defs.lua_Debug();
        ar.event = event;
        ar.currentline = line;
        ar.i_ci = ci;
        luaD_checkstack(L, defs.LUA_MINSTACK); /* ensure minimum stack size */
        ci.top = L.top + defs.LUA_MINSTACK;
        assert(ci.top <= L.stack_last);
        L.allowhook = 0; /* cannot call hooks inside a hook */
        ci.callstatus |= lstate.CIST_HOOKED;
        hook(L, ar);
        assert(!L.allowhook);
        L.allowhook = 1;
        ci.top = ci_top;
        adjust_top(L, top);
        ci.callstatus &= ~lstate.CIST_HOOKED;
    }
};

var callhook = function callhook(L, ci) {
    var hook = defs.LUA_HOOKCALL;
    ci.l_savedpc++; /* hooks assume 'pc' is already incremented */
    if (ci.previous.callstatus & lstate.CIST_LUA && ci.previous.l_code[ci.previous.l_savedpc - 1].opcode == lopcodes.OpCodesI.OP_TAILCALL) {
        ci.callstatus |= lstate.CIST_TAIL;
        hook = defs.LUA_HOOKTAILCALL;
    }
    luaD_hook(L, hook, -1);
    ci.l_savedpc--; /* correct 'pc' */
};

var adjust_varargs = function adjust_varargs(L, p, actual) {
    var nfixargs = p.numparams;
    /* move fixed parameters to final position */
    var fixed = L.top - actual; /* first fixed argument */
    var base = L.top; /* final position of first argument */

    var i = void 0;
    for (i = 0; i < nfixargs && i < actual; i++) {
        lobject.pushobj2s(L, L.stack[fixed + i]);
        L.stack[fixed + i].setnilvalue();
    }

    for (; i < nfixargs; i++) {
        L.stack[L.top++] = new lobject.TValue(CT.LUA_TNIL, null);
    }return base;
};

var tryfuncTM = function tryfuncTM(L, off, func) {
    var tm = ltm.luaT_gettmbyobj(L, func, ltm.TMS.TM_CALL);
    if (!tm.ttisfunction(tm)) ldebug.luaG_typeerror(L, func, defs.to_luastring("call", true));
    /* Open a hole inside the stack at 'func' */
    lobject.pushobj2s(L, L.stack[L.top - 1]); /* push top of stack again */
    for (var p = L.top - 2; p > off; p--) {
        lobject.setobjs2s(L, p, p - 1);
    } /* move other items up one */
    lobject.setobj2s(L, off, tm); /* tag method is the new function to be called */
};

/*
** Check appropriate error for stack overflow ("regular" overflow or
** overflow while handling stack overflow). If 'nCalls' is larger than
** LUAI_MAXCCALLS (which means it is handling a "regular" overflow) but
** smaller than 9/8 of LUAI_MAXCCALLS, does not report an error (to
** allow overflow handling to work)
*/
var stackerror = function stackerror(L) {
    if (L.nCcalls === llimit.LUAI_MAXCCALLS) ldebug.luaG_runerror(L, defs.to_luastring("JS stack overflow", true));else if (L.nCcalls >= llimit.LUAI_MAXCCALLS + (llimit.LUAI_MAXCCALLS >> 3)) luaD_throw(L, TS.LUA_ERRERR); /* error while handing stack error */
};

/*
** Call a function (JS or Lua). The function to be called is at func.
** The arguments are on the stack, right after the function.
** When returns, all the results are on the stack, starting at the original
** function position.
*/
var luaD_call = function luaD_call(L, off, nResults) {
    if (++L.nCcalls >= llimit.LUAI_MAXCCALLS) stackerror(L);
    if (!luaD_precall(L, off, nResults)) lvm.luaV_execute(L);
    L.nCcalls--;
};

var luaD_throw = function luaD_throw(L, errcode) {
    if (L.errorJmp) {
        /* thread has an error handler? */
        L.errorJmp.status = errcode; /* set status */
        throw L.errorJmp;
    } else {
        /* thread has no error handler */
        var g = L.l_G;
        L.status = errcode; /* mark it as dead */
        if (g.mainthread.errorJmp) {
            /* main thread has a handler? */
            g.mainthread.stack[g.mainthread.top++] = L.stack[L.top - 1]; /* copy error obj. */
            luaD_throw(g.mainthread, errcode); /* re-throw in main thread */
        } else {
            /* no handler at all; abort */
            var panic = g.panic;
            if (panic) {
                /* panic function? */
                seterrorobj(L, errcode, L.top); /* assume EXTRA_STACK */
                if (L.ci.top < L.top) L.ci.top = L.top; /* pushing msg. can break this invariant */
                panic(L); /* call panic function (last chance to jump out) */
            }
            throw new Error('Aborted ' + errcode);
        }
    }
};

var luaD_rawrunprotected = function luaD_rawrunprotected(L, f, ud) {
    var oldnCcalls = L.nCcalls;
    var lj = { // TODO: necessary when using try/catch ? (ldo.c:47-52)
        status: TS.LUA_OK,
        previous: L.errorJmp /* chain new error handler */
    };
    L.errorJmp = lj;

    try {
        f(L, ud);
    } catch (e) {
        if (lj.status === TS.LUA_OK) {
            /* error was not thrown via luaD_throw, i.e. it is a JS error */
            /* run user error handler (if it exists) */
            var atnativeerror = L.l_G.atnativeerror;
            if (atnativeerror) {
                try {
                    lj.status = TS.LUA_OK;

                    lapi.lua_pushcfunction(L, atnativeerror);
                    lapi.lua_pushlightuserdata(L, e);
                    luaD_callnoyield(L, L.top - 2, 1);

                    /* Now run the message handler (if it exists) */
                    /* copy of luaG_errormsg without the throw */
                    if (L.errfunc !== 0) {
                        /* is there an error handling function? */
                        var errfunc = L.errfunc;
                        lobject.pushobj2s(L, L.stack[L.top - 1]); /* move argument */
                        lobject.setobjs2s(L, L.top - 2, errfunc); /* push function */
                        luaD_callnoyield(L, L.top - 2, 1);
                    }

                    lj.status = TS.LUA_ERRRUN;
                } catch (e2) {
                    if (lj.status === TS.LUA_OK) {
                        /* also failed */
                        lj.status = -1;
                    }
                }
            } else {
                lj.status = -1;
            }
        }
    }

    L.errorJmp = lj.previous;
    L.nCcalls = oldnCcalls;

    return lj.status;
};

/*
** Completes the execution of an interrupted C function, calling its
** continuation function.
*/
var finishCcall = function finishCcall(L, status) {
    var ci = L.ci;

    /* must have a continuation and must be able to call it */
    assert(ci.c_k !== null && L.nny === 0);
    /* error status can only happen in a protected call */
    assert(ci.callstatus & lstate.CIST_YPCALL || status === TS.LUA_YIELD);

    if (ci.callstatus & TS.CIST_YPCALL) {
        /* was inside a pcall? */
        ci.callstatus &= ~TS.CIST_YPCALL; /* continuation is also inside it */
        L.errfunc = ci.c_old_errfunc; /* with the same error function */
    }

    /* finish 'lua_callk'/'lua_pcall'; CIST_YPCALL and 'errfunc' already
       handled */
    if (ci.nresults === defs.LUA_MULTRET && L.ci.top < L.top) L.ci.top = L.top;
    var c_k = ci.c_k; /* don't want to call as method */
    var n = c_k(L, status, ci.c_ctx); /* call continuation function */
    assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
    luaD_poscall(L, ci, L.top - n, n); /* finish 'luaD_precall' */
};

/*
** Executes "full continuation" (everything in the stack) of a
** previously interrupted coroutine until the stack is empty (or another
** interruption long-jumps out of the loop). If the coroutine is
** recovering from an error, 'ud' points to the error status, which must
** be passed to the first continuation function (otherwise the default
** status is LUA_YIELD).
*/
var unroll = function unroll(L, ud) {
    if (ud !== null) /* error status? */
        finishCcall(L, ud); /* finish 'lua_pcallk' callee */

    while (L.ci !== L.base_ci) {
        /* something in the stack */
        if (!(L.ci.callstatus & lstate.CIST_LUA)) /* C function? */
            finishCcall(L, TS.LUA_YIELD); /* complete its execution */
        else {
                /* Lua function */
                lvm.luaV_finishOp(L); /* finish interrupted instruction */
                lvm.luaV_execute(L); /* execute down to higher C 'boundary' */
            }
    }
};

/*
** Try to find a suspended protected call (a "recover point") for the
** given thread.
*/
var findpcall = function findpcall(L) {
    for (var ci = L.ci; ci !== null; ci = ci.previous) {
        /* search for a pcall */
        if (ci.callstatus & lstate.CIST_YPCALL) return ci;
    }

    return null; /* no pending pcall */
};

/*
** Recovers from an error in a coroutine. Finds a recover point (if
** there is one) and completes the execution of the interrupted
** 'luaD_pcall'. If there is no recover point, returns zero.
*/
var recover = function recover(L, status) {
    var ci = findpcall(L);
    if (ci === null) return 0; /* no recovery point */
    /* "finish" luaD_pcall */
    var oldtop = ci.extra;
    lfunc.luaF_close(L, oldtop);
    seterrorobj(L, status, oldtop);
    L.ci = ci;
    L.allowhook = ci.callstatus & lstate.CIST_OAH; /* restore original 'allowhook' */
    L.nny = 0; /* should be zero to be yieldable */
    luaD_shrinkstack(L);
    L.errfunc = ci.c_old_errfunc;
    return 1; /* continue running the coroutine */
};

/*
** Signal an error in the call to 'lua_resume', not in the execution
** of the coroutine itself. (Such errors should not be handled by any
** coroutine error handler and should not kill the coroutine.)
*/
var resume_error = function resume_error(L, msg, narg) {
    var ts = lstring.luaS_newliteral(L, msg);
    if (narg === 0) {
        lobject.pushsvalue2s(L, ts);
        assert(L.top <= L.ci.top, "stack overflow");
    } else {
        /* remove args from the stack */
        for (var i = 1; i < narg; i++) {
            delete L.stack[--L.top];
        }lobject.setsvalue2s(L, L.top - 1, ts); /* push error message */
    }
    return TS.LUA_ERRRUN;
};

/*
** Do the work for 'lua_resume' in protected mode. Most of the work
** depends on the status of the coroutine: initial state, suspended
** inside a hook, or regularly suspended (optionally with a continuation
** function), plus erroneous cases: non-suspended coroutine or dead
** coroutine.
*/
var resume = function resume(L, n) {
    var firstArg = L.top - n; /* first argument */
    var ci = L.ci;
    if (L.status === TS.LUA_OK) {
        /* starting a coroutine? */
        if (!luaD_precall(L, firstArg - 1, defs.LUA_MULTRET)) /* Lua function? */
            lvm.luaV_execute(L); /* call it */
    } else {
        /* resuming from previous yield */
        assert(L.status === TS.LUA_YIELD);
        L.status = TS.LUA_OK; /* mark that it is running (again) */
        ci.funcOff = ci.extra;
        ci.func = L.stack[ci.funcOff];

        if (ci.callstatus & lstate.CIST_LUA) /* yielded inside a hook? */
            lvm.luaV_execute(L); /* just continue running Lua code */
        else {
                /* 'common' yield */
                if (ci.c_k !== null) {
                    /* does it have a continuation function? */
                    n = ci.c_k(L, TS.LUA_YIELD, ci.c_ctx); /* call continuation */
                    assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
                    firstArg = L.top - n; /* yield results come from continuation */
                }

                luaD_poscall(L, ci, firstArg, n); /* finish 'luaD_precall' */
            }

        unroll(L, null); /* run continuation */
    }
};

var lua_resume = function lua_resume(L, from, nargs) {
    var oldnny = L.nny; /* save "number of non-yieldable" calls */

    if (L.status === TS.LUA_OK) {
        /* may be starting a coroutine */
        if (L.ci !== L.base_ci) /* not in base level? */
            return resume_error(L, "cannot resume non-suspended coroutine", nargs);
    } else if (L.status !== TS.LUA_YIELD) return resume_error(L, "cannot resume dead coroutine", nargs);

    L.nCcalls = from ? from.nCcalls + 1 : 1;
    if (L.nCcalls >= llimit.LUAI_MAXCCALLS) return resume_error(L, "JS stack overflow", nargs);

    L.nny = 0; /* allow yields */

    assert((L.status === TS.LUA_OK ? nargs + 1 : nargs) < L.top - L.ci.funcOff, "not enough elements in the stack");

    var status = luaD_rawrunprotected(L, resume, nargs);
    if (status === -1) /* error calling 'lua_resume'? */
        status = TS.LUA_ERRRUN;else {
        /* continue running after recoverable errors */
        while (status > TS.LUA_YIELD && recover(L, status)) {
            /* unroll continuation */
            status = luaD_rawrunprotected(L, unroll, status);
        }

        if (status > TS.LUA_YIELD) {
            /* unrecoverable error? */
            L.status = status; /* mark thread as 'dead' */
            seterrorobj(L, status, L.top); /* push error message */
            L.ci.top = L.top;
        } else assert(status === L.status); /* normal end or yield */
    }

    L.nny = oldnny; /* restore 'nny' */
    L.nCcalls--;
    assert(L.nCcalls === (from ? from.nCcalls : 0));
    return status;
};

var lua_isyieldable = function lua_isyieldable(L) {
    return L.nny === 0;
};

var lua_yieldk = function lua_yieldk(L, nresults, ctx, k) {
    var ci = L.ci;
    assert(nresults < L.top - L.ci.funcOff, "not enough elements in the stack");

    if (L.nny > 0) {
        if (L !== L.l_G.mainthread) ldebug.luaG_runerror(L, defs.to_luastring("attempt to yield across a JS-call boundary", true));else ldebug.luaG_runerror(L, defs.to_luastring("attempt to yield from outside a coroutine", true));
    }

    L.status = TS.LUA_YIELD;
    ci.extra = ci.funcOff; /* save current 'func' */
    if (ci.callstatus & lstate.CIST_LUA) /* inside a hook? */
        assert(k === null, "hooks cannot continue after yielding");else {
        ci.c_k = k;
        if (k !== null) /* is there a continuation? */
            ci.c_ctx = ctx; /* save context */
        ci.funcOff = L.top - nresults - 1; /* protect stack below results */
        ci.func = L.stack[ci.funcOff];
        luaD_throw(L, TS.LUA_YIELD);
    }

    assert(ci.callstatus & lstate.CIST_HOOKED); /* must be inside a hook */
    return 0; /* return to 'luaD_hook' */
};

var lua_yield = function lua_yield(L, n) {
    lua_yieldk(L, n, 0, null);
};

var luaD_pcall = function luaD_pcall(L, func, u, old_top, ef) {
    var old_ci = L.ci;
    var old_allowhooks = L.allowhook;
    var old_nny = L.nny;
    var old_errfunc = L.errfunc;
    L.errfunc = ef;

    var status = luaD_rawrunprotected(L, func, u);

    if (status !== TS.LUA_OK) {
        lfunc.luaF_close(L, old_top);
        seterrorobj(L, status, old_top);
        L.ci = old_ci;
        L.allowhook = old_allowhooks;
        L.nny = old_nny;
        luaD_shrinkstack(L);
    }

    L.errfunc = old_errfunc;

    return status;
};

/*
** Similar to 'luaD_call', but does not allow yields during the call
*/
var luaD_callnoyield = function luaD_callnoyield(L, off, nResults) {
    L.nny++;
    luaD_call(L, off, nResults);
    L.nny--;
};

/*
** Execute a protected parser.
*/

var SParser = function SParser(z, name, mode) {
    _classCallCheck(this, SParser);

    /* data to 'f_parser' */
    this.z = z;
    this.buff = new lzio.MBuffer(); /* dynamic structure used by the scanner */
    this.dyd = new lparser.Dyndata(); /* dynamic structures used by the parser */
    this.mode = mode;
    this.name = name;
};

var checkmode = function checkmode(L, mode, x) {
    if (mode && mode.indexOf(x[0]) === -1) {
        lapi.lua_pushstring(L, defs.to_luastring('attempt to load a ' + defs.to_jsstring(x) + ' chunk (mode is \'' + defs.to_jsstring(mode) + '\')'));
        luaD_throw(L, TS.LUA_ERRSYNTAX);
    }
};

var f_parser = function f_parser(L, p) {
    var cl = void 0;
    var c = p.z.zgetc(); /* read first character */
    if (c === defs.LUA_SIGNATURE.charCodeAt(0)) {
        checkmode(L, p.mode, defs.to_luastring("binary", true));
        cl = lundump.luaU_undump(L, p.z, p.name);
    } else {
        checkmode(L, p.mode, defs.to_luastring("text", true));
        cl = lparser.luaY_parser(L, p.z, p.buff, p.dyd, p.name, c);
    }

    assert(cl.nupvalues === cl.p.upvalues.length);
    lfunc.luaF_initupvals(L, cl);
};

var luaD_protectedparser = function luaD_protectedparser(L, z, name, mode) {
    var p = new SParser(z, name, mode);
    L.nny++; /* cannot yield during parsing */
    var status = luaD_pcall(L, f_parser, p, L.top, L.errfunc);
    L.nny--;
    return status;
};

module.exports.adjust_top = adjust_top;
module.exports.luaD_call = luaD_call;
module.exports.luaD_callnoyield = luaD_callnoyield;
module.exports.luaD_checkstack = luaD_checkstack;
module.exports.luaD_growstack = luaD_growstack;
module.exports.luaD_hook = luaD_hook;
module.exports.luaD_inctop = luaD_inctop;
module.exports.luaD_pcall = luaD_pcall;
module.exports.luaD_poscall = luaD_poscall;
module.exports.luaD_precall = luaD_precall;
module.exports.luaD_protectedparser = luaD_protectedparser;
module.exports.luaD_rawrunprotected = luaD_rawrunprotected;
module.exports.luaD_reallocstack = luaD_reallocstack;
module.exports.luaD_throw = luaD_throw;
module.exports.lua_isyieldable = lua_isyieldable;
module.exports.lua_resume = lua_resume;
module.exports.lua_yield = lua_yield;
module.exports.lua_yieldk = lua_yieldk;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var ldebug = __webpack_require__(10);
var lobject = __webpack_require__(3);
var lstring = __webpack_require__(8);
var lstate = __webpack_require__(12);
var CT = defs.constant_types;

/* used to prevent conflicts with lightuserdata keys */
var lightuserdata_hashes = new WeakMap();
var get_lightuserdata_hash = function get_lightuserdata_hash(v) {
    var hash = lightuserdata_hashes.get(v);
    if (!hash) {
        /* Hash should be something unique that is a valid WeakMap key
           so that it ends up in dead_weak when removed from a table */
        hash = {};
        lightuserdata_hashes.set(v, hash);
    }
    return hash;
};

var table_hash = function table_hash(L, key) {
    switch (key.type) {
        case CT.LUA_TNIL:
            return ldebug.luaG_runerror(L, defs.to_luastring("table index is nil", true));
        case CT.LUA_TNUMFLT:
            if (isNaN(key.value)) return ldebug.luaG_runerror(L, defs.to_luastring("table index is NaN", true));
        /* fall through */
        case CT.LUA_TNUMINT: /* takes advantage of floats and integers being same in JS */
        case CT.LUA_TBOOLEAN:
        case CT.LUA_TTABLE:
        case CT.LUA_TLCL:
        case CT.LUA_TLCF:
        case CT.LUA_TCCL:
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTHREAD:
            return key.value;
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            return lstring.luaS_hashlongstr(key.tsvalue());
        case CT.LUA_TLIGHTUSERDATA:
            var v = key.value;
            switch (typeof v === 'undefined' ? 'undefined' : _typeof(v)) {
                case "string":
                    /* possible conflict with LUA_TSTRING.
                       prefix this string with "*" so they don't clash */
                    return "*" + v;
                case "number":
                    /* possible conflict with LUA_TNUMBER.
                       turn into string and prefix with "#" to avoid clash with other strings */
                    return "#" + v;
                case "boolean":
                    /* possible conflict with LUA_TBOOLEAN. use strings ?true and ?false instead */
                    return v ? "?true" : "?false";
                case "function":
                    /* possible conflict with LUA_TLCF.
                       indirect via a weakmap */
                    return get_lightuserdata_hash(v);
                case "object":
                    /* v could be a lua_State, CClosure, LClosure, Table or Userdata from this state as returned by lua_topointer */
                    if (v instanceof lstate.lua_State && v.l_G === L.l_G || v instanceof Table || v instanceof lobject.Udata || v instanceof lobject.LClosure || v instanceof lobject.CClosure) {
                        /* indirect via a weakmap */
                        return get_lightuserdata_hash(v);
                    }
                /* fall through */
                default:
                    return v;
            }
        default:
            throw new Error("unknown key type: " + key.type);
    }
};

var Table = function Table(L) {
    _classCallCheck(this, Table);

    this.id = L.l_G.id_counter++;
    this.strong = new Map();
    this.dead_strong = new Map();
    this.dead_weak = void 0; /* initialised when needed */
    this.f = void 0; /* first entry */
    this.l = void 0; /* last entry */
    this.metatable = null;
    this.flags = ~0;
};

var invalidateTMcache = function invalidateTMcache(t) {
    t.flags = 0;
};

var add = function add(t, hash, key, value) {
    t.dead_strong.clear();
    t.dead_weak = void 0;
    var prev = null;
    var entry = {
        key: key,
        value: value,
        p: prev = t.l,
        n: void 0
    };
    if (!t.f) t.f = entry;
    if (prev) prev.n = entry;
    t.strong.set(hash, entry);
    t.l = entry;
};

var is_valid_weakmap_key = function is_valid_weakmap_key(k) {
    return (typeof k === 'undefined' ? 'undefined' : _typeof(k)) === 'object' ? k !== null : typeof k === 'function';
};

/* Move out of 'strong' part and into 'dead' part. */
var mark_dead = function mark_dead(t, hash) {
    var e = t.strong.get(hash);
    if (e) {
        e.key.setdeadvalue();
        e.value = void 0;
        var next = e.n;
        var prev = e.p;
        e.p = void 0; /* no need to know previous item any more */
        if (prev) prev.n = next;
        if (next) next.p = prev;
        if (t.f === e) t.f = next;
        if (t.l === e) t.l = prev;
        t.strong.delete(hash);
        if (is_valid_weakmap_key(hash)) {
            if (!t.dead_weak) t.dead_weak = new WeakMap();
            t.dead_weak.set(hash, e);
        } else {
            /* can't be used as key in weakmap */
            t.dead_strong.set(hash, e);
        }
    }
};

var luaH_new = function luaH_new(L) {
    return new Table(L);
};

var getgeneric = function getgeneric(t, hash) {
    var v = t.strong.get(hash);
    return v ? v.value : lobject.luaO_nilobject;
};

var luaH_getint = function luaH_getint(t, key) {
    assert(typeof key == "number" && (key | 0) === key);
    return getgeneric(t, key);
};

var luaH_getstr = function luaH_getstr(t, key) {
    assert(key instanceof lstring.TString);
    return getgeneric(t, lstring.luaS_hashlongstr(key));
};

var luaH_get = function luaH_get(L, t, key) {
    assert(key instanceof lobject.TValue);
    if (key.ttisnil() || key.ttisfloat() && isNaN(key.value)) return lobject.luaO_nilobject;
    return getgeneric(t, table_hash(L, key));
};

var setgeneric = function setgeneric(t, hash, key) {
    var v = t.strong.get(hash);
    if (v) return v.value;

    var kv = key.value;
    if (key.ttisfloat() && (kv | 0) === kv) {
        /* does index fit in an integer? */
        /* insert it as an integer */
        key = new lobject.TValue(CT.LUA_TNUMINT, kv);
    } else {
        key = new lobject.TValue(key.type, kv);
    }
    var tv = new lobject.TValue(CT.LUA_TNIL, null);
    add(t, hash, key, tv);
    return tv;
};

var luaH_setint = function luaH_setint(t, key, value) {
    assert(typeof key == "number" && (key | 0) === key && value instanceof lobject.TValue);
    var hash = key; /* table_hash known result */
    if (value.ttisnil()) {
        mark_dead(t, hash);
        return;
    }
    var v = t.strong.get(hash);
    if (v) {
        var tv = v.value;
        tv.setfrom(value);
    } else {
        var k = new lobject.TValue(CT.LUA_TNUMINT, key);
        var _v = new lobject.TValue(value.type, value.value);
        add(t, hash, k, _v);
    }
};

var luaH_set = function luaH_set(L, t, key) {
    assert(key instanceof lobject.TValue);
    var hash = table_hash(L, key);
    return setgeneric(t, hash, key);
};

var luaH_delete = function luaH_delete(L, t, key) {
    assert(key instanceof lobject.TValue);
    var hash = table_hash(L, key);
    return mark_dead(t, hash);
};

/*
** Try to find a boundary in table 't'. A 'boundary' is an integer index
** such that t[i] is non-nil and t[i+1] is nil (and 0 if t[1] is nil).
*/
var luaH_getn = function luaH_getn(t) {
    var i = 0;
    var j = t.strong.size + 1; /* use known size of Map to bound search */
    /* now do a binary search between them */
    while (j - i > 1) {
        var m = Math.floor((i + j) / 2);
        if (luaH_getint(t, m).ttisnil()) j = m;else i = m;
    }
    return i;
};

var luaH_next = function luaH_next(L, table, keyI) {
    var keyO = L.stack[keyI];

    var entry = void 0;
    if (keyO.type === CT.LUA_TNIL) {
        entry = table.f;
        if (!entry) return false;
    } else {
        /* First find current key */
        var hash = table_hash(L, keyO);
        /* Look in main part of table */
        entry = table.strong.get(hash);
        if (entry) {
            entry = entry.n;
            if (!entry) return false;
        } else {
            /* Try dead keys */
            entry = table.dead_weak && table.dead_weak.get(hash) || table.dead_strong.get(hash);
            if (!entry)
                /* item not in table */
                return ldebug.luaG_runerror(L, defs.to_luastring("invalid key to 'next'"));
            /* Iterate until either out of keys, or until finding a non-dead key */
            do {
                entry = entry.n;
                if (!entry) return false;
            } while (entry.key.ttisdeadkey());
        }
    }
    lobject.setobj2s(L, keyI, entry.key);
    lobject.setobj2s(L, keyI + 1, entry.value);
    return true;
};

module.exports.invalidateTMcache = invalidateTMcache;
module.exports.luaH_delete = luaH_delete;
module.exports.luaH_get = luaH_get;
module.exports.luaH_getint = luaH_getint;
module.exports.luaH_getn = luaH_getn;
module.exports.luaH_getstr = luaH_getstr;
module.exports.luaH_set = luaH_set;
module.exports.luaH_setint = luaH_setint;
module.exports.luaH_new = luaH_new;
module.exports.luaH_next = luaH_next;
module.exports.Table = Table;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);

var TString = function () {
    function TString(L, str) {
        _classCallCheck(this, TString);

        this.hash = null;
        this.realstring = str;
    }

    _createClass(TString, [{
        key: "getstr",
        value: function getstr() {
            return this.realstring;
        }
    }, {
        key: "tsslen",
        value: function tsslen() {
            return this.realstring.length;
        }
    }]);

    return TString;
}();

var luaS_eqlngstr = function luaS_eqlngstr(a, b) {
    assert(a instanceof TString);
    assert(b instanceof TString);
    return a == b || a.realstring.length == b.realstring.length && a.realstring.join() == b.realstring.join();
};

/* converts strings (arrays) to a consistent map key
   make sure this doesn't conflict with any of the anti-collision strategies in ltable */
var luaS_hash = function luaS_hash(str) {
    assert(defs.is_luastring(str));
    return str.map(function (e) {
        return e + "|";
    }).join('');
};

var luaS_hashlongstr = function luaS_hashlongstr(ts) {
    assert(ts instanceof TString);
    if (ts.hash === null) {
        ts.hash = luaS_hash(ts.getstr());
    }
    return ts.hash;
};

/* variant that takes ownership of array */
var luaS_bless = function luaS_bless(L, str) {
    return new TString(L, str);
};

/* makes a copy */
var luaS_new = function luaS_new(L, str) {
    return luaS_bless(L, str.slice(0));
};

/* takes a js string */
var luaS_newliteral = function luaS_newliteral(L, str) {
    return luaS_bless(L, defs.to_luastring(str));
};

module.exports.luaS_eqlngstr = luaS_eqlngstr;
module.exports.luaS_hash = luaS_hash;
module.exports.luaS_hashlongstr = luaS_hashlongstr;
module.exports.luaS_bless = luaS_bless;
module.exports.luaS_new = luaS_new;
module.exports.luaS_newliteral = luaS_newliteral;
module.exports.TString = TString;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var llimit = __webpack_require__(4);
var sprintf = __webpack_require__(19).sprintf;

/*
@@ LUAI_MAXSTACK limits the size of the Lua stack.
** CHANGE it if you need a different limit. This limit is arbitrary;
** its only purpose is to stop Lua from consuming unlimited stack
** space (and to reserve some numbers for pseudo-indices).
*/
/* TODO: put back to 1000000. Node would go out of memory in some cases (e.g. travis) */
var LUAI_MAXSTACK = 100000;

/*
@@ LUA_IDSIZE gives the maximum size for the description of the source
@@ of a function in debug information.
** CHANGE it if you want a different size.
*/
var LUA_IDSIZE = 60;

var lua_integer2str = function lua_integer2str(n) {
    return sprintf(LUA_INTEGER_FMT, n);
};

var lua_number2str = function lua_number2str(n) {
    return sprintf(LUA_NUMBER_FMT, n);
};

var lua_numbertointeger = function lua_numbertointeger(n) {
    return n >= llimit.MIN_INT && n < -llimit.MIN_INT ? n : false;
};

var LUA_INTEGER_FRMLEN = "";
var LUA_NUMBER_FRMLEN = "";

var LUA_INTEGER_FMT = '%' + LUA_INTEGER_FRMLEN + 'd';
var LUA_NUMBER_FMT = "%.14g";

var lua_getlocaledecpoint = function lua_getlocaledecpoint() {
    return 1.1.toLocaleString().substring(1, 2);
};

// See: http://croquetweak.blogspot.fr/2014/08/deconstructing-floats-frexp-and-ldexp.html
var frexp = function frexp(value) {
    if (value === 0) return [value, 0];
    var data = new DataView(new ArrayBuffer(8));
    data.setFloat64(0, value);
    var bits = data.getUint32(0) >>> 20 & 0x7FF;
    if (bits === 0) {
        // denormal
        data.setFloat64(0, value * Math.pow(2, 64)); // exp + 64
        bits = (data.getUint32(0) >>> 20 & 0x7FF) - 64;
    }
    var exponent = bits - 1022;
    var mantissa = ldexp(value, -exponent);
    return [mantissa, exponent];
};

var ldexp = function ldexp(mantissa, exponent) {
    var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
    var result = mantissa;
    for (var i = 0; i < steps; i++) {
        result *= Math.pow(2, Math.floor((exponent + i) / steps));
    }return result;
};

module.exports.frexp = frexp;
module.exports.ldexp = ldexp;
module.exports.LUAI_MAXSTACK = LUAI_MAXSTACK;
module.exports.LUA_IDSIZE = LUA_IDSIZE;
module.exports.LUA_INTEGER_FMT = LUA_INTEGER_FMT;
module.exports.LUA_INTEGER_FRMLEN = LUA_INTEGER_FRMLEN;
module.exports.LUA_NUMBER_FMT = LUA_NUMBER_FMT;
module.exports.LUA_NUMBER_FRMLEN = LUA_NUMBER_FRMLEN;
module.exports.lua_getlocaledecpoint = lua_getlocaledecpoint;
module.exports.lua_integer2str = lua_integer2str;
module.exports.lua_number2str = lua_number2str;
module.exports.lua_numbertointeger = lua_numbertointeger;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var ldo = __webpack_require__(6);
var lfunc = __webpack_require__(11);
var lobject = __webpack_require__(3);
var lopcodes = __webpack_require__(15);
var lstate = __webpack_require__(12);
var ltable = __webpack_require__(7);
var ltm = __webpack_require__(13);
var luaconf = __webpack_require__(9);
var lvm = __webpack_require__(14);

var CT = defs.constant_types;
var TS = defs.thread_status;

var currentpc = function currentpc(ci) {
    assert(ci.callstatus & lstate.CIST_LUA);
    return ci.l_savedpc - 1;
};

var currentline = function currentline(ci) {
    return ci.func.value.p.lineinfo.length !== 0 ? ci.func.value.p.lineinfo[currentpc(ci)] : -1;
};

/*
** If function yielded, its 'func' can be in the 'extra' field. The
** next function restores 'func' to its correct value for debugging
** purposes. (It exchanges 'func' and 'extra'; so, when called again,
** after debugging, it also "re-restores" ** 'func' to its altered value.
*/
var swapextra = function swapextra(L) {
    if (L.status === TS.LUA_YIELD) {
        var ci = L.ci; /* get function that yielded */
        var temp = ci.funcOff; /* exchange its 'func' and 'extra' values */
        ci.func = L.stack[ci.extra];
        ci.funcOff = ci.extra;
        ci.extra = temp;
    }
};

var lua_sethook = function lua_sethook(L, func, mask, count) {
    if (func === null || mask === 0) {
        /* turn off hooks? */
        mask = 0;
        func = null;
    }
    if (L.ci.callstatus & lstate.CIST_LUA) L.oldpc = L.ci.l_savedpc;
    L.hook = func;
    L.basehookcount = count;
    L.hookcount = L.basehookcount;
    L.hookmask = mask;
};

var lua_gethook = function lua_gethook(L) {
    return L.hook;
};

var lua_gethookmask = function lua_gethookmask(L) {
    return L.hookmask;
};

var lua_gethookcount = function lua_gethookcount(L) {
    return L.basehookcount;
};

var lua_getstack = function lua_getstack(L, level, ar) {
    var ci = void 0;
    var status = void 0;
    if (level < 0) return 0; /* invalid (negative) level */
    for (ci = L.ci; level > 0 && ci !== L.base_ci; ci = ci.previous) {
        level--;
    }if (level === 0 && ci !== L.base_ci) {
        /* level found? */
        status = 1;
        ar.i_ci = ci;
    } else status = 0; /* no such level */
    return status;
};

var upvalname = function upvalname(p, uv) {
    assert(uv < p.upvalues.length);
    var s = p.upvalues[uv].name;
    if (s === null) return ["?".charCodeAt(0)];
    return s.getstr();
};

var findvararg = function findvararg(ci, n) {
    var nparams = ci.func.value.p.numparams;
    if (n >= ci.l_base - ci.funcOff - nparams) return null; /* no such vararg */
    else {
            return {
                pos: ci.funcOff + nparams + n,
                name: defs.to_luastring("(*vararg)", true) /* generic name for any vararg */
            };
        }
};

var findlocal = function findlocal(L, ci, n) {
    var base = void 0,
        name = null;

    if (ci.callstatus & lstate.CIST_LUA) {
        if (n < 0) /* access to vararg values? */
            return findvararg(ci, -n);else {
            base = ci.l_base;
            name = lfunc.luaF_getlocalname(ci.func.value.p, n, currentpc(ci));
        }
    } else base = ci.funcOff + 1;

    if (name === null) {
        /* no 'standard' name? */
        var limit = ci === L.ci ? L.top : ci.next.funcOff;
        if (limit - base >= n && n > 0) /* is 'n' inside 'ci' stack? */
            name = defs.to_luastring("(*temporary)", true); /* generic name for any valid slot */
        else return null; /* no name */
    }
    return {
        pos: base + (n - 1),
        name: name
    };
};

var lua_getlocal = function lua_getlocal(L, ar, n) {
    var name = void 0;
    swapextra(L);
    if (ar === null) {
        /* information about non-active function? */
        if (!L.stack[L.top - 1].ttisLclosure()) /* not a Lua function? */
            name = null;else /* consider live variables at function start (parameters) */
            name = lfunc.luaF_getlocalname(L.stack[L.top - 1].value.p, n, 0);
    } else {
        /* active function; get information through 'ar' */
        var local = findlocal(L, ar.i_ci, n);
        if (local) {
            name = local.name;
            lobject.pushobj2s(L, L.stack[local.pos]);
            assert(L.top <= L.ci.top, "stack overflow");
        } else {
            name = null;
        }
    }
    swapextra(L);
    return name;
};

var lua_setlocal = function lua_setlocal(L, ar, n) {
    var name = void 0;
    swapextra(L);
    var local = findlocal(L, ar.i_ci, n);
    if (local) {
        name = local.name;
        lobject.setobjs2s(L, local.pos, L.top - 1);
        delete L.stack[--L.top]; /* pop value */
    } else {
        name = null;
    }
    swapextra(L);
    return name;
};

var funcinfo = function funcinfo(ar, cl) {
    if (cl === null || cl instanceof lobject.CClosure) {
        ar.source = defs.to_luastring("=[JS]", true);
        ar.linedefined = -1;
        ar.lastlinedefined = -1;
        ar.what = ["J".charCodeAt(0)];
    } else {
        var p = cl.p;
        ar.source = p.source ? p.source.getstr() : defs.to_luastring("=?", true);
        ar.linedefined = p.linedefined;
        ar.lastlinedefined = p.lastlinedefined;
        ar.what = ar.linedefined === 0 ? defs.to_luastring("main", true) : defs.to_luastring("Lua", true);
    }

    ar.short_src = lobject.luaO_chunkid(ar.source, luaconf.LUA_IDSIZE);
};

var collectvalidlines = function collectvalidlines(L, f) {
    if (f === null || f instanceof lobject.CClosure) {
        L.stack[L.top] = new lobject.TValue(CT.LUA_TNIL, null);
        L.top++;
        assert(L.top <= L.ci.top, "stack overflow");
    } else {
        var lineinfo = f.p.lineinfo;
        var t = ltable.luaH_new(L);
        L.stack[L.top] = new lobject.TValue(CT.LUA_TTABLE, t);
        L.top++;
        assert(L.top <= L.ci.top, "stack overflow");
        var v = new lobject.TValue(CT.LUA_TBOOLEAN, true);
        for (var i = 0; i < lineinfo.length; i++) {
            ltable.luaH_setint(t, lineinfo[i], v);
        }
    }
};

var getfuncname = function getfuncname(L, ci) {
    var r = {
        name: null,
        funcname: null
    };
    if (ci === null) return null;else if (ci.callstatus & lstate.CIST_FIN) {
        /* is this a finalizer? */
        r.name = defs.to_luastring("__gc", true);
        r.funcname = defs.to_luastring("metamethod", true); /* report it as such */
        return r;
    }
    /* calling function is a known Lua function? */
    else if (!(ci.callstatus & lstate.CIST_TAIL) && ci.previous.callstatus & lstate.CIST_LUA) return funcnamefromcode(L, ci.previous);else return null; /* no way to find a name */
};

var auxgetinfo = function auxgetinfo(L, what, ar, f, ci) {
    var status = 1;
    for (; what.length > 0; what = what.slice(1)) {
        switch (String.fromCharCode(what[0])) {
            case 'S':
                {
                    funcinfo(ar, f);
                    break;
                }
            case 'l':
                {
                    ar.currentline = ci && ci.callstatus & lstate.CIST_LUA ? currentline(ci) : -1;
                    break;
                }
            case 'u':
                {
                    ar.nups = f === null ? 0 : f.nupvalues;
                    if (f === null || f instanceof lobject.CClosure) {
                        ar.isvararg = true;
                        ar.nparams = 0;
                    } else {
                        ar.isvararg = f.p.is_vararg;
                        ar.nparams = f.p.numparams;
                    }
                    break;
                }
            case 't':
                {
                    ar.istailcall = ci ? ci.callstatus & lstate.CIST_TAIL : 0;
                    break;
                }
            case 'n':
                {
                    var r = getfuncname(L, ci);
                    if (r === null) {
                        ar.namewhat = [];
                        ar.name = null;
                    } else {
                        ar.namewhat = r.funcname;
                        ar.name = r.name;
                    }
                    break;
                }
            case 'L':
            case 'f':
                /* handled by lua_getinfo */
                break;
            default:
                status = 0; /* invalid option */
        }
    }

    return status;
};

var lua_getinfo = function lua_getinfo(L, what, ar) {
    var status = void 0,
        cl = void 0,
        ci = void 0,
        func = void 0;
    swapextra(L);
    if (what[0] === '>'.charCodeAt(0)) {
        ci = null;
        func = L.stack[L.top - 1];
        assert(L, func.ttisfunction(), "function expected");
        what = what.slice(1); /* skip the '>' */
        L.top--; /* pop function */
    } else {
        ci = ar.i_ci;
        func = ci.func;
        assert(ci.func.ttisfunction());
    }

    cl = func.ttisclosure() ? func.value : null;
    status = auxgetinfo(L, what, ar, cl, ci);
    if (what.indexOf('f'.charCodeAt(0)) >= 0) {
        lobject.pushobj2s(L, func);
        assert(L.top <= L.ci.top, "stack overflow");
    }

    swapextra(L);
    if (what.indexOf('L'.charCodeAt(0)) >= 0) collectvalidlines(L, cl);

    return status;
};

var kname = function kname(p, pc, c) {
    var r = {
        name: null,
        funcname: null
    };

    if (lopcodes.ISK(c)) {
        /* is 'c' a constant? */
        var kvalue = p.k[lopcodes.INDEXK(c)];
        if (kvalue.ttisstring()) {
            /* literal constant? */
            r.name = kvalue.svalue(); /* it is its own name */
            return r;
        }
        /* else no reasonable name found */
    } else {
        /* 'c' is a register */
        var what = getobjname(p, pc, c); /* search for 'c' */
        if (what && what.funcname[0] === 'c'.charCodeAt(0)) {
            /* found a constant name? */
            return what; /* 'name' already filled */
        }
        /* else no reasonable name found */
    }
    r.name = [defs.char["?"]];
    return r; /* no reasonable name found */
};

var filterpc = function filterpc(pc, jmptarget) {
    if (pc < jmptarget) /* is code conditional (inside a jump)? */
        return -1; /* cannot know who sets that register */
    else return pc; /* current position sets that register */
};

/*
** try to find last instruction before 'lastpc' that modified register 'reg'
*/
var findsetreg = function findsetreg(p, lastpc, reg) {
    var setreg = -1; /* keep last instruction that changed 'reg' */
    var jmptarget = 0; /* any code before this address is conditional */
    var OCi = lopcodes.OpCodesI;
    for (var pc = 0; pc < lastpc; pc++) {
        var i = p.code[pc];
        var a = i.A;
        switch (i.opcode) {
            case OCi.OP_LOADNIL:
                {
                    var b = i.B;
                    if (a <= reg && reg <= a + b) /* set registers from 'a' to 'a+b' */
                        setreg = filterpc(pc, jmptarget);
                    break;
                }
            case OCi.OP_TFORCALL:
                {
                    if (reg >= a + 2) /* affect all regs above its base */
                        setreg = filterpc(pc, jmptarget);
                    break;
                }
            case OCi.OP_CALL:
            case OCi.OP_TAILCALL:
                {
                    if (reg >= a) /* affect all registers above base */
                        setreg = filterpc(pc, jmptarget);
                    break;
                }
            case OCi.OP_JMP:
                {
                    var _b = i.sBx;
                    var dest = pc + 1 + _b;
                    /* jump is forward and do not skip 'lastpc'? */
                    if (pc < dest && dest <= lastpc) {
                        if (dest > jmptarget) jmptarget = dest; /* update 'jmptarget' */
                    }
                    break;
                }
            default:
                if (lopcodes.testAMode(i.opcode) && reg === a) setreg = filterpc(pc, jmptarget);
                break;
        }
    }

    return setreg;
};

var getobjname = function getobjname(p, lastpc, reg) {
    var r = {
        name: lfunc.luaF_getlocalname(p, reg + 1, lastpc),
        funcname: null
    };

    if (r.name) {
        /* is a local? */
        r.funcname = defs.to_luastring("local", true);
        return r;
    }

    /* else try symbolic execution */
    var pc = findsetreg(p, lastpc, reg);
    var OCi = lopcodes.OpCodesI;
    if (pc !== -1) {
        /* could find instruction? */
        var i = p.code[pc];
        switch (i.opcode) {
            case OCi.OP_MOVE:
                {
                    var b = i.B; /* move from 'b' to 'a' */
                    if (b < i.A) return getobjname(p, pc, b); /* get name for 'b' */
                    break;
                }
            case OCi.OP_GETTABUP:
            case OCi.OP_GETTABLE:
                {
                    var k = i.C; /* key index */
                    var t = i.B; /* table index */
                    var vn = i.opcode === OCi.OP_GETTABLE ? lfunc.luaF_getlocalname(p, t + 1, pc) : upvalname(p, t);
                    r.name = kname(p, pc, k).name;
                    r.funcname = vn && defs.to_jsstring(vn) === "_ENV" ? defs.to_luastring("global", true) : defs.to_luastring("field", true);
                    return r;
                }
            case OCi.OP_GETUPVAL:
                {
                    r.name = upvalname(p, i.B);
                    r.funcname = defs.to_luastring("upvalue", true);
                    return r;
                }
            case OCi.OP_LOADK:
            case OCi.OP_LOADKX:
                {
                    var _b2 = i.opcode === OCi.OP_LOADK ? i.Bx : p.code[pc + 1].Ax;
                    if (p.k[_b2].ttisstring()) {
                        r.name = p.k[_b2].svalue();
                        r.funcname = defs.to_luastring("constant", true);
                        return r;
                    }
                    break;
                }
            case OCi.OP_SELF:
                {
                    var _k = i.C;
                    r.name = kname(p, pc, _k).name;
                    r.funcname = defs.to_luastring("method", true);
                    return r;
                }
            default:
                break;
        }
    }

    return null;
};

/*
** Try to find a name for a function based on the code that called it.
** (Only works when function was called by a Lua function.)
** Returns what the name is (e.g., "for iterator", "method",
** "metamethod") and sets '*name' to point to the name.
*/
var funcnamefromcode = function funcnamefromcode(L, ci) {
    var r = {
        name: null,
        funcname: null
    };

    var tm = 0; /* (initial value avoids warnings) */
    var p = ci.func.value.p; /* calling function */
    var pc = currentpc(ci); /* calling instruction index */
    var i = p.code[pc]; /* calling instruction */
    var OCi = lopcodes.OpCodesI;

    if (ci.callstatus & lstate.CIST_HOOKED) {
        r.name = [defs.char["?"]];
        r.funcname = defs.to_luastring("hook", true);
        return r;
    }

    switch (i.opcode) {
        case OCi.OP_CALL:
        case OCi.OP_TAILCALL:
            return getobjname(p, pc, i.A); /* get function name */
        case OCi.OP_TFORCALL:
            r.name = defs.to_luastring("for iterator", true);
            r.funcname = defs.to_luastring("for iterator", true);
            return r;
        /* other instructions can do calls through metamethods */
        case OCi.OP_SELF:
        case OCi.OP_GETTABUP:
        case OCi.OP_GETTABLE:
            tm = ltm.TMS.TM_INDEX;
            break;
        case OCi.OP_SETTABUP:
        case OCi.OP_SETTABLE:
            tm = ltm.TMS.TM_NEWINDEX;
            break;
        case OCi.OP_ADD:
            tm = ltm.TMS.TM_ADD;break;
        case OCi.OP_SUB:
            tm = ltm.TMS.TM_SUB;break;
        case OCi.OP_MUL:
            tm = ltm.TMS.TM_MUL;break;
        case OCi.OP_MOD:
            tm = ltm.TMS.TM_MOD;break;
        case OCi.OP_POW:
            tm = ltm.TMS.TM_POW;break;
        case OCi.OP_DIV:
            tm = ltm.TMS.TM_DIV;break;
        case OCi.OP_IDIV:
            tm = ltm.TMS.TM_IDIV;break;
        case OCi.OP_BAND:
            tm = ltm.TMS.TM_BAND;break;
        case OCi.OP_BOR:
            tm = ltm.TMS.TM_BOR;break;
        case OCi.OP_BXOR:
            tm = ltm.TMS.TM_BXOR;break;
        case OCi.OP_SHL:
            tm = ltm.TMS.TM_SHL;break;
        case OCi.OP_SHR:
            tm = ltm.TMS.TM_SHR;break;
        case OCi.OP_UNM:
            tm = ltm.TMS.TM_UNM;break;
        case OCi.OP_BNOT:
            tm = ltm.TMS.TM_BNOT;break;
        case OCi.OP_LEN:
            tm = ltm.TMS.TM_LEN;break;
        case OCi.OP_CONCAT:
            tm = ltm.TMS.TM_CONCAT;break;
        case OCi.OP_EQ:
            tm = ltm.TMS.TM_EQ;break;
        case OCi.OP_LT:
            tm = ltm.TMS.TM_LT;break;
        case OCi.OP_LE:
            tm = ltm.TMS.TM_LE;break;
        default:
            return null; /* cannot find a reasonable name */
    }

    r.name = L.l_G.tmname[tm].getstr();
    r.funcname = defs.to_luastring("metamethod", true);
    return r;
};

var isinstack = function isinstack(L, ci, o) {
    for (var i = ci.l_base; i < ci.top; i++) {
        if (L.stack[i] === o) return i;
    }

    return false;
};

/*
** Checks whether value 'o' came from an upvalue. (That can only happen
** with instructions OP_GETTABUP/OP_SETTABUP, which operate directly on
** upvalues.)
*/
var getupvalname = function getupvalname(L, ci, o) {
    var c = ci.func.value;
    for (var i = 0; i < c.nupvalues; i++) {
        if (c.upvals[i].v === o) {
            return {
                name: upvalname(c.p, i),
                funcname: defs.to_luastring('upvalue', true)
            };
        }
    }

    return null;
};

var varinfo = function varinfo(L, o) {
    var ci = L.ci;
    var kind = null;
    if (ci.callstatus & lstate.CIST_LUA) {
        kind = getupvalname(L, ci, o); /* check whether 'o' is an upvalue */
        var stkid = isinstack(L, ci, o);
        if (!kind && stkid) /* no? try a register */
            kind = getobjname(ci.func.value.p, currentpc(ci), stkid - ci.l_base);
    }

    return kind ? lobject.luaO_pushfstring(L, defs.to_luastring(" (%s '%s')", true), kind.funcname, kind.name) : defs.to_luastring("", true);
};

var luaG_typeerror = function luaG_typeerror(L, o, op) {
    var t = ltm.luaT_objtypename(L, o);
    luaG_runerror(L, defs.to_luastring("attempt to %s a %s value%s", true), op, t, varinfo(L, o));
};

var luaG_concaterror = function luaG_concaterror(L, p1, p2) {
    if (p1.ttisstring() || lvm.cvt2str(p1)) p1 = p2;
    luaG_typeerror(L, p1, defs.to_luastring('concatenate', true));
};

/*
** Error when both values are convertible to numbers, but not to integers
*/
var luaG_opinterror = function luaG_opinterror(L, p1, p2, msg) {
    if (lvm.tonumber(p1) === false) p2 = p1;
    luaG_typeerror(L, p2, msg);
};

var luaG_ordererror = function luaG_ordererror(L, p1, p2) {
    var t1 = ltm.luaT_objtypename(L, p1);
    var t2 = ltm.luaT_objtypename(L, p2);
    if (t1.join() === t2.join()) luaG_runerror(L, defs.to_luastring("attempt to compare two %s values", true), t1);else luaG_runerror(L, defs.to_luastring("attempt to compare %s with %s", true), t1, t2);
};

/* add src:line information to 'msg' */
var luaG_addinfo = function luaG_addinfo(L, msg, src, line) {
    var buff = void 0;
    if (src) buff = lobject.luaO_chunkid(src.getstr(), luaconf.LUA_IDSIZE);else buff = ['?'.charCodeAt(0)];

    return lobject.luaO_pushfstring(L, defs.to_luastring("%s:%d: %s", true), buff, line, msg);
};

var luaG_runerror = function luaG_runerror(L, fmt) {
    var ci = L.ci;

    for (var _len = arguments.length, argp = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        argp[_key - 2] = arguments[_key];
    }

    var msg = lobject.luaO_pushvfstring(L, fmt, argp);
    if (ci.callstatus & lstate.CIST_LUA) /* if Lua function, add source:line information */
        luaG_addinfo(L, msg, ci.func.value.p.source, currentline(ci));
    luaG_errormsg(L);
};

var luaG_errormsg = function luaG_errormsg(L) {
    if (L.errfunc !== 0) {
        /* is there an error handling function? */
        var errfunc = L.errfunc;
        lobject.pushobj2s(L, L.stack[L.top - 1]); /* move argument */
        lobject.setobjs2s(L, L.top - 2, errfunc); /* push function */
        ldo.luaD_callnoyield(L, L.top - 2, 1);
    }

    ldo.luaD_throw(L, TS.LUA_ERRRUN);
};

/*
** Error when both values are convertible to numbers, but not to integers
*/
var luaG_tointerror = function luaG_tointerror(L, p1, p2) {
    var temp = lvm.tointeger(p1);
    if (temp === false) p2 = p1;
    luaG_runerror(L, defs.to_luastring("number%s has no integer representation", true), varinfo(L, p2));
};

var luaG_traceexec = function luaG_traceexec(L) {
    var ci = L.ci;
    var mask = L.hookmask;
    var counthook = --L.hookcount === 0 && mask & defs.LUA_MASKCOUNT;
    if (counthook) L.hookcount = L.basehookcount; /* reset count */
    else if (!(mask & defs.LUA_MASKLINE)) return; /* no line hook and count != 0; nothing to be done */
    if (ci.callstatus & lstate.CIST_HOOKYIELD) {
        /* called hook last time? */
        ci.callstatus &= ~lstate.CIST_HOOKYIELD; /* erase mark */
        return; /* do not call hook again (VM yielded, so it did not move) */
    }
    if (counthook) ldo.luaD_hook(L, defs.LUA_HOOKCOUNT, -1); /* call count hook */
    if (mask & defs.LUA_MASKLINE) {
        var p = ci.func.value.p;
        var npc = ci.l_savedpc - 1; // pcRel(ci.u.l.savedpc, p);
        var newline = p.lineinfo.length !== 0 ? p.lineinfo[npc] : -1;
        if (npc === 0 || /* call linehook when enter a new function, */
        ci.l_savedpc <= L.oldpc || /* when jump back (loop), or when */
        newline !== (p.lineinfo.length !== 0 ? p.lineinfo[L.oldpc - 1] : -1)) /* enter a new line */
            ldo.luaD_hook(L, defs.LUA_HOOKLINE, newline); /* call line hook */
    }
    L.oldpc = ci.l_savedpc;
    if (L.status === TS.LUA_YIELD) {
        /* did hook yield? */
        if (counthook) L.hookcount = 1; /* undo decrement to zero */
        ci.l_savedpc--; /* undo increment (resume will increment it again) */
        ci.callstatus |= lstate.CIST_HOOKYIELD; /* mark that it yielded */
        ci.funcOff = L.top - 1; /* protect stack below results */
        ci.func = L.stack[ci.funcOff];
        ldo.luaD_throw(L, TS.LUA_YIELD);
    }
};

module.exports.luaG_addinfo = luaG_addinfo;
module.exports.luaG_concaterror = luaG_concaterror;
module.exports.luaG_errormsg = luaG_errormsg;
module.exports.luaG_opinterror = luaG_opinterror;
module.exports.luaG_ordererror = luaG_ordererror;
module.exports.luaG_runerror = luaG_runerror;
module.exports.luaG_tointerror = luaG_tointerror;
module.exports.luaG_traceexec = luaG_traceexec;
module.exports.luaG_typeerror = luaG_typeerror;
module.exports.lua_gethook = lua_gethook;
module.exports.lua_gethookcount = lua_gethookcount;
module.exports.lua_gethookmask = lua_gethookmask;
module.exports.lua_getinfo = lua_getinfo;
module.exports.lua_getlocal = lua_getlocal;
module.exports.lua_getstack = lua_getstack;
module.exports.lua_sethook = lua_sethook;
module.exports.lua_setlocal = lua_setlocal;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var lobject = __webpack_require__(3);
var CT = defs.constant_types;

var Proto = function Proto(L) {
    _classCallCheck(this, Proto);

    this.id = L.l_G.id_counter++;
    this.k = []; // constants used by the function
    this.p = []; // functions defined inside the function
    this.code = []; // opcodes
    this.cache = null; // last-created closure with this prototype
    this.lineinfo = []; // map from opcodes to source lines (debug information)
    this.upvalues = []; // upvalue information
    this.numparams = 0; // number of fixed parameters
    this.is_vararg = false;
    this.maxstacksize = 0; // number of registers needed by this function
    this.locvars = []; // information about local variables (debug information)
    this.linedefined = 0; // debug information
    this.lastlinedefined = 0; // debug information
    this.source = null; // used for debug information
};

var UpVal = function () {
    function UpVal(L) {
        _classCallCheck(this, UpVal);

        this.id = L.l_G.id_counter++;
        this.v = void 0; /* if open: reference to TValue on stack. if closed: TValue */
        this.vOff = void 0; /* if open: index on stack. if closed: undefined */
        this.refcount = 0;
        this.open_next = null; /* linked list (when open) */
    }

    _createClass(UpVal, [{
        key: 'isopen',
        value: function isopen() {
            return this.vOff !== void 0;
        }
    }]);

    return UpVal;
}();

var luaF_newLclosure = function luaF_newLclosure(L, n) {
    var c = new lobject.LClosure(L, n);
    return c;
};

var luaF_findupval = function luaF_findupval(L, level) {
    var prevp = void 0;
    var p = L.openupval;
    while (p !== null && p.vOff >= level) {
        assert(p.isopen());
        if (p.vOff === level) /* found a corresponding upvalue? */
            return p; /* return it */
        prevp = p;
        p = p.open_next;
    }
    /* not found: create a new upvalue */
    var uv = new UpVal(L);
    /* link it to list of open upvalues */
    uv.open_next = p;
    if (prevp) prevp.open_next = uv;else L.openupval = uv;
    uv.v = L.stack[level]; /* current value lives in the stack */
    uv.vOff = level;
    return uv;
};

var luaF_close = function luaF_close(L, level) {
    while (L.openupval !== null && L.openupval.vOff >= level) {
        var uv = L.openupval;
        assert(uv.isopen());
        L.openupval = uv.open_next; /* remove from 'open' list */
        if (uv.refcount === 0) {
            /* no references? */
            /* free upvalue */
            uv.v = void 0;
            uv.open_next = null;
        } else {
            var from = uv.v;
            uv.v = new lobject.TValue(from.type, from.value);
        }
        uv.vOff = void 0;
    }
};

/*
** fill a closure with new closed upvalues
*/
var luaF_initupvals = function luaF_initupvals(L, cl) {
    for (var i = 0; i < cl.nupvalues; i++) {
        var uv = new UpVal(L);
        uv.refcount = 1;
        uv.v = new lobject.TValue(CT.LUA_TNIL, null);
        cl.upvals[i] = uv;
    }
};

/*
** Look for n-th local variable at line 'line' in function 'func'.
** Returns null if not found.
*/
var luaF_getlocalname = function luaF_getlocalname(f, local_number, pc) {
    for (var i = 0; i < f.locvars.length && f.locvars[i].startpc <= pc; i++) {
        if (pc < f.locvars[i].endpc) {
            /* is variable active? */
            local_number--;
            if (local_number === 0) return f.locvars[i].varname.getstr();
        }
    }
    return null; /* not found */
};

module.exports.MAXUPVAL = 255;
module.exports.Proto = Proto;
module.exports.UpVal = UpVal;
module.exports.luaF_findupval = luaF_findupval;
module.exports.luaF_close = luaF_close;
module.exports.luaF_getlocalname = luaF_getlocalname;
module.exports.luaF_initupvals = luaF_initupvals;
module.exports.luaF_newLclosure = luaF_newLclosure;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var lobject = __webpack_require__(3);
var ldo = __webpack_require__(6);
var lapi = __webpack_require__(17);
var ltable = __webpack_require__(7);
var lfunc = __webpack_require__(11);
var ltm = __webpack_require__(13);
var CT = defs.constant_types;
var TS = defs.thread_status;
var LUA_NUMTAGS = CT.LUA_NUMTAGS;

var EXTRA_STACK = 5;

var BASIC_STACK_SIZE = 2 * defs.LUA_MINSTACK;

var CallInfo = function CallInfo() {
    _classCallCheck(this, CallInfo);

    this.func = null;
    this.funcOff = NaN;
    this.top = NaN;
    this.previous = null;
    this.next = null;

    /* only for Lua functions */
    this.l_base = NaN; /* base for this function */
    this.l_code = null; /* reference to this.func.p.code */
    this.l_savedpc = NaN; /* offset into l_code */
    /* only for JS functions */
    this.c_k = null; /* continuation in case of yields */
    this.c_old_errfunc = null;
    this.c_ctx = null; /* context info. in case of yields */

    this.nresults = NaN;
    this.callstatus = NaN;
};

var lua_State = function lua_State(g) {
    _classCallCheck(this, lua_State);

    this.id = g.id_counter++;

    this.base_ci = new CallInfo(); /* CallInfo for first level (C calling Lua) */
    this.top = NaN; /* first free slot in the stack */
    this.stack_last = NaN; /* last free slot in the stack */
    this.oldpc = NaN; /* last pc traced */

    /* preinit_thread */
    this.l_G = g;
    this.stack = null;
    this.ci = null;
    this.errorJmp = null;
    this.nCcalls = 0;
    this.hook = null;
    this.hookmask = 0;
    this.basehookcount = 0;
    this.allowhook = 1;
    this.hookcount = this.basehookcount;
    this.openupval = null;
    this.nny = 1;
    this.status = TS.LUA_OK;
    this.errfunc = 0;
};

var global_State = function global_State() {
    _classCallCheck(this, global_State);

    this.id_counter = 0; /* used to give objects unique ids */

    this.mainthread = null;
    this.l_registry = new lobject.TValue(CT.LUA_TNIL, null);
    this.panic = null;
    this.atnativeerror = null;
    this.version = null;
    this.tmname = new Array(ltm.TMS.TM_N);
    this.mt = new Array(LUA_NUMTAGS);
};

var luaE_extendCI = function luaE_extendCI(L) {
    var ci = new CallInfo();
    L.ci.next = ci;
    ci.previous = L.ci;
    ci.next = null;
    L.ci = ci;
    return ci;
};

var luaE_freeCI = function luaE_freeCI(L) {
    var ci = L.ci;
    ci.next = null;
};

var stack_init = function stack_init(L1, L) {
    L1.stack = new Array(BASIC_STACK_SIZE);
    L1.top = 0;
    L1.stack_last = BASIC_STACK_SIZE - EXTRA_STACK;
    /* initialize first ci */
    var ci = L1.base_ci;
    ci.next = ci.previous = null;
    ci.callstatus = 0;
    ci.funcOff = L1.top;
    ci.func = L1.stack[L1.top];
    L1.stack[L1.top++] = new lobject.TValue(CT.LUA_TNIL, null);
    ci.top = L1.top + defs.LUA_MINSTACK;
    L1.ci = ci;
};

var freestack = function freestack(L) {
    L.ci = L.base_ci;
    luaE_freeCI(L);
    L.stack = null;
};

/*
** Create registry table and its predefined values
*/
var init_registry = function init_registry(L, g) {
    var registry = ltable.luaH_new(L);
    g.l_registry.sethvalue(registry);
    ltable.luaH_setint(registry, defs.LUA_RIDX_MAINTHREAD, new lobject.TValue(CT.LUA_TTHREAD, L));
    ltable.luaH_setint(registry, defs.LUA_RIDX_GLOBALS, new lobject.TValue(CT.LUA_TTABLE, ltable.luaH_new(L)));
};

/*
** open parts of the state that may cause memory-allocation errors.
** ('g->version' !== NULL flags that the state was completely build)
*/
var f_luaopen = function f_luaopen(L) {
    var g = L.l_G;
    stack_init(L, L);
    init_registry(L, g);
    ltm.luaT_init(L);
    g.version = lapi.lua_version(null);
};

var lua_newthread = function lua_newthread(L) {
    var g = L.l_G;
    var L1 = new lua_State(g);
    L.stack[L.top] = new lobject.TValue(CT.LUA_TTHREAD, L1);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
    L1.hookmask = L.hookmask;
    L1.basehookcount = L.basehookcount;
    L1.hook = L.hook;
    L1.hookcount = L1.basehookcount;
    stack_init(L1, L);
    return L1;
};

var luaE_freethread = function luaE_freethread(L, L1) {
    lfunc.luaF_close(L1, L1.stack);
    freestack(L1);
};

var lua_newstate = function lua_newstate() {
    var g = new global_State();
    var L = new lua_State(g);
    g.mainthread = L;

    if (ldo.luaD_rawrunprotected(L, f_luaopen, null) !== TS.LUA_OK) {
        L = null;
    }

    return L;
};

var close_state = function close_state(L) {
    lfunc.luaF_close(L, L.stack); /* close all upvalues for this thread */
    freestack(L);
};

var lua_close = function lua_close(L) {
    L = L.l_G.mainthread; /* only the main thread can be closed */
    close_state(L);
};

module.exports.lua_State = lua_State;
module.exports.CallInfo = CallInfo;
module.exports.CIST_OAH = 1 << 0; /* original value of 'allowhook' */
module.exports.CIST_LUA = 1 << 1; /* call is running a Lua function */
module.exports.CIST_HOOKED = 1 << 2; /* call is running a debug hook */
module.exports.CIST_FRESH = 1 << 3; /* call is running on a fresh invocation of luaV_execute */
module.exports.CIST_YPCALL = 1 << 4; /* call is a yieldable protected call */
module.exports.CIST_TAIL = 1 << 5; /* call was tail called */
module.exports.CIST_HOOKYIELD = 1 << 6; /* last hook called yielded */
module.exports.CIST_LEQ = 1 << 7; /* using __lt for __le */
module.exports.CIST_FIN = 1 << 8; /* call is running a finalizer */
module.exports.EXTRA_STACK = EXTRA_STACK;
module.exports.lua_close = lua_close;
module.exports.lua_newstate = lua_newstate;
module.exports.lua_newthread = lua_newthread;
module.exports.luaE_extendCI = luaE_extendCI;
module.exports.luaE_freeCI = luaE_freeCI;
module.exports.luaE_freethread = luaE_freethread;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var lobject = __webpack_require__(3);
var ldo = __webpack_require__(6);
var lstate = __webpack_require__(12);
var lstring = __webpack_require__(8);
var ltable = __webpack_require__(7);
var ldebug = __webpack_require__(10);
var lvm = __webpack_require__(14);
var CT = defs.constant_types;

var luaT_typenames_ = ["no value", "nil", "boolean", "userdata", "number", "string", "table", "function", "userdata", "thread", "proto" /* this last case is used for tests only */
].map(function (e) {
    return defs.to_luastring(e);
});

var ttypename = function ttypename(t) {
    return luaT_typenames_[t + 1];
};

/*
* WARNING: if you change the order of this enumeration,
* grep "ORDER TM" and "ORDER OP"
*/
var TMS = {
    TM_INDEX: 0,
    TM_NEWINDEX: 1,
    TM_GC: 2,
    TM_MODE: 3,
    TM_LEN: 4,
    TM_EQ: 5, /* last tag method with fast access */
    TM_ADD: 6,
    TM_SUB: 7,
    TM_MUL: 8,
    TM_MOD: 9,
    TM_POW: 10,
    TM_DIV: 11,
    TM_IDIV: 12,
    TM_BAND: 13,
    TM_BOR: 14,
    TM_BXOR: 15,
    TM_SHL: 16,
    TM_SHR: 17,
    TM_UNM: 18,
    TM_BNOT: 19,
    TM_LT: 20,
    TM_LE: 21,
    TM_CONCAT: 22,
    TM_CALL: 23,
    TM_N: 24 /* number of elements in the enum */
};

var luaT_init = function luaT_init(L) {
    L.l_G.tmname[TMS.TM_INDEX] = new lstring.luaS_new(L, defs.to_luastring("__index", true));
    L.l_G.tmname[TMS.TM_NEWINDEX] = new lstring.luaS_new(L, defs.to_luastring("__newindex", true));
    L.l_G.tmname[TMS.TM_GC] = new lstring.luaS_new(L, defs.to_luastring("__gc", true));
    L.l_G.tmname[TMS.TM_MODE] = new lstring.luaS_new(L, defs.to_luastring("__mode", true));
    L.l_G.tmname[TMS.TM_LEN] = new lstring.luaS_new(L, defs.to_luastring("__len", true));
    L.l_G.tmname[TMS.TM_EQ] = new lstring.luaS_new(L, defs.to_luastring("__eq", true));
    L.l_G.tmname[TMS.TM_ADD] = new lstring.luaS_new(L, defs.to_luastring("__add", true));
    L.l_G.tmname[TMS.TM_SUB] = new lstring.luaS_new(L, defs.to_luastring("__sub", true));
    L.l_G.tmname[TMS.TM_MUL] = new lstring.luaS_new(L, defs.to_luastring("__mul", true));
    L.l_G.tmname[TMS.TM_MOD] = new lstring.luaS_new(L, defs.to_luastring("__mod", true));
    L.l_G.tmname[TMS.TM_POW] = new lstring.luaS_new(L, defs.to_luastring("__pow", true));
    L.l_G.tmname[TMS.TM_DIV] = new lstring.luaS_new(L, defs.to_luastring("__div", true));
    L.l_G.tmname[TMS.TM_IDIV] = new lstring.luaS_new(L, defs.to_luastring("__idiv", true));
    L.l_G.tmname[TMS.TM_BAND] = new lstring.luaS_new(L, defs.to_luastring("__band", true));
    L.l_G.tmname[TMS.TM_BOR] = new lstring.luaS_new(L, defs.to_luastring("__bor", true));
    L.l_G.tmname[TMS.TM_BXOR] = new lstring.luaS_new(L, defs.to_luastring("__bxor", true));
    L.l_G.tmname[TMS.TM_SHL] = new lstring.luaS_new(L, defs.to_luastring("__shl", true));
    L.l_G.tmname[TMS.TM_SHR] = new lstring.luaS_new(L, defs.to_luastring("__shr", true));
    L.l_G.tmname[TMS.TM_UNM] = new lstring.luaS_new(L, defs.to_luastring("__unm", true));
    L.l_G.tmname[TMS.TM_BNOT] = new lstring.luaS_new(L, defs.to_luastring("__bnot", true));
    L.l_G.tmname[TMS.TM_LT] = new lstring.luaS_new(L, defs.to_luastring("__lt", true));
    L.l_G.tmname[TMS.TM_LE] = new lstring.luaS_new(L, defs.to_luastring("__le", true));
    L.l_G.tmname[TMS.TM_CONCAT] = new lstring.luaS_new(L, defs.to_luastring("__concat", true));
    L.l_G.tmname[TMS.TM_CALL] = new lstring.luaS_new(L, defs.to_luastring("__call", true));
};

/*
** Return the name of the type of an object. For tables and userdata
** with metatable, use their '__name' metafield, if present.
*/
var __name = defs.to_luastring('__name', true);
var luaT_objtypename = function luaT_objtypename(L, o) {
    var mt = void 0;
    if (o.ttistable() && (mt = o.value.metatable) !== null || o.ttisfulluserdata() && (mt = o.value.metatable) !== null) {
        var name = ltable.luaH_getstr(mt, lstring.luaS_bless(L, __name));
        if (name.ttisstring()) return name.svalue();
    }
    return ttypename(o.ttnov());
};

var luaT_callTM = function luaT_callTM(L, f, p1, p2, p3, hasres) {
    var func = L.top;

    lobject.pushobj2s(L, f); /* push function (assume EXTRA_STACK) */
    lobject.pushobj2s(L, p1); /* 1st argument */
    lobject.pushobj2s(L, p2); /* 2nd argument */

    if (!hasres) /* no result? 'p3' is third argument */
        lobject.pushobj2s(L, p3); /* 3rd argument */

    if (L.ci.callstatus & lstate.CIST_LUA) ldo.luaD_call(L, func, hasres);else ldo.luaD_callnoyield(L, func, hasres);

    if (hasres) {
        /* if has result, move it to its place */
        var tv = L.stack[L.top - 1];
        delete L.stack[--L.top];
        p3.setfrom(tv);
    }
};

var luaT_callbinTM = function luaT_callbinTM(L, p1, p2, res, event) {
    var tm = luaT_gettmbyobj(L, p1, event);
    if (tm.ttisnil()) tm = luaT_gettmbyobj(L, p2, event);
    if (tm.ttisnil()) return false;
    luaT_callTM(L, tm, p1, p2, res, 1);
    return true;
};

var luaT_trybinTM = function luaT_trybinTM(L, p1, p2, res, event) {
    if (!luaT_callbinTM(L, p1, p2, res, event)) {
        switch (event) {
            case TMS.TM_CONCAT:
                ldebug.luaG_concaterror(L, p1, p2);
            case TMS.TM_BAND:case TMS.TM_BOR:case TMS.TM_BXOR:
            case TMS.TM_SHL:case TMS.TM_SHR:case TMS.TM_BNOT:
                {
                    var n1 = lvm.tonumber(p1);
                    var n2 = lvm.tonumber(p2);
                    if (n1 !== false && n2 !== false) ldebug.luaG_tointerror(L, p1, p2);else ldebug.luaG_opinterror(L, p1, p2, defs.to_luastring("perform bitwise operation on", true));
                }
            default:
                ldebug.luaG_opinterror(L, p1, p2, defs.to_luastring("perform arithmetic on", true));
        }
    }
};

var luaT_callorderTM = function luaT_callorderTM(L, p1, p2, event) {
    var res = new lobject.TValue();
    if (!luaT_callbinTM(L, p1, p2, res, event)) return null;else return !res.l_isfalse();
};

var fasttm = function fasttm(l, et, e) {
    return et === null ? null : et.flags & 1 << e ? null : luaT_gettm(et, e, l.l_G.tmname[e]);
};

var luaT_gettm = function luaT_gettm(events, event, ename) {
    var tm = ltable.luaH_getstr(events, ename);
    assert(event <= TMS.TM_EQ);
    if (tm.ttisnil()) {
        /* no tag method? */
        events.flags |= 1 << event; /* cache this fact */
        return null;
    } else return tm;
};

var luaT_gettmbyobj = function luaT_gettmbyobj(L, o, event) {
    var mt = void 0;
    switch (o.ttnov()) {
        case CT.LUA_TTABLE:
        case CT.LUA_TUSERDATA:
            mt = o.value.metatable;
            break;
        default:
            mt = L.l_G.mt[o.ttnov()];
    }

    return mt ? ltable.luaH_getstr(mt, L.l_G.tmname[event]) : lobject.luaO_nilobject;
};

module.exports.fasttm = fasttm;
module.exports.TMS = TMS;
module.exports.luaT_callTM = luaT_callTM;
module.exports.luaT_callbinTM = luaT_callbinTM;
module.exports.luaT_trybinTM = luaT_trybinTM;
module.exports.luaT_callorderTM = luaT_callorderTM;
module.exports.luaT_gettm = luaT_gettm;
module.exports.luaT_gettmbyobj = luaT_gettmbyobj;
module.exports.luaT_init = luaT_init;
module.exports.luaT_objtypename = luaT_objtypename;
module.exports.ttypename = ttypename;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var lopcodes = __webpack_require__(15);
var luaconf = __webpack_require__(9);
var lobject = __webpack_require__(3);
var lfunc = __webpack_require__(11);
var lstate = __webpack_require__(12);
var lstring = __webpack_require__(8);
var llimit = __webpack_require__(4);
var ldo = __webpack_require__(6);
var ltm = __webpack_require__(13);
var ltable = __webpack_require__(7);
var ldebug = __webpack_require__(10);
var CT = defs.constant_types;
var LUA_MULTRET = defs.LUA_MULTRET;

/*
** finish execution of an opcode interrupted by an yield
*/
var luaV_finishOp = function luaV_finishOp(L) {
    var ci = L.ci;
    var OCi = lopcodes.OpCodesI;
    var base = ci.l_base;
    var inst = ci.l_code[ci.l_savedpc - 1]; /* interrupted instruction */
    var op = inst.opcode;

    switch (op) {/* finish its execution */
        case OCi.OP_ADD:case OCi.OP_SUB:case OCi.OP_MUL:case OCi.OP_DIV:case OCi.OP_IDIV:
        case OCi.OP_BAND:case OCi.OP_BOR:case OCi.OP_BXOR:case OCi.OP_SHL:case OCi.OP_SHR:
        case OCi.OP_MOD:case OCi.OP_POW:
        case OCi.OP_UNM:case OCi.OP_BNOT:case OCi.OP_LEN:
        case OCi.OP_GETTABUP:case OCi.OP_GETTABLE:case OCi.OP_SELF:
            {
                lobject.setobjs2s(L, base + inst.A, L.top - 1);
                delete L.stack[--L.top];
                break;
            }
        case OCi.OP_LE:case OCi.OP_LT:case OCi.OP_EQ:
            {
                var res = !L.stack[L.top - 1].l_isfalse();
                delete L.stack[--L.top];
                if (ci.callstatus & lstate.CIST_LEQ) {
                    /* "<=" using "<" instead? */
                    assert(op === OCi.OP_LE);
                    ci.callstatus ^= lstate.CIST_LEQ; /* clear mark */
                    res = !res; /* negate result */
                }
                assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_JMP);
                if (res !== (inst.A ? true : false)) /* condition failed? */
                    ci.l_savedpc++; /* skip jump instruction */
                break;
            }
        case OCi.OP_CONCAT:
            {
                var top = L.top - 1; /* top when 'luaT_trybinTM' was called */
                var b = inst.B; /* first element to concatenate */
                var total = top - 1 - (base + b); /* yet to concatenate */
                lobject.setobjs2s(L, top - 2, top); /* put TM result in proper position */
                if (total > 1) {
                    /* are there elements to concat? */
                    L.top = top - 1; /* top is one after last element (at top-2) */
                    luaV_concat(L, total); /* concat them (may yield again) */
                }
                /* move final result to final position */
                lobject.setobjs2s(L, ci.l_base + inst.A, L.top - 1);
                ldo.adjust_top(L, ci.top); /* restore top */
                break;
            }
        case OCi.OP_TFORCALL:
            {
                assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_TFORLOOP);
                ldo.adjust_top(L, ci.top); /* correct top */
                break;
            }
        case OCi.OP_CALL:
            {
                if (inst.C - 1 >= 0) /* nresults >= 0? */
                    ldo.adjust_top(L, ci.top); /* adjust results */
                break;
            }
    }
};

var RA = function RA(L, base, i) {
    return base + i.A;
};

var RB = function RB(L, base, i) {
    return base + i.B;
};

var RC = function RC(L, base, i) {
    return base + i.C;
};

var RKB = function RKB(L, base, k, i) {
    return lopcodes.ISK(i.B) ? k[lopcodes.INDEXK(i.B)] : L.stack[base + i.B];
};

var RKC = function RKC(L, base, k, i) {
    return lopcodes.ISK(i.C) ? k[lopcodes.INDEXK(i.C)] : L.stack[base + i.C];
};

var luaV_execute = function luaV_execute(L) {
    var OCi = lopcodes.OpCodesI;
    var ci = L.ci;

    ci.callstatus |= lstate.CIST_FRESH;
    newframe: for (;;) {
        assert(ci === L.ci);
        var cl = ci.func.value;
        var k = cl.p.k;
        var base = ci.l_base;

        var i = ci.l_code[ci.l_savedpc++];

        if (L.hookmask & (defs.LUA_MASKLINE | defs.LUA_MASKCOUNT)) {
            ldebug.luaG_traceexec(L);
        }

        var ra = RA(L, base, i);
        var opcode = i.opcode;

        switch (opcode) {
            case OCi.OP_MOVE:
                {
                    lobject.setobjs2s(L, ra, RB(L, base, i));
                    break;
                }
            case OCi.OP_LOADK:
                {
                    var konst = k[i.Bx];
                    lobject.setobj2s(L, ra, konst);
                    break;
                }
            case OCi.OP_LOADKX:
                {
                    assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_EXTRAARG);
                    var _konst = k[ci.l_code[ci.l_savedpc++].Ax];
                    lobject.setobj2s(L, ra, _konst);
                    break;
                }
            case OCi.OP_LOADBOOL:
                {
                    L.stack[ra].setbvalue(i.B !== 0);

                    if (i.C !== 0) ci.l_savedpc++; /* skip next instruction (if C) */

                    break;
                }
            case OCi.OP_LOADNIL:
                {
                    for (var j = 0; j <= i.B; j++) {
                        L.stack[ra + j].setnilvalue();
                    }break;
                }
            case OCi.OP_GETUPVAL:
                {
                    var b = i.B;
                    lobject.setobj2s(L, ra, cl.upvals[b].v);
                    break;
                }
            case OCi.OP_GETTABUP:
                {
                    var upval = cl.upvals[i.B].v;
                    var rc = RKC(L, base, k, i);
                    luaV_gettable(L, upval, rc, ra);
                    break;
                }
            case OCi.OP_GETTABLE:
                {
                    var rb = L.stack[RB(L, base, i)];
                    var _rc = RKC(L, base, k, i);
                    luaV_gettable(L, rb, _rc, ra);
                    break;
                }
            case OCi.OP_SETTABUP:
                {
                    var _upval = cl.upvals[i.A].v;
                    var _rb = RKB(L, base, k, i);
                    var _rc2 = RKC(L, base, k, i);
                    settable(L, _upval, _rb, _rc2);
                    break;
                }
            case OCi.OP_SETUPVAL:
                {
                    var uv = cl.upvals[i.B];
                    uv.v.setfrom(L.stack[ra]);
                    break;
                }
            case OCi.OP_SETTABLE:
                {
                    var table = L.stack[ra];
                    var key = RKB(L, base, k, i);
                    var v = RKC(L, base, k, i);

                    settable(L, table, key, v);
                    break;
                }
            case OCi.OP_NEWTABLE:
                {
                    L.stack[ra].sethvalue(ltable.luaH_new(L));
                    break;
                }
            case OCi.OP_SELF:
                {
                    var _rb2 = RB(L, base, i);
                    var _rc3 = RKC(L, base, k, i);
                    lobject.setobjs2s(L, ra + 1, _rb2);
                    luaV_gettable(L, L.stack[_rb2], _rc3, ra);
                    break;
                }
            case OCi.OP_ADD:
                {
                    var op1 = RKB(L, base, k, i);
                    var op2 = RKC(L, base, k, i);
                    var numberop1 = void 0,
                        numberop2 = void 0;

                    if (op1.ttisinteger() && op2.ttisinteger()) {
                        L.stack[ra].setivalue(op1.value + op2.value | 0);
                    } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                        L.stack[ra].setfltvalue(numberop1 + numberop2);
                    } else {
                        ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_ADD);
                    }
                    break;
                }
            case OCi.OP_SUB:
                {
                    var _op = RKB(L, base, k, i);
                    var _op2 = RKC(L, base, k, i);
                    var _numberop = void 0,
                        _numberop2 = void 0;

                    if (_op.ttisinteger() && _op2.ttisinteger()) {
                        L.stack[ra].setivalue(_op.value - _op2.value | 0);
                    } else if ((_numberop = tonumber(_op)) !== false && (_numberop2 = tonumber(_op2)) !== false) {
                        L.stack[ra].setfltvalue(_numberop - _numberop2);
                    } else {
                        ltm.luaT_trybinTM(L, _op, _op2, L.stack[ra], ltm.TMS.TM_SUB);
                    }
                    break;
                }
            case OCi.OP_MUL:
                {
                    var _op3 = RKB(L, base, k, i);
                    var _op4 = RKC(L, base, k, i);
                    var _numberop3 = void 0,
                        _numberop4 = void 0;

                    if (_op3.ttisinteger() && _op4.ttisinteger()) {
                        L.stack[ra].setivalue(Math.imul(_op3.value, _op4.value));
                    } else if ((_numberop3 = tonumber(_op3)) !== false && (_numberop4 = tonumber(_op4)) !== false) {
                        L.stack[ra].setfltvalue(_numberop3 * _numberop4);
                    } else {
                        ltm.luaT_trybinTM(L, _op3, _op4, L.stack[ra], ltm.TMS.TM_MUL);
                    }
                    break;
                }
            case OCi.OP_MOD:
                {
                    var _op5 = RKB(L, base, k, i);
                    var _op6 = RKC(L, base, k, i);
                    var _numberop5 = void 0,
                        _numberop6 = void 0;

                    if (_op5.ttisinteger() && _op6.ttisinteger()) {
                        L.stack[ra].setivalue(luaV_mod(L, _op5.value, _op6.value));
                    } else if ((_numberop5 = tonumber(_op5)) !== false && (_numberop6 = tonumber(_op6)) !== false) {
                        L.stack[ra].setfltvalue(llimit.luai_nummod(L, _numberop5, _numberop6));
                    } else {
                        ltm.luaT_trybinTM(L, _op5, _op6, L.stack[ra], ltm.TMS.TM_MOD);
                    }
                    break;
                }
            case OCi.OP_POW:
                {
                    var _op7 = RKB(L, base, k, i);
                    var _op8 = RKC(L, base, k, i);
                    var _numberop7 = void 0,
                        _numberop8 = void 0;

                    if ((_numberop7 = tonumber(_op7)) !== false && (_numberop8 = tonumber(_op8)) !== false) {
                        L.stack[ra].setfltvalue(Math.pow(_numberop7, _numberop8));
                    } else {
                        ltm.luaT_trybinTM(L, _op7, _op8, L.stack[ra], ltm.TMS.TM_POW);
                    }
                    break;
                }
            case OCi.OP_DIV:
                {
                    var _op9 = RKB(L, base, k, i);
                    var _op10 = RKC(L, base, k, i);
                    var _numberop9 = void 0,
                        _numberop10 = void 0;

                    if ((_numberop9 = tonumber(_op9)) !== false && (_numberop10 = tonumber(_op10)) !== false) {
                        L.stack[ra].setfltvalue(_numberop9 / _numberop10);
                    } else {
                        ltm.luaT_trybinTM(L, _op9, _op10, L.stack[ra], ltm.TMS.TM_DIV);
                    }
                    break;
                }
            case OCi.OP_IDIV:
                {
                    var _op11 = RKB(L, base, k, i);
                    var _op12 = RKC(L, base, k, i);
                    var _numberop11 = void 0,
                        _numberop12 = void 0;

                    if (_op11.ttisinteger() && _op12.ttisinteger()) {
                        L.stack[ra].setivalue(luaV_div(L, _op11.value, _op12.value));
                    } else if ((_numberop11 = tonumber(_op11)) !== false && (_numberop12 = tonumber(_op12)) !== false) {
                        L.stack[ra].setfltvalue(Math.floor(_numberop11 / _numberop12));
                    } else {
                        ltm.luaT_trybinTM(L, _op11, _op12, L.stack[ra], ltm.TMS.TM_IDIV);
                    }
                    break;
                }
            case OCi.OP_BAND:
                {
                    var _op13 = RKB(L, base, k, i);
                    var _op14 = RKC(L, base, k, i);
                    var _numberop13 = void 0,
                        _numberop14 = void 0;

                    if ((_numberop13 = tointeger(_op13)) !== false && (_numberop14 = tointeger(_op14)) !== false) {
                        L.stack[ra].setivalue(_numberop13 & _numberop14);
                    } else {
                        ltm.luaT_trybinTM(L, _op13, _op14, L.stack[ra], ltm.TMS.TM_BAND);
                    }
                    break;
                }
            case OCi.OP_BOR:
                {
                    var _op15 = RKB(L, base, k, i);
                    var _op16 = RKC(L, base, k, i);
                    var _numberop15 = void 0,
                        _numberop16 = void 0;

                    if ((_numberop15 = tointeger(_op15)) !== false && (_numberop16 = tointeger(_op16)) !== false) {
                        L.stack[ra].setivalue(_numberop15 | _numberop16);
                    } else {
                        ltm.luaT_trybinTM(L, _op15, _op16, L.stack[ra], ltm.TMS.TM_BOR);
                    }
                    break;
                }
            case OCi.OP_BXOR:
                {
                    var _op17 = RKB(L, base, k, i);
                    var _op18 = RKC(L, base, k, i);
                    var _numberop17 = void 0,
                        _numberop18 = void 0;

                    if ((_numberop17 = tointeger(_op17)) !== false && (_numberop18 = tointeger(_op18)) !== false) {
                        L.stack[ra].setivalue(_numberop17 ^ _numberop18);
                    } else {
                        ltm.luaT_trybinTM(L, _op17, _op18, L.stack[ra], ltm.TMS.TM_BXOR);
                    }
                    break;
                }
            case OCi.OP_SHL:
                {
                    var _op19 = RKB(L, base, k, i);
                    var _op20 = RKC(L, base, k, i);
                    var _numberop19 = void 0,
                        _numberop20 = void 0;

                    if ((_numberop19 = tointeger(_op19)) !== false && (_numberop20 = tointeger(_op20)) !== false) {
                        L.stack[ra].setivalue(luaV_shiftl(_numberop19, _numberop20));
                    } else {
                        ltm.luaT_trybinTM(L, _op19, _op20, L.stack[ra], ltm.TMS.TM_SHL);
                    }
                    break;
                }
            case OCi.OP_SHR:
                {
                    var _op21 = RKB(L, base, k, i);
                    var _op22 = RKC(L, base, k, i);
                    var _numberop21 = void 0,
                        _numberop22 = void 0;

                    if ((_numberop21 = tointeger(_op21)) !== false && (_numberop22 = tointeger(_op22)) !== false) {
                        L.stack[ra].setivalue(luaV_shiftl(_numberop21, -_numberop22));
                    } else {
                        ltm.luaT_trybinTM(L, _op21, _op22, L.stack[ra], ltm.TMS.TM_SHR);
                    }
                    break;
                }
            case OCi.OP_UNM:
                {
                    var op = L.stack[RB(L, base, i)];
                    var numberop = void 0;

                    if (op.ttisinteger()) {
                        L.stack[ra].setivalue(-op.value | 0);
                    } else if ((numberop = tonumber(op)) !== false) {
                        L.stack[ra].setfltvalue(-numberop);
                    } else {
                        ltm.luaT_trybinTM(L, op, op, L.stack[ra], ltm.TMS.TM_UNM);
                    }
                    break;
                }
            case OCi.OP_BNOT:
                {
                    var _op23 = L.stack[RB(L, base, i)];

                    if (_op23.ttisinteger()) {
                        L.stack[ra].setivalue(~_op23.value);
                    } else {
                        ltm.luaT_trybinTM(L, _op23, _op23, L.stack[ra], ltm.TMS.TM_BNOT);
                    }
                    break;
                }
            case OCi.OP_NOT:
                {
                    var _op24 = L.stack[RB(L, base, i)];
                    L.stack[ra].setbvalue(_op24.l_isfalse());
                    break;
                }
            case OCi.OP_LEN:
                {
                    luaV_objlen(L, L.stack[ra], L.stack[RB(L, base, i)]);
                    break;
                }
            case OCi.OP_CONCAT:
                {
                    var _b = i.B;
                    var c = i.C;
                    L.top = base + c + 1; /* mark the end of concat operands */
                    luaV_concat(L, c - _b + 1);
                    var _rb3 = base + _b;
                    lobject.setobjs2s(L, ra, _rb3);
                    ldo.adjust_top(L, ci.top); /* restore top */
                    break;
                }
            case OCi.OP_JMP:
                {
                    dojump(L, ci, i, 0);
                    break;
                }
            case OCi.OP_EQ:
                {
                    if (luaV_equalobj(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A) ci.l_savedpc++;else donextjump(L, ci);
                    break;
                }
            case OCi.OP_LT:
                {
                    if (luaV_lessthan(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A) ci.l_savedpc++;else donextjump(L, ci);
                    break;
                }
            case OCi.OP_LE:
                {
                    if (luaV_lessequal(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A) ci.l_savedpc++;else donextjump(L, ci);
                    break;
                }
            case OCi.OP_TEST:
                {
                    if (i.C ? L.stack[ra].l_isfalse() : !L.stack[ra].l_isfalse()) ci.l_savedpc++;else donextjump(L, ci);
                    break;
                }
            case OCi.OP_TESTSET:
                {
                    var rbIdx = RB(L, base, i);
                    var _rb4 = L.stack[rbIdx];
                    if (i.C ? _rb4.l_isfalse() : !_rb4.l_isfalse()) ci.l_savedpc++;else {
                        lobject.setobjs2s(L, ra, rbIdx);
                        donextjump(L, ci);
                    }
                    break;
                }
            case OCi.OP_CALL:
                {
                    var _b2 = i.B;
                    var nresults = i.C - 1;
                    if (_b2 !== 0) ldo.adjust_top(L, ra + _b2); /* else previous instruction set top */
                    if (ldo.luaD_precall(L, ra, nresults)) {
                        if (nresults >= 0) ldo.adjust_top(L, ci.top); /* adjust results */
                    } else {
                        ci = L.ci;
                        continue newframe;
                    }

                    break;
                }
            case OCi.OP_TAILCALL:
                {
                    var _b3 = i.B;
                    if (_b3 !== 0) ldo.adjust_top(L, ra + _b3); /* else previous instruction set top */
                    if (ldo.luaD_precall(L, ra, LUA_MULTRET)) {// JS function
                    } else {
                        /* tail call: put called frame (n) in place of caller one (o) */
                        var nci = L.ci;
                        var oci = nci.previous;
                        var nfunc = nci.func;
                        var nfuncOff = nci.funcOff;
                        var ofuncOff = oci.funcOff;
                        var lim = nci.l_base + nfunc.value.p.numparams;
                        if (cl.p.p.length > 0) lfunc.luaF_close(L, oci.l_base);
                        for (var aux = 0; nfuncOff + aux < lim; aux++) {
                            lobject.setobjs2s(L, ofuncOff + aux, nfuncOff + aux);
                        }oci.l_base = ofuncOff + (nci.l_base - nfuncOff);
                        oci.top = ofuncOff + (L.top - nfuncOff);
                        ldo.adjust_top(L, oci.top); /* correct top */
                        oci.l_code = nci.l_code;
                        oci.l_savedpc = nci.l_savedpc;
                        oci.callstatus |= lstate.CIST_TAIL;
                        oci.next = null;
                        ci = L.ci = oci;

                        assert(L.top === oci.l_base + L.stack[ofuncOff].value.p.maxstacksize);

                        continue newframe;
                    }
                    break;
                }
            case OCi.OP_RETURN:
                {
                    if (cl.p.p.length > 0) lfunc.luaF_close(L, base);
                    var _b4 = ldo.luaD_poscall(L, ci, ra, i.B !== 0 ? i.B - 1 : L.top - ra);

                    if (ci.callstatus & lstate.CIST_FRESH) return; /* external invocation: return */
                    /* invocation via reentry: continue execution */
                    ci = L.ci;
                    if (_b4) ldo.adjust_top(L, ci.top);
                    assert(ci.callstatus & lstate.CIST_LUA);
                    assert(ci.l_code[ci.l_savedpc - 1].opcode === OCi.OP_CALL);
                    continue newframe;
                }
            case OCi.OP_FORLOOP:
                {
                    if (L.stack[ra].ttisinteger()) {
                        /* integer loop? */
                        var step = L.stack[ra + 2].value;
                        var idx = L.stack[ra].value + step | 0;
                        var limit = L.stack[ra + 1].value;

                        if (0 < step ? idx <= limit : limit <= idx) {
                            ci.l_savedpc += i.sBx;
                            L.stack[ra].chgivalue(idx); /* update internal index... */
                            L.stack[ra + 3].setivalue(idx);
                        }
                    } else {
                        /* floating loop */
                        var _step = L.stack[ra + 2].value;
                        var _idx = L.stack[ra].value + _step;
                        var _limit = L.stack[ra + 1].value;

                        if (0 < _step ? _idx <= _limit : _limit <= _idx) {
                            ci.l_savedpc += i.sBx;
                            L.stack[ra].chgfltvalue(_idx); /* update internal index... */
                            L.stack[ra + 3].setfltvalue(_idx);
                        }
                    }
                    break;
                }
            case OCi.OP_FORPREP:
                {
                    var init = L.stack[ra];
                    var plimit = L.stack[ra + 1];
                    var pstep = L.stack[ra + 2];
                    var forlim = void 0;

                    if (init.ttisinteger() && pstep.ttisinteger() && (forlim = forlimit(plimit, pstep.value))) {
                        /* all values are integer */
                        var initv = forlim.stopnow ? 0 : init.value;
                        plimit.value = forlim.ilimit;
                        init.value = initv - pstep.value | 0;
                    } else {
                        /* try making all values floats */
                        var nlimit = void 0,
                            nstep = void 0,
                            ninit = void 0;
                        if ((nlimit = tonumber(plimit)) === false) ldebug.luaG_runerror(L, defs.to_luastring("'for' limit must be a number", true));
                        L.stack[ra + 1].setfltvalue(nlimit);
                        if ((nstep = tonumber(pstep)) === false) ldebug.luaG_runerror(L, defs.to_luastring("'for' step must be a number", true));
                        L.stack[ra + 2].setfltvalue(nstep);
                        if ((ninit = tonumber(init)) === false) ldebug.luaG_runerror(L, defs.to_luastring("'for' initial value must be a number", true));
                        L.stack[ra].setfltvalue(ninit - nstep);
                    }

                    ci.l_savedpc += i.sBx;
                    break;
                }
            case OCi.OP_TFORCALL:
                {
                    var cb = ra + 3; /* call base */
                    lobject.setobjs2s(L, cb + 2, ra + 2);
                    lobject.setobjs2s(L, cb + 1, ra + 1);
                    lobject.setobjs2s(L, cb, ra);
                    ldo.adjust_top(L, cb + 3); /* func. + 2 args (state and index) */
                    ldo.luaD_call(L, cb, i.C);
                    ldo.adjust_top(L, ci.top);
                    /* go straight to OP_TFORLOOP */
                    i = ci.l_code[ci.l_savedpc++];
                    ra = RA(L, base, i);
                    assert(i.opcode === OCi.OP_TFORLOOP);
                }
            /* fall through */
            case OCi.OP_TFORLOOP:
                {
                    if (!L.stack[ra + 1].ttisnil()) {
                        /* continue loop? */
                        lobject.setobjs2s(L, ra, ra + 1); /* save control variable */
                        ci.l_savedpc += i.sBx; /* jump back */
                    }
                    break;
                }
            case OCi.OP_SETLIST:
                {
                    var n = i.B;
                    var _c = i.C;

                    if (n === 0) n = L.top - ra - 1;

                    if (_c === 0) {
                        assert(ci.l_code[ci.l_savedpc].opcode === OCi.OP_EXTRAARG);
                        _c = ci.l_code[ci.l_savedpc++].Ax;
                    }

                    var h = L.stack[ra].value;
                    var last = (_c - 1) * lopcodes.LFIELDS_PER_FLUSH + n;

                    for (; n > 0; n--) {
                        ltable.luaH_setint(h, last--, L.stack[ra + n]);
                    }
                    ldo.adjust_top(L, ci.top); /* correct top (in case of previous open call) */
                    break;
                }
            case OCi.OP_CLOSURE:
                {
                    var p = cl.p.p[i.Bx];
                    var ncl = getcached(p, cl.upvals, L.stack, base); /* cached closure */
                    if (ncl === null) /* no match? */
                        pushclosure(L, p, cl.upvals, base, ra); /* create a new one */
                    else L.stack[ra].setclLvalue(ncl);
                    break;
                }
            case OCi.OP_VARARG:
                {
                    var _b5 = i.B - 1;
                    var _n = base - ci.funcOff - cl.p.numparams - 1;
                    var _j = void 0;

                    if (_n < 0) /* less arguments than parameters? */
                        _n = 0; /* no vararg arguments */

                    if (_b5 < 0) {
                        _b5 = _n; /* get all var. arguments */
                        ldo.luaD_checkstack(L, _n);
                        ldo.adjust_top(L, ra + _n);
                    }

                    for (_j = 0; _j < _b5 && _j < _n; _j++) {
                        lobject.setobjs2s(L, ra + _j, base - _n + _j);
                    }for (; _j < _b5; _j++) {
                        /* complete required results with nil */
                        L.stack[ra + _j].setnilvalue();
                    }break;
                }
            case OCi.OP_EXTRAARG:
                {
                    throw Error("invalid opcode");
                }
        }
    }
};

var dojump = function dojump(L, ci, i, e) {
    var a = i.A;
    if (a !== 0) lfunc.luaF_close(L, ci.l_base + a - 1);
    ci.l_savedpc += i.sBx + e;
};

var donextjump = function donextjump(L, ci) {
    dojump(L, ci, ci.l_code[ci.l_savedpc], 1);
};

var luaV_lessthan = function luaV_lessthan(L, l, r) {
    if (l.ttisnumber() && r.ttisnumber()) return LTnum(l, r) ? 1 : 0;else if (l.ttisstring() && r.ttisstring()) return l_strcmp(l.tsvalue(), r.tsvalue()) < 0 ? 1 : 0;else {
        var res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LT);
        if (res === null) ldebug.luaG_ordererror(L, l, r);
        return res ? 1 : 0;
    }
};

var luaV_lessequal = function luaV_lessequal(L, l, r) {
    var res = void 0;

    if (l.ttisnumber() && r.ttisnumber()) return LEnum(l, r) ? 1 : 0;else if (l.ttisstring() && r.ttisstring()) return l_strcmp(l.tsvalue(), r.tsvalue()) <= 0 ? 1 : 0;else {
        res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LE);
        if (res !== null) return res ? 1 : 0;
    }
    /* try 'lt': */
    L.ci.callstatus |= lstate.CIST_LEQ; /* mark it is doing 'lt' for 'le' */
    res = ltm.luaT_callorderTM(L, r, l, ltm.TMS.TM_LT);
    L.ci.callstatus ^= lstate.CIST_LEQ; /* clear mark */
    if (res === null) ldebug.luaG_ordererror(L, l, r);
    return res ? 0 : 1; /* result is negated */
};

var luaV_equalobj = function luaV_equalobj(L, t1, t2) {
    if (t1.ttype() !== t2.ttype()) {
        /* not the same variant? */
        if (t1.ttnov() !== t2.ttnov() || t1.ttnov() !== CT.LUA_TNUMBER) return 0; /* only numbers can be equal with different variants */
        else {
                /* two numbers with different variants */
                /* OPTIMIZATION: instead of calling luaV_tointeger we can just let JS do the comparison */
                return t1.value === t2.value ? 1 : 0;
            }
    }

    var tm = void 0;

    /* values have same type and same variant */
    switch (t1.ttype()) {
        case CT.LUA_TNIL:
            return 1;
        case CT.LUA_TBOOLEAN:
            return t1.value == t2.value ? 1 : 0; // Might be 1 or true
        case CT.LUA_TLIGHTUSERDATA:
        case CT.LUA_TNUMINT:
        case CT.LUA_TNUMFLT:
        case CT.LUA_TLCF:
            return t1.value === t2.value ? 1 : 0;
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            {
                return lstring.luaS_eqlngstr(t1.tsvalue(), t2.tsvalue()) ? 1 : 0;
            }
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE:
            if (t1.value === t2.value) return 1;else if (L === null) return 0;

            tm = ltm.fasttm(L, t1.value.metatable, ltm.TMS.TM_EQ);
            if (tm === null) tm = ltm.fasttm(L, t2.value.metatable, ltm.TMS.TM_EQ);
            break;
        default:
            return t1.value === t2.value ? 1 : 0;
    }

    if (tm === null) /* no TM? */
        return 0;

    var tv = new lobject.TValue(); /* doesn't use the stack */
    ltm.luaT_callTM(L, tm, t1, t2, tv, 1);
    return tv.l_isfalse() ? 0 : 1;
};

var luaV_rawequalobj = function luaV_rawequalobj(t1, t2) {
    return luaV_equalobj(null, t1, t2);
};

var forlimit = function forlimit(obj, step) {
    var stopnow = false;
    var ilimit = luaV_tointeger(obj, step < 0 ? 2 : 1);
    if (ilimit === false) {
        var n = tonumber(obj);
        if (n === false) return false;

        if (0 < n) {
            ilimit = llimit.LUA_MAXINTEGER;
            if (step < 0) stopnow = true;
        } else {
            ilimit = llimit.LUA_MININTEGER;
            if (step >= 0) stopnow = true;
        }
    }

    return {
        stopnow: stopnow,
        ilimit: ilimit
    };
};

/*
** try to convert a value to an integer, rounding according to 'mode':
** mode === 0: accepts only integral values
** mode === 1: takes the floor of the number
** mode === 2: takes the ceil of the number
*/
var luaV_tointeger = function luaV_tointeger(obj, mode) {
    if (obj.ttisfloat()) {
        var n = obj.value;
        var f = Math.floor(n);

        if (n !== f) {
            /* not an integral value? */
            if (mode === 0) return false; /* fails if mode demands integral value */
            else if (mode > 1) /* needs ceil? */
                    f += 1; /* convert floor to ceil (remember: n !== f) */
        }

        return luaconf.lua_numbertointeger(f);
    } else if (obj.ttisinteger()) {
        return obj.value;
    } else if (cvt2num(obj)) {
        var v = lobject.luaO_str2num(obj.svalue());
        if (v !== false) return luaV_tointeger(v, mode);
    }

    return false;
};

var tointeger = function tointeger(o) {
    return o.ttisinteger() ? o.value : luaV_tointeger(o, 0);
};

var tonumber = function tonumber(o) {
    if (o.ttnov() === CT.LUA_TNUMBER) return o.value;

    if (cvt2num(o)) {
        /* string convertible to number? */
        var v = lobject.luaO_str2num(o.svalue());
        if (v !== false) return v.value;
    }

    return false;
};

/*
** Return 'l < r', for numbers.
** As fengari uses javascript numbers for both floats and integers and has
** correct semantics, we can just compare values.
*/
var LTnum = function LTnum(l, r) {
    return l.value < r.value;
};

/*
** Return 'l <= r', for numbers.
*/
var LEnum = function LEnum(l, r) {
    return l.value <= r.value;
};

/*
** Compare two strings 'ls' x 'rs', returning an integer smaller-equal-
** -larger than zero if 'ls' is smaller-equal-larger than 'rs'.
*/
var l_strcmp = function l_strcmp(ls, rs) {
    var l = lstring.luaS_hashlongstr(ls);
    var r = lstring.luaS_hashlongstr(rs);
    /* In fengari we assume string hash has same collation as byte values */
    if (l === r) return 0;else if (l < r) return -1;else return 1;
};

/*
** Main operation 'ra' = #rb'.
*/
var luaV_objlen = function luaV_objlen(L, ra, rb) {
    var tm = void 0;
    switch (rb.ttype()) {
        case CT.LUA_TTABLE:
            {
                var h = rb.value;
                tm = ltm.fasttm(L, h.metatable, ltm.TMS.TM_LEN);
                if (tm !== null) break; /* metamethod? break switch to call it */
                ra.setivalue(ltable.luaH_getn(h)); /* else primitive len */
                return;
            }
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            ra.setivalue(rb.vslen());
            return;
        default:
            {
                tm = ltm.luaT_gettmbyobj(L, rb, ltm.TMS.TM_LEN);
                if (tm.ttisnil()) ldebug.luaG_typeerror(L, rb, defs.to_luastring("get length of", true));
                break;
            }
    }

    ltm.luaT_callTM(L, tm, rb, rb, ra, 1);
};

var luaV_div = function luaV_div(L, m, n) {
    if (n === 0) ldebug.luaG_runerror(L, defs.to_luastring("attempt to divide by zero"));
    return Math.floor(m / n) | 0;
};

// % semantic on negative numbers is different in js
var luaV_mod = function luaV_mod(L, m, n) {
    if (n === 0) ldebug.luaG_runerror(L, defs.to_luastring("attempt to perform 'n%%0'"));
    return m - Math.floor(m / n) * n | 0;
};

var NBITS = 32;

var luaV_shiftl = function luaV_shiftl(x, y) {
    if (y < 0) {
        /* shift right? */
        if (y <= -NBITS) return 0;else return x >>> -y;
    } else {
        /* shift left */
        if (y >= NBITS) return 0;else return x << y;
    }
};

/*
** check whether cached closure in prototype 'p' may be reused, that is,
** whether there is a cached closure with the same upvalues needed by
** new closure to be created.
*/
var getcached = function getcached(p, encup, stack, base) {
    var c = p.cache;
    if (c !== null) {
        /* is there a cached closure? */
        var uv = p.upvalues;
        var nup = uv.length;
        for (var i = 0; i < nup; i++) {
            /* check whether it has right upvalues */
            var v = uv[i].instack ? stack[base + uv[i].idx] : encup[uv[i].idx].v;
            if (c.upvals[i].v !== v) return null; /* wrong upvalue; cannot reuse closure */
        }
    }
    return c; /* return cached closure (or NULL if no cached closure) */
};

/*
** create a new Lua closure, push it in the stack, and initialize
** its upvalues.
*/
var pushclosure = function pushclosure(L, p, encup, base, ra) {
    var nup = p.upvalues.length;
    var uv = p.upvalues;
    var ncl = new lobject.LClosure(L, nup);
    ncl.p = p;
    L.stack[ra].setclLvalue(ncl);
    for (var i = 0; i < nup; i++) {
        if (uv[i].instack) ncl.upvals[i] = lfunc.luaF_findupval(L, base + uv[i].idx);else ncl.upvals[i] = encup[uv[i].idx];
        ncl.upvals[i].refcount++;
    }
    p.cache = ncl; /* save it on cache for reuse */
};

var cvt2str = function cvt2str(o) {
    return o.ttisnumber();
};

var cvt2num = function cvt2num(o) {
    return o.ttisstring();
};

var tostring = function tostring(L, i) {
    var o = L.stack[i];

    if (o.ttisstring()) return true;

    if (cvt2str(o)) {
        lobject.luaO_tostring(L, o);
        return true;
    }

    return false;
};

var isemptystr = function isemptystr(o) {
    return o.ttisstring() && o.vslen() === 0;
};

/*
** Main operation for concatenation: concat 'total' values in the stack,
** from 'L->top - total' up to 'L->top - 1'.
*/
var luaV_concat = function luaV_concat(L, total) {
    assert(total >= 2);
    do {
        var top = L.top;
        var n = 2; /* number of elements handled in this pass (at least 2) */

        if (!(L.stack[top - 2].ttisstring() || cvt2str(L.stack[top - 2])) || !tostring(L, top - 1)) {
            ltm.luaT_trybinTM(L, L.stack[top - 2], L.stack[top - 1], L.stack[top - 2], ltm.TMS.TM_CONCAT);
        } else if (isemptystr(L.stack[top - 1])) {
            tostring(L, top - 2);
        } else if (isemptystr(L.stack[top - 2])) {
            lobject.setobjs2s(L, top - 2, top - 1);
        } else {
            /* at least two non-empty string values; get as many as possible */
            var toconcat = new Array(total);
            toconcat[total - 1] = L.stack[top - 1].svalue();
            for (n = 1; n < total; n++) {
                if (!tostring(L, top - n - 1)) {
                    toconcat = toconcat.slice(total - n);
                    break;
                }
                toconcat[total - n - 1] = L.stack[top - n - 1].svalue();
            }
            var ts = lstring.luaS_bless(L, Array.prototype.concat.apply([], toconcat));
            lobject.setsvalue2s(L, top - n, ts);
        }
        total -= n - 1; /* got 'n' strings to create 1 new */
        /* popped 'n' strings and pushed one */
        for (; L.top > top - (n - 1);) {
            delete L.stack[--L.top];
        }
    } while (total > 1); /* repeat until only 1 result left */
};

var MAXTAGLOOP = 2000;

var luaV_gettable = function luaV_gettable(L, t, key, ra) {
    for (var loop = 0; loop < MAXTAGLOOP; loop++) {
        var tm = void 0;

        if (!t.ttistable()) {
            tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_INDEX);
            if (tm.ttisnil()) ldebug.luaG_typeerror(L, t, defs.to_luastring('index', true)); /* no metamethod */
            /* else will try the metamethod */
        } else {
            var slot = ltable.luaH_get(L, t.value, key);
            if (!slot.ttisnil()) {
                lobject.setobj2s(L, ra, slot);
                return;
            } else {
                /* 't' is a table */
                tm = ltm.fasttm(L, t.value.metatable, ltm.TMS.TM_INDEX); /* table's metamethod */
                if (tm === null) {
                    /* no metamethod? */
                    L.stack[ra].setnilvalue(); /* result is nil */
                    return;
                }
            }
            /* else will try the metamethod */
        }
        if (tm.ttisfunction()) {
            /* is metamethod a function? */
            ltm.luaT_callTM(L, tm, t, key, L.stack[ra], 1); /* call it */
            return;
        }
        t = tm; /* else try to access 'tm[key]' */
    }

    ldebug.luaG_runerror(L, defs.to_luastring("'__index' chain too long; possible loop", true));
};

var settable = function settable(L, t, key, val) {
    for (var loop = 0; loop < MAXTAGLOOP; loop++) {
        var tm = void 0;
        if (t.ttistable()) {
            var h = t.value; /* save 't' table */
            var slot = ltable.luaH_set(L, h, key);
            if (!slot.ttisnil() || (tm = ltm.fasttm(L, h.metatable, ltm.TMS.TM_NEWINDEX)) === null) {
                if (val.ttisnil()) ltable.luaH_delete(L, h, key);else slot.setfrom(val);
                ltable.invalidateTMcache(h);
                return;
            }
            /* else will try the metamethod */
        } else {
            /* not a table; check metamethod */
            if ((tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_NEWINDEX)).ttisnil()) ldebug.luaG_typeerror(L, t, defs.to_luastring('index', true));
        }
        /* try the metamethod */
        if (tm.ttisfunction()) {
            ltm.luaT_callTM(L, tm, t, key, val, 0);
            return;
        }
        t = tm; /* else repeat assignment over 'tm' */
    }

    ldebug.luaG_runerror(L, defs.to_luastring("'__newindex' chain too long; possible loop", true));
};

module.exports.cvt2str = cvt2str;
module.exports.cvt2num = cvt2num;
module.exports.luaV_gettable = luaV_gettable;
module.exports.luaV_concat = luaV_concat;
module.exports.luaV_div = luaV_div;
module.exports.luaV_equalobj = luaV_equalobj;
module.exports.luaV_execute = luaV_execute;
module.exports.luaV_finishOp = luaV_finishOp;
module.exports.luaV_lessequal = luaV_lessequal;
module.exports.luaV_lessthan = luaV_lessthan;
module.exports.luaV_mod = luaV_mod;
module.exports.luaV_objlen = luaV_objlen;
module.exports.luaV_rawequalobj = luaV_rawequalobj;
module.exports.luaV_shiftl = luaV_shiftl;
module.exports.luaV_tointeger = luaV_tointeger;
module.exports.settable = settable;
module.exports.tointeger = tointeger;
module.exports.tonumber = tonumber;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var OpCodes = ["MOVE", "LOADK", "LOADKX", "LOADBOOL", "LOADNIL", "GETUPVAL", "GETTABUP", "GETTABLE", "SETTABUP", "SETUPVAL", "SETTABLE", "NEWTABLE", "SELF", "ADD", "SUB", "MUL", "MOD", "POW", "DIV", "IDIV", "BAND", "BOR", "BXOR", "SHL", "SHR", "UNM", "BNOT", "NOT", "LEN", "CONCAT", "JMP", "EQ", "LT", "LE", "TEST", "TESTSET", "CALL", "TAILCALL", "RETURN", "FORLOOP", "FORPREP", "TFORCALL", "TFORLOOP", "SETLIST", "CLOSURE", "VARARG", "EXTRAARG"];

var OpCodesI = {
    OP_MOVE: 0,
    OP_LOADK: 1,
    OP_LOADKX: 2,
    OP_LOADBOOL: 3,
    OP_LOADNIL: 4,
    OP_GETUPVAL: 5,
    OP_GETTABUP: 6,
    OP_GETTABLE: 7,
    OP_SETTABUP: 8,
    OP_SETUPVAL: 9,
    OP_SETTABLE: 10,
    OP_NEWTABLE: 11,
    OP_SELF: 12,
    OP_ADD: 13,
    OP_SUB: 14,
    OP_MUL: 15,
    OP_MOD: 16,
    OP_POW: 17,
    OP_DIV: 18,
    OP_IDIV: 19,
    OP_BAND: 20,
    OP_BOR: 21,
    OP_BXOR: 22,
    OP_SHL: 23,
    OP_SHR: 24,
    OP_UNM: 25,
    OP_BNOT: 26,
    OP_NOT: 27,
    OP_LEN: 28,
    OP_CONCAT: 29,
    OP_JMP: 30,
    OP_EQ: 31,
    OP_LT: 32,
    OP_LE: 33,
    OP_TEST: 34,
    OP_TESTSET: 35,
    OP_CALL: 36,
    OP_TAILCALL: 37,
    OP_RETURN: 38,
    OP_FORLOOP: 39,
    OP_FORPREP: 40,
    OP_TFORCALL: 41,
    OP_TFORLOOP: 42,
    OP_SETLIST: 43,
    OP_CLOSURE: 44,
    OP_VARARG: 45,
    OP_EXTRAARG: 46
};

/*
** masks for instruction properties. The format is:
** bits 0-1: op mode
** bits 2-3: C arg mode
** bits 4-5: B arg mode
** bit 6: instruction set register A
** bit 7: operator is a test (next instruction must be a jump)
*/
var OpArgN = 0; /* argument is not used */
var OpArgU = 1; /* argument is used */
var OpArgR = 2; /* argument is a register or a jump offset */
var OpArgK = 3; /* argument is a constant or register/constant */

/* basic instruction format */
var iABC = 0;
var iABx = 1;
var iAsBx = 2;
var iAx = 3;

var luaP_opmodes = [0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC, /* OP_MOVE */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgN << 2 | iABx, /* OP_LOADK */
0 << 7 | 1 << 6 | OpArgN << 4 | OpArgN << 2 | iABx, /* OP_LOADKX */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC, /* OP_LOADBOOL */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC, /* OP_LOADNIL */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC, /* OP_GETUPVAL */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgK << 2 | iABC, /* OP_GETTABUP */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgK << 2 | iABC, /* OP_GETTABLE */
0 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_SETTABUP */
0 << 7 | 0 << 6 | OpArgU << 4 | OpArgN << 2 | iABC, /* OP_SETUPVAL */
0 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_SETTABLE */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC, /* OP_NEWTABLE */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgK << 2 | iABC, /* OP_SELF */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_ADD */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_SUB */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_MUL */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_MOD */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_POW */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_DIV */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_IDIV */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_BAND */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_BOR */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_BXOR */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_SHL */
0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_SHR */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC, /* OP_UNM */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC, /* OP_BNOT */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC, /* OP_NOT */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC, /* OP_LEN */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgR << 2 | iABC, /* OP_CONCAT */
0 << 7 | 0 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx, /* OP_JMP */
1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_EQ */
1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_LT */
1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC, /* OP_LE */
1 << 7 | 0 << 6 | OpArgN << 4 | OpArgU << 2 | iABC, /* OP_TEST */
1 << 7 | 1 << 6 | OpArgR << 4 | OpArgU << 2 | iABC, /* OP_TESTSET */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC, /* OP_CALL */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC, /* OP_TAILCALL */
0 << 7 | 0 << 6 | OpArgU << 4 | OpArgN << 2 | iABC, /* OP_RETURN */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx, /* OP_FORLOOP */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx, /* OP_FORPREP */
0 << 7 | 0 << 6 | OpArgN << 4 | OpArgU << 2 | iABC, /* OP_TFORCALL */
0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx, /* OP_TFORLOOP */
0 << 7 | 0 << 6 | OpArgU << 4 | OpArgU << 2 | iABC, /* OP_SETLIST */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABx, /* OP_CLOSURE */
0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC, /* OP_VARARG */
0 << 7 | 0 << 6 | OpArgU << 4 | OpArgU << 2 | iAx /* OP_EXTRAARG */
];

var getOpMode = function getOpMode(m) {
    return luaP_opmodes[m] & 3;
};

var getBMode = function getBMode(m) {
    return luaP_opmodes[m] >> 4 & 3;
};

var getCMode = function getCMode(m) {
    return luaP_opmodes[m] >> 2 & 3;
};

var testAMode = function testAMode(m) {
    return luaP_opmodes[m] & 1 << 6;
};

var testTMode = function testTMode(m) {
    return luaP_opmodes[m] & 1 << 7;
};

var SIZE_C = 9;
var SIZE_B = 9;
var SIZE_Bx = SIZE_C + SIZE_B;
var SIZE_A = 8;
var SIZE_Ax = SIZE_C + SIZE_B + SIZE_A;
var SIZE_OP = 6;
var POS_OP = 0;
var POS_A = POS_OP + SIZE_OP;
var POS_C = POS_A + SIZE_A;
var POS_B = POS_C + SIZE_C;
var POS_Bx = POS_C;
var POS_Ax = POS_A;
var MAXARG_Bx = (1 << SIZE_Bx) - 1;
var MAXARG_sBx = MAXARG_Bx >> 1; /* 'sBx' is signed */
var MAXARG_Ax = (1 << SIZE_Ax) - 1;
var MAXARG_A = (1 << SIZE_A) - 1;
var MAXARG_B = (1 << SIZE_B) - 1;
var MAXARG_C = (1 << SIZE_C) - 1;

/* this bit 1 means constant (0 means register) */
var BITRK = 1 << SIZE_B - 1;

var MAXINDEXRK = BITRK - 1;

/*
** invalid register that fits in 8 bits
*/
var NO_REG = MAXARG_A;

/* test whether value is a constant */
var ISK = function ISK(x) {
    return x & BITRK;
};

/* gets the index of the constant */
var INDEXK = function INDEXK(r) {
    return r & ~BITRK;
};

/* code a constant index as a RK value */
var RKASK = function RKASK(x) {
    return x | BITRK;
};

/* creates a mask with 'n' 1 bits at position 'p' */
var MASK1 = function MASK1(n, p) {
    return ~(~0 << n) << p;
};

/* creates a mask with 'n' 0 bits at position 'p' */
var MASK0 = function MASK0(n, p) {
    return ~MASK1(n, p);
};

var GET_OPCODE = function GET_OPCODE(i) {
    return i.opcode;
};

var SET_OPCODE = function SET_OPCODE(i, o) {
    i.code = i.code & MASK0(SIZE_OP, POS_OP) | o << POS_OP & MASK1(SIZE_OP, POS_OP);
    return fullins(i);
};

var setarg = function setarg(i, v, pos, size) {
    i.code = i.code & MASK0(size, pos) | v << pos & MASK1(size, pos);
    return fullins(i);
};

var GETARG_A = function GETARG_A(i) {
    return i.A;
};

var SETARG_A = function SETARG_A(i, v) {
    return setarg(i, v, POS_A, SIZE_A);
};

var GETARG_B = function GETARG_B(i) {
    return i.B;
};

var SETARG_B = function SETARG_B(i, v) {
    return setarg(i, v, POS_B, SIZE_B);
};

var GETARG_C = function GETARG_C(i) {
    return i.C;
};

var SETARG_C = function SETARG_C(i, v) {
    return setarg(i, v, POS_C, SIZE_C);
};

var GETARG_Bx = function GETARG_Bx(i) {
    return i.Bx;
};

var SETARG_Bx = function SETARG_Bx(i, v) {
    return setarg(i, v, POS_Bx, SIZE_Bx);
};

var GETARG_Ax = function GETARG_Ax(i) {
    return i.Ax;
};

var SETARG_Ax = function SETARG_Ax(i, v) {
    return setarg(i, v, POS_Ax, SIZE_Ax);
};

var GETARG_sBx = function GETARG_sBx(i) {
    return i.sBx;
};

var SETARG_sBx = function SETARG_sBx(i, b) {
    return SETARG_Bx(i, b + MAXARG_sBx);
};

/*
** Pre-calculate all possible part of the instruction
*/
var fullins = function fullins(ins) {
    if (typeof ins === "number") {
        return {
            code: ins,
            opcode: ins >> POS_OP & MASK1(SIZE_OP, 0),
            A: ins >> POS_A & MASK1(SIZE_A, 0),
            B: ins >> POS_B & MASK1(SIZE_B, 0),
            C: ins >> POS_C & MASK1(SIZE_C, 0),
            Bx: ins >> POS_Bx & MASK1(SIZE_Bx, 0),
            Ax: ins >> POS_Ax & MASK1(SIZE_Ax, 0),
            sBx: (ins >> POS_Bx & MASK1(SIZE_Bx, 0)) - MAXARG_sBx
        };
    } else {
        var i = ins.code;
        ins.opcode = i >> POS_OP & MASK1(SIZE_OP, 0);
        ins.A = i >> POS_A & MASK1(SIZE_A, 0);
        ins.B = i >> POS_B & MASK1(SIZE_B, 0);
        ins.C = i >> POS_C & MASK1(SIZE_C, 0);
        ins.Bx = i >> POS_Bx & MASK1(SIZE_Bx, 0);
        ins.Ax = i >> POS_Ax & MASK1(SIZE_Ax, 0);
        ins.sBx = (i >> POS_Bx & MASK1(SIZE_Bx, 0)) - MAXARG_sBx;
        return ins;
    }
};

var CREATE_ABC = function CREATE_ABC(o, a, b, c) {
    return fullins(o << POS_OP | a << POS_A | b << POS_B | c << POS_C);
};

var CREATE_ABx = function CREATE_ABx(o, a, bc) {
    return fullins(o << POS_OP | a << POS_A | bc << POS_Bx);
};

var CREATE_Ax = function CREATE_Ax(o, a) {
    return fullins(o << POS_OP | a << POS_Ax);
};

/* number of list items to accumulate before a SETLIST instruction */
var LFIELDS_PER_FLUSH = 50;

module.exports.BITRK = BITRK;
module.exports.CREATE_ABC = CREATE_ABC;
module.exports.CREATE_ABx = CREATE_ABx;
module.exports.CREATE_Ax = CREATE_Ax;
module.exports.GET_OPCODE = GET_OPCODE;
module.exports.GETARG_A = GETARG_A;
module.exports.GETARG_B = GETARG_B;
module.exports.GETARG_C = GETARG_C;
module.exports.GETARG_Bx = GETARG_Bx;
module.exports.GETARG_Ax = GETARG_Ax;
module.exports.GETARG_sBx = GETARG_sBx;
module.exports.INDEXK = INDEXK;
module.exports.ISK = ISK;
module.exports.LFIELDS_PER_FLUSH = LFIELDS_PER_FLUSH;
module.exports.MAXARG_A = MAXARG_A;
module.exports.MAXARG_Ax = MAXARG_Ax;
module.exports.MAXARG_B = MAXARG_B;
module.exports.MAXARG_Bx = MAXARG_Bx;
module.exports.MAXARG_C = MAXARG_C;
module.exports.MAXARG_sBx = MAXARG_sBx;
module.exports.MAXINDEXRK = MAXINDEXRK;
module.exports.NO_REG = NO_REG;
module.exports.OpArgK = OpArgK;
module.exports.OpArgN = OpArgN;
module.exports.OpArgR = OpArgR;
module.exports.OpArgU = OpArgU;
module.exports.OpCodes = OpCodes;
module.exports.OpCodesI = OpCodesI;
module.exports.POS_A = POS_A;
module.exports.POS_Ax = POS_Ax;
module.exports.POS_B = POS_B;
module.exports.POS_Bx = POS_Bx;
module.exports.POS_C = POS_C;
module.exports.POS_OP = POS_OP;
module.exports.RKASK = RKASK;
module.exports.SETARG_A = SETARG_A;
module.exports.SETARG_Ax = SETARG_Ax;
module.exports.SETARG_B = SETARG_B;
module.exports.SETARG_Bx = SETARG_Bx;
module.exports.SETARG_C = SETARG_C;
module.exports.SETARG_sBx = SETARG_sBx;
module.exports.SET_OPCODE = SET_OPCODE;
module.exports.SIZE_A = SIZE_A;
module.exports.SIZE_Ax = SIZE_Ax;
module.exports.SIZE_B = SIZE_B;
module.exports.SIZE_Bx = SIZE_Bx;
module.exports.SIZE_C = SIZE_C;
module.exports.SIZE_OP = SIZE_OP;
module.exports.fullins = fullins;
module.exports.getBMode = getBMode;
module.exports.getCMode = getCMode;
module.exports.getOpMode = getOpMode;
module.exports.iABC = iABC;
module.exports.iABx = iABx;
module.exports.iAsBx = iAsBx;
module.exports.iAx = iAx;
module.exports.testAMode = testAMode;
module.exports.testTMode = testTMode;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var MBuffer = function MBuffer() {
    _classCallCheck(this, MBuffer);

    this.buffer = null;
    this.n = 0;
};

var luaZ_buffremove = function luaZ_buffremove(buff, i) {
    buff.n -= i;
};

var luaZ_resetbuffer = function luaZ_resetbuffer(buff) {
    buff.n = 0;
    buff.buffer = [];
};

var ZIO = function () {
    function ZIO(L, reader, data) {
        _classCallCheck(this, ZIO);

        this.L = L; /* Lua state (for reader) */
        assert(typeof reader == "function", "ZIO requires a reader");
        this.reader = reader; /* reader function */
        this.data = data; /* additional data */
        this.n = 0; /* bytes still unread */
        this.buffer = null;
        this.off = 0; /* current position in buffer */
    }

    _createClass(ZIO, [{
        key: "zgetc",
        value: function zgetc() {
            return this.n-- > 0 ? this.buffer[this.off++] : luaZ_fill(this);
        }
    }]);

    return ZIO;
}();

var EOZ = -1;

var luaZ_fill = function luaZ_fill(z) {
    var size = void 0;
    var buff = z.reader(z.L, z.data);
    if (buff === null) return EOZ;
    if (buff instanceof DataView) {
        z.buffer = new Uint8Array(buff.buffer, buff.byteOffset, buff.byteLength);
        z.off = 0;
        size = buff.byteLength - buff.byteOffset;
    } else {
        assert(typeof buff !== "string", "Should only load binary of array of bytes");
        z.buffer = buff;
        z.off = 0;
        size = buff.length;
    }
    if (size === 0) return EOZ;
    z.n = size - 1;
    return z.buffer[z.off++];
};

/* b should be an array-like that will be set to bytes
 * b_offset is the offset at which to start filling */
var luaZ_read = function luaZ_read(z, b, b_offset, n) {
    while (n) {
        if (z.n === 0) {
            /* no bytes in buffer? */
            if (luaZ_fill(z) === EOZ) return n; /* no more input; return number of missing bytes */
            else {
                    z.n++; /* luaZ_fill consumed first byte; put it back */
                    z.off--;
                }
        }
        var m = n <= z.n ? n : z.n; /* min. between n and z->n */
        for (var i = 0; i < m; i++) {
            b[b_offset++] = z.buffer[z.off++];
        }
        z.n -= m;
        if (z.n === 0) // remove reference to input so it can get freed
            z.buffer = null;
        n -= m;
    }

    return 0;
};

module.exports.EOZ = EOZ;
module.exports.luaZ_buffremove = luaZ_buffremove;
module.exports.luaZ_fill = luaZ_fill;
module.exports.luaZ_read = luaZ_read;
module.exports.luaZ_resetbuffer = luaZ_resetbuffer;
module.exports.MBuffer = MBuffer;
module.exports.ZIO = ZIO;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var ldebug = __webpack_require__(10);
var ldo = __webpack_require__(6);
var ldump = __webpack_require__(37);
var lfunc = __webpack_require__(11);
var lobject = __webpack_require__(3);
var lstate = __webpack_require__(12);
var lstring = __webpack_require__(8);
var ltm = __webpack_require__(13);
var luaconf = __webpack_require__(9);
var lvm = __webpack_require__(14);
var ltable = __webpack_require__(7);
var lzio = __webpack_require__(16);
var MAXUPVAL = lfunc.MAXUPVAL;
var CT = defs.constant_types;
var TS = defs.thread_status;
var TValue = lobject.TValue;
var CClosure = lobject.CClosure;

var isvalid = function isvalid(o) {
    return o !== lobject.luaO_nilobject;
};

var lua_version = function lua_version(L) {
    if (L === null) return defs.LUA_VERSION_NUM;else return L.l_G.version;
};

var lua_atpanic = function lua_atpanic(L, panicf) {
    var old = L.l_G.panic;
    L.l_G.panic = panicf;
    return old;
};

var lua_atnativeerror = function lua_atnativeerror(L, errorf) {
    var old = L.l_G.atnativeerror;
    L.l_G.atnativeerror = errorf;
    return old;
};

// Return value for idx on stack
var index2addr = function index2addr(L, idx) {
    var ci = L.ci;
    if (idx > 0) {
        var o = ci.funcOff + idx;
        assert(idx <= ci.top - (ci.funcOff + 1), "unacceptable index");
        if (o >= L.top) return lobject.luaO_nilobject;else return L.stack[o];
    } else if (idx > defs.LUA_REGISTRYINDEX) {
        assert(idx !== 0 && -idx <= L.top, "invalid index");
        return L.stack[L.top + idx];
    } else if (idx === defs.LUA_REGISTRYINDEX) {
        return L.l_G.l_registry;
    } else {
        /* upvalues */
        idx = defs.LUA_REGISTRYINDEX - idx;
        assert(idx <= MAXUPVAL + 1, "upvalue index too large");
        if (ci.func.ttislcf()) /* light C function? */
            return lobject.luaO_nilobject; /* it has no upvalues */
        else {
                return idx <= ci.func.value.nupvalues ? ci.func.value.upvalue[idx - 1] : lobject.luaO_nilobject;
            }
    }
};

// Like index2addr but returns the index on stack; doesn't allow pseudo indices
var index2addr_ = function index2addr_(L, idx) {
    var ci = L.ci;
    if (idx > 0) {
        var o = ci.funcOff + idx;
        assert(idx <= ci.top - (ci.funcOff + 1), "unacceptable index");
        if (o >= L.top) return null;else return o;
    } else if (idx > defs.LUA_REGISTRYINDEX) {
        assert(idx !== 0 && -idx <= L.top, "invalid index");
        return L.top + idx;
    } else {
        /* registry or upvalue */
        throw Error("attempt to use pseudo-index");
    }
};

var lua_checkstack = function lua_checkstack(L, n) {
    var res = void 0;
    var ci = L.ci;
    assert(n >= 0, "negative 'n'");
    if (L.stack_last - L.top > n) /* stack large enough? */
        res = true;else {
        /* no; need to grow stack */
        var inuse = L.top + lstate.EXTRA_STACK;
        if (inuse > luaconf.LUAI_MAXSTACK - n) /* can grow without overflow? */
            res = false; /* no */
        else {
                /* try to grow stack */
                ldo.luaD_growstack(L, n);
                res = true;
            }
    }

    if (res && ci.top < L.top + n) ci.top = L.top + n; /* adjust frame top */

    return res;
};

var lua_xmove = function lua_xmove(from, to, n) {
    if (from === to) return;
    assert(n < from.top - from.ci.funcOff, "not enough elements in the stack");
    assert(from.l_G === to.l_G, "moving among independent states");
    assert(to.ci.top - to.top >= n, "stack overflow");

    from.top -= n;
    for (var i = 0; i < n; i++) {
        to.stack[to.top] = new lobject.TValue();
        lobject.setobj2s(to, to.top, from.stack[from.top + i]);
        delete from.stack[from.top + i];
        to.top++;
    }
};

/*
** basic stack manipulation
*/

/*
** convert an acceptable stack index into an absolute index
*/
var lua_absindex = function lua_absindex(L, idx) {
    return idx > 0 || idx <= defs.LUA_REGISTRYINDEX ? idx : L.top - L.ci.funcOff + idx;
};

var lua_gettop = function lua_gettop(L) {
    return L.top - (L.ci.funcOff + 1);
};

var lua_pushvalue = function lua_pushvalue(L, idx) {
    lobject.pushobj2s(L, index2addr(L, idx));
    assert(L.top <= L.ci.top, "stack overflow");
};

var lua_settop = function lua_settop(L, idx) {
    var func = L.ci.funcOff;
    var newtop = void 0;
    if (idx >= 0) {
        assert(idx <= L.stack_last - (func + 1), "new top too large");
        newtop = func + 1 + idx;
    } else {
        assert(-(idx + 1) <= L.top - (func + 1), "invalid new top");
        newtop = L.top + idx + 1; /* 'subtract' index (index is negative) */
    }
    ldo.adjust_top(L, newtop);
};

var lua_pop = function lua_pop(L, n) {
    lua_settop(L, -n - 1);
};

var reverse = function reverse(L, from, to) {
    for (; from < to; from++, to--) {
        var fromtv = L.stack[from];
        var temp = new TValue(fromtv.type, fromtv.value);
        lobject.setobjs2s(L, from, to);
        lobject.setobj2s(L, to, temp);
    }
};

/*
** Let x = AB, where A is a prefix of length 'n'. Then,
** rotate x n === BA. But BA === (A^r . B^r)^r.
*/
var lua_rotate = function lua_rotate(L, idx, n) {
    var t = L.top - 1;
    var pIdx = index2addr_(L, idx);
    var p = L.stack[pIdx];

    assert(isvalid(p) && idx > defs.LUA_REGISTRYINDEX, "index not in the stack");
    assert((n >= 0 ? n : -n) <= t - pIdx + 1, "invalid 'n'");

    var m = n >= 0 ? t - n : pIdx - n - 1; /* end of prefix */

    reverse(L, pIdx, m);
    reverse(L, m + 1, L.top - 1);
    reverse(L, pIdx, L.top - 1);
};

var lua_copy = function lua_copy(L, fromidx, toidx) {
    var from = index2addr(L, fromidx);
    index2addr(L, toidx).setfrom(from);
};

var lua_remove = function lua_remove(L, idx) {
    lua_rotate(L, idx, -1);
    lua_pop(L, 1);
};

var lua_insert = function lua_insert(L, idx) {
    lua_rotate(L, idx, 1);
};

var lua_replace = function lua_replace(L, idx) {
    lua_copy(L, -1, idx);
    lua_pop(L, 1);
};

/*
** push functions (JS -> stack)
*/

var lua_pushnil = function lua_pushnil(L) {
    L.stack[L.top] = new TValue(CT.LUA_TNIL, null);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var lua_pushnumber = function lua_pushnumber(L, n) {
    assert(typeof n === "number");

    L.stack[L.top] = new TValue(CT.LUA_TNUMFLT, n);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var lua_pushinteger = function lua_pushinteger(L, n) {
    assert(typeof n === "number" && (n | 0) === n);
    L.stack[L.top] = new TValue(CT.LUA_TNUMINT, n);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var lua_pushlstring = function lua_pushlstring(L, s, len) {
    assert(typeof len === "number");
    var ts = void 0;
    if (len === 0) {
        ts = lstring.luaS_bless(L, []);
    } else {
        assert(defs.is_luastring(s) && s.length >= len, "lua_pushlstring expects array of byte");
        ts = lstring.luaS_bless(L, s.slice(0, len));
    }
    lobject.pushsvalue2s(L, ts);
    assert(L.top <= L.ci.top, "stack overflow");

    return ts.value;
};

var lua_pushstring = function lua_pushstring(L, s) {
    assert(defs.is_luastring(s) || s === undefined || s === null, "lua_pushstring expects array of byte");

    if (s === undefined || s === null) {
        L.stack[L.top] = new TValue(CT.LUA_TNIL, null);
        L.top++;
    } else {
        var ts = lstring.luaS_new(L, s);
        lobject.pushsvalue2s(L, ts);
        s = ts.getstr(); /* internal copy */
    }
    assert(L.top <= L.ci.top, "stack overflow");

    return s;
};

var lua_pushvfstring = function lua_pushvfstring(L, fmt, argp) {
    assert(defs.is_luastring(fmt));
    return lobject.luaO_pushvfstring(L, fmt, argp);
};

var lua_pushfstring = function lua_pushfstring(L, fmt) {
    assert(defs.is_luastring(fmt));

    for (var _len = arguments.length, argp = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        argp[_key - 2] = arguments[_key];
    }

    return lobject.luaO_pushvfstring(L, fmt, argp);
};

/* Similar to lua_pushstring, but takes a JS string */
var lua_pushliteral = function lua_pushliteral(L, s) {
    assert(typeof s === "string" || s === undefined || s === null, "lua_pushliteral expects a JS string");

    if (s === undefined || s === null) {
        L.stack[L.top] = new TValue(CT.LUA_TNIL, null);
        L.top++;
    } else {
        var ts = lstring.luaS_newliteral(L, s);
        lobject.pushsvalue2s(L, ts);
        s = ts.getstr(); /* internal copy */
    }
    assert(L.top <= L.ci.top, "stack overflow");

    return s;
};

var lua_pushcclosure = function lua_pushcclosure(L, fn, n) {
    assert(typeof fn === "function");
    assert(typeof n === "number");

    if (n === 0) L.stack[L.top] = new TValue(CT.LUA_TLCF, fn);else {
        assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
        assert(n <= MAXUPVAL, "upvalue index too large");

        var cl = new CClosure(L, fn, n);
        for (var i = 0; i < n; i++) {
            cl.upvalue[i].setfrom(L.stack[L.top - n + i]);
        }for (var _i = 1; _i < n; _i++) {
            delete L.stack[--L.top];
        }if (n > 0) --L.top;
        L.stack[L.top].setclCvalue(cl);
    }
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var lua_pushjsclosure = lua_pushcclosure;

var lua_pushcfunction = function lua_pushcfunction(L, fn) {
    lua_pushcclosure(L, fn, 0);
};

var lua_pushjsfunction = lua_pushcfunction;

var lua_pushboolean = function lua_pushboolean(L, b) {
    L.stack[L.top] = new TValue(CT.LUA_TBOOLEAN, b ? true : false);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var lua_pushlightuserdata = function lua_pushlightuserdata(L, p) {
    L.stack[L.top] = new TValue(CT.LUA_TLIGHTUSERDATA, p);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var lua_pushthread = function lua_pushthread(L) {
    L.stack[L.top] = new TValue(CT.LUA_TTHREAD, L);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
    return L.l_G.mainthread === L;
};

var lua_pushglobaltable = function lua_pushglobaltable(L) {
    lua_rawgeti(L, defs.LUA_REGISTRYINDEX, defs.LUA_RIDX_GLOBALS);
};

/*
** set functions (stack -> Lua)
*/

/*
** t[k] = value at the top of the stack (where 'k' is a string)
*/
var auxsetstr = function auxsetstr(L, t, k) {
    assert(defs.is_luastring(k), "key must be an array of bytes");

    var str = lstring.luaS_new(L, k);
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    lobject.pushsvalue2s(L, str); /* push 'str' (to make it a TValue) */
    assert(L.top <= L.ci.top, "stack overflow");
    lvm.settable(L, t, L.stack[L.top - 1], L.stack[L.top - 2]);
    /* pop value and key */
    delete L.stack[--L.top];
    delete L.stack[--L.top];
};

var lua_setglobal = function lua_setglobal(L, name) {
    auxsetstr(L, ltable.luaH_getint(L.l_G.l_registry.value, defs.LUA_RIDX_GLOBALS), name);
};

var lua_setmetatable = function lua_setmetatable(L, objindex) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var mt = void 0;
    var obj = index2addr(L, objindex);
    if (L.stack[L.top - 1].ttisnil()) mt = null;else {
        assert(L.stack[L.top - 1].ttistable(), "table expected");
        mt = L.stack[L.top - 1].value;
    }

    switch (obj.ttnov()) {
        case CT.LUA_TUSERDATA:
        case CT.LUA_TTABLE:
            {
                obj.value.metatable = mt;
                break;
            }
        default:
            {
                L.l_G.mt[obj.ttnov()] = mt;
                break;
            }
    }

    delete L.stack[--L.top];
    return true;
};

var lua_settable = function lua_settable(L, idx) {
    assert(2 < L.top - L.ci.funcOff, "not enough elements in the stack");

    var t = index2addr(L, idx);
    lvm.settable(L, t, L.stack[L.top - 2], L.stack[L.top - 1]);
    delete L.stack[--L.top];
    delete L.stack[--L.top];
};

var lua_setfield = function lua_setfield(L, idx, k) {
    auxsetstr(L, index2addr(L, idx), k);
};

var lua_seti = function lua_seti(L, idx, n) {
    assert(typeof n === "number" && (n | 0) === n);
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var t = index2addr(L, idx);
    L.stack[L.top] = new TValue(CT.LUA_TNUMINT, n);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
    lvm.settable(L, t, L.stack[L.top - 1], L.stack[L.top - 2]);
    /* pop value and key */
    delete L.stack[--L.top];
    delete L.stack[--L.top];
};

var lua_rawset = function lua_rawset(L, idx) {
    assert(2 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var o = index2addr(L, idx);
    assert(o.ttistable(), "table expected");
    var k = L.stack[L.top - 2];
    var v = L.stack[L.top - 1];
    if (v.ttisnil()) {
        ltable.luaH_delete(L, o.value, k);
    } else {
        var slot = ltable.luaH_set(L, o.value, k);
        slot.setfrom(v);
    }
    ltable.invalidateTMcache(o.value);
    delete L.stack[--L.top];
    delete L.stack[--L.top];
};

var lua_rawseti = function lua_rawseti(L, idx, n) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var o = index2addr(L, idx);
    assert(o.ttistable(), "table expected");
    ltable.luaH_setint(o.value, n, L.stack[L.top - 1]);
    delete L.stack[--L.top];
};

var lua_rawsetp = function lua_rawsetp(L, idx, p) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var o = index2addr(L, idx);
    assert(L, o.ttistable(), "table expected");
    var k = new TValue(CT.LUA_TLIGHTUSERDATA, p);
    var v = L.stack[L.top - 1];
    if (v.ttisnil()) {
        ltable.luaH_delete(L, o.value, k);
    } else {
        var slot = ltable.luaH_set(L, o.value, k);
        slot.setfrom(v);
    }
    delete L.stack[--L.top];
};

/*
** get functions (Lua -> stack)
*/

var auxgetstr = function auxgetstr(L, t, k) {
    assert(defs.is_luastring(k), "key must be an array of bytes");
    var str = lstring.luaS_new(L, k);
    lobject.pushsvalue2s(L, str);
    assert(L.top <= L.ci.top, "stack overflow");
    lvm.luaV_gettable(L, t, L.stack[L.top - 1], L.top - 1);
    return L.stack[L.top - 1].ttnov();
};

var lua_rawgeti = function lua_rawgeti(L, idx, n) {
    var t = index2addr(L, idx);
    assert(t.ttistable(), "table expected");
    lobject.pushobj2s(L, ltable.luaH_getint(t.value, n));
    assert(L.top <= L.ci.top, "stack overflow");
    return L.stack[L.top - 1].ttnov();
};

var lua_rawgetp = function lua_rawgetp(L, idx, p) {
    var t = index2addr(L, idx);
    assert(t.ttistable(), "table expected");
    var k = new TValue(CT.LUA_TLIGHTUSERDATA, p);
    lobject.pushobj2s(L, ltable.luaH_get(L, t.value, k));
    assert(L.top <= L.ci.top, "stack overflow");
    return L.stack[L.top - 1].ttnov();
};

var lua_rawget = function lua_rawget(L, idx) {
    var t = index2addr(L, idx);
    assert(t.ttistable(t), "table expected");
    lobject.setobj2s(L, L.top - 1, ltable.luaH_get(L, t.value, L.stack[L.top - 1]));
    return L.stack[L.top - 1].ttnov();
};

// narray and nrec are mostly useless for this implementation
var lua_createtable = function lua_createtable(L, narray, nrec) {
    var t = new lobject.TValue(CT.LUA_TTABLE, ltable.luaH_new(L));
    L.stack[L.top] = t;
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var luaS_newudata = function luaS_newudata(L, size) {
    return new lobject.Udata(L, size);
};

var lua_newuserdata = function lua_newuserdata(L, size) {
    var u = luaS_newudata(L, size);
    L.stack[L.top] = new lobject.TValue(CT.LUA_TUSERDATA, u);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
    return u.data;
};

var aux_upvalue = function aux_upvalue(L, fi, n) {
    switch (fi.ttype()) {
        case CT.LUA_TCCL:
            {
                /* C closure */
                var f = fi.value;
                if (!(1 <= n && n <= f.nupvalues)) return null;
                return {
                    name: [],
                    val: f.upvalue[n - 1]
                };
            }
        case CT.LUA_TLCL:
            {
                /* Lua closure */
                var _f = fi.value;
                var p = _f.p;
                if (!(1 <= n && n <= p.upvalues.length)) return null;
                var name = p.upvalues[n - 1].name;
                return {
                    name: name ? name.getstr() : defs.to_luastring("(*no name)", true),
                    val: _f.upvals[n - 1].v
                };
            }
        default:
            return null; /* not a closure */
    }
};

var lua_getupvalue = function lua_getupvalue(L, funcindex, n) {
    var up = aux_upvalue(L, index2addr(L, funcindex), n);
    if (up) {
        var name = up.name;
        var val = up.val;
        lobject.pushobj2s(L, val);
        assert(L.top <= L.ci.top, "stack overflow");
        return name;
    }
    return null;
};

var lua_setupvalue = function lua_setupvalue(L, funcindex, n) {
    var fi = index2addr(L, funcindex);
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var aux = aux_upvalue(L, fi, n);
    if (aux) {
        var name = aux.name;
        var val = aux.val;
        val.setfrom(L.stack[L.top - 1]);
        delete L.stack[--L.top];
        return name;
    }
    return null;
};

var lua_newtable = function lua_newtable(L) {
    lua_createtable(L, 0, 0);
};

var lua_register = function lua_register(L, n, f) {
    lua_pushcfunction(L, f);
    lua_setglobal(L, n);
};

var lua_getmetatable = function lua_getmetatable(L, objindex) {
    var obj = index2addr(L, objindex);
    var mt = void 0;
    var res = false;
    switch (obj.ttnov()) {
        case CT.LUA_TTABLE:
        case CT.LUA_TUSERDATA:
            mt = obj.value.metatable;
            break;
        default:
            mt = L.l_G.mt[obj.ttnov()];
            break;
    }

    if (mt !== null && mt !== undefined) {
        L.stack[L.top] = new TValue(CT.LUA_TTABLE, mt);
        L.top++;
        assert(L.top <= L.ci.top, "stack overflow");
        res = true;
    }

    return res;
};

var lua_getuservalue = function lua_getuservalue(L, idx) {
    var o = index2addr(L, idx);
    assert(L, o.ttisfulluserdata(), "full userdata expected");
    var uv = o.value.uservalue;
    L.stack[L.top] = new TValue(uv.type, uv.value);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
    return L.stack[L.top - 1].ttnov();
};

var lua_gettable = function lua_gettable(L, idx) {
    var t = index2addr(L, idx);
    lvm.luaV_gettable(L, t, L.stack[L.top - 1], L.top - 1);
    return L.stack[L.top - 1].ttnov();
};

var lua_getfield = function lua_getfield(L, idx, k) {
    return auxgetstr(L, index2addr(L, idx), k);
};

var lua_geti = function lua_geti(L, idx, n) {
    assert(typeof n === "number" && (n | 0) === n);
    var t = index2addr(L, idx);
    L.stack[L.top] = new TValue(CT.LUA_TNUMINT, n);
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
    lvm.luaV_gettable(L, t, L.stack[L.top - 1], L.top - 1);
    return L.stack[L.top - 1].ttnov();
};

var lua_getglobal = function lua_getglobal(L, name) {
    return auxgetstr(L, ltable.luaH_getint(L.l_G.l_registry.value, defs.LUA_RIDX_GLOBALS), name);
};

/*
** access functions (stack -> JS)
*/

var lua_toboolean = function lua_toboolean(L, idx) {
    var o = index2addr(L, idx);
    return !o.l_isfalse();
};

var lua_tolstring = function lua_tolstring(L, idx) {
    var o = index2addr(L, idx);

    if (!o.ttisstring()) {
        if (!lvm.cvt2str(o)) {
            /* not convertible? */
            return null;
        }
        lobject.luaO_tostring(L, o);
    }
    return o.svalue();
};

var lua_tostring = lua_tolstring;

var lua_toljsstring = function lua_toljsstring(L, idx) {
    var o = index2addr(L, idx);

    if (!o.ttisstring()) {
        if (!lvm.cvt2str(o)) {
            /* not convertible? */
            return null;
        }
        lobject.luaO_tostring(L, o);
    }
    return o.jsstring();
};

var lua_tojsstring = lua_toljsstring;

var lua_todataview = function lua_todataview(L, idx) {
    var o = index2addr(L, idx);

    if (!o.ttisstring()) {
        if (!lvm.cvt2str(o)) {
            /* not convertible? */
            return null;
        }
        lobject.luaO_tostring(L, o);
    }

    var dv = new DataView(new ArrayBuffer(o.vslen()));
    o.svalue().forEach(function (e, i) {
        return dv.setUint8(i, e, true);
    });

    return dv;
};

var lua_rawlen = function lua_rawlen(L, idx) {
    var o = index2addr(L, idx);
    switch (o.ttype()) {
        case CT.LUA_TSHRSTR:
        case CT.LUA_TLNGSTR:
            return o.vslen();
        case CT.LUA_TUSERDATA:
            return o.value.len;
        case CT.LUA_TTABLE:
            return ltable.luaH_getn(o.value);
        default:
            return 0;
    }
};

var lua_tocfunction = function lua_tocfunction(L, idx) {
    var o = index2addr(L, idx);
    if (o.ttislcf() || o.ttisCclosure()) return o.value;else return null; /* not a C function */
};

var lua_tointeger = function lua_tointeger(L, idx) {
    var n = lua_tointegerx(L, idx);
    return n === false ? 0 : n;
};

var lua_tointegerx = function lua_tointegerx(L, idx) {
    return lvm.tointeger(index2addr(L, idx));
};

var lua_tonumber = function lua_tonumber(L, idx) {
    var n = lua_tonumberx(L, idx);
    return n === false ? 0 : n;
};

var lua_tonumberx = function lua_tonumberx(L, idx) {
    return lvm.tonumber(index2addr(L, idx));
};

var lua_touserdata = function lua_touserdata(L, idx) {
    var o = index2addr(L, idx);
    switch (o.ttnov()) {
        case CT.LUA_TUSERDATA:
            return o.value.data;
        case CT.LUA_TLIGHTUSERDATA:
            return o.value;
        default:
            return null;
    }
};

var lua_tothread = function lua_tothread(L, idx) {
    var o = index2addr(L, idx);
    return o.ttisthread() ? o.value : null;
};

var lua_topointer = function lua_topointer(L, idx) {
    var o = index2addr(L, idx);
    switch (o.ttype()) {
        case CT.LUA_TTABLE:
        case CT.LUA_TLCL:
        case CT.LUA_TCCL:
        case CT.LUA_TLCF:
        case CT.LUA_TTHREAD:
        case CT.LUA_TUSERDATA: /* note: this differs in behaviour to reference lua implementation */
        case CT.LUA_TLIGHTUSERDATA:
            return o.value;
        default:
            return null;
    }
};

/* A proxy is a function that the same lua value to the given lua state. */

/* Having a weakmap of created proxies was only way I could think of to provide an 'isproxy' function */
var seen = new WeakMap();

/* is the passed object a proxy? is it from the given state? (if passed) */
var lua_isproxy = function lua_isproxy(p, L) {
    var G = seen.get(p);
    if (!G) return false;
    return L === null || L.l_G === G;
};

/* Use 'create_proxy' helper function so that 'L' is not in scope */
var create_proxy = function create_proxy(G, type, value) {
    var proxy = function proxy(L) {
        assert(G === L.l_G, "must be from same global state");
        L.stack[L.top] = new TValue(type, value);
        L.top++;
        assert(L.top <= L.ci.top, "stack overflow");
    };
    seen.set(proxy, G);
    return proxy;
};

var lua_toproxy = function lua_toproxy(L, idx) {
    var tv = index2addr(L, idx);
    /* pass broken down tv incase it is an upvalue index */
    return create_proxy(L.l_G, tv.type, tv.value);
};

var lua_compare = function lua_compare(L, index1, index2, op) {
    var o1 = index2addr(L, index1);
    var o2 = index2addr(L, index2);

    var i = 0;

    if (isvalid(o1) && isvalid(o2)) {
        switch (op) {
            case defs.LUA_OPEQ:
                i = lvm.luaV_equalobj(L, o1, o2);break;
            case defs.LUA_OPLT:
                i = lvm.luaV_lessthan(L, o1, o2);break;
            case defs.LUA_OPLE:
                i = lvm.luaV_lessequal(L, o1, o2);break;
            default:
                assert(false, "invalid option");
        }
    }

    return i;
};

var lua_stringtonumber = function lua_stringtonumber(L, s) {
    var tv = lobject.luaO_str2num(s);
    if (tv) {
        L.stack[L.top] = tv;
        L.top++;
        assert(L.top <= L.ci.top, "stack overflow");
        return s.length + 1;
    }
    return 0;
};

var f_call = function f_call(L, ud) {
    ldo.luaD_callnoyield(L, ud.funcOff, ud.nresults);
};

var lua_type = function lua_type(L, idx) {
    var o = index2addr(L, idx);
    return isvalid(o) ? o.ttnov() : CT.LUA_TNONE;
};

var lua_typename = function lua_typename(L, t) {
    assert(CT.LUA_TNONE <= t && t < CT.LUA_NUMTAGS, "invalid tag");
    return ltm.ttypename(t);
};

var lua_iscfunction = function lua_iscfunction(L, idx) {
    var o = index2addr(L, idx);
    return o.ttislcf(o) || o.ttisCclosure();
};

var lua_isnil = function lua_isnil(L, n) {
    return lua_type(L, n) === CT.LUA_TNIL;
};

var lua_isboolean = function lua_isboolean(L, n) {
    return lua_type(L, n) === CT.LUA_TBOOLEAN;
};

var lua_isnone = function lua_isnone(L, n) {
    return lua_type(L, n) === CT.LUA_TNONE;
};

var lua_isnoneornil = function lua_isnoneornil(L, n) {
    return lua_type(L, n) <= 0;
};

var lua_istable = function lua_istable(L, idx) {
    return index2addr(L, idx).ttistable();
};

var lua_isinteger = function lua_isinteger(L, idx) {
    return index2addr(L, idx).ttisinteger();
};

var lua_isnumber = function lua_isnumber(L, idx) {
    return lvm.tonumber(index2addr(L, idx)) !== false;
};

var lua_isstring = function lua_isstring(L, idx) {
    var o = index2addr(L, idx);
    return o.ttisstring() || lvm.cvt2str(o);
};

var lua_isuserdata = function lua_isuserdata(L, idx) {
    var o = index2addr(L, idx);
    return o.ttisfulluserdata(o) || o.ttislightuserdata();
};

var lua_isthread = function lua_isthread(L, idx) {
    return lua_type(L, idx) === CT.LUA_TTHREAD;
};

var lua_isfunction = function lua_isfunction(L, idx) {
    return lua_type(L, idx) === CT.LUA_TFUNCTION;
};

var lua_islightuserdata = function lua_islightuserdata(L, idx) {
    return lua_type(L, idx) === CT.LUA_TLIGHTUSERDATA;
};

var lua_rawequal = function lua_rawequal(L, index1, index2) {
    var o1 = index2addr(L, index1);
    var o2 = index2addr(L, index2);
    return isvalid(o1) && isvalid(o2) ? lvm.luaV_equalobj(null, o1, o2) : 0; // TODO: isvalid ?
};

var lua_arith = function lua_arith(L, op) {
    if (op !== defs.LUA_OPUNM && op !== defs.LUA_OPBNOT) assert(2 < L.top - L.ci.funcOff, "not enough elements in the stack"); /* all other operations expect two operands */
    else {
            /* for unary operations, add fake 2nd operand */
            assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
            lobject.pushobj2s(L, L.stack[L.top - 1]);
            assert(L.top <= L.ci.top, "stack overflow");
        }
    /* first operand at top - 2, second at top - 1; result go to top - 2 */
    lobject.luaO_arith(L, op, L.stack[L.top - 2], L.stack[L.top - 1], L.stack[L.top - 2]);
    delete L.stack[--L.top]; /* remove second operand */
};

/*
** 'load' and 'call' functions (run Lua code)
*/

var lua_load = function lua_load(L, reader, data, chunkname, mode) {
    assert(defs.is_luastring(chunkname), "lua_load expect an array of byte as chunkname");
    assert(mode ? defs.is_luastring(mode) : true, "lua_load expect an array of byte as mode");
    if (!chunkname) chunkname = [defs.char["?"]];
    var z = new lzio.ZIO(L, reader, data);
    var status = ldo.luaD_protectedparser(L, z, chunkname, mode);
    if (status === TS.LUA_OK) {
        /* no errors? */
        var f = L.stack[L.top - 1].value; /* get newly created function */
        if (f.nupvalues >= 1) {
            /* does it have an upvalue? */
            /* get global table from registry */
            var gt = ltable.luaH_getint(L.l_G.l_registry.value, defs.LUA_RIDX_GLOBALS);
            /* set global table as 1st upvalue of 'f' (may be LUA_ENV) */
            f.upvals[0].v.setfrom(gt);
        }
    }
    return status;
};

var lua_dump = function lua_dump(L, writer, data, strip) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var o = L.stack[L.top - 1];
    if (o.ttisLclosure()) return ldump.luaU_dump(L, o.value.p, writer, data, strip);
    return 1;
};

var lua_status = function lua_status(L) {
    return L.status;
};

var lua_setuservalue = function lua_setuservalue(L, idx) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    var o = index2addr(L, idx);
    assert(L, o.ttisfulluserdata(), "full userdata expected");
    o.value.uservalue.setfrom(L.stack[L.top - 1]);
    delete L.stack[--L.top];
};

var lua_callk = function lua_callk(L, nargs, nresults, ctx, k) {
    assert(k === null || !(L.ci.callstatus & lstate.CIST_LUA), "cannot use continuations inside hooks");
    assert(nargs + 1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    assert(L.status === TS.LUA_OK, "cannot do calls on non-normal thread");
    assert(nargs === defs.LUA_MULTRET || L.ci.top - L.top >= nargs - nresults, "results from function overflow current stack size");

    var func = L.top - (nargs + 1);
    if (k !== null && L.nny === 0) {
        /* need to prepare continuation? */
        L.ci.c_k = k;
        L.ci.c_ctx = ctx;
        ldo.luaD_call(L, func, nresults);
    } else {
        /* no continuation or no yieldable */
        ldo.luaD_callnoyield(L, func, nresults);
    }

    if (nresults === defs.LUA_MULTRET && L.ci.top < L.top) L.ci.top = L.top;
};

var lua_call = function lua_call(L, n, r) {
    lua_callk(L, n, r, 0, null);
};

var lua_pcallk = function lua_pcallk(L, nargs, nresults, errfunc, ctx, k) {
    assert(nargs + 1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    assert(L.status === TS.LUA_OK, "cannot do calls on non-normal thread");
    assert(nargs === defs.LUA_MULTRET || L.ci.top - L.top >= nargs - nresults, "results from function overflow current stack size");

    var c = {
        func: null,
        funcOff: NaN,
        nresults: NaN
    };
    var status = void 0;
    var func = void 0;

    if (errfunc === 0) func = 0;else {
        // let o = index2addr(L, errfunc);
        // TODO: api_checkstackindex(L, errfunc, o);
        func = index2addr_(L, errfunc);
    }

    c.funcOff = L.top - (nargs + 1); /* function to be called */
    c.func = L.stack[c.funcOff];

    if (k === null || L.nny > 0) {
        /* no continuation or no yieldable? */
        c.nresults = nresults; /* do a 'conventional' protected call */
        status = ldo.luaD_pcall(L, f_call, c, c.funcOff, func);
    } else {
        /* prepare continuation (call is already protected by 'resume') */
        var ci = L.ci;
        ci.c_k = k; /* prepare continuation (call is already protected by 'resume') */
        ci.c_ctx = ctx; /* prepare continuation (call is already protected by 'resume') */
        /* save information for error recovery */
        ci.extra = c.funcOff;
        ci.c_old_errfunc = L.errfunc;
        L.errfunc = func;
        ci.callstatus &= ~lstate.CIST_OAH | L.allowhook;
        ci.callstatus |= lstate.CIST_YPCALL; /* function can do error recovery */
        ldo.luaD_call(L, c.funcOff, nresults); /* do the call */
        ci.callstatus &= ~lstate.CIST_YPCALL;
        L.errfunc = ci.c_old_errfunc;
        status = TS.LUA_OK;
    }

    if (nresults === defs.LUA_MULTRET && L.ci.top < L.top) L.ci.top = L.top;

    return status;
};

var lua_pcall = function lua_pcall(L, n, r, f) {
    return lua_pcallk(L, n, r, f, 0, null);
};

/*
** miscellaneous functions
*/

var lua_error = function lua_error(L) {
    assert(1 < L.top - L.ci.funcOff, "not enough elements in the stack");
    ldebug.luaG_errormsg(L);
};

var lua_next = function lua_next(L, idx) {
    var t = index2addr(L, idx);
    assert(t.ttistable(), "table expected");
    L.stack[L.top] = new TValue();
    var more = ltable.luaH_next(L, t.value, L.top - 1);
    if (more) {
        L.top++;
        assert(L.top <= L.ci.top, "stack overflow");
        return 1;
    } else {
        delete L.stack[L.top];
        delete L.stack[--L.top];
        return 0;
    }
};

var lua_concat = function lua_concat(L, n) {
    assert(n < L.top - L.ci.funcOff, "not enough elements in the stack");
    if (n >= 2) lvm.luaV_concat(L, n);else if (n === 0) {
        lobject.pushsvalue2s(L, lstring.luaS_bless(L, []));
        assert(L.top <= L.ci.top, "stack overflow");
    }
};

var lua_len = function lua_len(L, idx) {
    var t = index2addr(L, idx);
    var tv = new TValue();
    lvm.luaV_objlen(L, tv, t);
    L.stack[L.top] = tv;
    L.top++;
    assert(L.top <= L.ci.top, "stack overflow");
};

var getupvalref = function getupvalref(L, fidx, n) {
    var fi = index2addr(L, fidx);
    assert(fi.ttisLclosure(), "Lua function expected");
    var f = fi.value;
    assert(1 <= n && n <= f.p.upvalues.length, "invalid upvalue index");
    return {
        closure: f,
        upval: f.upvals[n - 1],
        upvalOff: n - 1
    };
};

var lua_upvalueid = function lua_upvalueid(L, fidx, n) {
    var fi = index2addr(L, fidx);
    switch (fi.ttype()) {
        case CT.LUA_TLCL:
            {
                /* lua closure */
                return getupvalref(L, fidx, n).upval;
            }
        case CT.LUA_TCCL:
            {
                /* C closure */
                var f = fi.value;
                assert(1 <= n && n <= f.nupvalues, "invalid upvalue index");
                return f.upvalue[n - 1];
            }
        default:
            {
                assert(false, "closure expected");
                return null;
            }
    }
};

var lua_upvaluejoin = function lua_upvaluejoin(L, fidx1, n1, fidx2, n2) {
    var ref1 = getupvalref(L, fidx1, n1);
    var ref2 = getupvalref(L, fidx2, n2);
    var up1 = ref1.upval;
    var up2 = ref2.upval;
    var f1 = ref1.closure;
    assert(up1.refcount > 0);
    up1.refcount--;
    f1.upvals[ref1.upvalOff] = up2;
    up2.refcount++;
};

// This functions are only there for compatibility purposes
var lua_gc = function lua_gc() {};

var lua_getallocf = function lua_getallocf() {
    console.warn("lua_getallocf is not available");
    return 0;
};

var lua_setallocf = function lua_setallocf() {
    console.warn("lua_setallocf is not available");
    return 0;
};

var lua_getextraspace = function lua_getextraspace() {
    console.warn("lua_getextraspace is not available");
    return 0;
};

module.exports.index2addr = index2addr;
module.exports.index2addr_ = index2addr_;
module.exports.lua_absindex = lua_absindex;
module.exports.lua_arith = lua_arith;
module.exports.lua_atpanic = lua_atpanic;
module.exports.lua_atnativeerror = lua_atnativeerror;
module.exports.lua_call = lua_call;
module.exports.lua_callk = lua_callk;
module.exports.lua_checkstack = lua_checkstack;
module.exports.lua_compare = lua_compare;
module.exports.lua_concat = lua_concat;
module.exports.lua_copy = lua_copy;
module.exports.lua_createtable = lua_createtable;
module.exports.lua_dump = lua_dump;
module.exports.lua_error = lua_error;
module.exports.lua_gc = lua_gc;
module.exports.lua_getallocf = lua_getallocf;
module.exports.lua_getextraspace = lua_getextraspace;
module.exports.lua_getfield = lua_getfield;
module.exports.lua_getglobal = lua_getglobal;
module.exports.lua_geti = lua_geti;
module.exports.lua_getmetatable = lua_getmetatable;
module.exports.lua_gettable = lua_gettable;
module.exports.lua_gettop = lua_gettop;
module.exports.lua_getupvalue = lua_getupvalue;
module.exports.lua_getuservalue = lua_getuservalue;
module.exports.lua_insert = lua_insert;
module.exports.lua_isboolean = lua_isboolean;
module.exports.lua_iscfunction = lua_iscfunction;
module.exports.lua_isfunction = lua_isfunction;
module.exports.lua_isinteger = lua_isinteger;
module.exports.lua_islightuserdata = lua_islightuserdata;
module.exports.lua_isnil = lua_isnil;
module.exports.lua_isnone = lua_isnone;
module.exports.lua_isnoneornil = lua_isnoneornil;
module.exports.lua_isnumber = lua_isnumber;
module.exports.lua_isproxy = lua_isproxy;
module.exports.lua_isstring = lua_isstring;
module.exports.lua_istable = lua_istable;
module.exports.lua_isthread = lua_isthread;
module.exports.lua_isuserdata = lua_isuserdata;
module.exports.lua_len = lua_len;
module.exports.lua_load = lua_load;
module.exports.lua_newtable = lua_newtable;
module.exports.lua_newuserdata = lua_newuserdata;
module.exports.lua_next = lua_next;
module.exports.lua_pcall = lua_pcall;
module.exports.lua_pcallk = lua_pcallk;
module.exports.lua_pop = lua_pop;
module.exports.lua_pushboolean = lua_pushboolean;
module.exports.lua_pushcclosure = lua_pushcclosure;
module.exports.lua_pushcfunction = lua_pushcfunction;
module.exports.lua_pushfstring = lua_pushfstring;
module.exports.lua_pushglobaltable = lua_pushglobaltable;
module.exports.lua_pushinteger = lua_pushinteger;
module.exports.lua_pushjsclosure = lua_pushjsclosure;
module.exports.lua_pushjsfunction = lua_pushjsfunction;
module.exports.lua_pushlightuserdata = lua_pushlightuserdata;
module.exports.lua_pushliteral = lua_pushliteral;
module.exports.lua_pushlstring = lua_pushlstring;
module.exports.lua_pushnil = lua_pushnil;
module.exports.lua_pushnumber = lua_pushnumber;
module.exports.lua_pushstring = lua_pushstring;
module.exports.lua_pushthread = lua_pushthread;
module.exports.lua_pushvalue = lua_pushvalue;
module.exports.lua_pushvfstring = lua_pushvfstring;
module.exports.lua_rawequal = lua_rawequal;
module.exports.lua_rawget = lua_rawget;
module.exports.lua_rawgeti = lua_rawgeti;
module.exports.lua_rawgetp = lua_rawgetp;
module.exports.lua_rawlen = lua_rawlen;
module.exports.lua_rawset = lua_rawset;
module.exports.lua_rawseti = lua_rawseti;
module.exports.lua_rawsetp = lua_rawsetp;
module.exports.lua_register = lua_register;
module.exports.lua_remove = lua_remove;
module.exports.lua_replace = lua_replace;
module.exports.lua_rotate = lua_rotate;
module.exports.lua_setallocf = lua_setallocf;
module.exports.lua_setfield = lua_setfield;
module.exports.lua_setglobal = lua_setglobal;
module.exports.lua_seti = lua_seti;
module.exports.lua_setmetatable = lua_setmetatable;
module.exports.lua_settable = lua_settable;
module.exports.lua_settop = lua_settop;
module.exports.lua_setupvalue = lua_setupvalue;
module.exports.lua_setuservalue = lua_setuservalue;
module.exports.lua_status = lua_status;
module.exports.lua_stringtonumber = lua_stringtonumber;
module.exports.lua_toboolean = lua_toboolean;
module.exports.lua_tocfunction = lua_tocfunction;
module.exports.lua_todataview = lua_todataview;
module.exports.lua_tointeger = lua_tointeger;
module.exports.lua_tointegerx = lua_tointegerx;
module.exports.lua_tojsstring = lua_tojsstring;
module.exports.lua_toljsstring = lua_toljsstring;
module.exports.lua_tolstring = lua_tolstring;
module.exports.lua_tonumber = lua_tonumber;
module.exports.lua_tonumberx = lua_tonumberx;
module.exports.lua_topointer = lua_topointer;
module.exports.lua_toproxy = lua_toproxy;
module.exports.lua_tostring = lua_tostring;
module.exports.lua_tothread = lua_tothread;
module.exports.lua_touserdata = lua_touserdata;
module.exports.lua_type = lua_type;
module.exports.lua_typename = lua_typename;
module.exports.lua_upvalueid = lua_upvalueid;
module.exports.lua_upvaluejoin = lua_upvaluejoin;
module.exports.lua_version = lua_version;
module.exports.lua_xmove = lua_xmove;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);
var lualib = __webpack_require__(23);

module.exports.lua = lua;
module.exports.lauxlib = lauxlib;
module.exports.lualib = lualib;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

/* global window, exports, define */

!function () {
    'use strict';

    var re = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    };

    function sprintf(key) {
        // `arguments` is not an array, but should be fine for this call
        return sprintf_format(sprintf_parse(key), arguments);
    }

    function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []));
    }

    function sprintf_format(parse_tree, argv) {
        var cursor = 1,
            tree_length = parse_tree.length,
            arg,
            output = '',
            i,
            k,
            match,
            pad,
            pad_character,
            pad_length,
            is_positive,
            sign;
        for (i = 0; i < tree_length; i++) {
            if (typeof parse_tree[i] === 'string') {
                output += parse_tree[i];
            } else if (Array.isArray(parse_tree[i])) {
                match = parse_tree[i]; // convenience purposes only
                if (match[2]) {
                    // keyword argument
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                        }
                        arg = arg[match[2][k]];
                    }
                } else if (match[1]) {
                    // positional argument (explicit)
                    arg = argv[match[1]];
                } else {
                    // positional argument (implicit)
                    arg = argv[cursor++];
                }

                if (re.not_type.test(match[8]) && re.not_primitive.test(match[8]) && arg instanceof Function) {
                    arg = arg();
                }

                if (re.numeric_arg.test(match[8]) && typeof arg !== 'number' && isNaN(arg)) {
                    throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg));
                }

                if (re.number.test(match[8])) {
                    is_positive = arg >= 0;
                }

                switch (match[8]) {
                    case 'b':
                        arg = parseInt(arg, 10).toString(2);
                        break;
                    case 'c':
                        arg = String.fromCharCode(parseInt(arg, 10));
                        break;
                    case 'd':
                    case 'i':
                        arg = parseInt(arg, 10);
                        break;
                    case 'j':
                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0);
                        break;
                    case 'e':
                        arg = match[7] ? parseFloat(arg).toExponential(match[7]) : parseFloat(arg).toExponential();
                        break;
                    case 'f':
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                        break;
                    case 'g':
                        arg = match[7] ? String(Number(arg.toPrecision(match[7]))) : parseFloat(arg);
                        break;
                    case 'o':
                        arg = (parseInt(arg, 10) >>> 0).toString(8);
                        break;
                    case 's':
                        arg = String(arg);
                        arg = match[7] ? arg.substring(0, match[7]) : arg;
                        break;
                    case 't':
                        arg = String(!!arg);
                        arg = match[7] ? arg.substring(0, match[7]) : arg;
                        break;
                    case 'T':
                        arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
                        arg = match[7] ? arg.substring(0, match[7]) : arg;
                        break;
                    case 'u':
                        arg = parseInt(arg, 10) >>> 0;
                        break;
                    case 'v':
                        arg = arg.valueOf();
                        arg = match[7] ? arg.substring(0, match[7]) : arg;
                        break;
                    case 'x':
                        arg = (parseInt(arg, 10) >>> 0).toString(16);
                        break;
                    case 'X':
                        arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
                        break;
                }
                if (re.json.test(match[8])) {
                    output += arg;
                } else {
                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
                        sign = is_positive ? '+' : '-';
                        arg = arg.toString().replace(re.sign, '');
                    } else {
                        sign = '';
                    }
                    pad_character = match[4] ? match[4] === '0' ? '0' : match[4].charAt(1) : ' ';
                    pad_length = match[6] - (sign + arg).length;
                    pad = match[6] ? pad_length > 0 ? pad_character.repeat(pad_length) : '' : '';
                    output += match[5] ? sign + arg + pad : pad_character === '0' ? sign + pad + arg : pad + sign + arg;
                }
            }
        }
        return output;
    }

    var sprintf_cache = Object.create(null);

    function sprintf_parse(fmt) {
        if (sprintf_cache[fmt]) {
            return sprintf_cache[fmt];
        }

        var _fmt = fmt,
            match,
            parse_tree = [],
            arg_names = 0;
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree.push(match[0]);
            } else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree.push('%');
            } else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [],
                        replacement_field = match[2],
                        field_match = [];
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1]);
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            } else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            } else {
                                throw new SyntaxError('[sprintf] failed to parse named argument key');
                            }
                        }
                    } else {
                        throw new SyntaxError('[sprintf] failed to parse named argument key');
                    }
                    match[2] = field_list;
                } else {
                    arg_names |= 2;
                }
                if (arg_names === 3) {
                    throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported');
                }
                parse_tree.push(match);
            } else {
                throw new SyntaxError('[sprintf] unexpected placeholder');
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return sprintf_cache[fmt] = parse_tree;
    }

    /**
     * export to either browser or node.js
     */
    /* eslint-disable quote-props */
    if (true) {
        exports['sprintf'] = sprintf;
        exports['vsprintf'] = vsprintf;
    }
    if (typeof window !== 'undefined') {
        window['sprintf'] = sprintf;
        window['vsprintf'] = vsprintf;

        if (true) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
                return {
                    'sprintf': sprintf,
                    'vsprintf': vsprintf
                };
            }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        }
    }
    /* eslint-enable quote-props */
}();

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lisdigit = function lisdigit(c) {
    return (/^\d$/.test(String.fromCharCode(c))
    );
};

var lisxdigit = function lisxdigit(c) {
    return (/^[0-9a-fA-F]$/.test(String.fromCharCode(c))
    );
};

var lisprint = function lisprint(c) {
    return (/^[\x20-\x7E]$/.test(String.fromCharCode(c))
    );
};

var lisspace = function lisspace(c) {
    return (/^\s$/.test(String.fromCharCode(c))
    );
};

var lislalpha = function lislalpha(c) {
    return (/^[_a-zA-Z]$/.test(String.fromCharCode(c))
    );
};

var lislalnum = function lislalnum(c) {
    return (/^[_a-zA-Z0-9]$/.test(String.fromCharCode(c))
    );
};

module.exports.lisdigit = lisdigit;
module.exports.lislalnum = lislalnum;
module.exports.lislalpha = lislalpha;
module.exports.lisprint = lisprint;
module.exports.lisspace = lisspace;
module.exports.lisxdigit = lisxdigit;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var lcode = __webpack_require__(35);
var ldo = __webpack_require__(6);
var lfunc = __webpack_require__(11);
var llex = __webpack_require__(22);
var llimit = __webpack_require__(4);
var lobject = __webpack_require__(3);
var lopcodes = __webpack_require__(15);
var lstring = __webpack_require__(8);
var ltable = __webpack_require__(7);
var BinOpr = lcode.BinOpr;
var OpCodesI = lopcodes.OpCodesI;
var Proto = lfunc.Proto;
var R = llex.RESERVED;
var UnOpr = lcode.UnOpr;
var char = defs.char;

var MAXVARS = 200;

var hasmultret = function hasmultret(k) {
    return k === expkind.VCALL || k === expkind.VVARARG;
};

var eqstr = function eqstr(a, b) {
    /* TODO: use plain equality as strings are cached */
    return lstring.luaS_eqlngstr(a, b);
};

var BlockCnt = function BlockCnt() {
    _classCallCheck(this, BlockCnt);

    this.previous = null; /* chain */
    this.firstlabel = NaN; /* index of first label in this block */
    this.firstgoto = NaN; /* index of first pending goto in this block */
    this.nactvar = NaN; /* # active locals outside the block */
    this.upval = NaN; /* true if some variable in the block is an upvalue */
    this.isloop = NaN; /* true if 'block' is a loop */
};

var expkind = {
    VVOID: 0, /* when 'expdesc' describes the last expression a list,
                 this kind means an empty list (so, no expression) */
    VNIL: 1, /* constant nil */
    VTRUE: 2, /* constant true */
    VFALSE: 3, /* constant false */
    VK: 4, /* constant in 'k'; info = index of constant in 'k' */
    VKFLT: 5, /* floating constant; nval = numerical float value */
    VKINT: 6, /* integer constant; nval = numerical integer value */
    VNONRELOC: 7, /* expression has its value in a fixed register;
                     info = result register */
    VLOCAL: 8, /* local variable; info = local register */
    VUPVAL: 9, /* upvalue variable; info = index of upvalue in 'upvalues' */
    VINDEXED: 10, /* indexed variable;
                     ind.vt = whether 't' is register or upvalue;
                     ind.t = table register or upvalue;
                     ind.idx = key's R/K index */
    VJMP: 11, /* expression is a test/comparison;
                 info = pc of corresponding jump instruction */
    VRELOCABLE: 12, /* expression can put result in any register;
                       info = instruction pc */
    VCALL: 13, /* expression is a function call; info = instruction pc */
    VVARARG: 14 /* vararg expression; info = instruction pc */
};

var vkisvar = function vkisvar(k) {
    return expkind.VLOCAL <= k && k <= expkind.VINDEXED;
};

var vkisinreg = function vkisinreg(k) {
    return k === expkind.VNONRELOC || k === expkind.VLOCAL;
};

var expdesc = function () {
    function expdesc() {
        _classCallCheck(this, expdesc);

        this.k = NaN;
        this.u = {
            ival: NaN, /* for VKINT */
            nval: NaN, /* for VKFLT */
            info: NaN, /* for generic use */
            ind: { /* for indexed variables (VINDEXED) */
                idx: NaN, /* index (R/K) */
                t: NaN, /* table (register or upvalue) */
                vt: NaN /* whether 't' is register (VLOCAL) or upvalue (VUPVAL) */
            }
        };
        this.t = NaN; /* patch list of 'exit when true' */
        this.f = NaN; /* patch list of 'exit when false' */
    }

    _createClass(expdesc, [{
        key: 'to',
        value: function to(e) {
            // Copy e content to this, cf. luaK_posfix
            this.k = e.k;
            this.u = e.u;
            this.t = e.t;
            this.f = e.f;
        }
    }]);

    return expdesc;
}();

var FuncState = function FuncState() {
    _classCallCheck(this, FuncState);

    this.f = null; /* current function header */
    this.prev = null; /* enclosing function */
    this.ls = null; /* lexical state */
    this.bl = null; /* chain of current blocks */
    this.pc = NaN; /* next position to code (equivalent to 'ncode') */
    this.lasttarget = NaN; /* 'label' of last 'jump label' */
    this.jpc = NaN; /* list of pending jumps to 'pc' */
    this.nk = NaN; /* number of elements in 'k' */
    this.np = NaN; /* number of elements in 'p' */
    this.firstlocal = NaN; /* index of first local var (in Dyndata array) */
    this.nlocvars = NaN; /* number of elements in 'f->locvars' */
    this.nactvar = NaN; /* number of active local variables */
    this.nups = NaN; /* number of upvalues */
    this.freereg = NaN; /* first free register */
};

/* description of active local variable */


var Vardesc = function Vardesc() {
    _classCallCheck(this, Vardesc);

    this.idx = NaN; /* variable index in stack */
};

/* description of pending goto statements and label statements */


var Labeldesc = function Labeldesc() {
    _classCallCheck(this, Labeldesc);

    this.name = null; /* label identifier */
    this.pc = NaN; /* position in code */
    this.line = NaN; /* line where it appeared */
    this.nactvar = NaN; /* local level where it appears in current block */
};

/* list of labels or gotos */


var Labellist = function Labellist() {
    _classCallCheck(this, Labellist);

    this.arr = []; /* array */
    this.n = NaN; /* number of entries in use */
    this.size = NaN; /* array size */
};

/* dynamic structures used by the parser */


var Dyndata = function Dyndata() {
    _classCallCheck(this, Dyndata);

    this.actvar = { /* list of active local variables */
        arr: [],
        n: NaN,
        size: NaN
    };
    this.gt = new Labellist();
    this.label = new Labellist();
};

var semerror = function semerror(ls, msg) {
    ls.t.token = 0; /* remove "near <token>" from final message */
    llex.luaX_syntaxerror(ls, msg);
};

var error_expected = function error_expected(ls, token) {
    llex.luaX_syntaxerror(ls, lobject.luaO_pushfstring(ls.L, defs.to_luastring("%s expected", true), llex.luaX_token2str(ls, token)));
};

var errorlimit = function errorlimit(fs, limit, what) {
    var L = fs.ls.L;
    var line = fs.f.linedefined;
    var where = line === 0 ? defs.to_luastring("main function", true) : lobject.luaO_pushfstring(L, defs.to_luastring("function at line %d", true), line);
    var msg = lobject.luaO_pushfstring(L, defs.to_luastring("too many %s (limit is %d) in %s", true), what, limit, where);
    llex.luaX_syntaxerror(fs.ls, msg);
};

var checklimit = function checklimit(fs, v, l, what) {
    if (v > l) errorlimit(fs, l, what);
};

var testnext = function testnext(ls, c) {
    if (ls.t.token === c) {
        llex.luaX_next(ls);
        return true;
    }

    return false;
};

var check = function check(ls, c) {
    if (ls.t.token !== c) error_expected(ls, c);
};

var checknext = function checknext(ls, c) {
    check(ls, c);
    llex.luaX_next(ls);
};

var check_condition = function check_condition(ls, c, msg) {
    if (!c) llex.luaX_syntaxerror(ls, msg);
};

var check_match = function check_match(ls, what, who, where) {
    if (!testnext(ls, what)) {
        if (where === ls.linenumber) error_expected(ls, what);else llex.luaX_syntaxerror(ls, lobject.luaO_pushfstring(ls.L, defs.to_luastring("%s expected (to close %s at line %d)"), llex.luaX_token2str(ls, what), llex.luaX_token2str(ls, who), where));
    }
};

var str_checkname = function str_checkname(ls) {
    check(ls, R.TK_NAME);
    var ts = ls.t.seminfo.ts;
    llex.luaX_next(ls);
    return ts;
};

var init_exp = function init_exp(e, k, i) {
    e.f = e.t = lcode.NO_JUMP;
    e.k = k;
    e.u.info = i;
};

var codestring = function codestring(ls, e, s) {
    init_exp(e, expkind.VK, lcode.luaK_stringK(ls.fs, s));
};

var checkname = function checkname(ls, e) {
    codestring(ls, e, str_checkname(ls));
};

var registerlocalvar = function registerlocalvar(ls, varname) {
    var fs = ls.fs;
    var f = fs.f;
    f.locvars[fs.nlocvars] = new lobject.LocVar();
    f.locvars[fs.nlocvars].varname = varname;
    return fs.nlocvars++;
};

var new_localvar = function new_localvar(ls, name) {
    var fs = ls.fs;
    var dyd = ls.dyd;
    var reg = registerlocalvar(ls, name);
    checklimit(fs, dyd.actvar.n + 1 - fs.firstlocal, MAXVARS, defs.to_luastring("local variables", true));
    dyd.actvar.arr[dyd.actvar.n] = new Vardesc();
    dyd.actvar.arr[dyd.actvar.n].idx = reg;
    dyd.actvar.n++;
};

var new_localvarliteral = function new_localvarliteral(ls, name) {
    new_localvar(ls, llex.luaX_newstring(ls, defs.to_luastring(name, true)));
};

var getlocvar = function getlocvar(fs, i) {
    var idx = fs.ls.dyd.actvar.arr[fs.firstlocal + i].idx;
    assert(idx < fs.nlocvars);
    return fs.f.locvars[idx];
};

var adjustlocalvars = function adjustlocalvars(ls, nvars) {
    var fs = ls.fs;
    fs.nactvar = fs.nactvar + nvars;
    for (; nvars; nvars--) {
        getlocvar(fs, fs.nactvar - nvars).startpc = fs.pc;
    }
};

var removevars = function removevars(fs, tolevel) {
    fs.ls.dyd.actvar.n -= fs.nactvar - tolevel;
    while (fs.nactvar > tolevel) {
        getlocvar(fs, --fs.nactvar).endpc = fs.pc;
    }
};

var searchupvalue = function searchupvalue(fs, name) {
    var up = fs.f.upvalues;
    for (var i = 0; i < fs.nups; i++) {
        if (eqstr(up[i].name, name)) return i;
    }
    return -1; /* not found */
};

var newupvalue = function newupvalue(fs, name, v) {
    var f = fs.f;
    checklimit(fs, fs.nups + 1, lfunc.MAXUPVAL, defs.to_luastring("upvalues", true));
    f.upvalues[fs.nups] = {
        instack: v.k === expkind.VLOCAL,
        idx: v.u.info,
        name: name
    };
    return fs.nups++;
};

var searchvar = function searchvar(fs, n) {
    for (var i = fs.nactvar - 1; i >= 0; i--) {
        if (eqstr(n, getlocvar(fs, i).varname)) return i;
    }

    return -1;
};

/*
** Mark block where variable at given level was defined
** (to emit close instructions later).
*/
var markupval = function markupval(fs, level) {
    var bl = fs.bl;
    while (bl.nactvar > level) {
        bl = bl.previous;
    }bl.upval = 1;
};

/*
** Find variable with given name 'n'. If it is an upvalue, add this
** upvalue into all intermediate functions.
*/
var singlevaraux = function singlevaraux(fs, n, vr, base) {
    if (fs === null) /* no more levels? */
        init_exp(vr, expkind.VVOID, 0); /* default is global */
    else {
            var v = searchvar(fs, n); /* look up locals at current level */
            if (v >= 0) {
                /* found? */
                init_exp(vr, expkind.VLOCAL, v); /* variable is local */
                if (!base) markupval(fs, v); /* local will be used as an upval */
            } else {
                /* not found as local at current level; try upvalues */
                var idx = searchupvalue(fs, n); /* try existing upvalues */
                if (idx < 0) {
                    /* not found? */
                    singlevaraux(fs.prev, n, vr, 0); /* try upper levels */
                    if (vr.k === expkind.VVOID) /* not found? */
                        return; /* it is a global */
                    /* else was LOCAL or UPVAL */
                    idx = newupvalue(fs, n, vr); /* will be a new upvalue */
                }
                init_exp(vr, expkind.VUPVAL, idx); /* new or old upvalue */
            }
        }
};

var singlevar = function singlevar(ls, vr) {
    var varname = str_checkname(ls);
    var fs = ls.fs;
    singlevaraux(fs, varname, vr, 1);
    if (vr.k === expkind.VVOID) {
        /* global name? */
        var key = new expdesc();
        singlevaraux(fs, ls.envn, vr, 1); /* get environment variable */
        assert(vr.k !== expkind.VVOID); /* this one must exist */
        codestring(ls, key, varname); /* key is variable name */
        lcode.luaK_indexed(fs, vr, key); /* env[varname] */
    }
};

var adjust_assign = function adjust_assign(ls, nvars, nexps, e) {
    var fs = ls.fs;
    var extra = nvars - nexps;
    if (hasmultret(e.k)) {
        extra++; /* includes call itself */
        if (extra < 0) extra = 0;
        lcode.luaK_setreturns(fs, e, extra); /* last exp. provides the difference */
        if (extra > 1) lcode.luaK_reserveregs(fs, extra - 1);
    } else {
        if (e.k !== expkind.VVOID) lcode.luaK_exp2nextreg(fs, e); /* close last expression */
        if (extra > 0) {
            var reg = fs.freereg;
            lcode.luaK_reserveregs(fs, extra);
            lcode.luaK_nil(fs, reg, extra);
        }
    }
    if (nexps > nvars) ls.fs.freereg -= nexps - nvars; /* remove extra values */
};

var enterlevel = function enterlevel(ls) {
    var L = ls.L;
    ++L.nCcalls;
    checklimit(ls.fs, L.nCcalls, llimit.LUAI_MAXCCALLS, defs.to_luastring("JS levels", true));
};

var leavelevel = function leavelevel(ls) {
    return ls.L.nCcalls--;
};

var closegoto = function closegoto(ls, g, label) {
    var fs = ls.fs;
    var gl = ls.dyd.gt;
    var gt = gl.arr[g];
    assert(eqstr(gt.name, label.name));
    if (gt.nactvar < label.nactvar) {
        var vname = getlocvar(fs, gt.nactvar).varname;
        var msg = lobject.luaO_pushfstring(ls.L, defs.to_luastring("<goto %s> at line %d jumps into the scope of local '%s'"), gt.name.getstr(), gt.line, vname.getstr());
        semerror(ls, msg);
    }
    lcode.luaK_patchlist(fs, gt.pc, label.pc);
    /* remove goto from pending list */
    for (var i = g; i < gl.n - 1; i++) {
        gl.arr[i] = gl.arr[i + 1];
    }gl.n--;
};

/*
** try to close a goto with existing labels; this solves backward jumps
*/
var findlabel = function findlabel(ls, g) {
    var bl = ls.fs.bl;
    var dyd = ls.dyd;
    var gt = dyd.gt.arr[g];
    /* check labels in current block for a match */
    for (var i = bl.firstlabel; i < dyd.label.n; i++) {
        var lb = dyd.label.arr[i];
        if (eqstr(lb.name, gt.name)) {
            /* correct label? */
            if (gt.nactvar > lb.nactvar && (bl.upval || dyd.label.n > bl.firstlabel)) lcode.luaK_patchclose(ls.fs, gt.pc, lb.nactvar);
            closegoto(ls, g, lb); /* close it */
            return true;
        }
    }
    return false; /* label not found; cannot close goto */
};

var newlabelentry = function newlabelentry(ls, l, name, line, pc) {
    var n = l.n;
    l.arr[n] = new Labeldesc();
    l.arr[n].name = name;
    l.arr[n].line = line;
    l.arr[n].nactvar = ls.fs.nactvar;
    l.arr[n].pc = pc;
    l.n = n + 1;
    return n;
};

/*
** check whether new label 'lb' matches any pending gotos in current
** block; solves forward jumps
*/
var findgotos = function findgotos(ls, lb) {
    var gl = ls.dyd.gt;
    var i = ls.fs.bl.firstgoto;
    while (i < gl.n) {
        if (eqstr(gl.arr[i].name, lb.name)) closegoto(ls, i, lb);else i++;
    }
};

/*
** export pending gotos to outer level, to check them against
** outer labels; if the block being exited has upvalues, and
** the goto exits the scope of any variable (which can be the
** upvalue), close those variables being exited.
*/
var movegotosout = function movegotosout(fs, bl) {
    var i = bl.firstgoto;
    var gl = fs.ls.dyd.gt;
    /* correct pending gotos to current block and try to close it
       with visible labels */
    while (i < gl.n) {
        var gt = gl.arr[i];
        if (gt.nactvar > bl.nactvar) {
            if (bl.upval) lcode.luaK_patchclose(fs, gt.pc, bl.nactvar);
            gt.nactvar = bl.nactvar;
        }
        if (!findlabel(fs.ls, i)) i++; /* move to next one */
    }
};

var enterblock = function enterblock(fs, bl, isloop) {
    bl.isloop = isloop;
    bl.nactvar = fs.nactvar;
    bl.firstlabel = fs.ls.dyd.label.n;
    bl.firstgoto = fs.ls.dyd.gt.n;
    bl.upval = 0;
    bl.previous = fs.bl;
    fs.bl = bl;
    assert(fs.freereg === fs.nactvar);
};

/*
** create a label named 'break' to resolve break statements
*/
var breaklabel = function breaklabel(ls) {
    var n = lstring.luaS_newliteral(ls.L, "break");
    var l = newlabelentry(ls, ls.dyd.label, n, 0, ls.fs.pc);
    findgotos(ls, ls.dyd.label.arr[l]);
};

/*
** generates an error for an undefined 'goto'; choose appropriate
** message when label name is a reserved word (which can only be 'break')
*/
var undefgoto = function undefgoto(ls, gt) {
    var msg = llex.isreserved(gt.name) ? "<%s> at line %d not inside a loop" : "no visible label '%s' for <goto> at line %d";
    msg = lobject.luaO_pushfstring(ls.L, defs.to_luastring(msg), gt.name.getstr(), gt.line);
    semerror(ls, msg);
};

/*
** adds a new prototype into list of prototypes
*/
var addprototype = function addprototype(ls) {
    var L = ls.L;
    var clp = new Proto(L);
    var fs = ls.fs;
    var f = fs.f; /* prototype of current function */
    f.p[fs.np++] = clp;
    return clp;
};

/*
** codes instruction to create new closure in parent function.
*/
var codeclosure = function codeclosure(ls, v) {
    var fs = ls.fs.prev;
    init_exp(v, expkind.VRELOCABLE, lcode.luaK_codeABx(fs, OpCodesI.OP_CLOSURE, 0, fs.np - 1));
    lcode.luaK_exp2nextreg(fs, v); /* fix it at the last register */
};

var open_func = function open_func(ls, fs, bl) {
    fs.prev = ls.fs; /* linked list of funcstates */
    fs.ls = ls;
    ls.fs = fs;
    fs.pc = 0;
    fs.lasttarget = 0;
    fs.jpc = lcode.NO_JUMP;
    fs.freereg = 0;
    fs.nk = 0;
    fs.np = 0;
    fs.nups = 0;
    fs.nlocvars = 0;
    fs.nactvar = 0;
    fs.firstlocal = ls.dyd.actvar.n;
    fs.bl = null;
    var f = new Proto(ls.L);
    f = fs.f;
    f.source = ls.source;
    f.maxstacksize = 2; /* registers 0/1 are always valid */
    enterblock(fs, bl, false);
};

var leaveblock = function leaveblock(fs) {
    var bl = fs.bl;
    var ls = fs.ls;
    if (bl.previous && bl.upval) {
        /* create a 'jump to here' to close upvalues */
        var j = lcode.luaK_jump(fs);
        lcode.luaK_patchclose(fs, j, bl.nactvar);
        lcode.luaK_patchtohere(fs, j);
    }

    if (bl.isloop) breaklabel(ls); /* close pending breaks */

    fs.bl = bl.previous;
    removevars(fs, bl.nactvar);
    assert(bl.nactvar === fs.nactvar);
    fs.freereg = fs.nactvar; /* free registers */
    ls.dyd.label.n = bl.firstlabel; /* remove local labels */
    if (bl.previous) /* inner block? */
        movegotosout(fs, bl); /* update pending gotos to outer block */
    else if (bl.firstgoto < ls.dyd.gt.n) /* pending gotos in outer block? */
            undefgoto(ls, ls.dyd.gt.arr[bl.firstgoto]); /* error */
};

var close_func = function close_func(ls) {
    var fs = ls.fs;
    lcode.luaK_ret(fs, 0, 0); /* final return */
    leaveblock(fs);
    assert(fs.bl === null);
    ls.fs = fs.prev;
};

/*============================================================*/
/* GRAMMAR RULES */
/*============================================================*/

var block_follow = function block_follow(ls, withuntil) {
    switch (ls.t.token) {
        case R.TK_ELSE:case R.TK_ELSEIF:
        case R.TK_END:case R.TK_EOS:
            return true;
        case R.TK_UNTIL:
            return withuntil;
        default:
            return false;
    }
};

var statlist = function statlist(ls) {
    /* statlist -> { stat [';'] } */
    while (!block_follow(ls, 1)) {
        if (ls.t.token === R.TK_RETURN) {
            statement(ls);
            return; /* 'return' must be last statement */
        }
        statement(ls);
    }
};

var fieldsel = function fieldsel(ls, v) {
    /* fieldsel -> ['.' | ':'] NAME */
    var fs = ls.fs;
    var key = new expdesc();
    lcode.luaK_exp2anyregup(fs, v);
    llex.luaX_next(ls); /* skip the dot or colon */
    checkname(ls, key);
    lcode.luaK_indexed(fs, v, key);
};

var yindex = function yindex(ls, v) {
    /* index -> '[' expr ']' */
    llex.luaX_next(ls); /* skip the '[' */
    expr(ls, v);
    lcode.luaK_exp2val(ls.fs, v);
    checknext(ls, char[']']);
};

/*
** {======================================================================
** Rules for Constructors
** =======================================================================
*/

var ConsControl = function ConsControl() {
    _classCallCheck(this, ConsControl);

    this.v = new expdesc(); /* last list item read */
    this.t = new expdesc(); /* table descriptor */
    this.nh = NaN; /* total number of 'record' elements */
    this.na = NaN; /* total number of array elements */
    this.tostore = NaN; /* number of array elements pending to be stored */
};

var recfield = function recfield(ls, cc) {
    /* recfield -> (NAME | '['exp1']') = exp1 */
    var fs = ls.fs;
    var reg = ls.fs.freereg;
    var key = new expdesc();
    var val = new expdesc();

    if (ls.t.token === R.TK_NAME) {
        checklimit(fs, cc.nh, llimit.MAX_INT, defs.to_luastring("items in a constructor", true));
        checkname(ls, key);
    } else /* ls->t.token === '[' */
        yindex(ls, key);
    cc.nh++;
    checknext(ls, char['=']);
    var rkkey = lcode.luaK_exp2RK(fs, key);
    expr(ls, val);
    lcode.luaK_codeABC(fs, OpCodesI.OP_SETTABLE, cc.t.u.info, rkkey, lcode.luaK_exp2RK(fs, val));
    fs.freereg = reg; /* free registers */
};

var closelistfield = function closelistfield(fs, cc) {
    if (cc.v.k === expkind.VVOID) return; /* there is no list item */
    lcode.luaK_exp2nextreg(fs, cc.v);
    cc.v.k = expkind.VVOID;
    if (cc.tostore === lopcodes.LFIELDS_PER_FLUSH) {
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, cc.tostore); /* flush */
        cc.tostore = 0; /* no more items pending */
    }
};

var lastlistfield = function lastlistfield(fs, cc) {
    if (cc.tostore === 0) return;
    if (hasmultret(cc.v.k)) {
        lcode.luaK_setmultret(fs, cc.v);
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, defs.LUA_MULTRET);
        cc.na--; /* do not count last expression (unknown number of elements) */
    } else {
        if (cc.v.k !== expkind.VVOID) lcode.luaK_exp2nextreg(fs, cc.v);
        lcode.luaK_setlist(fs, cc.t.u.info, cc.na, cc.tostore);
    }
};

var listfield = function listfield(ls, cc) {
    /* listfield -> exp */
    expr(ls, cc.v);
    checklimit(ls.fs, cc.na, llimit.MAX_INT, defs.to_luastring("items in a constructor", true));
    cc.na++;
    cc.tostore++;
};

var field = function field(ls, cc) {
    /* field -> listfield | recfield */
    switch (ls.t.token) {
        case R.TK_NAME:
            {
                /* may be 'listfield' or 'recfield' */
                if (llex.luaX_lookahead(ls) !== char['=']) /* expression? */
                    listfield(ls, cc);else recfield(ls, cc);
                break;
            }
        case char['[']:
            {
                recfield(ls, cc);
                break;
            }
        default:
            {
                listfield(ls, cc);
                break;
            }
    }
};

var constructor = function constructor(ls, t) {
    /* constructor -> '{' [ field { sep field } [sep] ] '}'
       sep -> ',' | ';' */
    var fs = ls.fs;
    var line = ls.linenumber;
    var pc = lcode.luaK_codeABC(fs, OpCodesI.OP_NEWTABLE, 0, 0, 0);
    var cc = new ConsControl();
    cc.na = cc.nh = cc.tostore = 0;
    cc.t = t;
    init_exp(t, expkind.VRELOCABLE, pc);
    init_exp(cc.v, expkind.VVOID, 0); /* no value (yet) */
    lcode.luaK_exp2nextreg(ls.fs, t); /* fix it at stack top */
    checknext(ls, char['{']);
    do {
        assert(cc.v.k === expkind.VVOID || cc.tostore > 0);
        if (ls.t.token === char['}']) break;
        closelistfield(fs, cc);
        field(ls, cc);
    } while (testnext(ls, char[',']) || testnext(ls, char[';']));
    check_match(ls, char['}'], char['{'], line);
    lastlistfield(fs, cc);
    lopcodes.SETARG_B(fs.f.code[pc], lobject.luaO_int2fb(cc.na)); /* set initial array size */
    lopcodes.SETARG_C(fs.f.code[pc], lobject.luaO_int2fb(cc.nh)); /* set initial table size */
};

/* }====================================================================== */

var parlist = function parlist(ls) {
    /* parlist -> [ param { ',' param } ] */
    var fs = ls.fs;
    var f = fs.f;
    var nparams = 0;
    f.is_vararg = false;
    if (ls.t.token !== char[')']) {
        /* is 'parlist' not empty? */
        do {
            switch (ls.t.token) {
                case R.TK_NAME:
                    {
                        /* param -> NAME */
                        new_localvar(ls, str_checkname(ls));
                        nparams++;
                        break;
                    }
                case R.TK_DOTS:
                    {
                        /* param -> '...' */
                        llex.luaX_next(ls);
                        f.is_vararg = true; /* declared vararg */
                        break;
                    }
                default:
                    llex.luaX_syntaxerror(ls, defs.to_luastring("<name> or '...' expected", true));
            }
        } while (!f.is_vararg && testnext(ls, char[',']));
    }
    adjustlocalvars(ls, nparams);
    f.numparams = fs.nactvar;
    lcode.luaK_reserveregs(fs, fs.nactvar); /* reserve register for parameters */
};

var body = function body(ls, e, ismethod, line) {
    /* body ->  '(' parlist ')' block END */
    var new_fs = new FuncState();
    var bl = new BlockCnt();
    new_fs.f = addprototype(ls);
    new_fs.f.linedefined = line;
    open_func(ls, new_fs, bl);
    checknext(ls, char['(']);
    if (ismethod) {
        new_localvarliteral(ls, "self"); /* create 'self' parameter */
        adjustlocalvars(ls, 1);
    }
    parlist(ls);
    checknext(ls, char[')']);
    statlist(ls);
    new_fs.f.lastlinedefined = ls.linenumber;
    check_match(ls, R.TK_END, R.TK_FUNCTION, line);
    codeclosure(ls, e);
    close_func(ls);
};

var explist = function explist(ls, v) {
    /* explist -> expr { ',' expr } */
    var n = 1; /* at least one expression */
    expr(ls, v);
    while (testnext(ls, char[','])) {
        lcode.luaK_exp2nextreg(ls.fs, v);
        expr(ls, v);
        n++;
    }
    return n;
};

var funcargs = function funcargs(ls, f, line) {
    var fs = ls.fs;
    var args = new expdesc();
    switch (ls.t.token) {
        case char['(']:
            {
                /* funcargs -> '(' [ explist ] ')' */
                llex.luaX_next(ls);
                if (ls.t.token === char[')']) /* arg list is empty? */
                    args.k = expkind.VVOID;else {
                    explist(ls, args);
                    lcode.luaK_setmultret(fs, args);
                }
                check_match(ls, char[')'], char['('], line);
                break;
            }
        case char['{']:
            {
                /* funcargs -> constructor */
                constructor(ls, args);
                break;
            }
        case R.TK_STRING:
            {
                /* funcargs -> STRING */
                codestring(ls, args, ls.t.seminfo.ts);
                llex.luaX_next(ls); /* must use 'seminfo' before 'next' */
                break;
            }
        default:
            {
                llex.luaX_syntaxerror(ls, defs.to_luastring("function arguments expected", true));
            }
    }
    assert(f.k === expkind.VNONRELOC);
    var nparams = void 0;
    var base = f.u.info; /* base register for call */
    if (hasmultret(args.k)) nparams = defs.LUA_MULTRET; /* open call */
    else {
            if (args.k !== expkind.VVOID) lcode.luaK_exp2nextreg(fs, args); /* close last argument */
            nparams = fs.freereg - (base + 1);
        }
    init_exp(f, expkind.VCALL, lcode.luaK_codeABC(fs, OpCodesI.OP_CALL, base, nparams + 1, 2));
    lcode.luaK_fixline(fs, line);
    fs.freereg = base + 1; /* call remove function and arguments and leaves (unless changed) one result */
};

/*
** {======================================================================
** Expression parsing
** =======================================================================
*/

var primaryexp = function primaryexp(ls, v) {
    /* primaryexp -> NAME | '(' expr ')' */
    switch (ls.t.token) {
        case char['(']:
            {
                var line = ls.linenumber;
                llex.luaX_next(ls);
                expr(ls, v);
                check_match(ls, char[')'], char['('], line);
                lcode.luaK_dischargevars(ls.fs, v);
                return;
            }
        case R.TK_NAME:
            {
                singlevar(ls, v);
                return;
            }
        default:
            {
                llex.luaX_syntaxerror(ls, defs.to_luastring("unexpected symbol", true));
            }
    }
};

var suffixedexp = function suffixedexp(ls, v) {
    /* suffixedexp ->
       primaryexp { '.' NAME | '[' exp ']' | ':' NAME funcargs | funcargs } */
    var fs = ls.fs;
    var line = ls.linenumber;
    primaryexp(ls, v);
    for (;;) {
        switch (ls.t.token) {
            case char['.']:
                {
                    /* fieldsel */
                    fieldsel(ls, v);
                    break;
                }
            case char['[']:
                {
                    /* '[' exp1 ']' */
                    var key = new expdesc();
                    lcode.luaK_exp2anyregup(fs, v);
                    yindex(ls, key);
                    lcode.luaK_indexed(fs, v, key);
                    break;
                }
            case char[':']:
                {
                    /* ':' NAME funcargs */
                    var _key = new expdesc();
                    llex.luaX_next(ls);
                    checkname(ls, _key);
                    lcode.luaK_self(fs, v, _key);
                    funcargs(ls, v, line);
                    break;
                }
            case char['(']:case R.TK_STRING:case char['{']:
                {
                    /* funcargs */
                    lcode.luaK_exp2nextreg(fs, v);
                    funcargs(ls, v, line);
                    break;
                }
            default:
                return;
        }
    }
};

var simpleexp = function simpleexp(ls, v) {
    /* simpleexp -> FLT | INT | STRING | NIL | TRUE | FALSE | ... |
       constructor | FUNCTION body | suffixedexp */
    switch (ls.t.token) {
        case R.TK_FLT:
            {
                init_exp(v, expkind.VKFLT, 0);
                v.u.nval = ls.t.seminfo.r;
                break;
            }
        case R.TK_INT:
            {
                init_exp(v, expkind.VKINT, 0);
                v.u.ival = ls.t.seminfo.i;
                break;
            }
        case R.TK_STRING:
            {
                codestring(ls, v, ls.t.seminfo.ts);
                break;
            }
        case R.TK_NIL:
            {
                init_exp(v, expkind.VNIL, 0);
                break;
            }
        case R.TK_TRUE:
            {
                init_exp(v, expkind.VTRUE, 0);
                break;
            }
        case R.TK_FALSE:
            {
                init_exp(v, expkind.VFALSE, 0);
                break;
            }
        case R.TK_DOTS:
            {
                /* vararg */
                var fs = ls.fs;
                check_condition(ls, fs.f.is_vararg, defs.to_luastring("cannot use '...' outside a vararg function", true));
                init_exp(v, expkind.VVARARG, lcode.luaK_codeABC(fs, OpCodesI.OP_VARARG, 0, 1, 0));
                break;
            }
        case char['{']:
            {
                /* constructor */
                constructor(ls, v);
                return;
            }
        case R.TK_FUNCTION:
            {
                llex.luaX_next(ls);
                body(ls, v, 0, ls.linenumber);
                return;
            }
        default:
            {
                suffixedexp(ls, v);
                return;
            }
    }
    llex.luaX_next(ls);
};

var getunopr = function getunopr(op) {
    switch (op) {
        case R.TK_NOT:
            return UnOpr.OPR_NOT;
        case char['-']:
            return UnOpr.OPR_MINUS;
        case char['~']:
            return UnOpr.OPR_BNOT;
        case char['#']:
            return UnOpr.OPR_LEN;
        default:
            return UnOpr.OPR_NOUNOPR;
    }
};

var getbinopr = function getbinopr(op) {
    switch (op) {
        case char['+']:
            return BinOpr.OPR_ADD;
        case char['-']:
            return BinOpr.OPR_SUB;
        case char['*']:
            return BinOpr.OPR_MUL;
        case char['%']:
            return BinOpr.OPR_MOD;
        case char['^']:
            return BinOpr.OPR_POW;
        case char['/']:
            return BinOpr.OPR_DIV;
        case R.TK_IDIV:
            return BinOpr.OPR_IDIV;
        case char['&']:
            return BinOpr.OPR_BAND;
        case char['|']:
            return BinOpr.OPR_BOR;
        case char['~']:
            return BinOpr.OPR_BXOR;
        case R.TK_SHL:
            return BinOpr.OPR_SHL;
        case R.TK_SHR:
            return BinOpr.OPR_SHR;
        case R.TK_CONCAT:
            return BinOpr.OPR_CONCAT;
        case R.TK_NE:
            return BinOpr.OPR_NE;
        case R.TK_EQ:
            return BinOpr.OPR_EQ;
        case char['<']:
            return BinOpr.OPR_LT;
        case R.TK_LE:
            return BinOpr.OPR_LE;
        case char['>']:
            return BinOpr.OPR_GT;
        case R.TK_GE:
            return BinOpr.OPR_GE;
        case R.TK_AND:
            return BinOpr.OPR_AND;
        case R.TK_OR:
            return BinOpr.OPR_OR;
        default:
            return BinOpr.OPR_NOBINOPR;
    }
};

var priority = [/* ORDER OPR */
{ left: 10, right: 10 }, { left: 10, right: 10 }, /* '+' '-' */
{ left: 11, right: 11 }, { left: 11, right: 11 }, /* '*' '%' */
{ left: 14, right: 13 }, /* '^' (right associative) */
{ left: 11, right: 11 }, { left: 11, right: 11 }, /* '/' '//' */
{ left: 6, right: 6 }, { left: 4, right: 4 }, { left: 5, right: 5 }, /* '&' '|' '~' */
{ left: 7, right: 7 }, { left: 7, right: 7 }, /* '<<' '>>' */
{ left: 9, right: 8 }, /* '..' (right associative) */
{ left: 3, right: 3 }, { left: 3, right: 3 }, { left: 3, right: 3 }, /* ==, <, <= */
{ left: 3, right: 3 }, { left: 3, right: 3 }, { left: 3, right: 3 }, /* ~=, >, >= */
{ left: 2, right: 2 }, { left: 1, right: 1 /* and, or */
}];

var UNARY_PRIORITY = 12;

/*
** subexpr -> (simpleexp | unop subexpr) { binop subexpr }
** where 'binop' is any binary operator with a priority higher than 'limit'
*/
var subexpr = function subexpr(ls, v, limit) {
    enterlevel(ls);
    var uop = getunopr(ls.t.token);
    if (uop !== UnOpr.OPR_NOUNOPR) {
        var line = ls.linenumber;
        llex.luaX_next(ls);
        subexpr(ls, v, UNARY_PRIORITY);
        lcode.luaK_prefix(ls.fs, uop, v, line);
    } else simpleexp(ls, v);
    /* expand while operators have priorities higher than 'limit' */
    var op = getbinopr(ls.t.token);
    while (op !== BinOpr.OPR_NOBINOPR && priority[op].left > limit) {
        var v2 = new expdesc();
        var _line = ls.linenumber;
        llex.luaX_next(ls);
        lcode.luaK_infix(ls.fs, op, v);
        /* read sub-expression with higher priority */
        var nextop = subexpr(ls, v2, priority[op].right);
        lcode.luaK_posfix(ls.fs, op, v, v2, _line);
        op = nextop;
    }
    leavelevel(ls);
    return op; /* return first untreated operator */
};

var expr = function expr(ls, v) {
    subexpr(ls, v, 0);
};

/* }==================================================================== */

/*
** {======================================================================
** Rules for Statements
** =======================================================================
*/

var block = function block(ls) {
    /* block -> statlist */
    var fs = ls.fs;
    var bl = new BlockCnt();
    enterblock(fs, bl, 0);
    statlist(ls);
    leaveblock(fs);
};

/*
** structure to chain all variables in the left-hand side of an
** assignment
*/

var LHS_assign = function LHS_assign() {
    _classCallCheck(this, LHS_assign);

    this.prev = null;
    this.v = new expdesc(); /* variable (global, local, upvalue, or indexed) */
};

/*
** check whether, in an assignment to an upvalue/local variable, the
** upvalue/local variable is begin used in a previous assignment to a
** table. If so, save original upvalue/local value in a safe place and
** use this safe copy in the previous assignment.
*/


var check_conflict = function check_conflict(ls, lh, v) {
    var fs = ls.fs;
    var extra = fs.freereg; /* eventual position to save local variable */
    var conflict = false;
    for (; lh; lh = lh.prev) {
        /* check all previous assignments */
        if (lh.v.k === expkind.VINDEXED) {
            /* assigning to a table? */
            /* table is the upvalue/local being assigned now? */
            if (lh.v.u.ind.vt === v.k && lh.v.u.ind.t === v.u.info) {
                conflict = true;
                lh.v.u.ind.vt = expkind.VLOCAL;
                lh.v.u.ind.t = extra; /* previous assignment will use safe copy */
            }
            /* index is the local being assigned? (index cannot be upvalue) */
            if (v.k === expkind.VLOCAL && lh.v.u.ind.idx === v.u.info) {
                conflict = true;
                lh.v.u.ind.idx = extra; /* previous assignment will use safe copy */
            }
        }
    }
    if (conflict) {
        /* copy upvalue/local value to a temporary (in position 'extra') */
        var op = v.k === expkind.VLOCAL ? OpCodesI.OP_MOVE : OpCodesI.OP_GETUPVAL;
        lcode.luaK_codeABC(fs, op, extra, v.u.info, 0);
        lcode.luaK_reserveregs(fs, 1);
    }
};

var assignment = function assignment(ls, lh, nvars) {
    var e = new expdesc();
    check_condition(ls, vkisvar(lh.v.k), defs.to_luastring("syntax error", true));
    if (testnext(ls, char[','])) {
        /* assignment -> ',' suffixedexp assignment */
        var nv = new LHS_assign();
        nv.prev = lh;
        suffixedexp(ls, nv.v);
        if (nv.v.k !== expkind.VINDEXED) check_conflict(ls, lh, nv.v);
        checklimit(ls.fs, nvars + ls.L.nCcalls, llimit.LUAI_MAXCCALLS, defs.to_luastring("JS levels", true));
        assignment(ls, nv, nvars + 1);
    } else {
        /* assignment -> '=' explist */
        checknext(ls, char['=']);
        var nexps = explist(ls, e);
        if (nexps !== nvars) adjust_assign(ls, nvars, nexps, e);else {
            lcode.luaK_setoneret(ls.fs, e); /* close last expression */
            lcode.luaK_storevar(ls.fs, lh.v, e);
            return; /* avoid default */
        }
    }
    init_exp(e, expkind.VNONRELOC, ls.fs.freereg - 1); /* default assignment */
    lcode.luaK_storevar(ls.fs, lh.v, e);
};

var cond = function cond(ls) {
    /* cond -> exp */
    var v = new expdesc();
    expr(ls, v); /* read condition */
    if (v.k === expkind.VNIL) v.k = expkind.VFALSE; /* 'falses' are all equal here */
    lcode.luaK_goiftrue(ls.fs, v);
    return v.f;
};

var gotostat = function gotostat(ls, pc) {
    var line = ls.linenumber;
    var label = void 0;
    if (testnext(ls, R.TK_GOTO)) label = str_checkname(ls);else {
        llex.luaX_next(ls); /* skip break */
        label = lstring.luaS_newliteral(ls.L, "break");
    }
    var g = newlabelentry(ls, ls.dyd.gt, label, line, pc);
    findlabel(ls, g); /* close it if label already defined */
};

/* check for repeated labels on the same block */
var checkrepeated = function checkrepeated(fs, ll, label) {
    for (var i = fs.bl.firstlabel; i < ll.n; i++) {
        if (eqstr(label, ll.arr[i].name)) {
            var msg = lobject.luaO_pushfstring(fs.ls.L, defs.to_luastring("label '%s' already defined on line %d", true), label.getstr(), ll.arr[i].line);
            semerror(fs.ls, msg);
        }
    }
};

/* skip no-op statements */
var skipnoopstat = function skipnoopstat(ls) {
    while (ls.t.token === char[';'] || ls.t.token === R.TK_DBCOLON) {
        statement(ls);
    }
};

var labelstat = function labelstat(ls, label, line) {
    /* label -> '::' NAME '::' */
    var fs = ls.fs;
    var ll = ls.dyd.label;
    var l = void 0; /* index of new label being created */
    checkrepeated(fs, ll, label); /* check for repeated labels */
    checknext(ls, R.TK_DBCOLON); /* skip double colon */
    /* create new entry for this label */
    l = newlabelentry(ls, ll, label, line, lcode.luaK_getlabel(fs));
    skipnoopstat(ls); /* skip other no-op statements */
    if (block_follow(ls, 0)) {
        /* label is last no-op statement in the block? */
        /* assume that locals are already out of scope */
        ll.arr[l].nactvar = fs.bl.nactvar;
    }
    findgotos(ls, ll.arr[l]);
};

var whilestat = function whilestat(ls, line) {
    /* whilestat -> WHILE cond DO block END */
    var fs = ls.fs;
    var bl = new BlockCnt();
    llex.luaX_next(ls); /* skip WHILE */
    var whileinit = lcode.luaK_getlabel(fs);
    var condexit = cond(ls);
    enterblock(fs, bl, 1);
    checknext(ls, R.TK_DO);
    block(ls);
    lcode.luaK_jumpto(fs, whileinit);
    check_match(ls, R.TK_END, R.TK_WHILE, line);
    leaveblock(fs);
    lcode.luaK_patchtohere(fs, condexit); /* false conditions finish the loop */
};

var repeatstat = function repeatstat(ls, line) {
    /* repeatstat -> REPEAT block UNTIL cond */
    var fs = ls.fs;
    var repeat_init = lcode.luaK_getlabel(fs);
    var bl1 = new BlockCnt();
    var bl2 = new BlockCnt();
    enterblock(fs, bl1, 1); /* loop block */
    enterblock(fs, bl2, 0); /* scope block */
    llex.luaX_next(ls); /* skip REPEAT */
    statlist(ls);
    check_match(ls, R.TK_UNTIL, R.TK_REPEAT, line);
    var condexit = cond(ls); /* read condition (inside scope block) */
    if (bl2.upval) /* upvalues? */
        lcode.luaK_patchclose(fs, condexit, bl2.nactvar);
    leaveblock(fs); /* finish scope */
    lcode.luaK_patchlist(fs, condexit, repeat_init); /* close the loop */
    leaveblock(fs); /* finish loop */
};

var exp1 = function exp1(ls) {
    var e = new expdesc();
    expr(ls, e);
    lcode.luaK_exp2nextreg(ls.fs, e);
    assert(e.k === expkind.VNONRELOC);
    var reg = e.u.info;
    return reg;
};

var forbody = function forbody(ls, base, line, nvars, isnum) {
    /* forbody -> DO block */
    var bl = new BlockCnt();
    var fs = ls.fs;
    var endfor = void 0;
    adjustlocalvars(ls, 3); /* control variables */
    checknext(ls, R.TK_DO);
    var prep = isnum ? lcode.luaK_codeAsBx(fs, OpCodesI.OP_FORPREP, base, lcode.NO_JUMP) : lcode.luaK_jump(fs);
    enterblock(fs, bl, 0); /* scope for declared variables */
    adjustlocalvars(ls, nvars);
    lcode.luaK_reserveregs(fs, nvars);
    block(ls);
    leaveblock(fs); /* end of scope for declared variables */
    lcode.luaK_patchtohere(fs, prep);
    if (isnum) /* end of scope for declared variables */
        endfor = lcode.luaK_codeAsBx(fs, OpCodesI.OP_FORLOOP, base, lcode.NO_JUMP);else {
        /* generic for */
        lcode.luaK_codeABC(fs, OpCodesI.OP_TFORCALL, base, 0, nvars);
        lcode.luaK_fixline(fs, line);
        endfor = lcode.luaK_codeAsBx(fs, OpCodesI.OP_TFORLOOP, base + 2, lcode.NO_JUMP);
    }
    lcode.luaK_patchlist(fs, endfor, prep + 1);
    lcode.luaK_fixline(fs, line);
};

var fornum = function fornum(ls, varname, line) {
    /* fornum -> NAME = exp1,exp1[,exp1] forbody */
    var fs = ls.fs;
    var base = fs.freereg;
    new_localvarliteral(ls, "(for index)");
    new_localvarliteral(ls, "(for limit)");
    new_localvarliteral(ls, "(for step)");
    new_localvar(ls, varname);
    checknext(ls, char['=']);
    exp1(ls); /* initial value */
    checknext(ls, char[',']);
    exp1(ls); /* limit */
    if (testnext(ls, char[','])) exp1(ls); /* optional step */
    else {
            /* default step = 1 */
            lcode.luaK_codek(fs, fs.freereg, lcode.luaK_intK(fs, 1));
            lcode.luaK_reserveregs(fs, 1);
        }
    forbody(ls, base, line, 1, 1);
};

var forlist = function forlist(ls, indexname) {
    /* forlist -> NAME {,NAME} IN explist forbody */
    var fs = ls.fs;
    var e = new expdesc();
    var nvars = 4; /* gen, state, control, plus at least one declared var */
    var base = fs.freereg;
    /* create control variables */
    new_localvarliteral(ls, "(for generator)");
    new_localvarliteral(ls, "(for state)");
    new_localvarliteral(ls, "(for control)");
    /* create declared variables */
    new_localvar(ls, indexname);
    while (testnext(ls, char[','])) {
        new_localvar(ls, str_checkname(ls));
        nvars++;
    }
    checknext(ls, R.TK_IN);
    var line = ls.linenumber;
    adjust_assign(ls, 3, explist(ls, e), e);
    lcode.luaK_checkstack(fs, 3); /* extra space to call generator */
    forbody(ls, base, line, nvars - 3, 0);
};

var forstat = function forstat(ls, line) {
    /* forstat -> FOR (fornum | forlist) END */
    var fs = ls.fs;
    var bl = new BlockCnt();
    enterblock(fs, bl, 1); /* scope for loop and control variables */
    llex.luaX_next(ls); /* skip 'for' */
    var varname = str_checkname(ls); /* first variable name */
    switch (ls.t.token) {
        case char['=']:
            fornum(ls, varname, line);break;
        case char[',']:case R.TK_IN:
            forlist(ls, varname);break;
        default:
            llex.luaX_syntaxerror(ls, defs.to_luastring("'=' or 'in' expected", true));
    }
    check_match(ls, R.TK_END, R.TK_FOR, line);
    leaveblock(fs); /* loop scope ('break' jumps to this point) */
};

var test_then_block = function test_then_block(ls, escapelist) {
    /* test_then_block -> [IF | ELSEIF] cond THEN block */
    var bl = new BlockCnt();
    var fs = ls.fs;
    var v = new expdesc();
    var jf = void 0; /* instruction to skip 'then' code (if condition is false) */

    llex.luaX_next(ls); /* skip IF or ELSEIF */
    expr(ls, v); /* read condition */
    checknext(ls, R.TK_THEN);

    if (ls.t.token === R.TK_GOTO || ls.t.token === R.TK_BREAK) {
        lcode.luaK_goiffalse(ls.fs, v); /* will jump to label if condition is true */
        enterblock(fs, bl, false); /* must enter block before 'goto' */
        gotostat(ls, v.t); /* handle goto/break */
        while (testnext(ls, char[';'])) {} /* skip colons */
        if (block_follow(ls, 0)) {
            /* 'goto' is the entire block? */
            leaveblock(fs);
            return escapelist; /* and that is it */
        } else /* must skip over 'then' part if condition is false */
            jf = lcode.luaK_jump(fs);
    } else {
        /* regular case (not goto/break) */
        lcode.luaK_goiftrue(ls.fs, v); /* skip over block if condition is false */
        enterblock(fs, bl, false);
        jf = v.f;
    }

    statlist(ls); /* 'then' part */
    leaveblock(fs);
    if (ls.t.token === R.TK_ELSE || ls.t.token === R.TK_ELSEIF) /* followed by 'else'/'elseif'? */
        escapelist = lcode.luaK_concat(fs, escapelist, lcode.luaK_jump(fs)); /* must jump over it */
    lcode.luaK_patchtohere(fs, jf);

    return escapelist;
};

var ifstat = function ifstat(ls, line) {
    /* ifstat -> IF cond THEN block {ELSEIF cond THEN block} [ELSE block] END */
    var fs = ls.fs;
    var escapelist = lcode.NO_JUMP; /* exit list for finished parts */
    escapelist = test_then_block(ls, escapelist); /* IF cond THEN block */
    while (ls.t.token === R.TK_ELSEIF) {
        escapelist = test_then_block(ls, escapelist);
    } /* ELSEIF cond THEN block */
    if (testnext(ls, R.TK_ELSE)) block(ls); /* 'else' part */
    check_match(ls, R.TK_END, R.TK_IF, line);
    lcode.luaK_patchtohere(fs, escapelist); /* patch escape list to 'if' end */
};

var localfunc = function localfunc(ls) {
    var b = new expdesc();
    var fs = ls.fs;
    new_localvar(ls, str_checkname(ls)); /* new local variable */
    adjustlocalvars(ls, 1); /* enter its scope */
    body(ls, b, 0, ls.linenumber); /* function created in next register */
    /* debug information will only see the variable after this point! */
    getlocvar(fs, b.u.info).startpc = fs.pc;
};

var localstat = function localstat(ls) {
    /* stat -> LOCAL NAME {',' NAME} ['=' explist] */
    var nvars = 0;
    var nexps = void 0;
    var e = new expdesc();
    do {
        new_localvar(ls, str_checkname(ls));
        nvars++;
    } while (testnext(ls, char[',']));
    if (testnext(ls, char['='])) nexps = explist(ls, e);else {
        e.k = expkind.VVOID;
        nexps = 0;
    }
    adjust_assign(ls, nvars, nexps, e);
    adjustlocalvars(ls, nvars);
};

var funcname = function funcname(ls, v) {
    /* funcname -> NAME {fieldsel} [':' NAME] */
    var ismethod = 0;
    singlevar(ls, v);
    while (ls.t.token === char['.']) {
        fieldsel(ls, v);
    }if (ls.t.token === char[':']) {
        ismethod = 1;
        fieldsel(ls, v);
    }
    return ismethod;
};

var funcstat = function funcstat(ls, line) {
    /* funcstat -> FUNCTION funcname body */
    var v = new expdesc();
    var b = new expdesc();
    llex.luaX_next(ls); /* skip FUNCTION */
    var ismethod = funcname(ls, v);
    body(ls, b, ismethod, line);
    lcode.luaK_storevar(ls.fs, v, b);
    lcode.luaK_fixline(ls.fs, line); /* definition "happens" in the first line */
};

var exprstat = function exprstat(ls) {
    /* stat -> func | assignment */
    var fs = ls.fs;
    var v = new LHS_assign();
    suffixedexp(ls, v.v);
    if (ls.t.token === char['='] || ls.t.token === char[',']) {
        /* stat . assignment ? */
        v.prev = null;
        assignment(ls, v, 1);
    } else {
        /* stat -> func */
        check_condition(ls, v.v.k === expkind.VCALL, defs.to_luastring("syntax error", true));
        lopcodes.SETARG_C(lcode.getinstruction(fs, v.v), 1); /* call statement uses no results */
    }
};

var retstat = function retstat(ls) {
    /* stat -> RETURN [explist] [';'] */
    var fs = ls.fs;
    var e = new expdesc();
    var first = void 0,
        nret = void 0; /* registers with returned values */
    if (block_follow(ls, 1) || ls.t.token === char[';']) first = nret = 0; /* return no values */
    else {
            nret = explist(ls, e); /* optional return values */
            if (hasmultret(e.k)) {
                lcode.luaK_setmultret(fs, e);
                if (e.k === expkind.VCALL && nret === 1) {
                    /* tail call? */
                    lopcodes.SET_OPCODE(lcode.getinstruction(fs, e), OpCodesI.OP_TAILCALL);
                    assert(lcode.getinstruction(fs, e).A === fs.nactvar);
                }
                first = fs.nactvar;
                nret = defs.LUA_MULTRET; /* return all values */
            } else {
                if (nret === 1) /* only one single value? */
                    first = lcode.luaK_exp2anyreg(fs, e);else {
                    lcode.luaK_exp2nextreg(fs, e); /* values must go to the stack */
                    first = fs.nactvar; /* return all active values */
                    assert(nret === fs.freereg - first);
                }
            }
        }
    lcode.luaK_ret(fs, first, nret);
    testnext(ls, char[';']); /* skip optional semicolon */
};

var statement = function statement(ls) {
    var line = ls.linenumber; /* may be needed for error messages */
    enterlevel(ls);
    switch (ls.t.token) {
        case char[';']:
            {
                /* stat -> ';' (empty statement) */
                llex.luaX_next(ls); /* skip ';' */
                break;
            }
        case R.TK_IF:
            {
                /* stat -> ifstat */
                ifstat(ls, line);
                break;
            }
        case R.TK_WHILE:
            {
                /* stat -> whilestat */
                whilestat(ls, line);
                break;
            }
        case R.TK_DO:
            {
                /* stat -> DO block END */
                llex.luaX_next(ls); /* skip DO */
                block(ls);
                check_match(ls, R.TK_END, R.TK_DO, line);
                break;
            }
        case R.TK_FOR:
            {
                /* stat -> forstat */
                forstat(ls, line);
                break;
            }
        case R.TK_REPEAT:
            {
                /* stat -> repeatstat */
                repeatstat(ls, line);
                break;
            }
        case R.TK_FUNCTION:
            {
                /* stat -> funcstat */
                funcstat(ls, line);
                break;
            }
        case R.TK_LOCAL:
            {
                /* stat -> localstat */
                llex.luaX_next(ls); /* skip LOCAL */
                if (testnext(ls, R.TK_FUNCTION)) /* local function? */
                    localfunc(ls);else localstat(ls);
                break;
            }
        case R.TK_DBCOLON:
            {
                /* stat -> label */
                llex.luaX_next(ls); /* skip double colon */
                labelstat(ls, str_checkname(ls), line);
                break;
            }
        case R.TK_RETURN:
            {
                /* skip double colon */
                llex.luaX_next(ls); /* skip RETURN */
                retstat(ls);
                break;
            }
        case R.TK_BREAK: /* stat -> breakstat */
        case R.TK_GOTO:
            {
                /* stat -> 'goto' NAME */
                gotostat(ls, lcode.luaK_jump(ls.fs));
                break;
            }
        default:
            {
                /* stat -> func | assignment */
                exprstat(ls);
                break;
            }
    }

    assert(ls.fs.f.maxstacksize >= ls.fs.freereg && ls.fs.freereg >= ls.fs.nactvar);
    ls.fs.freereg = ls.fs.nactvar; /* free registers */
    leavelevel(ls);
};

/*
** compiles the main function, which is a regular vararg function with an
** upvalue named LUA_ENV
*/
var mainfunc = function mainfunc(ls, fs) {
    var bl = new BlockCnt();
    var v = new expdesc();
    open_func(ls, fs, bl);
    fs.f.is_vararg = true; /* main function is always declared vararg */
    init_exp(v, expkind.VLOCAL, 0); /* create and... */
    newupvalue(fs, ls.envn, v); /* ...set environment upvalue */
    llex.luaX_next(ls); /* read first token */
    statlist(ls); /* parse main body */
    check(ls, R.TK_EOS);
    close_func(ls);
};

var luaY_parser = function luaY_parser(L, z, buff, dyd, name, firstchar) {
    var lexstate = new llex.LexState();
    var funcstate = new FuncState();
    var cl = lfunc.luaF_newLclosure(L, 1); /* create main closure */
    ldo.luaD_inctop(L);
    L.stack[L.top - 1].setclLvalue(cl);
    lexstate.h = ltable.luaH_new(L); /* create table for scanner */
    ldo.luaD_inctop(L);
    L.stack[L.top - 1].sethvalue(lexstate.h);
    funcstate.f = cl.p = new Proto(L);
    funcstate.f.source = lstring.luaS_new(L, name);
    lexstate.buff = buff;
    lexstate.dyd = dyd;
    dyd.actvar.n = dyd.gt.n = dyd.label.n = 0;
    llex.luaX_setinput(L, lexstate, z, funcstate.f.source, firstchar);
    mainfunc(lexstate, funcstate);
    assert(!funcstate.prev && funcstate.nups === 1 && !lexstate.fs);
    /* all scopes should be correctly finished */
    assert(dyd.actvar.n === 0 && dyd.gt.n === 0 && dyd.label.n === 0);
    delete L.stack[--L.top]; /* remove scanner's table */
    return cl; /* closure is on the stack, too */
};

module.exports.Dyndata = Dyndata;
module.exports.expkind = expkind;
module.exports.expdesc = expdesc;
module.exports.luaY_parser = luaY_parser;
module.exports.vkisinreg = vkisinreg;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var ldebug = __webpack_require__(10);
var ldo = __webpack_require__(6);
var ljstype = __webpack_require__(20);
var lobject = __webpack_require__(3);
var lstring = __webpack_require__(8);
var ltable = __webpack_require__(7);
var llimit = __webpack_require__(4);
var lzio = __webpack_require__(16);
var TS = defs.thread_status;
var char = defs.char;

var FIRST_RESERVED = 257;

var RESERVED = {
    /* terminal symbols denoted by reserved words */
    TK_AND: FIRST_RESERVED,
    TK_BREAK: FIRST_RESERVED + 1,
    TK_DO: FIRST_RESERVED + 2,
    TK_ELSE: FIRST_RESERVED + 3,
    TK_ELSEIF: FIRST_RESERVED + 4,
    TK_END: FIRST_RESERVED + 5,
    TK_FALSE: FIRST_RESERVED + 6,
    TK_FOR: FIRST_RESERVED + 7,
    TK_FUNCTION: FIRST_RESERVED + 8,
    TK_GOTO: FIRST_RESERVED + 9,
    TK_IF: FIRST_RESERVED + 10,
    TK_IN: FIRST_RESERVED + 11,
    TK_LOCAL: FIRST_RESERVED + 12,
    TK_NIL: FIRST_RESERVED + 13,
    TK_NOT: FIRST_RESERVED + 14,
    TK_OR: FIRST_RESERVED + 15,
    TK_REPEAT: FIRST_RESERVED + 16,
    TK_RETURN: FIRST_RESERVED + 17,
    TK_THEN: FIRST_RESERVED + 18,
    TK_TRUE: FIRST_RESERVED + 19,
    TK_UNTIL: FIRST_RESERVED + 20,
    TK_WHILE: FIRST_RESERVED + 21,
    /* other terminal symbols */
    TK_IDIV: FIRST_RESERVED + 22,
    TK_CONCAT: FIRST_RESERVED + 23,
    TK_DOTS: FIRST_RESERVED + 24,
    TK_EQ: FIRST_RESERVED + 25,
    TK_GE: FIRST_RESERVED + 26,
    TK_LE: FIRST_RESERVED + 27,
    TK_NE: FIRST_RESERVED + 28,
    TK_SHL: FIRST_RESERVED + 29,
    TK_SHR: FIRST_RESERVED + 30,
    TK_DBCOLON: FIRST_RESERVED + 31,
    TK_EOS: FIRST_RESERVED + 32,
    TK_FLT: FIRST_RESERVED + 33,
    TK_INT: FIRST_RESERVED + 34,
    TK_NAME: FIRST_RESERVED + 35,
    TK_STRING: FIRST_RESERVED + 36
};

var R = RESERVED;

var luaX_tokens = ["and", "break", "do", "else", "elseif", "end", "false", "for", "function", "goto", "if", "in", "local", "nil", "not", "or", "repeat", "return", "then", "true", "until", "while", "//", "..", "...", "==", ">=", "<=", "~=", "<<", ">>", "::", "<eof>", "<number>", "<integer>", "<name>", "<string>"];

var SemInfo = function SemInfo() {
    _classCallCheck(this, SemInfo);

    this.r = NaN;
    this.i = NaN;
    this.ts = null;
};

var Token = function Token() {
    _classCallCheck(this, Token);

    this.token = NaN;
    this.seminfo = new SemInfo();
};

/* state of the lexer plus state of the parser when shared by all
   functions */


var LexState = function LexState() {
    _classCallCheck(this, LexState);

    this.current = NaN; /* current character (charint) */
    this.linenumber = NaN; /* input line counter */
    this.lastline = NaN; /* line of last token 'consumed' */
    this.t = new Token(); /* current token */
    this.lookahead = new Token(); /* look ahead token */
    this.fs = null; /* current function (parser) */
    this.L = null;
    this.z = null; /* input stream */
    this.buff = null; /* buffer for tokens */
    this.h = null; /* to reuse strings */
    this.dyd = null; /* dynamic structures used by the parser */
    this.source = null; /* current source name */
    this.envn = null; /* environment variable name */
};

var save = function save(ls, c) {
    var b = ls.buff;
    if (b.n + 1 > b.buffer.length) {
        if (b.buffer.length >= llimit.MAX_INT / 2) lexerror(ls, defs.to_luastring("lexical element too long", true), 0);
    }
    b.buffer[b.n++] = c < 0 ? 255 + c + 1 : c;
};

var luaX_token2str = function luaX_token2str(ls, token) {
    if (token < FIRST_RESERVED) {
        /* single-byte symbols? */
        return lobject.luaO_pushfstring(ls.L, defs.to_luastring("'%c'", true), token);
    } else {
        var s = luaX_tokens[token - FIRST_RESERVED];
        if (token < R.TK_EOS) /* fixed format (symbols and reserved words)? */
            return lobject.luaO_pushfstring(ls.L, defs.to_luastring("'%s'", true), defs.to_luastring(s));else /* names, strings, and numerals */
            return defs.to_luastring(s);
    }
};

var currIsNewline = function currIsNewline(ls) {
    return ls.current === char['\n'] || ls.current === char['\r'];
};

var next = function next(ls) {
    ls.current = ls.z.zgetc();
};

var save_and_next = function save_and_next(ls) {
    save(ls, ls.current);
    next(ls);
};

/*
** creates a new string and anchors it in scanner's table so that
** it will not be collected until the end of the compilation
** (by that time it should be anchored somewhere)
*/
var luaX_newstring = function luaX_newstring(ls, str) {
    var L = ls.L;
    var ts = lstring.luaS_new(L, str);
    var o = ltable.luaH_set(L, ls.h, new lobject.TValue(defs.CT.LUA_TLNGSTR, ts));
    if (o.ttisnil()) {
        /* not in use yet? */
        o.setbvalue(true);
    } else {
        /* string already present */
        /* HACK: Workaround lack of ltable 'keyfromval' */
        var tpair = ls.h.strong.get(lstring.luaS_hashlongstr(ts));
        assert(tpair.value == o);
        ts = tpair.key.tsvalue(); /* re-use value previously stored */
    }
    return ts;
};

/*
** increment line number and skips newline sequence (any of
** \n, \r, \n\r, or \r\n)
*/
var inclinenumber = function inclinenumber(ls) {
    var old = ls.current;
    assert(currIsNewline(ls));
    next(ls); /* skip '\n' or '\r' */
    if (currIsNewline(ls) && ls.current !== old) next(ls); /* skip '\n\r' or '\r\n' */
    if (++ls.linenumber >= llimit.MAX_INT) lexerror(ls, defs.to_luastring("chunk has too many lines", true), 0);
};

var luaX_setinput = function luaX_setinput(L, ls, z, source, firstchar) {
    ls.t = {
        token: 0,
        seminfo: new SemInfo()
    };
    ls.L = L;
    ls.current = firstchar;
    ls.lookahead = {
        token: R.TK_EOS,
        seminfo: new SemInfo()
    };
    ls.z = z;
    ls.fs = null;
    ls.linenumber = 1;
    ls.lastline = 1;
    ls.source = source;
    ls.envn = lstring.luaS_newliteral(L, "_ENV");
};

var check_next1 = function check_next1(ls, c) {
    if (ls.current === c.charCodeAt(0)) {
        next(ls);
        return true;
    }

    return false;
};

/*
** Check whether current char is in set 'set' (with two chars) and
** saves it
*/
var check_next2 = function check_next2(ls, set) {
    if (ls.current === set[0].charCodeAt(0) || ls.current === set[1].charCodeAt(0)) {
        save_and_next(ls);
        return true;
    }

    return false;
};

var read_numeral = function read_numeral(ls, seminfo) {
    var expo = "Ee";
    var first = ls.current;
    assert(ljstype.lisdigit(ls.current));
    save_and_next(ls);
    if (first === char['0'] && check_next2(ls, "xX")) /* hexadecimal? */
        expo = "Pp";

    for (;;) {
        if (check_next2(ls, expo)) /* exponent part? */
            check_next2(ls, "-+"); /* optional exponent sign */
        if (ljstype.lisxdigit(ls.current)) save_and_next(ls);else if (ls.current === char['.']) save_and_next(ls);else break;
    }

    // save(ls, 0);

    var obj = lobject.luaO_str2num(ls.buff.buffer);
    if (obj === false) /* format error? */
        lexerror(ls, defs.to_luastring("malformed number", true), R.TK_FLT);
    if (obj.ttisinteger()) {
        seminfo.i = obj.value;
        return R.TK_INT;
    } else {
        assert(obj.ttisfloat());
        seminfo.r = obj.value;
        return R.TK_FLT;
    }
};

var txtToken = function txtToken(ls, token) {
    switch (token) {
        case R.TK_NAME:case R.TK_STRING:
        case R.TK_FLT:case R.TK_INT:
            // save(ls, 0);
            return lobject.luaO_pushfstring(ls.L, defs.to_luastring("'%s'", true), ls.buff.buffer);
        default:
            return luaX_token2str(ls, token);
    }
};

var lexerror = function lexerror(ls, msg, token) {
    msg = ldebug.luaG_addinfo(ls.L, msg, ls.source, ls.linenumber);
    if (token) lobject.luaO_pushfstring(ls.L, defs.to_luastring("%s near %s"), msg, txtToken(ls, token));
    ldo.luaD_throw(ls.L, TS.LUA_ERRSYNTAX);
};

var luaX_syntaxerror = function luaX_syntaxerror(ls, msg) {
    lexerror(ls, msg, ls.t.token);
};

/*
** skip a sequence '[=*[' or ']=*]'; if sequence is well formed, return
** its number of '='s; otherwise, return a negative number (-1 iff there
** are no '='s after initial bracket)
*/
var skip_sep = function skip_sep(ls) {
    var count = 0;
    var s = ls.current;
    assert(s === char['['] || s === char[']']);
    save_and_next(ls);
    while (ls.current === char['=']) {
        save_and_next(ls);
        count++;
    }
    return ls.current === s ? count : -count - 1;
};

var read_long_string = function read_long_string(ls, seminfo, sep) {
    var line = ls.linenumber; /* initial line (for error message) */
    save_and_next(ls); /* skip 2nd '[' */

    if (currIsNewline(ls)) /* string starts with a newline? */
        inclinenumber(ls); /* skip it */

    var skip = false;
    for (; !skip;) {
        switch (ls.current) {
            case lzio.EOZ:
                {
                    /* error */
                    var what = seminfo ? "string" : "comment";
                    var msg = 'unfinished long ' + what + ' (starting at line ' + line + ')';
                    lexerror(ls, defs.to_luastring(msg), R.TK_EOS);
                    break;
                }
            case char[']']:
                {
                    if (skip_sep(ls) === sep) {
                        save_and_next(ls); /* skip 2nd ']' */
                        skip = true;
                    }
                    break;
                }
            case char['\n']:case char['\r']:
                {
                    save(ls, char['\n']);
                    inclinenumber(ls);
                    if (!seminfo) lzio.luaZ_resetbuffer(ls.buff);
                    break;
                }
            default:
                {
                    if (seminfo) save_and_next(ls);else next(ls);
                }
        }
    }

    if (seminfo) seminfo.ts = luaX_newstring(ls, ls.buff.buffer.slice(2 + sep, 2 + sep - 2 * (2 + sep)));
};

var esccheck = function esccheck(ls, c, msg) {
    if (!c) {
        if (ls.current !== lzio.EOZ) save_and_next(ls); /* add current to buffer for error message */
        lexerror(ls, msg, R.TK_STRING);
    }
};

var gethexa = function gethexa(ls) {
    save_and_next(ls);
    esccheck(ls, ljstype.lisxdigit(ls.current), defs.to_luastring("hexadecimal digit expected", true));
    return lobject.luaO_hexavalue(ls.current);
};

var readhexaesc = function readhexaesc(ls) {
    var r = gethexa(ls);
    r = (r << 4) + gethexa(ls);
    lzio.luaZ_buffremove(ls.buff, 2); /* remove saved chars from buffer */
    return r;
};

var readutf8desc = function readutf8desc(ls) {
    var i = 4; /* chars to be removed: '\', 'u', '{', and first digit */
    save_and_next(ls); /* skip 'u' */
    esccheck(ls, ls.current === char['{'], defs.to_luastring("missing '{'", true));
    var r = gethexa(ls); /* must have at least one digit */

    save_and_next(ls);
    while (ljstype.lisxdigit(ls.current)) {
        i++;
        r = (r << 4) + lobject.luaO_hexavalue(ls.current);
        esccheck(ls, r <= 0x10FFFF, defs.to_luastring("UTF-8 value too large", true));
        save_and_next(ls);
    }
    esccheck(ls, ls.current === char['}'], defs.to_luastring("missing '}'", true));
    next(ls); /* skip '}' */
    lzio.luaZ_buffremove(ls.buff, i); /* remove saved chars from buffer */
    return r;
};

var utf8esc = function utf8esc(ls) {
    var u = lobject.luaO_utf8esc(readutf8desc(ls));
    var buff = u.buff;
    for (var n = u.n; n > 0; n--) {
        /* add 'buff' to string */
        save(ls, buff[lobject.UTF8BUFFSZ - n]);
    }
};

var readdecesc = function readdecesc(ls) {
    var r = 0; /* result accumulator */
    var i = void 0;
    for (i = 0; i < 3 && ljstype.lisdigit(ls.current); i++) {
        /* read up to 3 digits */
        r = 10 * r + ls.current - char['0'];
        save_and_next(ls);
    }
    esccheck(ls, r <= 255, defs.to_luastring("decimal escape too large", true));
    lzio.luaZ_buffremove(ls.buff, i); /* remove read digits from buffer */
    return r;
};

var read_string = function read_string(ls, del, seminfo) {
    save_and_next(ls); /* keep delimiter (for error messages) */

    while (ls.current !== del) {
        switch (ls.current) {
            case lzio.EOZ:
                lexerror(ls, defs.to_luastring("unfinished string", true), R.TK_EOS);
                break;
            case char['\n']:
            case char['\r']:
                lexerror(ls, defs.to_luastring("unfinished string", true), R.TK_STRING);
                break;
            case char['\\']:
                {
                    /* escape sequences */
                    save_and_next(ls); /* keep '\\' for error messages */
                    var will = void 0;
                    var c = void 0;
                    switch (ls.current) {
                        case char['a']:
                            c = 7 /* \a isn't valid JS */;will = 'read_save';break;
                        case char['b']:
                            c = char['\b'];will = 'read_save';break;
                        case char['f']:
                            c = char['\f'];will = 'read_save';break;
                        case char['n']:
                            c = char['\n'];will = 'read_save';break;
                        case char['r']:
                            c = char['\r'];will = 'read_save';break;
                        case char['t']:
                            c = char['\t'];will = 'read_save';break;
                        case char['v']:
                            c = char['\v'];will = 'read_save';break;
                        case char['x']:
                            c = readhexaesc(ls);will = 'read_save';break;
                        case char['u']:
                            utf8esc(ls);will = 'no_save';break;
                        case char['\n']:case char['\r']:
                            inclinenumber(ls);c = char['\n'];will = 'only_save';break;
                        case char['\\']:case char['\"']:case char['\'']:
                            c = ls.current;will = 'read_save';break;
                        case lzio.EOZ:
                            will = 'no_save';break; /* will raise an error next loop */
                        case char['z']:
                            {
                                /* zap following span of spaces */
                                lzio.luaZ_buffremove(ls.buff, 1); /* remove '\\' */
                                next(ls); /* skip the 'z' */
                                while (ljstype.lisspace(ls.current)) {
                                    if (currIsNewline(ls)) inclinenumber(ls);else next(ls);
                                }
                                will = 'no_save';break;
                            }
                        default:
                            {
                                esccheck(ls, ljstype.lisdigit(ls.current), defs.to_luastring("invalid escape sequence", true));
                                c = readdecesc(ls); /* digital escape '\ddd' */
                                will = 'only_save';break;
                            }
                    }

                    if (will === 'read_save') next(ls);

                    if (will === 'read_save' || will === 'only_save') {
                        lzio.luaZ_buffremove(ls.buff, 1); /* remove '\\' */
                        save(ls, c);
                    }

                    break;
                }
            default:
                save_and_next(ls);
        }
    }
    save_and_next(ls); /* skip delimiter */

    seminfo.ts = luaX_newstring(ls, ls.buff.buffer.slice(1, ls.buff.n - 1));
};

var token_to_index = Object.create(null); /* don't want to return true for e.g. 'hasOwnProperty' */
luaX_tokens.forEach(function (e, i) {
    return token_to_index[lstring.luaS_hash(defs.to_luastring(e))] = i;
});

var isreserved = function isreserved(w) {
    var kidx = token_to_index[lstring.luaS_hashlongstr(w)];
    return kidx !== void 0 && kidx <= 22;
};

var llex = function llex(ls, seminfo) {
    lzio.luaZ_resetbuffer(ls.buff);
    for (;;) {
        assert(typeof ls.current == "number");
        switch (ls.current) {
            case char['\n']:case char['\r']:
                {
                    /* line breaks */
                    inclinenumber(ls);
                    break;
                }
            case char[' ']:case char['\f']:case char['\t']:case char['\v']:
                {
                    /* spaces */
                    next(ls);
                    break;
                }
            case char['-']:
                {
                    /* '-' or '--' (comment) */
                    next(ls);
                    if (ls.current !== char['-']) return char['-'];
                    /* else is a comment */
                    next(ls);
                    if (ls.current === char['[']) {
                        /* long comment? */
                        var sep = skip_sep(ls);
                        lzio.luaZ_resetbuffer(ls.buff); /* 'skip_sep' may dirty the buffer */
                        if (sep >= 0) {
                            read_long_string(ls, null, sep); /* skip long comment */
                            lzio.luaZ_resetbuffer(ls.buff); /* previous call may dirty the buff. */
                            break;
                        }
                    }

                    /* else short comment */
                    while (!currIsNewline(ls) && ls.current !== lzio.EOZ) {
                        next(ls);
                    } /* skip until end of line (or end of file) */
                    break;
                }
            case char['[']:
                {
                    /* long string or simply '[' */
                    var _sep = skip_sep(ls);
                    if (_sep >= 0) {
                        read_long_string(ls, seminfo, _sep);
                        return R.TK_STRING;
                    } else if (_sep !== -1) /* '[=...' missing second bracket */
                        lexerror(ls, defs.to_luastring("invalid long string delimiter", true), R.TK_STRING);
                    return char['['];
                }
            case char['=']:
                {
                    next(ls);
                    if (check_next1(ls, '=')) return R.TK_EQ;else return char['='];
                }
            case char['<']:
                {
                    next(ls);
                    if (check_next1(ls, '=')) return R.TK_LE;else if (check_next1(ls, '<')) return R.TK_SHL;else return char['<'];
                }
            case char['>']:
                {
                    next(ls);
                    if (check_next1(ls, '=')) return R.TK_GE;else if (check_next1(ls, '>')) return R.TK_SHR;else return char['>'];
                }
            case char['/']:
                {
                    next(ls);
                    if (check_next1(ls, '/')) return R.TK_IDIV;else return char['/'];
                }
            case char['~']:
                {
                    next(ls);
                    if (check_next1(ls, '=')) return R.TK_NE;else return char['~'];
                }
            case char[':']:
                {
                    next(ls);
                    if (check_next1(ls, ':')) return R.TK_DBCOLON;else return char[':'];
                }
            case char['"']:case char['\'']:
                {
                    /* short literal strings */
                    read_string(ls, ls.current, seminfo);
                    return R.TK_STRING;
                }
            case char['.']:
                {
                    /* '.', '..', '...', or number */
                    save_and_next(ls);
                    if (check_next1(ls, '.')) {
                        if (check_next1(ls, '.')) return R.TK_DOTS; /* '...' */
                        else return R.TK_CONCAT; /* '..' */
                    } else if (!ljstype.lisdigit(ls.current)) return char['.'];else return read_numeral(ls, seminfo);
                }
            case char['0']:case char['1']:case char['2']:case char['3']:case char['4']:
            case char['5']:case char['6']:case char['7']:case char['8']:case char['9']:
                {
                    return read_numeral(ls, seminfo);
                }
            case lzio.EOZ:
                {
                    return R.TK_EOS;
                }
            default:
                {
                    if (ljstype.lislalpha(ls.current)) {
                        /* identifier or reserved word? */
                        do {
                            save_and_next(ls);
                        } while (ljstype.lislalnum(ls.current));

                        var ts = luaX_newstring(ls, ls.buff.buffer);
                        seminfo.ts = ts;
                        var kidx = token_to_index[lstring.luaS_hashlongstr(ts)];
                        if (kidx !== void 0 && kidx <= 22) /* reserved word? */
                            return kidx + FIRST_RESERVED;else return R.TK_NAME;
                    } else {
                        /* single-char tokens (+ - / ...) */
                        var c = ls.current;
                        next(ls);
                        return c;
                    }
                }
        }
    }
};

var luaX_next = function luaX_next(ls) {
    ls.lastline = ls.linenumber;
    if (ls.lookahead.token !== R.TK_EOS) {
        /* is there a look-ahead token? */
        ls.t.token = ls.lookahead.token; /* use this one */
        ls.t.seminfo.i = ls.lookahead.seminfo.i;
        ls.t.seminfo.r = ls.lookahead.seminfo.r;
        ls.t.seminfo.ts = ls.lookahead.seminfo.ts; // TODO ?
        ls.lookahead.token = R.TK_EOS; /* and discharge it */
    } else ls.t.token = llex(ls, ls.t.seminfo); /* read next token */
};

var luaX_lookahead = function luaX_lookahead(ls) {
    assert(ls.lookahead.token === R.TK_EOS);
    ls.lookahead.token = llex(ls, ls.lookahead.seminfo);
    return ls.lookahead.token;
};

module.exports.FIRST_RESERVED = FIRST_RESERVED;
module.exports.LexState = LexState;
module.exports.RESERVED = RESERVED;
module.exports.isreserved = isreserved;
module.exports.luaX_lookahead = luaX_lookahead;
module.exports.luaX_newstring = luaX_newstring;
module.exports.luaX_next = luaX_next;
module.exports.luaX_setinput = luaX_setinput;
module.exports.luaX_syntaxerror = luaX_syntaxerror;
module.exports.luaX_token2str = luaX_token2str;
module.exports.luaX_tokens = luaX_tokens;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lua = __webpack_require__(2);
var linit = __webpack_require__(38);

var LUA_VERSUFFIX = "_" + lua.LUA_VERSION_MAJOR + "_" + lua.LUA_VERSION_MINOR;
module.exports.LUA_VERSUFFIX = LUA_VERSUFFIX;

var LUA_COLIBNAME = "coroutine";
module.exports.LUA_COLIBNAME = LUA_COLIBNAME;
module.exports.luaopen_coroutine = __webpack_require__(24).luaopen_coroutine;

var LUA_TABLIBNAME = "table";
module.exports.LUA_TABLIBNAME = LUA_TABLIBNAME;
module.exports.luaopen_table = __webpack_require__(27).luaopen_table;

if (false) {
    var LUA_IOLIBNAME = "io";
    module.exports.LUA_IOLIBNAME = LUA_IOLIBNAME;
    module.exports.luaopen_io = require("./liolib.js").luaopen_io;
}

var LUA_OSLIBNAME = "os";
module.exports.LUA_OSLIBNAME = LUA_OSLIBNAME;
module.exports.luaopen_os = __webpack_require__(30).luaopen_os;

var LUA_STRLIBNAME = "string";
module.exports.LUA_STRLIBNAME = LUA_STRLIBNAME;
module.exports.luaopen_string = __webpack_require__(26).luaopen_string;

var LUA_UTF8LIBNAME = "utf8";
module.exports.LUA_UTF8LIBNAME = LUA_UTF8LIBNAME;
module.exports.luaopen_utf8 = __webpack_require__(28).luaopen_utf8;

var LUA_BITLIBNAME = "bit32";
module.exports.LUA_BITLIBNAME = LUA_BITLIBNAME;
// module.exports.luaopen_bit32 = require("./lbitlib.js").luaopen_bit32;

var LUA_MATHLIBNAME = "math";
module.exports.LUA_MATHLIBNAME = LUA_MATHLIBNAME;
module.exports.luaopen_math = __webpack_require__(25).luaopen_math;

var LUA_DBLIBNAME = "debug";
module.exports.LUA_DBLIBNAME = LUA_DBLIBNAME;
module.exports.luaopen_debug = __webpack_require__(29).luaopen_debug;

var LUA_LOADLIBNAME = "package";
module.exports.LUA_LOADLIBNAME = LUA_LOADLIBNAME;
module.exports.luaopen_package = __webpack_require__(31).luaopen_package;

module.exports.luaL_openlibs = linit.luaL_openlibs;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);

var getco = function getco(L) {
    var co = lua.lua_tothread(L, 1);
    lauxlib.luaL_argcheck(L, co, 1, lua.to_luastring("thread expected", true));
    return co;
};

var auxresume = function auxresume(L, co, narg) {
    if (!lua.lua_checkstack(co, narg)) {
        lua.lua_pushliteral(L, "too many arguments to resume");
        return -1; /* error flag */
    }

    if (lua.lua_status(co) === lua.LUA_OK && lua.lua_gettop(co) === 0) {
        lua.lua_pushliteral(L, "cannot resume dead coroutine");
        return -1; /* error flag */
    }

    lua.lua_xmove(L, co, narg);
    var status = lua.lua_resume(co, L, narg);
    if (status === lua.LUA_OK || status === lua.LUA_YIELD) {
        var nres = lua.lua_gettop(co);
        if (!lua.lua_checkstack(L, nres + 1)) {
            lua.lua_pop(co, nres); /* remove results anyway */
            lua.lua_pushliteral(L, "too many results to resume");
            return -1; /* error flag */
        }

        lua.lua_xmove(co, L, nres); /* move yielded values */
        return nres;
    } else {
        lua.lua_xmove(co, L, 1); /* move error message */
        return -1; /* error flag */
    }
};

var luaB_coresume = function luaB_coresume(L) {
    var co = getco(L);
    var r = auxresume(L, co, lua.lua_gettop(L) - 1);
    if (r < 0) {
        lua.lua_pushboolean(L, 0);
        lua.lua_insert(L, -2);
        return 2; /* return false + error message */
    } else {
        lua.lua_pushboolean(L, 1);
        lua.lua_insert(L, -(r + 1));
        return r + 1; /* return true + 'resume' returns */
    }
};

var luaB_auxwrap = function luaB_auxwrap(L) {
    var co = lua.lua_tothread(L, lua.lua_upvalueindex(1));
    var r = auxresume(L, co, lua.lua_gettop(L));
    if (r < 0) {
        if (lua.lua_type(L, -1) === lua.LUA_TSTRING) {
            /* error object is a string? */
            lauxlib.luaL_where(L, 1); /* add extra info */
            lua.lua_insert(L, -2);
            lua.lua_concat(L, 2);
        }

        return lua.lua_error(L); /* propagate error */
    }

    return r;
};

var luaB_cocreate = function luaB_cocreate(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TFUNCTION);
    var NL = lua.lua_newthread(L);
    lua.lua_pushvalue(L, 1); /* move function to top */
    lua.lua_xmove(L, NL, 1); /* move function from L to NL */
    return 1;
};

var luaB_cowrap = function luaB_cowrap(L) {
    luaB_cocreate(L);
    lua.lua_pushcclosure(L, luaB_auxwrap, 1);
    return 1;
};

var luaB_yield = function luaB_yield(L) {
    return lua.lua_yield(L, lua.lua_gettop(L));
};

var luaB_costatus = function luaB_costatus(L) {
    var co = getco(L);
    if (L === co) lua.lua_pushliteral(L, "running");else {
        switch (lua.lua_status(co)) {
            case lua.LUA_YIELD:
                lua.lua_pushliteral(L, "suspended");
                break;
            case lua.LUA_OK:
                {
                    var ar = new lua.lua_Debug();
                    if (lua.lua_getstack(co, 0, ar) > 0) /* does it have frames? */
                        lua.lua_pushliteral(L, "normal"); /* it is running */
                    else if (lua.lua_gettop(co) === 0) lua.lua_pushliteral(L, "dead");else lua.lua_pushliteral(L, "suspended"); /* initial state */
                    break;
                }
            default:
                /* some error occurred */
                lua.lua_pushliteral(L, "dead");
                break;
        }
    }

    return 1;
};

var luaB_yieldable = function luaB_yieldable(L) {
    lua.lua_pushboolean(L, lua.lua_isyieldable(L));
    return 1;
};

var luaB_corunning = function luaB_corunning(L) {
    lua.lua_pushboolean(L, lua.lua_pushthread(L));
    return 2;
};

var co_funcs = {
    "create": luaB_cocreate,
    "isyieldable": luaB_yieldable,
    "resume": luaB_coresume,
    "running": luaB_corunning,
    "status": luaB_costatus,
    "wrap": luaB_cowrap,
    "yield": luaB_yield
};

var luaopen_coroutine = function luaopen_coroutine(L) {
    lauxlib.luaL_newlib(L, co_funcs);
    return 1;
};

module.exports.luaopen_coroutine = luaopen_coroutine;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);
var llimit = __webpack_require__(4);
var luaconf = __webpack_require__(9);

var math_random = function math_random(L) {
    var low = void 0,
        up = void 0;
    var r = Math.random();
    switch (lua.lua_gettop(L)) {/* check number of arguments */
        case 0:
            lua.lua_pushnumber(L, r); /* Number between 0 and 1 */
            return 1;
        case 1:
            {
                low = 1;
                up = lauxlib.luaL_checkinteger(L, 1);
                break;
            }
        case 2:
            {
                low = lauxlib.luaL_checkinteger(L, 1);
                up = lauxlib.luaL_checkinteger(L, 2);
                break;
            }
        default:
            return lauxlib.luaL_error(L, lua.to_luastring("wrong number of arguments", true));
    }

    /* random integer in the interval [low, up] */
    lauxlib.luaL_argcheck(L, low <= up, 1, lua.to_luastring("interval is empty", true));
    lauxlib.luaL_argcheck(L, low >= 0 || up <= llimit.MAX_INT + low, 1, lua.to_luastring("interval too large", true));

    r *= up - low + 1;
    lua.lua_pushinteger(L, Math.floor(r) + low);
    return 1;
};

var math_abs = function math_abs(L) {
    if (lua.lua_isinteger(L, 1)) {
        var n = lua.lua_tointeger(L, 1);
        if (n < 0) n = -n | 0;
        lua.lua_pushinteger(L, n);
    } else lua.lua_pushnumber(L, Math.abs(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_sin = function math_sin(L) {
    lua.lua_pushnumber(L, Math.sin(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_cos = function math_cos(L) {
    lua.lua_pushnumber(L, Math.cos(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_tan = function math_tan(L) {
    lua.lua_pushnumber(L, Math.tan(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_asin = function math_asin(L) {
    lua.lua_pushnumber(L, Math.asin(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_acos = function math_acos(L) {
    lua.lua_pushnumber(L, Math.acos(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_atan = function math_atan(L) {
    var y = lauxlib.luaL_checknumber(L, 1);
    var x = lauxlib.luaL_optnumber(L, 2, 1);
    lua.lua_pushnumber(L, Math.atan2(y, x));
    return 1;
};

var math_toint = function math_toint(L) {
    var n = lua.lua_tointegerx(L, 1);
    if (n !== false) lua.lua_pushinteger(L, n);else {
        lauxlib.luaL_checkany(L, 1);
        lua.lua_pushnil(L); /* value is not convertible to integer */
    }
    return 1;
};

var pushnumint = function pushnumint(L, d) {
    var n = luaconf.lua_numbertointeger(d);
    if (n !== false) /* does 'd' fit in an integer? */
        lua.lua_pushinteger(L, n); /* result is integer */
    else lua.lua_pushnumber(L, d); /* result is float */
};

var math_floor = function math_floor(L) {
    if (lua.lua_isinteger(L, 1)) lua.lua_settop(L, 1);else pushnumint(L, Math.floor(lauxlib.luaL_checknumber(L, 1)));

    return 1;
};

var math_ceil = function math_ceil(L) {
    if (lua.lua_isinteger(L, 1)) lua.lua_settop(L, 1);else pushnumint(L, Math.ceil(lauxlib.luaL_checknumber(L, 1)));

    return 1;
};

var math_sqrt = function math_sqrt(L) {
    lua.lua_pushnumber(L, Math.sqrt(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_ult = function math_ult(L) {
    var a = lauxlib.luaL_checkinteger(L, 1);
    var b = lauxlib.luaL_checkinteger(L, 2);
    lua.lua_pushboolean(L, a >= 0 ? b < 0 || a < b : b < 0 && a < b);
    return 1;
};

var math_log = function math_log(L) {
    var x = lauxlib.luaL_checknumber(L, 1);
    var res = void 0;
    if (lua.lua_isnoneornil(L, 2)) res = Math.log(x);else {
        var base = lauxlib.luaL_checknumber(L, 2);
        if (base === 2) res = Math.log2(x);else if (base === 10) res = Math.log10(x);else res = Math.log(x) / Math.log(base);
    }
    lua.lua_pushnumber(L, res);
    return 1;
};

var math_exp = function math_exp(L) {
    lua.lua_pushnumber(L, Math.exp(lauxlib.luaL_checknumber(L, 1)));
    return 1;
};

var math_deg = function math_deg(L) {
    lua.lua_pushnumber(L, lauxlib.luaL_checknumber(L, 1) * (180 / Math.PI));
    return 1;
};

var math_rad = function math_rad(L) {
    lua.lua_pushnumber(L, lauxlib.luaL_checknumber(L, 1) * (Math.PI / 180));
    return 1;
};

var math_min = function math_min(L) {
    var n = lua.lua_gettop(L); /* number of arguments */
    var imin = 1; /* index of current minimum value */
    lauxlib.luaL_argcheck(L, n >= 1, 1, lua.to_luastring("value expected", true));
    for (var i = 2; i <= n; i++) {
        if (lua.lua_compare(L, i, imin, lua.LUA_OPLT)) imin = i;
    }
    lua.lua_pushvalue(L, imin);
    return 1;
};

var math_max = function math_max(L) {
    var n = lua.lua_gettop(L); /* number of arguments */
    var imax = 1; /* index of current minimum value */
    lauxlib.luaL_argcheck(L, n >= 1, 1, lua.to_luastring("value expected", true));
    for (var i = 2; i <= n; i++) {
        if (lua.lua_compare(L, imax, i, lua.LUA_OPLT)) imax = i;
    }
    lua.lua_pushvalue(L, imax);
    return 1;
};

var math_type = function math_type(L) {
    if (lua.lua_type(L, 1) === lua.LUA_TNUMBER) {
        if (lua.lua_isinteger(L, 1)) lua.lua_pushliteral(L, "integer");else lua.lua_pushliteral(L, "float");
    } else {
        lauxlib.luaL_checkany(L, 1);
        lua.lua_pushnil(L);
    }
    return 1;
};

var math_fmod = function math_fmod(L) {
    if (lua.lua_isinteger(L, 1) && lua.lua_isinteger(L, 2)) {
        var d = lua.lua_tointeger(L, 2);
        /* no special case needed for -1 in javascript */
        if (d === 0) {
            lauxlib.luaL_argerror(L, 2, lua.to_luastring("zero", true));
        } else lua.lua_pushinteger(L, lua.lua_tointeger(L, 1) % d | 0);
    } else {
        var a = lauxlib.luaL_checknumber(L, 1);
        var b = lauxlib.luaL_checknumber(L, 2);
        lua.lua_pushnumber(L, a % b);
    }
    return 1;
};

var math_modf = function math_modf(L) {
    if (lua.lua_isinteger(L, 1)) {
        lua.lua_settop(L, 1); /* number is its own integer part */
        lua.lua_pushnumber(L, 0); /* no fractional part */
    } else {
        var n = lauxlib.luaL_checknumber(L, 1);
        var ip = n < 0 ? Math.ceil(n) : Math.floor(n);
        pushnumint(L, ip);
        lua.lua_pushnumber(L, n === ip ? 0 : n - ip);
    }
    return 2;
};

var mathlib = {
    "abs": math_abs,
    "acos": math_acos,
    "asin": math_asin,
    "atan": math_atan,
    "ceil": math_ceil,
    "cos": math_cos,
    "deg": math_deg,
    "exp": math_exp,
    "floor": math_floor,
    "fmod": math_fmod,
    "log": math_log,
    "max": math_max,
    "min": math_min,
    "modf": math_modf,
    "rad": math_rad,
    "random": math_random,
    "sin": math_sin,
    "sqrt": math_sqrt,
    "tan": math_tan,
    "tointeger": math_toint,
    "type": math_type,
    "ult": math_ult
};

var luaopen_math = function luaopen_math(L) {
    lauxlib.luaL_newlib(L, mathlib);
    lua.lua_pushnumber(L, Math.PI);
    lua.lua_setfield(L, -2, lua.to_luastring("pi", true));
    lua.lua_pushnumber(L, Infinity);
    lua.lua_setfield(L, -2, lua.to_luastring("huge", true));
    lua.lua_pushinteger(L, llimit.MAX_INT);
    lua.lua_setfield(L, -2, lua.to_luastring("maxinteger", true));
    lua.lua_pushinteger(L, llimit.MIN_INT);
    lua.lua_setfield(L, -2, lua.to_luastring("mininteger", true));
    return 1;
};

module.exports.luaopen_math = luaopen_math;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var assert = __webpack_require__(0);
var sprintf = __webpack_require__(19).sprintf;

var lauxlib = __webpack_require__(5);
var lua = __webpack_require__(2);
var luaconf = __webpack_require__(9);
var llimit = __webpack_require__(4);

var sL_ESC = '%';
var L_ESC = sL_ESC.charCodeAt(0);

/*
** maximum number of captures that a pattern can do during
** pattern-matching. This limit is arbitrary, but must fit in
** an unsigned char.
*/
var LUA_MAXCAPTURES = 32;

// (sizeof(size_t) < sizeof(int) ? MAX_SIZET : (size_t)(INT_MAX))
var MAXSIZE = 2147483647;

/* Give natural (i.e. strings end at the first \0) length of a string represented by an array of bytes */
var strlen = function strlen(s) {
    var len = s.indexOf(0);
    return len > -1 ? len : s.length;
};

/* translate a relative string position: negative means back from end */
var posrelat = function posrelat(pos, len) {
    if (pos >= 0) return pos;else if (0 - pos > len) return 0;else return len + pos + 1;
};

var str_sub = function str_sub(L) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var l = s.length;
    var start = posrelat(lauxlib.luaL_checkinteger(L, 2), l);
    var end = posrelat(lauxlib.luaL_optinteger(L, 3, -1), l);
    if (start < 1) start = 1;
    if (end > l) end = l;
    if (start <= end) lua.lua_pushstring(L, s.slice(start - 1, start - 1 + (end - start + 1)));else lua.lua_pushliteral(L, "");
    return 1;
};

var str_len = function str_len(L) {
    lua.lua_pushinteger(L, lauxlib.luaL_checkstring(L, 1).length);
    return 1;
};

var str_char = function str_char(L) {
    var n = lua.lua_gettop(L); /* number of arguments */
    var p = [];
    for (var i = 1; i <= n; i++) {
        var c = lauxlib.luaL_checkinteger(L, i);
        lauxlib.luaL_argcheck(L, c >= 0 && c <= 255, "value out of range"); // Strings are 8-bit clean
        p.push(c);
    }
    lua.lua_pushstring(L, p);
    return 1;
};

var writer = function writer(L, b, size, B) {
    B.push.apply(B, _toConsumableArray(b.slice(0, size)));
    return 0;
};

var str_dump = function str_dump(L) {
    var b = [];
    var strip = lua.lua_toboolean(L, 2);
    lauxlib.luaL_checktype(L, 1, lua.LUA_TFUNCTION);
    lua.lua_settop(L, 1);
    if (lua.lua_dump(L, writer, b, strip) !== 0) return lauxlib.luaL_error(L, lua.to_luastring("unable to dump given function"));
    lua.lua_pushstring(L, b);
    return 1;
};

var SIZELENMOD = luaconf.LUA_NUMBER_FRMLEN.length + 1;

var L_NBFD = 1;

/*
** Add integer part of 'x' to buffer and return new 'x'
*/
var adddigit = function adddigit(buff, n, x) {
    var d = Math.floor(x); /* get integer part from 'x' */
    buff[n] = d < 10 ? d + '0'.charCodeAt(0) : d - 10 + 'a'.charCodeAt(0); /* add to buffer */
    return x - d; /* return what is left */
};

var num2straux = function num2straux(x) {
    /* if 'inf' or 'NaN', format it like '%g' */
    if (Object.is(x, Infinity)) return lua.to_luastring('inf', true).slice(0);else if (Object.is(x, -Infinity)) return lua.to_luastring('-inf', true).slice(0);else if (Number.isNaN(x)) return lua.to_luastring('nan', true).slice(0);else if (x === 0) {
        /* can be -0... */
        /* create "0" or "-0" followed by exponent */
        var zero = sprintf(luaconf.LUA_NUMBER_FMT + "x0p+0", x);
        if (Object.is(x, -0)) zero = "-" + zero;
        return lua.to_luastring(zero);
    } else {
        var buff = [];
        var fe = luaconf.frexp(x); /* 'x' fraction and exponent */
        var m = fe[0];
        var e = fe[1];
        var n = 0; /* character count */
        if (m < 0) {
            /* is number negative? */
            buff[n++] = '-'.charCodeAt(0); /* add signal */
            m = -m; /* make it positive */
        }
        buff[n++] = '0'.charCodeAt(0);
        buff[n++] = 'x'.charCodeAt(0); /* add "0x" */
        m = adddigit(buff, n++, m * (1 << L_NBFD)); /* add first digit */
        e -= L_NBFD; /* this digit goes before the radix point */
        if (m > 0) {
            /* more digits? */
            buff[n++] = luaconf.lua_getlocaledecpoint().charCodeAt(0); /* add radix point */
            do {
                /* add as many digits as needed */
                m = adddigit(buff, n++, m * 16);
            } while (m > 0);
        }
        var exp = lua.to_luastring(sprintf("p%+d", e));
        return buff.concat(exp);
    }
};

var lua_number2strx = function lua_number2strx(L, fmt, x) {
    var buff = num2straux(x);
    if (fmt[SIZELENMOD] === 'A'.charCodeAt(0)) {
        for (var i = 0; i < buff.length; i++) {
            buff[i] = String.fromCharCode(buff[i]).toUpperCase().charCodeAt(0);
        }
    } else if (fmt[SIZELENMOD] !== 'a'.charCodeAt(0)) lauxlib.luaL_error(L, lua.to_luastring("modifiers for format '%%a'/'%%A' not implemented"));
    return buff;
};

/*
** Maximum size of each formatted item. This maximum size is produced
** by format('%.99f', -maxfloat), and is equal to 99 + 3 ('-', '.',
** and '\0') + number of decimal digits to represent maxfloat (which
** is maximum exponent + 1). (99+3+1 then rounded to 120 for "extra
** expenses", such as locale-dependent stuff)
*/
var MAX_ITEM = 120; // TODO: + l_mathlim(MAX_10_EXP);


/* valid flags in a format specification */
var FLAGS = ["-".charCodeAt(0), "+".charCodeAt(0), " ".charCodeAt(0), "#".charCodeAt(0), "0".charCodeAt(0)];

/*
** maximum size of each format specification (such as "%-099.99d")
*/
var MAX_FORMAT = 32;

// TODO: locale ? and do it better
var isalpha = function isalpha(e) {
    return 'a'.charCodeAt(0) <= e && e <= 'z'.charCodeAt(0) || e >= 'A'.charCodeAt(0) && e <= 'Z'.charCodeAt(0);
};
var isdigit = function isdigit(e) {
    return '0'.charCodeAt(0) <= e && e <= '9'.charCodeAt(0);
};
var iscntrl = function iscntrl(e) {
    return 0x00 <= e && e <= 0x1f || e === 0x7f;
};
var isgraph = function isgraph(e) {
    return e > 32 && e < 127;
}; // TODO: Will only work for ASCII
var islower = function islower(e) {
    return (/^[a-z]$/.test(String.fromCharCode(e))
    );
};
var isupper = function isupper(e) {
    return (/^[A-Z]$/.test(String.fromCharCode(e))
    );
};
var isalnum = function isalnum(e) {
    return (/^[a-zA-Z0-9]$/.test(String.fromCharCode(e))
    );
};
var ispunct = function ispunct(e) {
    return isgraph(e) && !isalnum(e);
};
var isspace = function isspace(e) {
    return (/^\s$/.test(String.fromCharCode(e))
    );
};
var isxdigit = function isxdigit(e) {
    return (/^[0-9A-Fa-f]$/.test(String.fromCharCode(e))
    );
};

// Concat 2 arrays by modifying the first one
var concat = function concat(a1, a2) {
    for (var i = 0; i < a2.length; i++) {
        a1.push(a2[i]);
    }
};

var addquoted = function addquoted(b, s) {
    b.push('"'.charCodeAt(0));
    var len = s.length;
    while (len--) {
        if (s[0] === '"'.charCodeAt(0) || s[0] === '\\'.charCodeAt(0) || s[0] === '\n'.charCodeAt(0)) {
            b.push('\\'.charCodeAt(0));
            b.push(s[0]);
        } else if (iscntrl(s[0])) {
            var buff = [];
            if (!isdigit(s[1])) buff = lua.to_luastring(sprintf("\\%d", s[0]));else buff = lua.to_luastring(sprintf("\\%03d", s[0]));
            concat(b, buff);
        } else b.push(s[0]);
        s = s.slice(1);
    }
    b.push('"'.charCodeAt(0));
};

/*
** Ensures the 'buff' string uses a dot as the radix character.
*/
var checkdp = function checkdp(buff) {
    if (buff.indexOf('.'.charCodeAt(0)) < 0) {
        /* no dot? */
        var point = luaconf.lua_getlocaledecpoint().charCodeAt(0); /* try locale point */
        var ppoint = buff.indexOf(point);
        if (ppoint) buff[ppoint] = '.'; /* change it to a dot */
    }
};

var addliteral = function addliteral(L, b, arg) {
    switch (lua.lua_type(L, arg)) {
        case lua.LUA_TSTRING:
            {
                var s = lua.lua_tostring(L, arg);
                addquoted(b, s, s.length);
                break;
            }
        case lua.LUA_TNUMBER:
            {
                if (!lua.lua_isinteger(L, arg)) {
                    /* float? */
                    var n = lua.lua_tonumber(L, arg); /* write as hexa ('%a') */
                    concat(b, lua_number2strx(L, lua.to_luastring('%' + luaconf.LUA_INTEGER_FRMLEN + 'a'), n));
                    checkdp(b); /* ensure it uses a dot */
                } else {
                    /* integers */
                    var _n = lua.lua_tointeger(L, arg);
                    var format = _n === llimit.LUA_MININTEGER ? /* corner case? */
                    "0x%" + luaconf.LUA_INTEGER_FRMLEN + "x" /* use hexa */
                    : luaconf.LUA_INTEGER_FMT; /* else use default format */
                    concat(b, lua.to_luastring(sprintf(format, _n)));
                }
                break;
            }
        case lua.LUA_TNIL:case lua.LUA_TBOOLEAN:
            {
                concat(b, lauxlib.luaL_tolstring(L, arg));
                break;
            }
        default:
            {
                lauxlib.luaL_argerror(L, arg, lua.to_luastring("value has no literal form", true));
            }
    }
};

var scanformat = function scanformat(L, strfrmt, form) {
    var p = strfrmt;
    while (p[0] !== 0 && FLAGS.indexOf(p[0]) >= 0) {
        p = p.slice(1);
    } /* skip flags */
    if (strfrmt.length - p.length >= FLAGS.length) lauxlib.luaL_error(L, lua.to_luastring("invalid format (repeated flags)", true));
    if (isdigit(p[0])) p = p.slice(1); /* skip width */
    if (isdigit(p[0])) p = p.slice(1); /* (2 digits at most) */
    if (p[0] === '.'.charCodeAt(0)) {
        p = p.slice(1);
        if (isdigit(p[0])) p = p.slice(1); /* skip precision */
        if (isdigit(p[0])) p = p.slice(1); /* (2 digits at most) */
    }
    if (isdigit(p[0])) lauxlib.luaL_error(L, lua.to_luastring("invalid format (width or precision too long)", true));
    form[0] = "%".charCodeAt(0);
    for (var i = 0; i < strfrmt.length - p.length + 1; i++) {
        form[i + 1] = strfrmt[i];
    } // form[strfrmt.length - p.length + 2] = 0;
    return {
        form: form,
        p: p
    };
};

/*
** add length modifier into formats
*/
var addlenmod = function addlenmod(form, lenmod) {
    var l = form.length;
    var lm = lenmod.length;
    var spec = form[l - 1];
    for (var i = 0; i < lenmod.length; i++) {
        form[i + l - 1] = lenmod[i];
    }form[l + lm - 1] = spec;
    // form[l + lm] = 0;
    return form;
};

var str_format = function str_format(L) {
    var top = lua.lua_gettop(L);
    var arg = 1;
    var strfrmt = lauxlib.luaL_checkstring(L, arg);
    var b = [];

    while (strfrmt.length > 0) {
        if (strfrmt[0] !== L_ESC) {
            b.push(strfrmt[0]);
            strfrmt = strfrmt.slice(1);
        } else if ((strfrmt = strfrmt.slice(1))[0] === L_ESC) {
            b.push(strfrmt[0]);
            strfrmt = strfrmt.slice(1);
        } else {
            /* format item */
            var form = []; /* to store the format ('%...') */
            if (++arg > top) lauxlib.luaL_argerror(L, arg, lua.to_luastring("no value", true));
            var f = scanformat(L, strfrmt, form);
            strfrmt = f.p;
            form = f.form;
            switch (String.fromCharCode(strfrmt[0])) {
                case 'c':
                    {
                        strfrmt = strfrmt.slice(1);
                        // concat(b, lua.to_luastring(sprintf(String.fromCharCode(...form), lauxlib.luaL_checkinteger(L, arg))));
                        b.push(lauxlib.luaL_checkinteger(L, arg));
                        break;
                    }
                case 'd':case 'i':
                case 'o':case 'u':case 'x':case 'X':
                    {
                        strfrmt = strfrmt.slice(1);
                        var n = lauxlib.luaL_checkinteger(L, arg);
                        form = addlenmod(form, luaconf.LUA_INTEGER_FRMLEN.split('').map(function (e) {
                            return e.charCodeAt(0);
                        }));
                        concat(b, lua.to_luastring(sprintf(String.fromCharCode.apply(String, _toConsumableArray(form)), n)));
                        break;
                    }
                case 'a':case 'A':
                    {
                        strfrmt = strfrmt.slice(1);
                        form = addlenmod(form, luaconf.LUA_INTEGER_FRMLEN.split('').map(function (e) {
                            return e.charCodeAt(0);
                        }));
                        concat(b, lua_number2strx(L, form, lauxlib.luaL_checknumber(L, arg)));
                        break;
                    }
                case 'e':case 'E':case 'f':
                case 'g':case 'G':
                    {
                        strfrmt = strfrmt.slice(1);
                        var _n2 = lauxlib.luaL_checknumber(L, arg);
                        form = addlenmod(form, luaconf.LUA_INTEGER_FRMLEN.split('').map(function (e) {
                            return e.charCodeAt(0);
                        }));
                        concat(b, lua.to_luastring(sprintf(String.fromCharCode.apply(String, _toConsumableArray(form)), _n2)));
                        break;
                    }
                case 'q':
                    {
                        strfrmt = strfrmt.slice(1);
                        addliteral(L, b, arg);
                        break;
                    }
                case 's':
                    {
                        strfrmt = strfrmt.slice(1);
                        var s = lauxlib.luaL_tolstring(L, arg);
                        if (form.length <= 2 || form[2] === 0) {
                            /* no modifiers? */
                            concat(b, s); /* keep entire string */
                            lua.lua_pop(L, 1); /* remove result from 'luaL_tolstring' */
                        } else {
                            lauxlib.luaL_argcheck(L, s.length === strlen(s), arg, lua.to_luastring("string contains zeros", true));
                            if (form.indexOf('.'.charCodeAt(0)) < 0 && s.length >= 100) {
                                /* no precision and string is too long to be formatted */
                                concat(b, s); /* keep entire string */
                                lua.lua_pop(L, 1); /* remove result from 'luaL_tolstring' */
                            } else {
                                /* format the string into 'buff' */
                                // TODO: will fail if s is not valid UTF-8
                                concat(b, lua.to_luastring(sprintf(String.fromCharCode.apply(String, _toConsumableArray(form)), lua.to_jsstring(s))));
                                lua.lua_pop(L, 1); /* remove result from 'luaL_tolstring' */
                            }
                        }
                        break;
                    }
                default:
                    {
                        /* also treat cases 'pnLlh' */
                        return lauxlib.luaL_error(L, lua.to_luastring("invalid option '%%%c' to 'format'"), strfrmt[0]);
                    }
            }
        }
    }

    lua.lua_pushstring(L, b);
    return 1;
};

/* value used for padding */
var LUAL_PACKPADBYTE = 0x00;

/* maximum size for the binary representation of an integer */
var MAXINTSIZE = 16;

var SZINT = 4; // Size of lua_Integer

/* number of bits in a character */
var NB = 8;

/* mask for one character (NB 1's) */
var MC = (1 << NB) - 1;

var MAXALIGN = 8;

/*
** information to pack/unpack stuff
*/

var Header = function Header(L) {
    _classCallCheck(this, Header);

    this.L = L;
    this.islittle = true;
    this.maxalign = 1;
};

/*
** options for pack/unpack
*/


var KOption = {
    Kint: 0, /* signed integers */
    Kuint: 1, /* unsigned integers */
    Kfloat: 2, /* floating-point numbers */
    Kchar: 3, /* fixed-length strings */
    Kstring: 4, /* strings with prefixed length */
    Kzstr: 5, /* zero-terminated strings */
    Kpadding: 6, /* padding */
    Kpaddalign: 7, /* padding for alignment */
    Knop: 8 /* no-op (configuration or spaces) */
};

var digit = function digit(c) {
    return '0'.charCodeAt(0) <= c && c <= '9'.charCodeAt(0);
};

var getnum = function getnum(fmt, df) {
    if (fmt.off >= fmt.s.length || !digit(fmt.s[fmt.off])) /* no number? */
        return df; /* return default value */
    else {
            var a = 0;
            do {
                a = a * 10 + (fmt.s[fmt.off++] - '0'.charCodeAt(0));
            } while (fmt.off < fmt.s.length && digit(fmt.s[fmt.off]) && a <= (MAXSIZE - 9) / 10);
            return a;
        }
};

/*
** Read an integer numeral and raises an error if it is larger
** than the maximum size for integers.
*/
var getnumlimit = function getnumlimit(h, fmt, df) {
    var sz = getnum(fmt, df);
    if (sz > MAXINTSIZE || sz <= 0) lauxlib.luaL_error(h.L, lua.to_luastring("integral size (%d) out of limits [1,%d]"), sz, MAXINTSIZE);
    return sz;
};

/*
** Read and classify next option. 'size' is filled with option's size.
*/
var getoption = function getoption(h, fmt) {
    var r = {
        opt: NaN,
        size: NaN
    };

    r.opt = fmt.s[fmt.off++];
    r.size = 0; /* default */
    switch (r.opt) {
        case 'b'.charCodeAt(0):
            r.size = 1;r.opt = KOption.Kint;return r; // sizeof(char): 1
        case 'B'.charCodeAt(0):
            r.size = 1;r.opt = KOption.Kuint;return r;
        case 'h'.charCodeAt(0):
            r.size = 2;r.opt = KOption.Kint;return r; // sizeof(short): 2
        case 'H'.charCodeAt(0):
            r.size = 2;r.opt = KOption.Kuint;return r;
        case 'l'.charCodeAt(0):
            r.size = 4;r.opt = KOption.Kint;return r; // sizeof(long): 4
        case 'L'.charCodeAt(0):
            r.size = 4;r.opt = KOption.Kuint;return r;
        case 'j'.charCodeAt(0):
            r.size = 4;r.opt = KOption.Kint;return r; // sizeof(lua_Integer): 4
        case 'J'.charCodeAt(0):
            r.size = 4;r.opt = KOption.Kuint;return r;
        case 'T'.charCodeAt(0):
            r.size = 4;r.opt = KOption.Kuint;return r; // sizeof(size_t): 4
        case 'f'.charCodeAt(0):
            r.size = 4;r.opt = KOption.Kfloat;return r; // sizeof(float): 4
        case 'd'.charCodeAt(0):
            r.size = 8;r.opt = KOption.Kfloat;return r; // sizeof(double): 8
        case 'n'.charCodeAt(0):
            r.size = 8;r.opt = KOption.Kfloat;return r; // sizeof(lua_Number): 8
        case 'i'.charCodeAt(0):
            r.size = getnumlimit(h, fmt, 4);r.opt = KOption.Kint;return r; // sizeof(int): 4
        case 'I'.charCodeAt(0):
            r.size = getnumlimit(h, fmt, 4);r.opt = KOption.Kuint;return r;
        case 's'.charCodeAt(0):
            r.size = getnumlimit(h, fmt, 4);r.opt = KOption.Kstring;return r;
        case 'c'.charCodeAt(0):
            {
                r.size = getnum(fmt, -1);
                if (r.size === -1) lauxlib.luaL_error(h.L, lua.to_luastring("missing size for format option 'c'"));
                r.opt = KOption.Kchar;
                return r;
            }
        case 'z'.charCodeAt(0):
            r.opt = KOption.Kzstr;return r;
        case 'x'.charCodeAt(0):
            r.size = 1;r.opt = KOption.Kpadding;return r;
        case 'X'.charCodeAt(0):
            r.opt = KOption.Kpaddalign;return r;
        case ' '.charCodeAt(0):
            break;
        case '<'.charCodeAt(0):
            h.islittle = true;break;
        case '>'.charCodeAt(0):
            h.islittle = false;break;
        case '='.charCodeAt(0):
            h.islittle = true;break;
        case '!'.charCodeAt(0):
            h.maxalign = getnumlimit(h, fmt, MAXALIGN);break;
        default:
            lauxlib.luaL_error(h.L, lua.to_luastring("invalid format option '%c'"), r.opt);
    }

    r.opt = KOption.Knop;
    return r;
};

/*
** Read, classify, and fill other details about the next option.
** 'psize' is filled with option's size, 'notoalign' with its
** alignment requirements.
** Local variable 'size' gets the size to be aligned. (Kpadal option
** always gets its full alignment, other options are limited by
** the maximum alignment ('maxalign'). Kchar option needs no alignment
** despite its size.
*/
var getdetails = function getdetails(h, totalsize, fmt) {
    var r = {
        opt: NaN,
        size: NaN,
        ntoalign: NaN
    };

    var opt = getoption(h, fmt);
    r.size = opt.size;
    r.opt = opt.opt;
    var align = r.size; /* usually, alignment follows size */
    if (r.opt === KOption.Kpaddalign) {
        /* 'X' gets alignment from following option */
        if (fmt.off >= fmt.s.length || fmt.s[fmt.off] === 0) lauxlib.luaL_argerror(h.L, 1, lua.to_luastring("invalid next option for option 'X'", true));else {
            var o = getoption(h, fmt);
            align = o.size;
            o = o.opt;
            if (o === KOption.Kchar || align === 0) lauxlib.luaL_argerror(h.L, 1, lua.to_luastring("invalid next option for option 'X'", true));
        }
    }
    if (align <= 1 || r.opt === KOption.Kchar) /* need no alignment? */
        r.ntoalign = 0;else {
        if (align > h.maxalign) /* enforce maximum alignment */
            align = h.maxalign;
        if ((align & align - 1) !== 0) /* is 'align' not a power of 2? */
            lauxlib.luaL_argerror(h.L, 1, lua.to_luastring("format asks for alignment not power of 2", true));
        r.ntoalign = align - (totalsize & align - 1) & align - 1;
    }
    return r;
};

/*
** Pack integer 'n' with 'size' bytes and 'islittle' endianness.
** The final 'if' handles the case when 'size' is larger than
** the size of a Lua integer, correcting the extra sign-extension
** bytes if necessary (by default they would be zeros).
*/
var packint = function packint(b, n, islittle, size, neg) {
    var buff = new Array(size);

    buff[islittle ? 0 : size - 1] = n & MC; /* first byte */
    for (var i = 1; i < size; i++) {
        n >>= NB;
        buff[islittle ? i : size - 1 - i] = n & MC;
    }
    if (neg && size > SZINT) {
        /* negative number need sign extension? */
        for (var _i = SZINT; _i < size; _i++) {
            /* correct extra bytes */
            buff[islittle ? _i : size - 1 - _i] = MC;
        }
    }
    b.push.apply(b, buff); /* add result to buffer */
};

var packnum = function packnum(b, n, islittle, size) {
    var dv = new DataView(new ArrayBuffer(size));
    if (size === 4) dv.setFloat32(0, n, islittle);else dv.setFloat64(0, n, islittle);

    for (var i = 0; i < size; i++) {
        b.push(dv.getUint8(i, islittle));
    }
};

var str_pack = function str_pack(L) {
    var b = [];
    var h = new Header(L);
    var fmt = {
        s: lauxlib.luaL_checkstring(L, 1), /* format string */
        off: 0
    };
    var arg = 1; /* current argument to pack */
    var totalsize = 0; /* accumulate total size of result */
    lua.lua_pushnil(L); /* mark to separate arguments from string buffer */
    while (fmt.off < fmt.s.length) {
        var details = getdetails(h, totalsize, fmt);
        var opt = details.opt;
        var size = details.size;
        var ntoalign = details.ntoalign;
        totalsize += ntoalign + size;
        while (ntoalign-- > 0) {
            b.push(LUAL_PACKPADBYTE);
        } /* fill alignment */
        arg++;
        switch (opt) {
            case KOption.Kint:
                {
                    /* signed integers */
                    var n = lauxlib.luaL_checkinteger(L, arg);
                    if (size < SZINT) {
                        /* need overflow check? */
                        var lim = 1 << size * 8 - 1;
                        lauxlib.luaL_argcheck(L, -lim <= n && n < lim, arg, lua.to_luastring("integer overflow", true));
                    }
                    packint(b, n, h.islittle, size, n < 0);
                    break;
                }
            case KOption.Kuint:
                {
                    /* unsigned integers */
                    var _n3 = lauxlib.luaL_checkinteger(L, arg);
                    if (size < SZINT) lauxlib.luaL_argcheck(L, _n3 >>> 0 < 1 << size * NB, arg, lua.to_luastring("unsigned overflow", true));
                    packint(b, _n3 >>> 0, h.islittle, size, false);
                    break;
                }
            case KOption.Kfloat:
                {
                    /* floating-point options */
                    var _n4 = lauxlib.luaL_checknumber(L, arg); /* get argument */
                    packnum(b, _n4, h.islittle, size);
                    break;
                }
            case KOption.Kchar:
                {
                    /* fixed-size string */
                    var s = lauxlib.luaL_checkstring(L, arg);
                    var len = s.length;
                    lauxlib.luaL_argcheck(L, len <= size, arg, lua.to_luastring("string longer than given size", true));
                    b.push.apply(b, _toConsumableArray(s)); /* add string */
                    while (len++ < size) {
                        /* pad extra space */
                        b.push(LUAL_PACKPADBYTE);
                    }break;
                }
            case KOption.Kstring:
                {
                    /* strings with length count */
                    var _s = lauxlib.luaL_checkstring(L, arg);
                    var _len = _s.length;
                    lauxlib.luaL_argcheck(L, size >= 4 /* sizeof(size_t) */ || _len < 1 << size * NB, arg, lua.to_luastring("string length does not fit in given size", true));
                    packint(b, _len, h.islittle, size, 0); /* pack length */
                    b.push.apply(b, _toConsumableArray(_s));
                    totalsize += _len;
                    break;
                }
            case KOption.Kzstr:
                {
                    /* zero-terminated string */
                    var _s2 = lauxlib.luaL_checkstring(L, arg);
                    var _len2 = _s2.length;
                    lauxlib.luaL_argcheck(L, _s2.indexOf(0) < 0, arg, lua.to_luastring("strings contains zeros", true));
                    b.push.apply(b, _toConsumableArray(_s2));
                    b.push(0); /* add zero at the end */
                    totalsize += _len2 + 1;
                    break;
                }
            case KOption.Kpadding:
                b.push(LUAL_PACKPADBYTE); /* fall through */
            case KOption.Kpaddalign:case KOption.Knop:
                arg--; /* undo increment */
                break;
        }
    }
    lua.lua_pushstring(L, b);
    return 1;
};

var str_reverse = function str_reverse(L) {
    lua.lua_pushstring(L, lauxlib.luaL_checkstring(L, 1).slice(0).reverse());
    return 1;
};

var str_lower = function str_lower(L) {
    // TODO: will fail on invalid UTF-8
    lua.lua_pushstring(L, lua.to_luastring(lua.to_jsstring(lauxlib.luaL_checkstring(L, 1)).toLowerCase()));
    return 1;
};

var str_upper = function str_upper(L) {
    // TODO: will fail on invalid UTF-8
    lua.lua_pushstring(L, lua.to_luastring(lua.to_jsstring(lauxlib.luaL_checkstring(L, 1)).toUpperCase()));
    return 1;
};

var str_rep = function str_rep(L) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var n = lauxlib.luaL_checkinteger(L, 2);
    var sep = lauxlib.luaL_optstring(L, 3, []);

    if (s.length + sep.length < s.length || s.length + sep.length > MAXSIZE / n) /* may overflow? */
        return lauxlib.luaL_error(L, lua.to_luastring("resulting string too large", true));

    var r = [];
    for (var i = 0; i < n - 1; i++) {
        r = r.concat(s.concat(sep));
    }r = r.concat(s);

    lua.lua_pushstring(L, n > 0 ? r : []);
    return 1;
};

var str_byte = function str_byte(L) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var l = s.length;
    var posi = posrelat(lauxlib.luaL_optinteger(L, 2, 1), l);
    var pose = posrelat(lauxlib.luaL_optinteger(L, 3, posi), l);

    if (posi < 1) posi = 1;
    if (pose > l) pose = l;
    if (posi > pose) return 0; /* empty interval; return no values */
    if (pose - posi >= llimit.MAX_INT) /* arithmetic overflow? */
        return lauxlib.luaL_error(L, lua.to_luastring("string slice too long", true));

    var n = pose - posi + 1;
    lauxlib.luaL_checkstack(L, n, lua.to_luastring("string slice too long", true));
    for (var i = 0; i < n; i++) {
        lua.lua_pushinteger(L, s[posi + i - 1]);
    }return n;
};

var str_packsize = function str_packsize(L) {
    var h = new Header(L);
    var fmt = {
        s: lauxlib.luaL_checkstring(L, 1),
        off: 0
    };
    var totalsize = 0; /* accumulate total size of result */
    while (fmt.off < fmt.s.length) {
        var details = getdetails(h, totalsize, fmt);
        var opt = details.opt;
        var size = details.size;
        var ntoalign = details.ntoalign;
        size += ntoalign; /* total space used by option */
        lauxlib.luaL_argcheck(L, totalsize <= MAXSIZE - size, 1, lua.to_luastring("format result too large", true));
        totalsize += size;
        switch (opt) {
            case KOption.Kstring: /* strings with length count */
            case KOption.Kzstr:
                /* zero-terminated string */
                lauxlib.luaL_argerror(L, 1, lua.to_luastring("variable-length format", true));
            /* call never return, but to avoid warnings: */ /* fall through */
            default:
                break;
        }
    }
    lua.lua_pushinteger(L, totalsize);
    return 1;
};

/*
** Unpack an integer with 'size' bytes and 'islittle' endianness.
** If size is smaller than the size of a Lua integer and integer
** is signed, must do sign extension (propagating the sign to the
** higher bits); if size is larger than the size of a Lua integer,
** it must check the unread bytes to see whether they do not cause an
** overflow.
*/
var unpackint = function unpackint(L, str, islittle, size, issigned) {
    var res = 0;
    var limit = size <= SZINT ? size : SZINT;
    for (var i = limit - 1; i >= 0; i--) {
        res <<= NB;
        res |= str[islittle ? i : size - 1 - i];
    }
    if (size < SZINT) {
        /* real size smaller than lua_Integer? */
        if (issigned) {
            /* needs sign extension? */
            var mask = 1 << size * NB - 1;
            res = (res ^ mask) - mask; /* do sign extension */
        }
    } else if (size > SZINT) {
        /* must check unread bytes */
        var _mask = !issigned || res >= 0 ? 0 : MC;
        for (var _i2 = limit; _i2 < size; _i2++) {
            if (str[islittle ? _i2 : size - 1 - _i2] !== _mask) lauxlib.luaL_error(L, lua.to_luastring("%d-byte integer does not fit into Lua Integer"), size);
        }
    }
    return res;
};

var unpacknum = function unpacknum(L, b, islittle, size) {
    assert(b.length >= size);

    var dv = new DataView(new ArrayBuffer(size));
    for (var i = 0; i < size; i++) {
        dv.setUint8(i, b[i], islittle);
    }if (size == 4) return dv.getFloat32(0, islittle);else return dv.getFloat64(0, islittle);
};

var str_unpack = function str_unpack(L) {
    var h = new Header(L);
    var fmt = {
        s: lauxlib.luaL_checkstring(L, 1),
        off: 0
    };
    var data = lauxlib.luaL_checkstring(L, 2);
    var ld = data.length;
    var pos = posrelat(lauxlib.luaL_optinteger(L, 3, 1), ld) - 1;
    var n = 0; /* number of results */
    lauxlib.luaL_argcheck(L, pos <= ld && pos >= 0, 3, lua.to_luastring("initial position out of string", true));
    while (fmt.off < fmt.s.length) {
        var details = getdetails(h, pos, fmt);
        var opt = details.opt;
        var size = details.size;
        var ntoalign = details.ntoalign;
        if ( /*ntoalign + size > ~pos ||*/pos + ntoalign + size > ld) lauxlib.luaL_argerror(L, 2, lua.to_luastring("data string too short", true));
        pos += ntoalign; /* skip alignment */
        /* stack space for item + next position */
        lauxlib.luaL_checkstack(L, 2, lua.to_luastring("too many results", true));
        n++;
        switch (opt) {
            case KOption.Kint:
            case KOption.Kuint:
                {
                    var res = unpackint(L, data.slice(pos), h.islittle, size, opt === KOption.Kint);
                    lua.lua_pushinteger(L, res);
                    break;
                }
            case KOption.Kfloat:
                {
                    var _res = unpacknum(L, data.slice(pos), h.islittle, size);
                    lua.lua_pushnumber(L, _res);
                    break;
                }
            case KOption.Kchar:
                {
                    lua.lua_pushstring(L, data.slice(pos, pos + size));
                    break;
                }
            case KOption.Kstring:
                {
                    var len = unpackint(L, data.slice(pos), h.islittle, size, 0);
                    lauxlib.luaL_argcheck(L, pos + len + size <= ld, 2, lua.to_luastring("data string too short", true));
                    lua.lua_pushstring(L, data.slice(pos + size, pos + size + len));
                    pos += len; /* skip string */
                    break;
                }
            case KOption.Kzstr:
                {
                    var _len3 = data.slice(pos).indexOf(0);
                    lua.lua_pushstring(L, data.slice(pos, pos + _len3));
                    pos += _len3 + 1; /* skip string plus final '\0' */
                    break;
                }
            case KOption.Kpaddalign:case KOption.Kpadding:case KOption.Knop:
                n--; /* undo increment */
                break;
        }
        pos += size;
    }
    lua.lua_pushinteger(L, pos + 1); /* next position */
    return n + 1;
};

var CAP_UNFINISHED = -1;
var CAP_POSITION = -2;
var MAXCCALLS = 200;
var SPECIALS = ["^".charCodeAt(0), "$".charCodeAt(0), "*".charCodeAt(0), "+".charCodeAt(0), "?".charCodeAt(0), ".".charCodeAt(0), "(".charCodeAt(0), "[".charCodeAt(0), "%".charCodeAt(0), "-".charCodeAt(0)];

var MatchState = function MatchState(L) {
    _classCallCheck(this, MatchState);

    this.src = null; /* unmodified source string */
    this.src_init = null; /* init of source string */
    this.src_end = null; /* end ('\0') of source string */
    this.p = null; /* unmodified pattern string */
    this.p_end = null; /* end ('\0') of pattern */
    this.L = L;
    this.matchdepth = NaN; /* control for recursive depth */
    this.level = NaN; /* total number of captures (finished or unfinished) */
    this.capture = [];
};

var check_capture = function check_capture(ms, l) {
    l = l - '1'.charCodeAt(0);
    if (l < 0 || l >= ms.level || ms.capture[l].len === CAP_UNFINISHED) return lauxlib.luaL_error(ms.L, lua.to_luastring("invalid capture index %%%d"), l + 1);
    return l;
};

var capture_to_close = function capture_to_close(ms) {
    var level = ms.level;
    for (level--; level >= 0; level--) {
        if (ms.capture[level].len === CAP_UNFINISHED) return level;
    }return lauxlib.luaL_error(ms.L, lua.to_luastring("invalid pattern capture"));
};

var classend = function classend(ms, p) {
    switch (ms.p[p++]) {
        case L_ESC:
            {
                if (p === ms.p_end) lauxlib.luaL_error(ms.L, lua.to_luastring("malformed pattern (ends with '%%')"));
                return p + 1;
            }
        case '['.charCodeAt(0):
            {
                if (ms.p[p] === '^'.charCodeAt(0)) p++;
                do {
                    /* look for a ']' */
                    if (p === ms.p_end) lauxlib.luaL_error(ms.L, lua.to_luastring("malformed pattern (missing ']')"));
                    if (ms.p[p++] === L_ESC && p < ms.p_end) p++; /* skip escapes (e.g. '%]') */
                } while (ms.p[p] !== ']'.charCodeAt(0));
                return p + 1;
            }
        default:
            {
                return p;
            }
    }
};

var match_class = function match_class(c, cl) {
    var res = void 0;
    switch (String.fromCharCode(cl).toLowerCase().charCodeAt(0)) {
        case 'a'.charCodeAt(0):
            res = isalpha(c);break;
        case 'c'.charCodeAt(0):
            res = iscntrl(c);break;
        case 'd'.charCodeAt(0):
            res = isdigit(c);break;
        case 'g'.charCodeAt(0):
            res = isgraph(c);break;
        case 'l'.charCodeAt(0):
            res = islower(c);break;
        case 'p'.charCodeAt(0):
            res = ispunct(c);break;
        case 's'.charCodeAt(0):
            res = isspace(c);break;
        case 'u'.charCodeAt(0):
            res = isupper(c);break;
        case 'w'.charCodeAt(0):
            res = isalnum(c);break;
        case 'x'.charCodeAt(0):
            res = isxdigit(c);break;
        case 'z'.charCodeAt(0):
            res = c === 0;break; /* deprecated option */
        default:
            return cl === c;
    }
    return islower(cl) ? res : !res;
};

var matchbracketclass = function matchbracketclass(ms, c, p, ec) {
    var sig = true;
    if (ms.p[p + 1] === '^'.charCodeAt(0)) {
        sig = false;
        p++; /* skip the '^' */
    }
    while (++p < ec) {
        if (ms.p[p] === L_ESC) {
            p++;
            if (match_class(c, ms.p[p])) return sig;
        } else if (ms.p[p + 1] === '-'.charCodeAt(0) && p + 2 < ec) {
            p += 2;
            if (ms.p[p - 2] <= c && c <= ms.p[p]) return sig;
        } else if (ms.p[p] === c) return sig;
    }
    return !sig;
};

var singlematch = function singlematch(ms, s, p, ep) {
    if (s >= ms.src_end) return false;else {
        var c = ms.src[s];
        switch (ms.p[p]) {
            case '.'.charCodeAt(0):
                return true; /* matches any char */
            case L_ESC:
                return match_class(c, ms.p[p + 1]);
            case '['.charCodeAt(0):
                return matchbracketclass(ms, c, p, ep - 1);
            default:
                return ms.p[p] === c;
        }
    }
};

var matchbalance = function matchbalance(ms, s, p) {
    if (p >= ms.p_end - 1) lauxlib.luaL_error(ms.L, lua.to_luastring("malformed pattern (missing arguments to '%%b'"));
    if (ms.src[s] !== ms.p[p]) return null;else {
        var b = ms.p[p];
        var e = ms.p[p + 1];
        var cont = 1;
        while (++s < ms.src_end) {
            if (ms.src[s] === e) {
                if (--cont === 0) return s + 1;
            } else if (ms.src[s] === b) cont++;
        }
    }
    return null; /* string ends out of balance */
};

var max_expand = function max_expand(ms, s, p, ep) {
    var i = 0; /* counts maximum expand for item */
    while (singlematch(ms, s + i, p, ep)) {
        i++;
    } /* keeps trying to match with the maximum repetitions */
    while (i >= 0) {
        var res = match(ms, s + i, ep + 1);
        if (res) return res;
        i--; /* else didn't match; reduce 1 repetition to try again */
    }
    return null;
};

var min_expand = function min_expand(ms, s, p, ep) {
    for (;;) {
        var res = match(ms, s, ep + 1);
        if (res !== null) return res;else if (singlematch(ms, s, p, ep)) s++; /* try with one more repetition */
        else return null;
    }
};

var start_capture = function start_capture(ms, s, p, what) {
    var level = ms.level;
    if (level >= LUA_MAXCAPTURES) lauxlib.luaL_error(ms.L, lua.to_luastring("too many captures", true));
    ms.capture[level] = ms.capture[level] ? ms.capture[level] : {};
    ms.capture[level].init = s;
    ms.capture[level].len = what;
    ms.level = level + 1;
    var res = void 0;
    if ((res = match(ms, s, p)) === null) /* match failed? */
        ms.level--; /* undo capture */
    return res;
};

var end_capture = function end_capture(ms, s, p) {
    var l = capture_to_close(ms);
    ms.capture[l].len = s - ms.capture[l].init; /* close capture */
    var res = void 0;
    if ((res = match(ms, s, p)) === null) /* match failed? */
        ms.capture[l].len = CAP_UNFINISHED; /* undo capture */
    return res;
};

/* Compare the elements of arrays 'a' and 'b' to see if they contain the same elements */
var array_cmp = function array_cmp(a, ai, b, bi, len) {
    var aj = ai + len;
    for (; ai < aj; ai++, bi++) {
        if (a[ai] !== b[bi]) return false;
    }
    return true;
};

var match_capture = function match_capture(ms, s, l) {
    l = check_capture(ms, l);
    var len = ms.capture[l].len;
    if (ms.src_end - s >= len && array_cmp(ms.src, ms.capture[l].init, ms.src, s, len)) return s + len;else return null;
};

var match = function match(ms, s, p) {
    var gotodefault = false;
    var gotoinit = true;

    if (ms.matchdepth-- === 0) lauxlib.luaL_error(ms.L, lua.to_luastring("pattern too complex", true));

    while (gotoinit || gotodefault) {
        gotoinit = false;
        if (p !== ms.p_end) {
            /* end of pattern? */
            switch (gotodefault ? 'x'.charCodeAt(0) : ms.p[p]) {
                case '('.charCodeAt(0):
                    {
                        /* start capture */
                        if (ms.p[p + 1] === ')'.charCodeAt(0)) /* position capture? */
                            s = start_capture(ms, s, p + 2, CAP_POSITION);else s = start_capture(ms, s, p + 1, CAP_UNFINISHED);
                        break;
                    }
                case ')'.charCodeAt(0):
                    {
                        /* end capture */
                        s = end_capture(ms, s, p + 1);
                        break;
                    }
                case '$'.charCodeAt(0):
                    {
                        if (p + 1 !== ms.p_end) {
                            /* is the '$' the last char in pattern? */
                            gotodefault = true; /* no; go to default */
                            break;
                        }
                        s = ms.src.slice(s).length === 0 ? s : null; /* check end of string */
                        break;
                    }
                case L_ESC:
                    {
                        /* escaped sequences not in the format class[*+?-]? */
                        switch (ms.p[p + 1]) {
                            case 'b'.charCodeAt(0):
                                {
                                    /* balanced string? */
                                    s = matchbalance(ms, s, p + 2);
                                    if (s !== null) {
                                        p += 4;
                                        gotoinit = true;
                                    }
                                    break;
                                }
                            case 'f'.charCodeAt(0):
                                {
                                    /* frontier? */
                                    p += 2;
                                    if (ms.p[p] !== '['.charCodeAt(0)) lauxlib.luaL_error(ms.L, lua.to_luastring("missing '[' after '%%f' in pattern"));
                                    var ep = classend(ms, p); /* points to what is next */
                                    var previous = s === ms.src_init ? 0 : ms.src[s - 1];
                                    if (!matchbracketclass(ms, previous, p, ep - 1) && matchbracketclass(ms, s === ms.src_end ? 0 : ms.src[s], p, ep - 1)) {
                                        p = ep;gotoinit = true;break;
                                    }
                                    s = null; /* match failed */
                                    break;
                                }
                            case '0'.charCodeAt(0):case '1'.charCodeAt(0):case '2'.charCodeAt(0):case '3'.charCodeAt(0):
                            case '4'.charCodeAt(0):case '5'.charCodeAt(0):case '6'.charCodeAt(0):case '7'.charCodeAt(0):
                            case '8'.charCodeAt(0):case '9'.charCodeAt(0):
                                {
                                    /* capture results (%0-%9)? */
                                    s = match_capture(ms, s, ms.p[p + 1]);
                                    if (s !== null) {
                                        p += 2;gotoinit = true;
                                    }
                                    break;
                                }
                            default:
                                gotodefault = true;
                        }
                        break;
                    }
                default:
                    {
                        /* pattern class plus optional suffix */
                        gotodefault = false;
                        var _ep = classend(ms, p); /* points to optional suffix */
                        /* does not match at least once? */
                        if (!singlematch(ms, s, p, _ep)) {
                            if (ms.p[_ep] === '*'.charCodeAt(0) || ms.p[_ep] === '?'.charCodeAt(0) || ms.p[_ep] === '-'.charCodeAt(0)) {
                                /* accept empty? */
                                p = _ep + 1;gotoinit = true;break;
                            } else /* '+' or no suffix */
                                s = null; /* fail */
                        } else {
                            /* matched once */
                            switch (ms.p[_ep]) {/* handle optional suffix */
                                case '?'.charCodeAt(0):
                                    {
                                        /* optional */
                                        var res = void 0;
                                        if ((res = match(ms, s + 1, _ep + 1)) !== null) s = res;else {
                                            p = _ep + 1;gotoinit = true;
                                        }
                                        break;
                                    }
                                case '+'.charCodeAt(0):
                                    /* 1 or more repetitions */
                                    s++; /* 1 match already done */
                                /* fall through */
                                case '*'.charCodeAt(0):
                                    /* 0 or more repetitions */
                                    s = max_expand(ms, s, p, _ep);
                                    break;
                                case '-'.charCodeAt(0):
                                    /* 0 or more repetitions (minimum) */
                                    s = min_expand(ms, s, p, _ep);
                                    break;
                                default:
                                    /* no suffix */
                                    s++;p = _ep;gotoinit = true;
                            }
                        }
                        break;
                    }
            }
        }
    }
    ms.matchdepth++;
    return s;
};

var push_onecapture = function push_onecapture(ms, i, s, e) {
    if (i >= ms.level) {
        if (i === 0) lua.lua_pushlstring(ms.L, ms.src.slice(s, e), e - s); /* add whole match */
        else lauxlib.luaL_error(ms.L, lua.to_luastring("invalid capture index %%%d"), i + 1);
    } else {
        var l = ms.capture[i].len;
        if (l === CAP_UNFINISHED) lauxlib.luaL_error(ms.L, lua.to_luastring("unfinished capture", true));
        if (l === CAP_POSITION) lua.lua_pushinteger(ms.L, ms.capture[i].init - ms.src_init + 1);else lua.lua_pushlstring(ms.L, ms.src.slice(ms.capture[i].init), l);
    }
};

var push_captures = function push_captures(ms, s, e) {
    var nlevels = ms.level === 0 && ms.src.slice(s) ? 1 : ms.level;
    lauxlib.luaL_checkstack(ms.L, nlevels, lua.to_luastring("too many catpures", true));
    for (var i = 0; i < nlevels; i++) {
        push_onecapture(ms, i, s, e);
    }return nlevels; /* number of strings pushed */
};

var nospecials = function nospecials(p, l) {
    var upto = 0;
    do {
        var special = false;
        var supto = p.slice(upto);
        for (var i = 0; i < SPECIALS.length; i++) {
            if (supto.indexOf(SPECIALS[i]) > -1) {
                special = true;
                break;
            }
        }

        if (special) return false; /* pattern has a special character */
        upto = upto + 1; /* may have more after \0 */
    } while (upto <= l);
    return true; /* no special chars found */
};

var prepstate = function prepstate(ms, L, s, ls, p, lp) {
    ms.L = L;
    ms.matchdepth = MAXCCALLS;
    ms.src = s;
    ms.src_init = 0;
    ms.src_end = ls;
    ms.p = p;
    ms.p_end = lp;
};

var reprepstate = function reprepstate(ms) {
    ms.level = 0;
    assert(ms.matchdepth === MAXCCALLS);
};

var find_subarray = function find_subarray(arr, subarr, from_index) {
    var i = from_index >>> 0,
        sl = subarr.length,
        l = arr.length + 1 - sl;

    loop: for (; i < l; i++) {
        for (var j = 0; j < sl; j++) {
            if (arr[i + j] !== subarr[j]) continue loop;
        }return i;
    }
    return -1;
};

var str_find_aux = function str_find_aux(L, find) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var p = lauxlib.luaL_checkstring(L, 2);
    var ls = s.length;
    var lp = p.length;
    var init = posrelat(lauxlib.luaL_optinteger(L, 3, 1), ls);
    if (init < 1) init = 1;else if (init > ls + 1) {
        /* start after string's end? */
        lua.lua_pushnil(L); /* cannot find anything */
        return 1;
    }
    /* explicit request or no special characters? */
    if (find && (lua.lua_toboolean(L, 4) || nospecials(p, lp))) {
        /* do a plain search */
        var f = find_subarray(s.slice(init - 1), p, 0);
        if (f > -1) {
            lua.lua_pushinteger(L, init + f);
            lua.lua_pushinteger(L, init + f + lp - 1);
            return 2;
        }
    } else {
        var ms = new MatchState(L);
        var s1 = init - 1;
        var anchor = p[0] === '^'.charCodeAt(0);
        if (anchor) {
            p = p.slice(1);lp--; /* skip anchor character */
        }
        prepstate(ms, L, s, ls, p, lp);
        do {
            var res = void 0;
            reprepstate(ms);
            if ((res = match(ms, s1, 0)) !== null) {
                if (find) {
                    lua.lua_pushinteger(L, s1 + 1); /* start */
                    lua.lua_pushinteger(L, res); /* end */
                    return push_captures(ms, null, 0) + 2;
                } else return push_captures(ms, s1, res);
            }
        } while (s1++ < ms.src_end && !anchor);
    }
    lua.lua_pushnil(L); /* not found */
    return 1;
};

var str_find = function str_find(L) {
    return str_find_aux(L, 1);
};

var str_match = function str_match(L) {
    return str_find_aux(L, 0);
};

/* state for 'gmatch' */

var GMatchState = function GMatchState() {
    _classCallCheck(this, GMatchState);

    this.src = NaN; /* current position */
    this.p = NaN; /* pattern */
    this.lastmatch = NaN; /* end of last match */
    this.ms = new MatchState(); /* match state */
};

var gmatch_aux = function gmatch_aux(L) {
    var gm = lua.lua_touserdata(L, lua.lua_upvalueindex(3));
    gm.ms.L = L;
    for (var src = gm.src; src <= gm.ms.src_end; src++) {
        reprepstate(gm.ms);
        var e = void 0;
        if ((e = match(gm.ms, src, gm.p)) !== null && e !== gm.lastmatch) {
            gm.src = gm.lastmatch = e;
            return push_captures(gm.ms, src, e);
        }
    }
    return 0; /* not found */
};

var str_gmatch = function str_gmatch(L) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var p = lauxlib.luaL_checkstring(L, 2);
    var ls = s.length;
    var lp = p.length;
    lua.lua_settop(L, 2); /* keep them on closure to avoid being collected */
    var gm = new GMatchState();
    lua.lua_pushlightuserdata(L, gm);
    prepstate(gm.ms, L, s, ls, p, lp);
    gm.src = 0;
    gm.p = 0;
    gm.lastmatch = null;
    lua.lua_pushcclosure(L, gmatch_aux, 3);
    return 1;
};

var add_s = function add_s(ms, b, s, e) {
    var L = ms.L;
    var news = lua.lua_tostring(L, 3);
    var l = news.length;
    for (var i = 0; i < l; i++) {
        if (news[i] !== L_ESC) lauxlib.luaL_addchar(b, news[i]);else {
            i++; /* skip ESC */
            if (!isdigit(news[i])) {
                if (news[i] !== L_ESC) lauxlib.luaL_error(L, lua.to_luastring("invalid use of '%c' in replacement string"), L_ESC);
                lauxlib.luaL_addchar(b, news[i]);
            } else if (news[i] === '0'.charCodeAt(0)) lauxlib.luaL_addlstring(b, ms.src.slice(s), e - s);else {
                push_onecapture(ms, news[i] - '1'.charCodeAt(0), s, e);
                lauxlib.luaL_tolstring(L, -1);
                lua.lua_remove(L, -2); /* remove original value */
                lauxlib.luaL_addvalue(b); /* add capture to accumulated result */
            }
        }
    }
};

var add_value = function add_value(ms, b, s, e, tr) {
    var L = ms.L;
    switch (tr) {
        case lua.LUA_TFUNCTION:
            {
                lua.lua_pushvalue(L, 3);
                var n = push_captures(ms, s, e);
                lua.lua_call(L, n, 1);
                break;
            }
        case lua.LUA_TTABLE:
            {
                push_onecapture(ms, 0, s, e);
                lua.lua_gettable(L, 3);
                break;
            }
        default:
            {
                /* LUA_TNUMBER or LUA_TSTRING */
                add_s(ms, b, s, e);
                return;
            }
    }
    if (!lua.lua_toboolean(L, -1)) {
        /* nil or false? */
        lua.lua_pop(L, 1);
        lua.lua_pushlstring(L, ms.src.slice(s, e), e - s); /* keep original text */
    } else if (!lua.lua_isstring(L, -1)) lauxlib.luaL_error(L, lua.to_luastring("invalid replacement value (a %s)"), lauxlib.luaL_typename(L, -1));
    lauxlib.luaL_addvalue(b); /* add result to accumulator */
};

var str_gsub = function str_gsub(L) {
    var src = lauxlib.luaL_checkstring(L, 1); /* subject */
    var srcl = src.length;
    var p = lauxlib.luaL_checkstring(L, 2); /* pattern */
    var lp = p.length;
    var lastmatch = null; /* end of last match */
    var tr = lua.lua_type(L, 3); /* replacement type */
    var max_s = lauxlib.luaL_optinteger(L, 4, srcl + 1); /* max replacements */
    var anchor = p[0] === '^'.charCodeAt(0);
    var n = 0; /* replacement count */
    var ms = new MatchState(L);
    var b = new lauxlib.luaL_Buffer();
    lauxlib.luaL_argcheck(L, tr === lua.LUA_TNUMBER || tr === lua.LUA_TSTRING || tr === lua.LUA_TFUNCTION || tr === lua.LUA_TTABLE, 3, lua.to_luastring("string/function/table expected", true));
    lauxlib.luaL_buffinit(L, b);
    if (anchor) {
        p = p.slice(1);lp--; /* skip anchor character */
    }
    prepstate(ms, L, src, srcl, p, lp);
    src = 0;p = 0;
    while (n < max_s) {
        var e = void 0;
        reprepstate(ms);
        if ((e = match(ms, src, p)) !== null && e !== lastmatch) {
            /* match? */
            n++;
            add_value(ms, b, src, e, tr); /* add replacement to buffer */
            src = lastmatch = e;
        } else if (src < ms.src_end) /* otherwise, skip one character */
            lauxlib.luaL_addchar(b, ms.src[src++]);else break; /* end of subject */
        if (anchor) break;
    }
    lauxlib.luaL_addlstring(b, ms.src.slice(src), ms.src_end - src);
    lauxlib.luaL_pushresult(b);
    lua.lua_pushinteger(L, n); /* number of substitutions */
    return 2;
};

var strlib = {
    "byte": str_byte,
    "char": str_char,
    "dump": str_dump,
    "find": str_find,
    "format": str_format,
    "gmatch": str_gmatch,
    "gsub": str_gsub,
    "len": str_len,
    "lower": str_lower,
    "match": str_match,
    "pack": str_pack,
    "packsize": str_packsize,
    "rep": str_rep,
    "reverse": str_reverse,
    "sub": str_sub,
    "unpack": str_unpack,
    "upper": str_upper
};

var createmetatable = function createmetatable(L) {
    lua.lua_createtable(L, 0, 1); /* table to be metatable for strings */
    lua.lua_pushliteral(L, ""); /* dummy string */
    lua.lua_pushvalue(L, -2); /* copy table */
    lua.lua_setmetatable(L, -2); /* set table as metatable for strings */
    lua.lua_pop(L, 1); /* pop dummy string */
    lua.lua_pushvalue(L, -2); /* get string library */
    lua.lua_setfield(L, -2, lua.to_luastring("__index", true)); /* metatable.__index = string */
    lua.lua_pop(L, 1); /* pop metatable */
};

var luaopen_string = function luaopen_string(L) {
    lauxlib.luaL_newlib(L, strlib);
    createmetatable(L);
    return 1;
};

module.exports.luaopen_string = luaopen_string;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(0);

var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);
var llimit = __webpack_require__(4);

/*
** Operations that an object must define to mimic a table
** (some functions only need some of them)
*/
var TAB_R = 1; /* read */
var TAB_W = 2; /* write */
var TAB_L = 4; /* length */
var TAB_RW = TAB_R | TAB_W; /* read/write */

var checkfield = function checkfield(L, key, n) {
    lua.lua_pushstring(L, key);
    return lua.lua_rawget(L, -n) !== lua.LUA_TNIL;
};

/*
** Check that 'arg' either is a table or can behave like one (that is,
** has a metatable with the required metamethods)
*/
var checktab = function checktab(L, arg, what) {
    if (lua.lua_type(L, arg) !== lua.LUA_TTABLE) {
        /* is it not a table? */
        var n = 1;
        if (lua.lua_getmetatable(L, arg) && ( /* must have metatable */
        !(what & TAB_R) || checkfield(L, lua.to_luastring("__index", true), ++n)) && (!(what & TAB_W) || checkfield(L, lua.to_luastring("__newindex", true), ++n)) && (!(what & TAB_L) || checkfield(L, lua.to_luastring("__len", true), ++n))) {
            lua.lua_pop(L, n); /* pop metatable and tested metamethods */
        } else lauxlib.luaL_checktype(L, arg, lua.LUA_TTABLE); /* force an error */
    }
};

var aux_getn = function aux_getn(L, n, w) {
    checktab(L, n, w | TAB_L);
    return lauxlib.luaL_len(L, n);
};

var addfield = function addfield(L, b, i) {
    lua.lua_geti(L, 1, i);
    if (!lua.lua_isstring(L, -1)) lauxlib.luaL_error(L, lua.to_luastring("invalid value (%s) at index %d in table for 'concat'"), lauxlib.luaL_typename(L, -1), i);

    lauxlib.luaL_addvalue(b);
};

var tinsert = function tinsert(L) {
    var e = aux_getn(L, 1, TAB_RW) + 1; /* first empty element */
    var pos = void 0;
    switch (lua.lua_gettop(L)) {
        case 2:
            pos = e;
            break;
        case 3:
            {
                pos = lauxlib.luaL_checkinteger(L, 2); /* 2nd argument is the position */
                lauxlib.luaL_argcheck(L, 1 <= pos && pos <= e, 2, lua.to_luastring("position out of bounds", true));
                for (var i = e; i > pos; i--) {
                    /* move up elements */
                    lua.lua_geti(L, 1, i - 1);
                    lua.lua_seti(L, 1, i); /* t[i] = t[i - 1] */
                }
                break;
            }
        default:
            {
                return lauxlib.luaL_error(L, lua.to_luastring("wrong number of arguments to 'insert'", true));
            }
    }

    lua.lua_seti(L, 1, pos); /* t[pos] = v */
    return 0;
};

var tremove = function tremove(L) {
    var size = aux_getn(L, 1, TAB_RW);
    var pos = lauxlib.luaL_optinteger(L, 2, size);
    if (pos !== size) /* validate 'pos' if given */
        lauxlib.luaL_argcheck(L, 1 <= pos && pos <= size + 1, 1, lua.to_luastring("position out of bounds", true));
    lua.lua_geti(L, 1, pos); /* result = t[pos] */
    for (; pos < size; pos++) {
        lua.lua_geti(L, 1, pos + 1);
        lua.lua_seti(L, 1, pos); /* t[pos] = t[pos + 1] */
    }
    lua.lua_pushnil(L);
    lua.lua_seti(L, 1, pos); /* t[pos] = nil */
    return 1;
};

/*
** Copy elements (1[f], ..., 1[e]) into (tt[t], tt[t+1], ...). Whenever
** possible, copy in increasing order, which is better for rehashing.
** "possible" means destination after original range, or smaller
** than origin, or copying to another table.
*/
var tmove = function tmove(L) {
    var f = lauxlib.luaL_checkinteger(L, 2);
    var e = lauxlib.luaL_checkinteger(L, 3);
    var t = lauxlib.luaL_checkinteger(L, 4);
    var tt = !lua.lua_isnoneornil(L, 5) ? 5 : 1; /* destination table */
    checktab(L, 1, TAB_R);
    checktab(L, tt, TAB_W);
    if (e >= f) {
        /* otherwise, nothing to move */
        lauxlib.luaL_argcheck(L, f > 0 || e < llimit.LUA_MAXINTEGER + f, 3, lua.to_luastring("too many elements to move", true));
        var n = e - f + 1; /* number of elements to move */
        lauxlib.luaL_argcheck(L, t <= llimit.LUA_MAXINTEGER - n + 1, 4, lua.to_luastring("destination wrap around", true));

        if (t > e || t <= f || tt !== 1 && lua.lua_compare(L, 1, tt, lua.LUA_OPEQ) !== 1) {
            for (var i = 0; i < n; i++) {
                lua.lua_geti(L, 1, f + i);
                lua.lua_seti(L, tt, t + i);
            }
        } else {
            for (var _i = n - 1; _i >= 0; _i--) {
                lua.lua_geti(L, 1, f + _i);
                lua.lua_seti(L, tt, t + _i);
            }
        }
    }

    lua.lua_pushvalue(L, tt); /* return destination table */
    return 1;
};

var tconcat = function tconcat(L) {
    var last = aux_getn(L, 1, TAB_R);
    var sep = lauxlib.luaL_optlstring(L, 2, []);
    var i = lauxlib.luaL_optinteger(L, 3, 1);
    last = lauxlib.luaL_optinteger(L, 4, last);

    var b = new lauxlib.luaL_Buffer();
    lauxlib.luaL_buffinit(L, b);

    for (; i < last; i++) {
        addfield(L, b, i);
        lauxlib.luaL_addlstring(b, sep);
    }

    if (i === last) addfield(L, b, i);

    lauxlib.luaL_pushresult(b);

    return 1;
};

var pack = function pack(L) {
    var n = lua.lua_gettop(L); /* number of elements to pack */
    lua.lua_createtable(L, n, 1); /* create result table */
    lua.lua_insert(L, 1); /* put it at index 1 */
    for (var i = n; i >= 1; i--) {
        /* assign elements */
        lua.lua_seti(L, 1, i);
    }lua.lua_pushinteger(L, n);
    lua.lua_setfield(L, 1, ["n".charCodeAt(0)]); /* t.n = number of elements */
    return 1; /* return table */
};

var unpack = function unpack(L) {
    var i = lauxlib.luaL_optinteger(L, 2, 1);
    var e = lauxlib.luaL_opt(L, lauxlib.luaL_checkinteger, 3, lauxlib.luaL_len(L, 1));
    if (i > e) return 0; /* empty range */
    var n = e - i; /* number of elements minus 1 (avoid overflows) */
    if (n >= llimit.MAX_INT || !lua.lua_checkstack(L, ++n)) return lauxlib.luaL_error(L, lua.to_luastring("too many results to unpack", true));
    for (; i < e; i++) {
        /* push arg[i..e - 1] (to avoid overflows) */
        lua.lua_geti(L, 1, i);
    }lua.lua_geti(L, 1, e); /* push last element */
    return n;
};

var l_randomizePivot = function l_randomizePivot() {
    return Math.floor(Math.random() * 1 << 32);
};

var RANLIMIT = 100;

var set2 = function set2(L, i, j) {
    lua.lua_seti(L, 1, i);
    lua.lua_seti(L, 1, j);
};

var sort_comp = function sort_comp(L, a, b) {
    if (lua.lua_isnil(L, 2)) /* no function? */
        return lua.lua_compare(L, a, b, lua.LUA_OPLT); /* a < b */
    else {
            /* function */
            lua.lua_pushvalue(L, 2); /* push function */
            lua.lua_pushvalue(L, a - 1); /* -1 to compensate function */
            lua.lua_pushvalue(L, b - 2); /* -2 to compensate function and 'a' */
            lua.lua_call(L, 2, 1); /* call function */
            var res = lua.lua_toboolean(L, -1); /* get result */
            lua.lua_pop(L, 1); /* pop result */
            return res;
        }
};

var partition = function partition(L, lo, up) {
    var i = lo; /* will be incremented before first use */
    var j = up - 1; /* will be decremented before first use */
    /* loop invariant: a[lo .. i] <= P <= a[j .. up] */
    for (;;) {
        /* next loop: repeat ++i while a[i] < P */
        while (lua.lua_geti(L, 1, ++i), sort_comp(L, -1, -2)) {
            if (i == up - 1) /* a[i] < P  but a[up - 1] == P  ?? */
                lauxlib.luaL_error(L, lua.to_luastring("invalid order function for sorting"));
            lua.lua_pop(L, 1); /* remove a[i] */
        }
        /* after the loop, a[i] >= P and a[lo .. i - 1] < P */
        /* next loop: repeat --j while P < a[j] */
        while (lua.lua_geti(L, 1, --j), sort_comp(L, -3, -1)) {
            if (j < i) /* j < i  but  a[j] > P ?? */
                lauxlib.luaL_error(L, lua.to_luastring("invalid order function for sorting"));
            lua.lua_pop(L, 1); /* remove a[j] */
        }
        /* after the loop, a[j] <= P and a[j + 1 .. up] >= P */
        if (j < i) {
            /* no elements out of place? */
            /* a[lo .. i - 1] <= P <= a[j + 1 .. i .. up] */
            lua.lua_pop(L, 1); /* pop a[j] */
            /* swap pivot (a[up - 1]) with a[i] to satisfy pos-condition */
            set2(L, up - 1, i);
            return i;
        }
        /* otherwise, swap a[i] - a[j] to restore invariant and repeat */
        set2(L, i, j);
    }
};

var choosePivot = function choosePivot(lo, up, rnd) {
    var r4 = Math.floor((up - lo) / 4); /* range/4 */
    var p = rnd % (r4 * 2) + (lo + r4);
    assert(lo + r4 <= p && p <= up - r4);
    return p;
};

var auxsort = function auxsort(L, lo, up, rnd) {
    while (lo < up) {
        /* loop for tail recursion */
        /* sort elements 'lo', 'p', and 'up' */
        lua.lua_geti(L, 1, lo);
        lua.lua_geti(L, 1, up);
        if (sort_comp(L, -1, -2)) /* a[up] < a[lo]? */
            set2(L, lo, up); /* swap a[lo] - a[up] */
        else lua.lua_pop(L, 2); /* remove both values */
        if (up - lo == 1) /* only 2 elements? */
            return; /* already sorted */
        var p = void 0; /* Pivot index */
        if (up - lo < RANLIMIT || rnd === 0) /* small interval or no randomize? */
            p = Math.floor((lo + up) / 2); /* middle element is a good pivot */
        else /* for larger intervals, it is worth a random pivot */
            p = choosePivot(lo, up, rnd);
        lua.lua_geti(L, 1, p);
        lua.lua_geti(L, 1, lo);
        if (sort_comp(L, -2, -1)) /* a[p] < a[lo]? */
            set2(L, p, lo); /* swap a[p] - a[lo] */
        else {
                lua.lua_pop(L, 1); /* remove a[lo] */
                lua.lua_geti(L, 1, up);
                if (sort_comp(L, -1, -2)) /* a[up] < a[p]? */
                    set2(L, p, up); /* swap a[up] - a[p] */
                else lua.lua_pop(L, 2);
            }
        if (up - lo == 2) /* only 3 elements? */
            return; /* already sorted */
        lua.lua_geti(L, 1, p); /* get middle element (Pivot) */
        lua.lua_pushvalue(L, -1); /* push Pivot */
        lua.lua_geti(L, 1, up - 1); /* push a[up - 1] */
        set2(L, p, up - 1); /* swap Pivot (a[p]) with a[up - 1] */
        p = partition(L, lo, up);
        var n = void 0;
        /* a[lo .. p - 1] <= a[p] == P <= a[p + 1 .. up] */
        if (p - lo < up - p) {
            /* lower interval is smaller? */
            auxsort(L, lo, p - 1, rnd); /* call recursively for lower interval */
            n = p - lo; /* size of smaller interval */
            lo = p + 1; /* tail call for [p + 1 .. up] (upper interval) */
        } else {
            auxsort(L, p + 1, up, rnd); /* call recursively for upper interval */
            n = up - p; /* size of smaller interval */
            up = p - 1; /* tail call for [lo .. p - 1]  (lower interval) */
        }
        if ((up - lo) / 128 > n) /* partition too imbalanced? */
            rnd = l_randomizePivot(); /* try a new randomization */
    } /* tail call auxsort(L, lo, up, rnd) */
};

var sort = function sort(L) {
    var n = aux_getn(L, 1, TAB_RW);
    if (n > 1) {
        /* non-trivial interval? */
        lauxlib.luaL_argcheck(L, n < llimit.MAX_INT, 1, lua.to_luastring("array too big", true));
        if (!lua.lua_isnoneornil(L, 2)) /* is there a 2nd argument? */
            lauxlib.luaL_checktype(L, 2, lua.LUA_TFUNCTION); /* must be a function */
        lua.lua_settop(L, 2); /* make sure there are two arguments */
        auxsort(L, 1, n, 0);
    }
    return 0;
};

var tab_funcs = {
    "concat": tconcat,
    "insert": tinsert,
    "move": tmove,
    "pack": pack,
    "remove": tremove,
    "sort": sort,
    "unpack": unpack
};

var luaopen_table = function luaopen_table(L) {
    lauxlib.luaL_newlib(L, tab_funcs);
    return 1;
};

module.exports.luaopen_table = luaopen_table;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);
var llimit = __webpack_require__(4);

var MAXUNICODE = 0x10FFFF;

var iscont = function iscont(p) {
    var c = p & 0xC0;
    return c === 0x80;
};

/* translate a relative string position: negative means back from end */
var u_posrelat = function u_posrelat(pos, len) {
    if (pos >= 0) return pos;else if (0 - pos > len) return 0;else return len + pos + 1;
};

/*
** Decode one UTF-8 sequence, returning NULL if byte sequence is invalid.
*/
var limits = [0xFF, 0x7F, 0x7FF, 0xFFFF];
var utf8_decode = function utf8_decode(s, pos) {
    var c = s[pos];
    var res = 0; /* final result */
    if (c < 0x80) /* ascii? */
        res = c;else {
        var count = 0; /* to count number of continuation bytes */
        while (c & 0x40) {
            /* still have continuation bytes? */
            var cc = s[pos + ++count]; /* read next byte */
            if ((cc & 0xC0) !== 0x80) /* not a continuation byte? */
                return null; /* invalid byte sequence */
            res = res << 6 | cc & 0x3F; /* add lower 6 bits from cont. byte */
            c <<= 1; /* to test next bit */
        }
        res |= (c & 0x7F) << count * 5; /* add first byte */
        if (count > 3 || res > MAXUNICODE || res <= limits[count]) return null; /* invalid byte sequence */
        pos += count; /* skip continuation bytes read */
    }

    return {
        code: res,
        pos: pos + 1
    };
};

/*
** utf8len(s [, i [, j]]) --> number of characters that start in the
** range [i,j], or nil + current position if 's' is not well formed in
** that interval
*/
var utflen = function utflen(L) {
    var n = 0;
    var s = lauxlib.luaL_checkstring(L, 1);
    var len = s.length;
    var posi = u_posrelat(lauxlib.luaL_optinteger(L, 2, 1), len);
    var posj = u_posrelat(lauxlib.luaL_optinteger(L, 3, -1), len);

    lauxlib.luaL_argcheck(L, 1 <= posi && --posi <= len, 2, lua.to_luastring("initial position out of string"));
    lauxlib.luaL_argcheck(L, --posj < len, 3, lua.to_luastring("final position out of string"));

    while (posi <= posj) {
        var dec = utf8_decode(s, posi);
        if (dec === null) {
            /* conversion error? */
            lua.lua_pushnil(L); /* return nil ... */
            lua.lua_pushinteger(L, posi + 1); /* ... and current position */
            return 2;
        }
        posi = dec.pos;
        n++;
    }
    lua.lua_pushinteger(L, n);
    return 1;
};

var pushutfchar = function pushutfchar(L, arg) {
    var code = lauxlib.luaL_checkinteger(L, arg);
    lauxlib.luaL_argcheck(L, 0 <= code && code <= MAXUNICODE, arg, lua.to_luastring("value out of range", true));
    lua.lua_pushstring(L, lua.to_luastring(String.fromCodePoint(code)));
};

/*
** utfchar(n1, n2, ...)  -> char(n1)..char(n2)...
*/
var utfchar = function utfchar(L) {
    var n = lua.lua_gettop(L); /* number of arguments */
    if (n === 1) /* optimize common case of single char */
        pushutfchar(L, 1);else {
        var b = new lauxlib.luaL_Buffer();
        lauxlib.luaL_buffinit(L, b);
        for (var i = 1; i <= n; i++) {
            pushutfchar(L, i);
            lauxlib.luaL_addvalue(b);
        }
        lauxlib.luaL_pushresult(b);
    }
    return 1;
};

/*
** offset(s, n, [i])  -> index where n-th character counting from
**   position 'i' starts; 0 means character at 'i'.
*/
var byteoffset = function byteoffset(L) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var n = lauxlib.luaL_checkinteger(L, 2);
    var posi = n >= 0 ? 1 : s.length + 1;
    posi = u_posrelat(lauxlib.luaL_optinteger(L, 3, posi), s.length);

    lauxlib.luaL_argcheck(L, 1 <= posi && --posi <= s.length, 3, lua.to_luastring("position out of range", true));

    if (n === 0) {
        /* find beginning of current byte sequence */
        while (posi > 0 && iscont(s[posi])) {
            posi--;
        }
    } else {
        if (iscont(s[posi])) lauxlib.luaL_error(L, lua.to_luastring("initial position is a continuation byte", true));

        if (n < 0) {
            while (n < 0 && posi > 0) {
                /* move back */
                do {
                    /* find beginning of previous character */
                    posi--;
                } while (posi > 0 && iscont(s[posi]));
                n++;
            }
        } else {
            n--; /* do not move for 1st character */
            while (n > 0 && posi < s.length) {
                do {
                    /* find beginning of next character */
                    posi++;
                } while (iscont(s[posi])); /* (cannot pass final '\0') */
                n--;
            }
        }
    }

    if (n === 0) /* did it find given character? */
        lua.lua_pushinteger(L, posi + 1);else /* no such character */
        lua.lua_pushnil(L);

    return 1;
};

/*
** codepoint(s, [i, [j]])  -> returns codepoints for all characters
** that start in the range [i,j]
*/
var codepoint = function codepoint(L) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var posi = u_posrelat(lauxlib.luaL_optinteger(L, 2, 1), s.length);
    var pose = u_posrelat(lauxlib.luaL_optinteger(L, 3, posi), s.length);

    lauxlib.luaL_argcheck(L, posi >= 1, 2, lua.to_luastring("out of range", true));
    lauxlib.luaL_argcheck(L, pose <= s.length, 3, lua.to_luastring("out of range", true));

    if (posi > pose) return 0; /* empty interval; return no values */
    if (pose - posi >= llimit.MAX_INT) return lauxlib.luaL_error(L, lua.to_luastring("string slice too long", true));
    var n = pose - posi + 1;
    lauxlib.luaL_checkstack(L, n, lua.to_luastring("string slice too long", true));
    n = 0;
    for (posi -= 1; posi < pose;) {
        var dec = utf8_decode(s, posi);
        if (dec === null) return lauxlib.luaL_error(L, lua.to_luastring("invalid UTF-8 code", true));
        lua.lua_pushinteger(L, dec.code);
        posi = dec.pos;
        n++;
    }
    return n;
};

var iter_aux = function iter_aux(L) {
    var s = lauxlib.luaL_checkstring(L, 1);
    var len = s.length;
    var n = lua.lua_tointeger(L, 2) - 1;

    if (n < 0) /* first iteration? */
        n = 0; /* start from here */
    else if (n < len) {
            n++; /* skip current byte */
            while (iscont(s[n])) {
                n++;
            } /* and its continuations */
        }

    if (n >= len) return 0; /* no more codepoints */
    else {
            var dec = utf8_decode(s, n);
            if (dec === null || iscont(s[dec.pos])) return lauxlib.luaL_error(L, lua.to_luastring("invalid UTF-8 code", true));
            lua.lua_pushinteger(L, n + 1);
            lua.lua_pushinteger(L, dec.code);
            return 2;
        }
};

var iter_codes = function iter_codes(L) {
    lauxlib.luaL_checkstring(L, 1);
    lua.lua_pushcfunction(L, iter_aux);
    lua.lua_pushvalue(L, 1);
    lua.lua_pushinteger(L, 0);
    return 3;
};

var funcs = {
    "char": utfchar,
    "codepoint": codepoint,
    "codes": iter_codes,
    "len": utflen,
    "offset": byteoffset
};

/* pattern to match a single UTF-8 character */
var UTF8PATT = [91, 0, 45, 127, 194, 45, 244, 93, 91, 128, 45, 191, 93, 42];

var luaopen_utf8 = function luaopen_utf8(L) {
    lauxlib.luaL_newlib(L, funcs);
    lua.lua_pushstring(L, UTF8PATT);
    lua.lua_setfield(L, -2, lua.to_luastring("charpattern", true));
    return 1;
};

module.exports.luaopen_utf8 = luaopen_utf8;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(0);

var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);

/*
** If L1 != L, L1 can be in any state, and therefore there are no
** guarantees about its stack space; any push in L1 must be
** checked.
*/
var checkstack = function checkstack(L, L1, n) {
    if (L !== L1 && !lua.lua_checkstack(L1, n)) lauxlib.luaL_error(L, lua.to_luastring("stack overflow", true));
};

var db_getregistry = function db_getregistry(L) {
    lua.lua_pushvalue(L, lua.LUA_REGISTRYINDEX);
    return 1;
};

var db_getmetatable = function db_getmetatable(L) {
    lauxlib.luaL_checkany(L, 1);
    if (!lua.lua_getmetatable(L, 1)) {
        lua.lua_pushnil(L); /* no metatable */
    }
    return 1;
};

var db_setmetatable = function db_setmetatable(L) {
    var t = lua.lua_type(L, 2);
    lauxlib.luaL_argcheck(L, t == lua.LUA_TNIL || t == lua.LUA_TTABLE, 2, lua.to_luastring("nil or table expected", true));
    lua.lua_settop(L, 2);
    lua.lua_setmetatable(L, 1);
    return 1; /* return 1st argument */
};

var db_getuservalue = function db_getuservalue(L) {
    if (lua.lua_type(L, 1) !== lua.LUA_TUSERDATA) lua.lua_pushnil(L);else lua.lua_getuservalue(L, 1);
    return 1;
};

var db_setuservalue = function db_setuservalue(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TUSERDATA);
    lauxlib.luaL_checkany(L, 2);
    lua.lua_settop(L, 2);
    lua.lua_setuservalue(L, 1);
    return 1;
};

/*
** Auxiliary function used by several library functions: check for
** an optional thread as function's first argument and set 'arg' with
** 1 if this argument is present (so that functions can skip it to
** access their other arguments)
*/
var getthread = function getthread(L) {
    if (lua.lua_isthread(L, 1)) {
        return {
            arg: 1,
            thread: lua.lua_tothread(L, 1)
        };
    } else {
        return {
            arg: 0,
            thread: L
        }; /* function will operate over current thread */
    }
};

/*
** Variations of 'lua_settable', used by 'db_getinfo' to put results
** from 'lua_getinfo' into result table. Key is always a string;
** value can be a string, an int, or a boolean.
*/
var settabss = function settabss(L, k, v) {
    lua.lua_pushstring(L, v);
    lua.lua_setfield(L, -2, k);
};

var settabsi = function settabsi(L, k, v) {
    lua.lua_pushinteger(L, v);
    lua.lua_setfield(L, -2, k);
};

var settabsb = function settabsb(L, k, v) {
    lua.lua_pushboolean(L, v);
    lua.lua_setfield(L, -2, k);
};

/*
** In function 'db_getinfo', the call to 'lua_getinfo' may push
** results on the stack; later it creates the result table to put
** these objects. Function 'treatstackoption' puts the result from
** 'lua_getinfo' on top of the result table so that it can call
** 'lua_setfield'.
*/
var treatstackoption = function treatstackoption(L, L1, fname) {
    if (L == L1) lua.lua_rotate(L, -2, 1); /* exchange object and table */
    else lua.lua_xmove(L1, L, 1); /* move object to the "main" stack */
    lua.lua_setfield(L, -2, fname); /* put object into table */
};

/*
** Calls 'lua_getinfo' and collects all results in a new table.
** L1 needs stack space for an optional input (function) plus
** two optional outputs (function and line table) from function
** 'lua_getinfo'.
*/
var db_getinfo = function db_getinfo(L) {
    var ar = new lua.lua_Debug();
    var thread = getthread(L);
    var arg = thread.arg;
    var L1 = thread.thread;
    var options = lauxlib.luaL_optstring(L, arg + 2, lua.to_luastring("flnStu", true));
    checkstack(L, L1, 3);
    if (lua.lua_isfunction(L, arg + 1)) {
        /* info about a function? */
        options = lua.lua_pushfstring(L, lua.to_luastring(">%s"), options); /* add '>' to 'options' */
        lua.lua_pushvalue(L, arg + 1); /* move function to 'L1' stack */
        lua.lua_xmove(L, L1, 1);
    } else {
        /* stack level */
        if (!lua.lua_getstack(L1, lauxlib.luaL_checkinteger(L, arg + 1), ar)) {
            lua.lua_pushnil(L); /* level out of range */
            return 1;
        }
    }

    if (!lua.lua_getinfo(L1, options, ar)) lauxlib.luaL_argerror(L, arg + 2, lua.to_luastring("invalid option", true));
    lua.lua_newtable(L); /* table to collect results */
    if (options.indexOf('S'.charCodeAt(0)) > -1) {
        settabss(L, lua.to_luastring("source", true), ar.source);
        settabss(L, lua.to_luastring("short_src", true), ar.short_src);
        settabsi(L, lua.to_luastring("linedefined", true), ar.linedefined);
        settabsi(L, lua.to_luastring("lastlinedefined", true), ar.lastlinedefined);
        settabss(L, lua.to_luastring("what", true), ar.what);
    }
    if (options.indexOf('l'.charCodeAt(0)) > -1) settabsi(L, lua.to_luastring("currentline", true), ar.currentline);
    if (options.indexOf('u'.charCodeAt(0)) > -1) {
        settabsi(L, lua.to_luastring("nups", true), ar.nups);
        settabsi(L, lua.to_luastring("nparams", true), ar.nparams);
        settabsb(L, lua.to_luastring("isvararg", true), ar.isvararg);
    }
    if (options.indexOf('n'.charCodeAt(0)) > -1) {
        settabss(L, lua.to_luastring("name", true), ar.name);
        settabss(L, lua.to_luastring("namewhat", true), ar.namewhat);
    }
    if (options.indexOf('t'.charCodeAt(0)) > -1) settabsb(L, lua.to_luastring("istailcall", true), ar.istailcall);
    if (options.indexOf('L'.charCodeAt(0)) > -1) treatstackoption(L, L1, lua.to_luastring("activelines", true));
    if (options.indexOf('f'.charCodeAt(0)) > -1) treatstackoption(L, L1, lua.to_luastring("func", true));
    return 1; /* return table */
};

var db_getlocal = function db_getlocal(L) {
    var thread = getthread(L);
    var L1 = thread.thread;
    var arg = thread.arg;
    var ar = new lua.lua_Debug();
    var nvar = lauxlib.luaL_checkinteger(L, arg + 2); /* local-variable index */
    if (lua.lua_isfunction(L, arg + 1)) {
        lua.lua_pushvalue(L, arg + 1); /* push function */
        lua.lua_pushstring(L, lua.lua_getlocal(L, null, nvar)); /* push local name */
        return 1; /* return only name (there is no value) */
    } else {
        /* stack-level argument */
        var level = lauxlib.luaL_checkinteger(L, arg + 1);
        if (!lua.lua_getstack(L1, level, ar)) /* out of range? */
            return lauxlib.luaL_argerror(L, arg + 1, lua.to_luastring("level out of range", true));
        checkstack(L, L1, 1);
        var name = lua.lua_getlocal(L1, ar, nvar);
        if (name) {
            lua.lua_xmove(L1, L, 1); /* move local value */
            lua.lua_pushstring(L, name); /* push name */
            lua.lua_rotate(L, -2, 1); /* re-order */
            return 2;
        } else {
            lua.lua_pushnil(L); /* no name (nor value) */
            return 1;
        }
    }
};

var db_setlocal = function db_setlocal(L) {
    var thread = getthread(L);
    var L1 = thread.thread;
    var arg = thread.arg;
    var ar = new lua.lua_Debug();
    var level = lauxlib.luaL_checkinteger(L, arg + 1);
    var nvar = lauxlib.luaL_checkinteger(L, arg + 2);
    if (!lua.lua_getstack(L1, level, ar)) /* out of range? */
        return lauxlib.luaL_argerror(L, arg + 1, "level out of range");
    lauxlib.luaL_checkany(L, arg + 3);
    lua.lua_settop(L, arg + 3);
    checkstack(L, L1, 1);
    lua.lua_xmove(L, L1, 1);
    var name = lua.lua_setlocal(L1, ar, nvar);
    if (name === null) lua.lua_pop(L1, 1); /* pop value (if not popped by 'lua_setlocal') */
    lua.lua_pushstring(L, name);
    return 1;
};

/*
** get (if 'get' is true) or set an upvalue from a closure
*/
var auxupvalue = function auxupvalue(L, get) {
    var n = lauxlib.luaL_checkinteger(L, 2); /* upvalue index */
    lauxlib.luaL_checktype(L, 1, lua.LUA_TFUNCTION); /* closure */
    var name = get ? lua.lua_getupvalue(L, 1, n) : lua.lua_setupvalue(L, 1, n);
    if (name === null) return 0;
    lua.lua_pushstring(L, name);
    lua.lua_insert(L, -(get + 1)); /* no-op if get is false */
    return get + 1;
};

var db_getupvalue = function db_getupvalue(L) {
    return auxupvalue(L, 1);
};

var db_setupvalue = function db_setupvalue(L) {
    lauxlib.luaL_checkany(L, 3);
    return auxupvalue(L, 0);
};

/*
** Check whether a given upvalue from a given closure exists and
** returns its index
*/
var checkupval = function checkupval(L, argf, argnup) {
    var nup = lauxlib.luaL_checkinteger(L, argnup); /* upvalue index */
    lauxlib.luaL_checktype(L, argf, lua.LUA_TFUNCTION); /* closure */
    lauxlib.luaL_argcheck(L, lua.lua_getupvalue(L, argf, nup) !== null, argnup, lua.to_luastring("invalid upvalue index", true));
    return nup;
};

var db_upvalueid = function db_upvalueid(L) {
    var n = checkupval(L, 1, 2);
    lua.lua_pushlightuserdata(L, lua.lua_upvalueid(L, 1, n));
    return 1;
};

var db_upvaluejoin = function db_upvaluejoin(L) {
    var n1 = checkupval(L, 1, 2);
    var n2 = checkupval(L, 3, 4);
    lauxlib.luaL_argcheck(L, !lua.lua_iscfunction(L, 1), 1, lua.to_luastring("Lua function expected", true));
    lauxlib.luaL_argcheck(L, !lua.lua_iscfunction(L, 3), 3, lua.to_luastring("Lua function expected", true));
    lua.lua_upvaluejoin(L, 1, n1, 3, n2);
    return 0;
};

/*
** The hook table at registry[HOOKKEY] maps threads to their current
** hook function. (We only need the unique address of 'HOOKKEY'.)
*/
var HOOKKEY = lua.to_luastring("__hooks__", true);

var hooknames = ["call", "return", "line", "count", "tail call"].map(function (e) {
    return lua.to_luastring(e);
});

/*
** Call hook function registered at hook table for the current
** thread (if there is one)
*/
var hookf = function hookf(L, ar) {
    lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY);
    lua.lua_pushthread(L);
    if (lua.lua_rawget(L, -2) === lua.LUA_TFUNCTION) {
        /* is there a hook function? */
        lua.lua_pushstring(L, hooknames[ar.event]); /* push event name */
        if (ar.currentline >= 0) lua.lua_pushinteger(L, ar.currentline); /* push current line */
        else lua.lua_pushnil(L);
        assert(lua.lua_getinfo(L, ["l".charCodeAt(0), "S".charCodeAt(0)], ar));
        lua.lua_call(L, 2, 0); /* call hook function */
    }
};

/*
** Convert a string mask (for 'sethook') into a bit mask
*/
var makemask = function makemask(smask, count) {
    var mask = 0;
    if (smask.indexOf("c".charCodeAt(0)) > -1) mask |= lua.LUA_MASKCALL;
    if (smask.indexOf("r".charCodeAt(0)) > -1) mask |= lua.LUA_MASKRET;
    if (smask.indexOf("l".charCodeAt(0)) > -1) mask |= lua.LUA_MASKLINE;
    if (count > 0) mask |= lua.LUA_MASKCOUNT;
    return mask;
};

/*
** Convert a bit mask (for 'gethook') into a string mask
*/
var unmakemask = function unmakemask(mask, smask) {
    var i = 0;
    if (mask & lua.LUA_MASKCALL) smask[i++] = "c".charCodeAt(0);
    if (mask & lua.LUA_MASKRET) smask[i++] = "r".charCodeAt(0);
    if (mask & lua.LUA_MASKLINE) smask[i++] = "l".charCodeAt(0);
    return smask;
};

var db_sethook = function db_sethook(L) {
    var mask = void 0,
        count = void 0,
        func = void 0;
    var thread = getthread(L);
    var L1 = thread.thread;
    var arg = thread.arg;
    if (lua.lua_isnoneornil(L, arg + 1)) {
        /* no hook? */
        lua.lua_settop(L, arg + 1);
        func = null;mask = 0;count = 0; /* turn off hooks */
    } else {
        var smask = lauxlib.luaL_checkstring(L, arg + 2);
        lauxlib.luaL_checktype(L, arg + 1, lua.LUA_TFUNCTION);
        count = lauxlib.luaL_optinteger(L, arg + 3, 0);
        func = hookf;mask = makemask(smask, count);
    }
    if (lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY) === lua.LUA_TNIL) {
        lua.lua_createtable(L, 0, 2); /* create a hook table */
        lua.lua_pushvalue(L, -1);
        lua.lua_rawsetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY); /* set it in position */
        lua.lua_pushstring(L, ["k".charCodeAt(0)]);
        lua.lua_setfield(L, -2, lua.to_luastring("__mode", true)); /** hooktable.__mode = "k" */
        lua.lua_pushvalue(L, -1);
        lua.lua_setmetatable(L, -2); /* setmetatable(hooktable) = hooktable */
    }
    checkstack(L, L1, 1);
    lua.lua_pushthread(L1);lua.lua_xmove(L1, L, 1); /* key (thread) */
    lua.lua_pushvalue(L, arg + 1); /* value (hook function) */
    lua.lua_rawset(L, -3); /* hooktable[L1] = new Lua hook */
    lua.lua_sethook(L1, func, mask, count);
    return 0;
};

var db_gethook = function db_gethook(L) {
    var thread = getthread(L);
    var L1 = thread.thread;
    var buff = [];
    var mask = lua.lua_gethookmask(L1);
    var hook = lua.lua_gethook(L1);
    if (hook === null) /* no hook? */
        lua.lua_pushnil(L);else if (hook !== hookf) /* external hook? */
        lua.lua_pushliteral(L, "external hook");else {
        /* hook table must exist */
        lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, HOOKKEY);
        checkstack(L, L1, 1);
        lua.lua_pushthread(L1);lua.lua_xmove(L1, L, 1);
        lua.lua_rawget(L, -2); /* 1st result = hooktable[L1] */
        lua.lua_remove(L, -2); /* remove hook table */
    }
    lua.lua_pushstring(L, unmakemask(mask, buff)); /* 2nd result = mask */
    lua.lua_pushinteger(L, lua.lua_gethookcount(L1)); /* 3rd result = count */
    return 3;
};

var db_traceback = function db_traceback(L) {
    var thread = getthread(L);
    var L1 = thread.thread;
    var arg = thread.arg;
    var msg = lua.lua_tostring(L, arg + 1);
    if (msg === null && !lua.lua_isnoneornil(L, arg + 1)) /* non-string 'msg'? */
        lua.lua_pushvalue(L, arg + 1); /* return it untouched */
    else {
            var level = lauxlib.luaL_optinteger(L, arg + 2, L === L1 ? 1 : 0);
            lauxlib.luaL_traceback(L, L1, msg, level);
        }
    return 1;
};

var dblib = {
    "gethook": db_gethook,
    "getinfo": db_getinfo,
    "getlocal": db_getlocal,
    "getmetatable": db_getmetatable,
    "getregistry": db_getregistry,
    "getupvalue": db_getupvalue,
    "getuservalue": db_getuservalue,
    "sethook": db_sethook,
    "setlocal": db_setlocal,
    "setmetatable": db_setmetatable,
    "setupvalue": db_setupvalue,
    "setuservalue": db_setuservalue,
    "traceback": db_traceback,
    "upvalueid": db_upvalueid,
    "upvaluejoin": db_upvaluejoin
};

// Only with Node
if (false) {
    var readlineSync = require('readline-sync');
    readlineSync.setDefaultOptions({
        prompt: 'lua_debug> '
    });

    // TODO: if in browser, use a designated input in the DOM ?
    var db_debug = function db_debug(L) {
        for (;;) {
            var input = readlineSync.prompt();

            if (input === "cont") return 0;

            if (input.length === 0) continue;

            var buffer = lua.to_luastring(input);
            if (lauxlib.luaL_loadbuffer(L, buffer, buffer.length, lua.to_luastring("=(debug command)", true)) || lua.lua_pcall(L, 0, 0, 0)) {
                lauxlib.lua_writestringerror(lua.lua_tojsstring(L, -1) + '\n');
            }
            lua.lua_settop(L, 0); /* remove eventual returns */
        }
    };

    dblib.debug = db_debug;
}

var luaopen_debug = function luaopen_debug(L) {
    lauxlib.luaL_newlib(L, dblib);
    return 1;
};

module.exports.luaopen_debug = luaopen_debug;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);
var llimit = __webpack_require__(4);

var strftime = __webpack_require__(40);

/* options for ANSI C 89 (only 1-char options) */
var L_STRFTIMEC89 = lua.to_luastring("aAbBcdHIjmMpSUwWxXyYZ%", true);

/* options for ISO C 99 and POSIX */
var L_STRFTIMEC99 = lua.to_luastring("aAbBcCdDeFgGhHIjmMnprRStTuUVwWxXyYzZ%||EcECExEXEyEYOdOeOHOIOmOMOSOuOUOVOwOWOy", true); /* two-char options */

/* options for Windows */
var L_STRFTIMEWIN = lua.to_luastring("aAbBcdHIjmMpSUwWxXyYzZ%||#c#x#d#H#I#j#m#M#S#U#w#W#y#Y", true); /* two-char options */

// const LUA_STRFTIMEOPTIONS = L_STRFTIMEWIN;
var LUA_STRFTIMEOPTIONS = L_STRFTIMEC89;
// const LUA_STRFTIMEOPTIONS = L_STRFTIMEC99;

var setfield = function setfield(L, key, value) {
    lua.lua_pushinteger(L, value);
    lua.lua_setfield(L, -2, lua.to_luastring(key, true));
};

var setallfields = function setallfields(L, time, utc) {
    setfield(L, "sec", !utc ? time.getSeconds() : time.getUTCSeconds());
    setfield(L, "min", !utc ? time.getMinutes() : time.getUTCMinutes());
    setfield(L, "hour", !utc ? time.getHours() : time.getUTCHours());
    setfield(L, "day", !utc ? time.getDate() : time.getUTCDate());
    setfield(L, "month", !utc ? time.getMonth() : time.getUTCMonth());
    setfield(L, "year", !utc ? time.getFullYear() : time.getUTCFullYear());
    setfield(L, "wday", !utc ? time.getDay() : time.getUTCDay());
    var now = new Date();
    setfield(L, "yday", Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)));
    // setboolfield(L, "isdst", time.get);
};

var L_MAXDATEFIELD = llimit.MAX_INT / 2;

var getfield = function getfield(L, key, d, delta) {
    var t = lua.lua_getfield(L, -1, lua.to_luastring(key, true)); /* get field and its type */
    var res = lua.lua_tointegerx(L, -1);
    if (res === false) {
        /* field is not an integer? */
        if (t !== lua.LUA_TNIL) /* some other value? */
            return lauxlib.luaL_error(L, lua.to_luastring("field '%s' is not an integer"), key);else if (d < 0) /* absent field; no default? */
            return lauxlib.luaL_error(L, lua.to_luastring("field '%s' missing in date table"), key);
        res = d;
    } else {
        if (!(-L_MAXDATEFIELD <= res && res <= L_MAXDATEFIELD)) return lauxlib.luaL_error(L, lua.to_luastring("field '%s' is out-of-bound"), key);
        res -= delta;
    }
    lua.lua_pop(L, 1);
    return res;
};

var checkoption = function checkoption(L, conv, buff) {
    var option = LUA_STRFTIMEOPTIONS;
    var oplen = 1; /* length of options being checked */
    for (; option.length > 0 && oplen <= conv.length; option = option.slice(oplen)) {
        if (option[0] === '|'.charCodeAt(0)) /* next block? */
            oplen++; /* will check options with next length (+1) */
        else if (lua.to_jsstring(conv.slice(0, oplen)) === lua.to_jsstring(option.slice(0, oplen))) {
                /* match? */
                buff.push.apply(buff, _toConsumableArray(conv.slice(0, oplen))); /* copy valid option to buffer */
                return conv.slice(oplen); /* return next item */
            }
    }
    lauxlib.luaL_argerror(L, 1, lua.lua_pushliteral(L, 'invalid conversion specifier \'%' + conv + '\'', conv));
};

/* maximum size for an individual 'strftime' item */
var SIZETIMEFMT = 250;

var os_date = function os_date(L) {
    var s = lauxlib.luaL_optlstring(L, 1, "%c");
    var t = lauxlib.luaL_opt(L, l_checktime, 2, new Date().getTime() / 1000) * 1000;
    var stm = new Date(t);
    var utc = false;
    if (s[0] === '!'.charCodeAt(0)) {
        /* UTC? */
        utc = true;
        s = s.slice(1); /* skip '!' */
    }

    if (stm === null) /* invalid date? */
        lauxlib.luaL_error(L, lua.to_luastring("time result cannot be represented in this installation", true));

    if (lua.to_jsstring(s) === "*t") {
        lua.lua_createtable(L, 0, 9); /* 9 = number of fields */
        setallfields(L, stm, utc);
    } else {
        var cc = void 0; /* buffer for individual conversion specifiers */
        var b = [];
        while (s.length > 0) {
            cc = ['%'.charCodeAt(0)];

            if (s[0] !== '%'.charCodeAt(0)) {
                /* not a conversion specifier? */
                b.push(s[0]);
                s = s.slice(1);
            } else {
                s = s.slice(1); /* skip '%' */
                s = checkoption(L, s, cc); /* copy specifier to 'cc' */
                b.push.apply(b, _toConsumableArray(lua.to_luastring(strftime(lua.to_jsstring(cc), stm))));
            }
        }
        lua.lua_pushstring(L, b);
    }
    return 1;
};

var os_time = function os_time(L) {
    var t = new Date();
    if (!lua.lua_isnoneornil(L, 1)) /* called with arg */{
            lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE); /* make sure table is at the top */
            lua.lua_settop(L, 1);
            t.setSeconds(getfield(L, "sec", 0, 0));
            t.setMinutes(getfield(L, "min", 0, 0));
            t.setHours(getfield(L, "hour", 12, 0));
            t.setDate(getfield(L, "day", -1, 0));
            t.setMonth(getfield(L, "month", -1, 1));
            t.setFullYear(getfield(L, "year", -1, 0));
            setallfields(L, t);
        }

    lua.lua_pushinteger(L, Math.floor(t / 1000));
    return 1;
};

var l_checktime = function l_checktime(L, arg) {
    var t = lauxlib.luaL_checkinteger(L, arg);
    // lauxlib.luaL_argcheck(L, t, arg, lua.to_luastring("time out-of-bounds"));
    return t;
};

var os_difftime = function os_difftime(L) {
    var t1 = l_checktime(L, 1);
    var t2 = l_checktime(L, 2);
    lua.lua_pushnumber(L, new Date(t1) - new Date(t2));
    return 1;
};

var syslib = {
    "date": os_date,
    "difftime": os_difftime,
    "time": os_time
};

// Only with Node
if (false) {
    var fs = require('fs');
    var tmp = require('tmp');
    var child_process = require('child_process');

    syslib.exit = function (L) {
        var status = void 0;
        if (lua.lua_isboolean(L, 1)) status = lua.lua_toboolean(L, 1) ? 0 : 1;else status = lauxlib.luaL_optinteger(L, 1, 0);
        if (lua.lua_toboolean(L, 2)) lua.lua_close(L);
        if (L) process.exit(status); /* 'if' to avoid warnings for unreachable 'return' */
        return 0;
    };

    syslib.getenv = function (L) {
        lua.lua_pushliteral(L, process.env[lua.to_jsstring(lauxlib.luaL_checkstring(L, 1))]); /* if NULL push nil */
        return 1;
    };

    syslib.clock = function (L) {
        lua.lua_pushnumber(L, process.uptime());
        return 1;
    };

    // TODO: on POSIX system, should create the file
    var lua_tmpname = function lua_tmpname() {
        return tmp.tmpNameSync();
    };

    syslib.remove = function (L) {
        var filename = lauxlib.luaL_checkstring(L, 1);
        try {
            if (fs.lstatSync(lua.to_jsstring(filename)).isDirectory()) {
                fs.rmdirSync(lua.to_jsstring(filename));
            } else {
                fs.unlinkSync(lua.to_jsstring(filename));
            }
        } catch (e) {
            return lauxlib.luaL_fileresult(L, false, filename, e);
        }
        return lauxlib.luaL_fileresult(L, true);
    };

    syslib.rename = function (L) {
        var fromname = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
        var toname = lua.to_jsstring(lauxlib.luaL_checkstring(L, 2));
        try {
            fs.renameSync(fromname, toname);
        } catch (e) {
            return lauxlib.luaL_fileresult(L, false, false, e);
        }
        return lauxlib.luaL_fileresult(L, true);
    };

    syslib.tmpname = function (L) {
        var name = lua_tmpname();
        if (!name) return lauxlib.luaL_error(L, lua.to_luastring("unable to generate a unique filename"));
        lua.lua_pushstring(L, lua.to_luastring(name));
        return 1;
    };

    syslib.execute = function (L) {
        var cmd = lauxlib.luaL_optstring(L, 1, null);
        if (cmd !== null) {
            try {
                child_process.execSync(lua.to_jsstring(cmd), {
                    stdio: [process.stdin, process.stdout, process.stderr]
                });
            } catch (e) {
                return lauxlib.luaL_execresult(L, e);
            }

            return lauxlib.luaL_execresult(L, null);
        } else {
            try {
                child_process.execSync(lua.to_jsstring(cmd), {
                    stdio: [process.stdin, process.stdout, process.stderr]
                });
                lua.lua_pushboolean(L, 1);
            } catch (e) {
                lua.lua_pushboolean(L, 0);
            }

            return 1;
        }
    };
}

var luaopen_os = function luaopen_os(L) {
    lauxlib.luaL_newlib(L, syslib);
    return 1;
};

module.exports.luaopen_os = luaopen_os;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var fengari = __webpack_require__(18);
var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);

var LUA_IGMARK = ["-".charCodeAt(0)];

var CLIBS = lua.to_luastring("__CLIBS__", true);
var LUA_PATH_VAR = "LUA_PATH";
var LUA_CPATH_VAR = "LUA_CPATH";

/*
** LUA_CSUBSEP is the character that replaces dots in submodule names
** when searching for a C loader.
** LUA_LSUBSEP is the character that replaces dots in submodule names
** when searching for a Lua loader.
*/
var LUA_CSUBSEP = lua.LUA_DIRSEP;
var LUA_LSUBSEP = lua.LUA_DIRSEP;

/* prefix for open functions in C libraries */
var LUA_POF = lua.to_luastring("luaopen_");

/* separator for open functions in C libraries */
var LUA_OFSEP = lua.to_luastring("_");
var LIB_FAIL = "open";

var AUXMARK = [1];

/*
** load JS library in file 'path'. If 'seeglb', load with all names in
** the library global.
** Returns the library; in case of error, returns NULL plus an
** error string in the stack.
*/
var lsys_load = void 0;
if (true) {
    lsys_load = function lsys_load(L, path, seeglb) {
        path = lua.to_jsstring(path);
        path = encodeURI(path);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send();

        if (xhr.status < 200 || xhr.status >= 300) {
            lua.lua_pushstring(L, lua.to_luastring(xhr.status + ': ' + xhr.statusText));
            return null;
        }

        var code = xhr.response;
        /* Add sourceURL comment to get path in debugger+tracebacks */
        if (!/\/\/[#@] sourceURL=/.test(code)) code += " //# sourceURL=" + path;
        var func = void 0;
        try {
            func = Function("fengari", code);
        } catch (e) {
            lua.lua_pushstring(L, lua.to_luastring(e.name + ': ' + e.message));
            return null;
        }
        var res = func(fengari);
        if (typeof res === "function" || (typeof res === 'undefined' ? 'undefined' : _typeof(res)) === "object" && res !== null) {
            return res;
        } else if (res === void 0) {
            /* assume library added symbols to global environment */
            return window;
        } else {
            lua.lua_pushstring(L, lua.to_luastring('library returned unexpected type (' + (typeof res === 'undefined' ? 'undefined' : _typeof(res)) + ')'));
            return null;
        }
    };
} else {
    var pathlib = require('path');
    lsys_load = function lsys_load(L, path, seeglb) {
        path = lua.to_jsstring(path);
        /* relative paths should be relative to cwd, not this js file */
        path = pathlib.resolve(process.cwd(), path);
        try {
            return require(path);
        } catch (e) {
            lua.lua_pushstring(L, lua.to_luastring(e.message));
            return null;
        }
    };
}

/*
** Try to find a function named 'sym' in library 'lib'.
** Returns the function; in case of error, returns NULL plus an
** error string in the stack.
*/
var lsys_sym = function lsys_sym(L, lib, sym) {
    var f = lib[lua.to_jsstring(sym)];

    if (f && typeof f === 'function') return f;else {
        lua.lua_pushfstring(L, lua.to_luastring("undefined symbol: %s"), sym);
        return null;
    }
};

/*
** return registry.LUA_NOENV as a boolean
*/
var noenv = function noenv(L) {
    lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring("LUA_NOENV"));
    var b = lua.lua_toboolean(L, -1);
    lua.lua_pop(L, 1); /* remove value */
    return b;
};

var readable = void 0;
// Only with Node
if (false) {

    var fs = require('fs');

    readable = function readable(filename) {
        var fd = false;

        try {
            fd = fs.openSync(lua.to_jsstring(filename), 'r');
            fs.closeSync(fd);
        } catch (e) {
            return false;
        }

        return true;
    };
} else {
    /* TODO: use async/await ? */
    readable = function readable(path) {
        path = lua.to_jsstring(path);
        path = encodeURI(path);
        var xhr = new XMLHttpRequest();
        /* Following GET request done by searcher_Web will be cached */
        xhr.open("GET", path, false);
        xhr.send();

        return xhr.status >= 200 && xhr.status <= 299;
    };
}

/* error codes for 'lookforfunc' */
var ERRLIB = 1;
var ERRFUNC = 2;

/*
** Look for a C function named 'sym' in a dynamically loaded library
** 'path'.
** First, check whether the library is already loaded; if not, try
** to load it.
** Then, if 'sym' is '*', return true (as library has been loaded).
** Otherwise, look for symbol 'sym' in the library and push a
** C function with that symbol.
** Return 0 and 'true' or a function in the stack; in case of
** errors, return an error code and an error message in the stack.
*/
var lookforfunc = function lookforfunc(L, path, sym) {
    var reg = checkclib(L, path); /* check loaded C libraries */
    if (reg === null) {
        /* must load library? */
        reg = lsys_load(L, path, sym[0] === '*'.charCodeAt(0)); /* a global symbols if 'sym'=='*' */
        if (reg === null) return ERRLIB; /* unable to load library */
        addtoclib(L, path, reg);
    }
    if (sym[0] === '*'.charCodeAt(0)) {
        /* loading only library (no function)? */
        lua.lua_pushboolean(L, 1); /* return 'true' */
        return 0; /* no errors */
    } else {
        var f = lsys_sym(L, reg, sym);
        if (f === null) return ERRFUNC; /* unable to find function */
        lua.lua_pushcfunction(L, f); /* else create new function */
        return 0; /* no errors */
    }
};

var ll_loadlib = function ll_loadlib(L) {
    var path = lauxlib.luaL_checkstring(L, 1);
    var init = lauxlib.luaL_checkstring(L, 2);
    var stat = lookforfunc(L, path, init);
    if (stat === 0) /* no errors? */
        return 1; /* return the loaded function */
    else {
            /* error; error message is on stack top */
            lua.lua_pushnil(L);
            lua.lua_insert(L, -2);
            lua.lua_pushliteral(L, stat === ERRLIB ? LIB_FAIL : "init");
            return 3; /* return nil, error message, and where */
        }
};

var env = void 0;
if (true) {
    env = window;
} else {
    env = process.env;
}

/*
** Set a path
*/
var setpath = function setpath(L, fieldname, envname, dft) {
    var nver = '' + envname + lua.LUA_VERSUFFIX;
    lua.lua_pushstring(L, lua.to_luastring(nver));
    var path = env[nver]; /* use versioned name */
    if (path === undefined) /* no environment variable? */
        path = env[envname]; /* try unversioned name */
    if (path === undefined || noenv(L)) /* no environment variable? */
        lua.lua_pushstring(L, lua.to_luastring(dft)); /* use default */
    else {
            /* replace ";;" by ";AUXMARK;" and then AUXMARK by default path */
            path = lauxlib.luaL_gsub(L, lua.to_luastring(path), lua.to_luastring(lua.LUA_PATH_SEP + lua.LUA_PATH_SEP, true), lua.to_luastring(lua.LUA_PATH_SEP, true).concat(AUXMARK).concat(lua.to_luastring(lua.LUA_PATH_SEP, true)));
            lauxlib.luaL_gsub(L, path, AUXMARK, lua.to_luastring(dft));
            lua.lua_remove(L, -2); /* remove result from 1st 'gsub' */
        }
    lua.lua_setfield(L, -3, fieldname); /* package[fieldname] = path value */
    lua.lua_pop(L, 1); /* pop versioned variable name */
};

/*
** return registry.CLIBS[path]
*/
var checkclib = function checkclib(L, path) {
    lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, CLIBS);
    lua.lua_getfield(L, -1, path);
    var plib = lua.lua_touserdata(L, -1); /* plib = CLIBS[path] */
    lua.lua_pop(L, 2); /* pop CLIBS table and 'plib' */
    return plib;
};

/*
** registry.CLIBS[path] = plib        -- for queries
** registry.CLIBS[#CLIBS + 1] = plib  -- also keep a list of all libraries
*/
var addtoclib = function addtoclib(L, path, plib) {
    lua.lua_rawgetp(L, lua.LUA_REGISTRYINDEX, CLIBS);
    lua.lua_pushlightuserdata(L, plib);
    lua.lua_pushvalue(L, -1);
    lua.lua_setfield(L, -3, path); /* CLIBS[path] = plib */
    lua.lua_rawseti(L, -2, lauxlib.luaL_len(L, -2) + 1); /* CLIBS[#CLIBS + 1] = plib */
    lua.lua_pop(L, 1); /* pop CLIBS table */
};

var pushnexttemplate = function pushnexttemplate(L, path) {
    while (path[0] === lua.LUA_PATH_SEP.charCodeAt(0)) {
        path = path.slice(1);
    } /* skip separators */
    if (path.length === 0) return null; /* no more templates */
    var l = path.indexOf(lua.LUA_PATH_SEP.charCodeAt(0)); /* find next separator */
    if (l < 0) l = path.length;
    lua.lua_pushlstring(L, path, l); /* template */
    return path.slice(l);
};

var searchpath = function searchpath(L, name, path, sep, dirsep) {
    var msg = new lauxlib.luaL_Buffer(); /* to build error message */
    lauxlib.luaL_buffinit(L, msg);
    if (sep[0] !== 0) /* non-empty separator? */
        name = lauxlib.luaL_gsub(L, name, sep, dirsep); /* replace it by 'dirsep' */
    while ((path = pushnexttemplate(L, path)) !== null) {
        var filename = lauxlib.luaL_gsub(L, lua.lua_tostring(L, -1), lua.to_luastring(lua.LUA_PATH_MARK, true), name);
        lua.lua_remove(L, -2); /* remove path template */
        if (readable(filename)) /* does file exist and is readable? */
            return filename; /* return that file name */
        lua.lua_pushfstring(L, lua.to_luastring("\n\tno file '%s'"), filename);
        lua.lua_remove(L, -2); /* remove file name */
        lauxlib.luaL_addvalue(msg);
    }
    lauxlib.luaL_pushresult(msg); /* create error message */
    return null; /* not found */
};

var ll_searchpath = function ll_searchpath(L) {
    var f = searchpath(L, lauxlib.luaL_checkstring(L, 1), lauxlib.luaL_checkstring(L, 2), lauxlib.luaL_optstring(L, 3, [".".charCodeAt(0)]), lauxlib.luaL_optstring(L, 4, [lua.LUA_DIRSEP.charCodeAt(0)]));
    if (f !== null) return 1;else {
        /* error message is on top of the stack */
        lua.lua_pushnil(L);
        lua.lua_insert(L, -2);
        return 2; /* return nil + error message */
    }
};

var findfile = function findfile(L, name, pname, dirsep) {
    lua.lua_getfield(L, lua.lua_upvalueindex(1), pname);
    var path = lua.lua_tostring(L, -1);
    if (path === null) lauxlib.luaL_error(L, lua.to_luastring("'package.%s' must be a string"), pname);
    return searchpath(L, name, path, ['.'.charCodeAt(0)], dirsep);
};

var checkload = function checkload(L, stat, filename) {
    if (stat) {
        /* module loaded successfully? */
        lua.lua_pushstring(L, filename); /* will be 2nd argument to module */
        return 2; /* return open function and file name */
    } else return lauxlib.luaL_error(L, lua.to_luastring("error loading module '%s' from file '%s':\n\t%s"), lua.lua_tostring(L, 1), filename, lua.lua_tostring(L, -1));
};

var searcher_Lua = function searcher_Lua(L) {
    var name = lauxlib.luaL_checkstring(L, 1);
    var filename = findfile(L, name, lua.to_luastring("path", true), lua.to_luastring(LUA_LSUBSEP, true));
    if (filename === null) return 1; /* module not found in this path */
    return checkload(L, lauxlib.luaL_loadfile(L, filename) === lua.LUA_OK, filename);
};

/*
** Try to find a load function for module 'modname' at file 'filename'.
** First, change '.' to '_' in 'modname'; then, if 'modname' has
** the form X-Y (that is, it has an "ignore mark"), build a function
** name "luaopen_X" and look for it. (For compatibility, if that
** fails, it also tries "luaopen_Y".) If there is no ignore mark,
** look for a function named "luaopen_modname".
*/
var loadfunc = function loadfunc(L, filename, modname) {
    var openfunc = void 0;
    modname = lauxlib.luaL_gsub(L, modname, [".".charCodeAt(0)], LUA_OFSEP);
    var mark = modname.indexOf(LUA_IGMARK[0]);
    if (mark >= 0) {
        openfunc = lua.lua_pushlstring(L, modname, mark);
        openfunc = lua.lua_pushfstring(L, lua.to_luastring("%s%s"), LUA_POF, openfunc);
        var stat = lookforfunc(L, filename, openfunc);
        if (stat !== ERRFUNC) return stat;
        modname = mark + 1; /* else go ahead and try old-style name */
    }
    openfunc = lua.lua_pushfstring(L, lua.to_luastring("%s%s"), LUA_POF, modname);
    return lookforfunc(L, filename, openfunc);
};

var searcher_C = function searcher_C(L) {
    var name = lauxlib.luaL_checkstring(L, 1);
    var filename = findfile(L, name, lua.to_luastring("cpath", true), lua.to_luastring(LUA_CSUBSEP, true));
    if (filename === null) return 1; /* module not found in this path */
    return checkload(L, loadfunc(L, filename, name) === 0, filename);
};

var searcher_Croot = function searcher_Croot(L) {
    var name = lauxlib.luaL_checkstring(L, 1);
    var p = name.indexOf('.'.charCodeAt(0));
    var stat = void 0;
    if (p < 0) return 0; /* is root */
    lua.lua_pushlstring(L, name, p);
    var filename = findfile(L, lua.lua_tostring(L, -1), lua.to_luastring("cpath", true), lua.to_luastring(LUA_CSUBSEP, true));
    if (filename === null) return 1; /* root not found */
    if ((stat = loadfunc(L, filename, name)) !== 0) {
        if (stat != ERRFUNC) return checkload(L, 0, filename); /* real error */
        else {
                /* open function not found */
                lua.lua_pushstring(L, lua.to_luastring("\n\tno module '%s' in file '%s'"), name, filename);
                return 1;
            }
    }
    lua.lua_pushstring(L, filename); /* will be 2nd argument to module */
    return 2;
};

var searcher_preload = function searcher_preload(L) {
    var name = lauxlib.luaL_checkstring(L, 1);
    lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring(lauxlib.LUA_PRELOAD_TABLE, true));
    if (lua.lua_getfield(L, -1, name) === lua.LUA_TNIL) /* not found? */
        lua.lua_pushfstring(L, lua.to_luastring("\n\tno field package.preload['%s']"), name);
    return 1;
};

var findloader = function findloader(L, name, ctx, k) {
    var msg = new lauxlib.luaL_Buffer(); /* to build error message */
    lauxlib.luaL_buffinit(L, msg);
    /* push 'package.searchers' to index 3 in the stack */
    if (lua.lua_getfield(L, lua.lua_upvalueindex(1), lua.to_luastring("searchers", true)) !== lua.LUA_TTABLE) lauxlib.luaL_error(L, lua.to_luastring("'package.searchers' must be a table"));
    var ctx2 = { name: name, i: 1, msg: msg, ctx: ctx, k: k };
    return findloader_cont(L, lua.LUA_OK, ctx2);
};

var findloader_cont = function findloader_cont(L, status, ctx) {
    /*  iterate over available searchers to find a loader */
    for (;; ctx.i++) {
        if (status === lua.LUA_OK) {
            if (lua.lua_rawgeti(L, 3, ctx.i) === lua.LUA_TNIL) {
                /* no more searchers? */
                lua.lua_pop(L, 1); /* remove nil */
                lauxlib.luaL_pushresult(ctx.msg); /* create error message */
                lauxlib.luaL_error(L, lua.to_luastring("module '%s' not found:%s"), ctx.name, lua.lua_tostring(L, -1));
            }
            lua.lua_pushstring(L, ctx.name);
            lua.lua_callk(L, 1, 2, ctx, findloader_cont); /* call it */
        } else {
            status = lua.LUA_OK;
        }
        if (lua.lua_isfunction(L, -2)) /* did it find a loader? */
            break; /* module loader found */
        else if (lua.lua_isstring(L, -2)) {
                /* searcher returned error message? */
                lua.lua_pop(L, 1); /* remove extra return */
                lauxlib.luaL_addvalue(ctx.msg); /* concatenate error message */
            } else lua.lua_pop(L, 2); /* remove both returns */
    }
    return ctx.k(L, lua.LUA_OK, ctx.ctx);
};

var ll_require = function ll_require(L) {
    var name = lauxlib.luaL_checkstring(L, 1);
    lua.lua_settop(L, 1); /* LOADED table will be at index 2 */
    lua.lua_getfield(L, lua.LUA_REGISTRYINDEX, lua.to_luastring(lauxlib.LUA_LOADED_TABLE, true));
    lua.lua_getfield(L, 2, name); /* LOADED[name] */
    if (lua.lua_toboolean(L, -1)) /* is it there? */
        return 1; /* package is already loaded */
    /* else must load package */
    lua.lua_pop(L, 1); /* remove 'getfield' result */
    var ctx = name;
    return findloader(L, name, ctx, ll_require_cont);
};

var ll_require_cont = function ll_require_cont(L, status, ctx) {
    var name = ctx;
    lua.lua_pushstring(L, name); /* pass name as argument to module loader */
    lua.lua_insert(L, -2); /* name is 1st argument (before search data) */
    lua.lua_callk(L, 2, 1, ctx, ll_require_cont2);
    return ll_require_cont2(L, lua.LUA_OK, ctx); /* run loader to load module */
};

var ll_require_cont2 = function ll_require_cont2(L, status, ctx) {
    var name = ctx;
    if (!lua.lua_isnil(L, -1)) /* non-nil return? */
        lua.lua_setfield(L, 2, name); /* LOADED[name] = returned value */
    if (lua.lua_getfield(L, 2, name) == lua.LUA_TNIL) {
        /* module set no value? */
        lua.lua_pushboolean(L, 1); /* use true as result */
        lua.lua_pushvalue(L, -1); /* extra copy to be returned */
        lua.lua_setfield(L, 2, name); /* LOADED[name] = true */
    }
    return 1;
};

var pk_funcs = {
    "loadlib": ll_loadlib,
    "searchpath": ll_searchpath
};

var ll_funcs = {
    "require": ll_require
};

var createsearcherstable = function createsearcherstable(L) {
    var searchers = [searcher_preload, searcher_Lua, searcher_C, searcher_Croot, null];
    /* create 'searchers' table */
    lua.lua_createtable(L);
    /* fill it with predefined searchers */
    for (var i = 0; searchers[i]; i++) {
        lua.lua_pushvalue(L, -2); /* set 'package' as upvalue for all searchers */
        lua.lua_pushcclosure(L, searchers[i], 1);
        lua.lua_rawseti(L, -2, i + 1);
    }
    lua.lua_setfield(L, -2, lua.to_luastring("searchers", true)); /* put it in field 'searchers' */
};

/*
** create table CLIBS to keep track of loaded C libraries,
** setting a finalizer to close all libraries when closing state.
*/
var createclibstable = function createclibstable(L) {
    lua.lua_newtable(L); /* create CLIBS table */
    lua.lua_createtable(L, 0, 1); /* create metatable for CLIBS */
    lua.lua_setmetatable(L, -2);
    lua.lua_rawsetp(L, lua.LUA_REGISTRYINDEX, CLIBS); /* set CLIBS table in registry */
};

var luaopen_package = function luaopen_package(L) {
    createclibstable(L);
    lauxlib.luaL_newlib(L, pk_funcs); /* create 'package' table */
    createsearcherstable(L);
    /* set paths */
    setpath(L, lua.to_luastring("path", true), LUA_PATH_VAR, lua.LUA_PATH_DEFAULT);
    setpath(L, lua.to_luastring("cpath", true), LUA_CPATH_VAR, lua.LUA_CPATH_DEFAULT);
    /* store config information */
    lua.lua_pushliteral(L, lua.LUA_DIRSEP + "\n" + lua.LUA_PATH_SEP + "\n" + lua.LUA_PATH_MARK + "\n" + lua.LUA_EXEC_DIR + "\n" + LUA_IGMARK + "\n");
    lua.lua_setfield(L, -2, lua.to_luastring("config", true));
    /* set field 'loaded' */
    lauxlib.luaL_getsubtable(L, lua.LUA_REGISTRYINDEX, lua.to_luastring(lauxlib.LUA_LOADED_TABLE, true));
    lua.lua_setfield(L, -2, lua.to_luastring("loaded", true));
    /* set field 'preload' */
    lauxlib.luaL_getsubtable(L, lua.LUA_REGISTRYINDEX, lua.to_luastring(lauxlib.LUA_PRELOAD_TABLE, true));
    lua.lua_setfield(L, -2, lua.to_luastring("preload", true));
    lua.lua_pushglobaltable(L);
    lua.lua_pushvalue(L, -2); /* set 'package' as upvalue for next lib */
    lauxlib.luaL_setfuncs(L, ll_funcs, 1); /* open lib into global table */
    lua.lua_pop(L, 1); /* pop global table */
    return 1; /* return 'package' table */
};

module.exports.luaopen_package = luaopen_package;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function (f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function (x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function (fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function () {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};

var debugs = {};
var debugEnviron;
exports.debuglog = function (set) {
  if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function () {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function () {};
    }
  }
  return debugs[set];
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  'white': [37, 39],
  'grey': [90, 39],
  'black': [30, 39],
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\x1B[' + inspect.colors[style][0] + 'm' + str + '\x1B[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  var hash = {};

  array.forEach(function (val, idx) {
    hash[val] = true;
  });

  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect && value && isFunction(value.inspect) &&
  // Filter out the util module, it's inspect function is special
  value.inspect !== exports.inspect &&
  // Also filter out any prototype objects using the circular check.
  !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '',
      array = false,
      braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function (key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function (prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'symbol' || // ES6 symbol
  typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(33);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function () {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(34);

exports._extend = function (origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function isBuffer(arg) {
  return arg && (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && typeof arg.copy === 'function' && typeof arg.fill === 'function' && typeof arg.readUInt8 === 'function';
};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function TempCtor() {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var llex = __webpack_require__(22);
var lobject = __webpack_require__(3);
var lopcodes = __webpack_require__(15);
var lparser = __webpack_require__(21);
var ltable = __webpack_require__(7);
var lvm = __webpack_require__(14);

var CT = defs.CT;
var OpCodesI = lopcodes.OpCodesI;
var TValue = lobject.TValue;

/* Maximum number of registers in a Lua function (must fit in 8 bits) */
var MAXREGS = 255;

/*
** Marks the end of a patch list. It is an invalid value both as an absolute
** address, and as a list link (would link an element to itself).
*/
var NO_JUMP = -1;

var BinOpr = {
    OPR_ADD: 0,
    OPR_SUB: 1,
    OPR_MUL: 2,
    OPR_MOD: 3,
    OPR_POW: 4,
    OPR_DIV: 5,
    OPR_IDIV: 6,
    OPR_BAND: 7,
    OPR_BOR: 8,
    OPR_BXOR: 9,
    OPR_SHL: 10,
    OPR_SHR: 11,
    OPR_CONCAT: 12,
    OPR_EQ: 13,
    OPR_LT: 14,
    OPR_LE: 15,
    OPR_NE: 16,
    OPR_GT: 17,
    OPR_GE: 18,
    OPR_AND: 19,
    OPR_OR: 20,
    OPR_NOBINOPR: 21
};

var UnOpr = {
    OPR_MINUS: 0,
    OPR_BNOT: 1,
    OPR_NOT: 2,
    OPR_LEN: 3,
    OPR_NOUNOPR: 4
};

var hasjumps = function hasjumps(e) {
    return e.t !== e.f;
};

/*
** If expression is a numeric constant returns either true or a new TValue
** (depending on 'make_tvalue'). Otherwise, returns false.
*/
var tonumeral = function tonumeral(e, make_tvalue) {
    var ek = lparser.expkind;
    if (hasjumps(e)) return false; /* not a numeral */
    switch (e.k) {
        case ek.VKINT:
            if (make_tvalue) {
                return new TValue(CT.LUA_TNUMINT, e.u.ival);
            }
            return true;
        case ek.VKFLT:
            if (make_tvalue) {
                return new TValue(CT.LUA_TNUMFLT, e.u.nval);
            }
            return true;
        default:
            return false;
    }
};

/*
** Create a OP_LOADNIL instruction, but try to optimize: if the previous
** instruction is also OP_LOADNIL and ranges are compatible, adjust
** range of previous instruction instead of emitting a new one. (For
** instance, 'local a; local b' will generate a single opcode.)
*/
var luaK_nil = function luaK_nil(fs, from, n) {
    var previous = void 0;
    var l = from + n - 1; /* last register to set nil */
    if (fs.pc > fs.lasttarget) {
        /* no jumps to current position? */
        previous = fs.f.code[fs.pc - 1];
        if (previous.opcode === OpCodesI.OP_LOADNIL) {
            /* previous is LOADNIL? */
            var pfrom = previous.A; /* get previous range */
            var pl = pfrom + previous.B;
            if (pfrom <= from && from <= pl + 1 || from <= pfrom && pfrom <= l + 1) {
                /* can connect both? */
                if (pfrom < from) from = pfrom; /* from = min(from, pfrom) */
                if (pl > l) l = pl; /* l = max(l, pl) */
                lopcodes.SETARG_A(previous, from);
                lopcodes.SETARG_B(previous, l - from);
                return;
            }
        } /* else go through */
    }
    luaK_codeABC(fs, OpCodesI.OP_LOADNIL, from, n - 1, 0); /* else no optimization */
};

var getinstruction = function getinstruction(fs, e) {
    return fs.f.code[e.u.info];
};

/*
** Gets the destination address of a jump instruction. Used to traverse
** a list of jumps.
*/
var getjump = function getjump(fs, pc) {
    var offset = fs.f.code[pc].sBx;
    if (offset === NO_JUMP) /* point to itself represents end of list */
        return NO_JUMP; /* end of list */
    else return pc + 1 + offset; /* turn offset into absolute position */
};

/*
** Fix jump instruction at position 'pc' to jump to 'dest'.
** (Jump addresses are relative in Lua)
*/
var fixjump = function fixjump(fs, pc, dest) {
    var jmp = fs.f.code[pc];
    var offset = dest - (pc + 1);
    assert(dest !== NO_JUMP);
    if (Math.abs(offset) > lopcodes.MAXARG_sBx) llex.luaX_syntaxerror(fs.ls, defs.to_luastring("control structure too long", true));
    lopcodes.SETARG_sBx(jmp, offset);
};

/*
** Concatenate jump-list 'l2' into jump-list 'l1'
*/
var luaK_concat = function luaK_concat(fs, l1, l2) {
    if (l2 === NO_JUMP) return l1; /* nothing to concatenate? */
    else if (l1 === NO_JUMP) /* no original list? */
            l1 = l2;else {
            var list = l1;
            var next = getjump(fs, list);
            while (next !== NO_JUMP) {
                /* find last element */
                list = next;
                next = getjump(fs, list);
            }
            fixjump(fs, list, l2);
        }

    return l1;
};

/*
** Create a jump instruction and return its position, so its destination
** can be fixed later (with 'fixjump'). If there are jumps to
** this position (kept in 'jpc'), link them all together so that
** 'patchlistaux' will fix all them directly to the final destination.
*/
var luaK_jump = function luaK_jump(fs) {
    var jpc = fs.jpc; /* save list of jumps to here */
    fs.jpc = NO_JUMP; /* no more jumps to here */
    var j = luaK_codeAsBx(fs, OpCodesI.OP_JMP, 0, NO_JUMP);
    j = luaK_concat(fs, j, jpc); /* keep them on hold */
    return j;
};

var luaK_jumpto = function luaK_jumpto(fs, t) {
    return luaK_patchlist(fs, luaK_jump(fs), t);
};

/*
** Code a 'return' instruction
*/
var luaK_ret = function luaK_ret(fs, first, nret) {
    luaK_codeABC(fs, OpCodesI.OP_RETURN, first, nret + 1, 0);
};

/*
** Code a "conditional jump", that is, a test or comparison opcode
** followed by a jump. Return jump position.
*/
var condjump = function condjump(fs, op, A, B, C) {
    luaK_codeABC(fs, op, A, B, C);
    return luaK_jump(fs);
};

/*
** returns current 'pc' and marks it as a jump target (to avoid wrong
** optimizations with consecutive instructions not in the same basic block).
*/
var luaK_getlabel = function luaK_getlabel(fs) {
    fs.lasttarget = fs.pc;
    return fs.pc;
};

/*
** Returns the position of the instruction "controlling" a given
** jump (that is, its condition), or the jump itself if it is
** unconditional.
*/
var getjumpcontroloffset = function getjumpcontroloffset(fs, pc) {
    if (pc >= 1 && lopcodes.testTMode(fs.f.code[pc - 1].opcode)) return pc - 1;else return pc;
};
var getjumpcontrol = function getjumpcontrol(fs, pc) {
    return fs.f.code[getjumpcontroloffset(fs, pc)];
};

/*
** Patch destination register for a TESTSET instruction.
** If instruction in position 'node' is not a TESTSET, return 0 ("fails").
** Otherwise, if 'reg' is not 'NO_REG', set it as the destination
** register. Otherwise, change instruction to a simple 'TEST' (produces
** no register value)
*/
var patchtestreg = function patchtestreg(fs, node, reg) {
    var pc = getjumpcontroloffset(fs, node);
    var i = fs.f.code[pc];
    if (i.opcode !== OpCodesI.OP_TESTSET) return false; /* cannot patch other instructions */
    if (reg !== lopcodes.NO_REG && reg !== i.B) lopcodes.SETARG_A(i, reg);else {
        /* no register to put value or register already has the value;
           change instruction to simple test */
        fs.f.code[pc] = lopcodes.CREATE_ABC(OpCodesI.OP_TEST, i.B, 0, i.C);
    }
    return true;
};

/*
** Traverse a list of tests ensuring no one produces a value
*/
var removevalues = function removevalues(fs, list) {
    for (; list !== NO_JUMP; list = getjump(fs, list)) {
        patchtestreg(fs, list, lopcodes.NO_REG);
    }
};

/*
** Traverse a list of tests, patching their destination address and
** registers: tests producing values jump to 'vtarget' (and put their
** values in 'reg'), other tests jump to 'dtarget'.
*/
var patchlistaux = function patchlistaux(fs, list, vtarget, reg, dtarget) {
    while (list !== NO_JUMP) {
        var next = getjump(fs, list);
        if (patchtestreg(fs, list, reg)) fixjump(fs, list, vtarget);else fixjump(fs, list, dtarget); /* jump to default target */
        list = next;
    }
};

/*
** Ensure all pending jumps to current position are fixed (jumping
** to current position with no values) and reset list of pending
** jumps
*/
var dischargejpc = function dischargejpc(fs) {
    patchlistaux(fs, fs.jpc, fs.pc, lopcodes.NO_REG, fs.pc);
    fs.jpc = NO_JUMP;
};

/*
** Add elements in 'list' to list of pending jumps to "here"
** (current position)
*/
var luaK_patchtohere = function luaK_patchtohere(fs, list) {
    luaK_getlabel(fs); /* mark "here" as a jump target */
    fs.jpc = luaK_concat(fs, fs.jpc, list);
};

/*
** Path all jumps in 'list' to jump to 'target'.
** (The assert means that we cannot fix a jump to a forward address
** because we only know addresses once code is generated.)
*/
var luaK_patchlist = function luaK_patchlist(fs, list, target) {
    if (target === fs.pc) /* 'target' is current position? */
        luaK_patchtohere(fs, list); /* add list to pending jumps */
    else {
            assert(target < fs.pc);
            patchlistaux(fs, list, target, lopcodes.NO_REG, target);
        }
};

/*
** Path all jumps in 'list' to close upvalues up to given 'level'
** (The assertion checks that jumps either were closing nothing
** or were closing higher levels, from inner blocks.)
*/
var luaK_patchclose = function luaK_patchclose(fs, list, level) {
    level++; /* argument is +1 to reserve 0 as non-op */
    for (; list !== NO_JUMP; list = getjump(fs, list)) {
        var ins = fs.f.code[list];
        assert(ins.opcode === OpCodesI.OP_JMP && (ins.A === 0 || ins.A >= level));
        lopcodes.SETARG_A(ins, level);
    }
};

/*
** Emit instruction 'i', checking for array sizes and saving also its
** line information. Return 'i' position.
*/
var luaK_code = function luaK_code(fs, i) {
    var f = fs.f;
    dischargejpc(fs); /* 'pc' will change */
    /* put new instruction in code array */
    f.code[fs.pc] = i;
    f.lineinfo[fs.pc] = fs.ls.lastline;
    return fs.pc++;
};

/*
** Format and emit an 'iABC' instruction. (Assertions check consistency
** of parameters versus opcode.)
*/
var luaK_codeABC = function luaK_codeABC(fs, o, a, b, c) {
    assert(lopcodes.getOpMode(o) === lopcodes.iABC);
    assert(lopcodes.getBMode(o) !== lopcodes.OpArgN || b === 0);
    assert(lopcodes.getCMode(o) !== lopcodes.OpArgN || c === 0);
    assert(a <= lopcodes.MAXARG_A && b <= lopcodes.MAXARG_B && c <= lopcodes.MAXARG_C);
    return luaK_code(fs, lopcodes.CREATE_ABC(o, a, b, c));
};

/*
** Format and emit an 'iABx' instruction.
*/
var luaK_codeABx = function luaK_codeABx(fs, o, a, bc) {
    assert(lopcodes.getOpMode(o) === lopcodes.iABx || lopcodes.getOpMode(o) === lopcodes.iAsBx);
    assert(lopcodes.getCMode(o) === lopcodes.OpArgN);
    assert(a <= lopcodes.MAXARG_A && bc <= lopcodes.MAXARG_Bx);
    return luaK_code(fs, lopcodes.CREATE_ABx(o, a, bc));
};

var luaK_codeAsBx = function luaK_codeAsBx(fs, o, A, sBx) {
    return luaK_codeABx(fs, o, A, sBx + lopcodes.MAXARG_sBx);
};

/*
** Emit an "extra argument" instruction (format 'iAx')
*/
var codeextraarg = function codeextraarg(fs, a) {
    assert(a <= lopcodes.MAXARG_Ax);
    return luaK_code(fs, lopcodes.CREATE_Ax(OpCodesI.OP_EXTRAARG, a));
};

/*
** Emit a "load constant" instruction, using either 'OP_LOADK'
** (if constant index 'k' fits in 18 bits) or an 'OP_LOADKX'
** instruction with "extra argument".
*/
var luaK_codek = function luaK_codek(fs, reg, k) {
    if (k <= lopcodes.MAXARG_Bx) return luaK_codeABx(fs, OpCodesI.OP_LOADK, reg, k);else {
        var p = luaK_codeABx(fs, OpCodesI.OP_LOADKX, reg, 0);
        codeextraarg(fs, k);
        return p;
    }
};

/*
** Check register-stack level, keeping track of its maximum size
** in field 'maxstacksize'
*/
var luaK_checkstack = function luaK_checkstack(fs, n) {
    var newstack = fs.freereg + n;
    if (newstack > fs.f.maxstacksize) {
        if (newstack >= MAXREGS) llex.luaX_syntaxerror(fs.ls, defs.to_luastring("function or expression needs too many registers", true));
        fs.f.maxstacksize = newstack;
    }
};

/*
** Reserve 'n' registers in register stack
*/
var luaK_reserveregs = function luaK_reserveregs(fs, n) {
    luaK_checkstack(fs, n);
    fs.freereg += n;
};

/*
** Free register 'reg', if it is neither a constant index nor
** a local variable.
*/
var freereg = function freereg(fs, reg) {
    if (!lopcodes.ISK(reg) && reg >= fs.nactvar) {
        fs.freereg--;
        assert(reg === fs.freereg);
    }
};

/*
** Free register used by expression 'e' (if any)
*/
var freeexp = function freeexp(fs, e) {
    if (e.k === lparser.expkind.VNONRELOC) freereg(fs, e.u.info);
};

/*
** Free registers used by expressions 'e1' and 'e2' (if any) in proper
** order.
*/
var freeexps = function freeexps(fs, e1, e2) {
    var r1 = e1.k === lparser.expkind.VNONRELOC ? e1.u.info : -1;
    var r2 = e2.k === lparser.expkind.VNONRELOC ? e2.u.info : -1;
    if (r1 > r2) {
        freereg(fs, r1);
        freereg(fs, r2);
    } else {
        freereg(fs, r2);
        freereg(fs, r1);
    }
};

/*
** Add constant 'v' to prototype's list of constants (field 'k').
** Use scanner's table to cache position of constants in constant list
** and try to reuse constants. Because some values should not be used
** as keys (nil cannot be a key, integer keys can collapse with float
** keys), the caller must provide a useful 'key' for indexing the cache.
*/
var addk = function addk(fs, key, v) {
    var f = fs.f;
    var idx = ltable.luaH_set(fs.L, fs.ls.h, key); /* index scanner table */
    if (idx.ttisinteger()) {
        /* is there an index there? */
        var _k = idx.value;
        /* correct value? (warning: must distinguish floats from integers!) */
        if (_k < fs.nk && f.k[_k].ttype() === v.ttype() && f.k[_k].value === v.value) return _k; /* reuse index */
    }
    /* constant not found; create a new entry */
    var k = fs.nk;
    idx.setivalue(k);
    f.k[k] = v;
    fs.nk++;
    return k;
};

/*
** Add a string to list of constants and return its index.
*/
var luaK_stringK = function luaK_stringK(fs, s) {
    var o = new TValue(CT.LUA_TLNGSTR, s);
    return addk(fs, o, o); /* use string itself as key */
};

/*
** Add an integer to list of constants and return its index.
** Integers use userdata as keys to avoid collision with floats with
** same value.
*/
var luaK_intK = function luaK_intK(fs, n) {
    var k = new TValue(CT.LUA_TLIGHTUSERDATA, n);
    var o = new TValue(CT.LUA_TNUMINT, n);
    return addk(fs, k, o);
};

/*
** Add a float to list of constants and return its index.
*/
var luaK_numberK = function luaK_numberK(fs, r) {
    var o = new TValue(CT.LUA_TNUMFLT, r);
    return addk(fs, o, o); /* use number itself as key */
};

/*
** Add a boolean to list of constants and return its index.
*/
var boolK = function boolK(fs, b) {
    var o = new TValue(CT.LUA_TBOOLEAN, b);
    return addk(fs, o, o); /* use boolean itself as key */
};

/*
** Add nil to list of constants and return its index.
*/
var nilK = function nilK(fs) {
    var v = new TValue(CT.LUA_TNIL, null);
    var k = new TValue(CT.LUA_TTABLE, fs.ls.h);
    /* cannot use nil as key; instead use table itself to represent nil */
    return addk(fs, k, v);
};

/*
** Fix an expression to return the number of results 'nresults'.
** Either 'e' is a multi-ret expression (function call or vararg)
** or 'nresults' is LUA_MULTRET (as any expression can satisfy that).
*/
var luaK_setreturns = function luaK_setreturns(fs, e, nresults) {
    var ek = lparser.expkind;
    if (e.k === ek.VCALL) {
        /* expression is an open function call? */
        lopcodes.SETARG_C(getinstruction(fs, e), nresults + 1);
    } else if (e.k === ek.VVARARG) {
        var pc = getinstruction(fs, e);
        lopcodes.SETARG_B(pc, nresults + 1);
        lopcodes.SETARG_A(pc, fs.freereg);
        luaK_reserveregs(fs, 1);
    } else assert(nresults === defs.LUA_MULTRET);
};

var luaK_setmultret = function luaK_setmultret(fs, e) {
    luaK_setreturns(fs, e, defs.LUA_MULTRET);
};

/*
** Fix an expression to return one result.
** If expression is not a multi-ret expression (function call or
** vararg), it already returns one result, so nothing needs to be done.
** Function calls become VNONRELOC expressions (as its result comes
** fixed in the base register of the call), while vararg expressions
** become VRELOCABLE (as OP_VARARG puts its results where it wants).
** (Calls are created returning one result, so that does not need
** to be fixed.)
*/
var luaK_setoneret = function luaK_setoneret(fs, e) {
    var ek = lparser.expkind;
    if (e.k === ek.VCALL) {
        /* expression is an open function call? */
        /* already returns 1 value */
        assert(getinstruction(fs, e).C === 2);
        e.k = ek.VNONRELOC; /* result has fixed position */
        e.u.info = getinstruction(fs, e).A;
    } else if (e.k === ek.VVARARG) {
        lopcodes.SETARG_B(getinstruction(fs, e), 2);
        e.k = ek.VRELOCABLE; /* can relocate its simple result */
    }
};

/*
** Ensure that expression 'e' is not a variable.
*/
var luaK_dischargevars = function luaK_dischargevars(fs, e) {
    var ek = lparser.expkind;

    switch (e.k) {
        case ek.VLOCAL:
            {
                /* already in a register */
                e.k = ek.VNONRELOC; /* becomes a non-relocatable value */
                break;
            }
        case ek.VUPVAL:
            {
                /* move value to some (pending) register */
                e.u.info = luaK_codeABC(fs, OpCodesI.OP_GETUPVAL, 0, e.u.info, 0);
                e.k = ek.VRELOCABLE;
                break;
            }
        case ek.VINDEXED:
            {
                var op = void 0;
                freereg(fs, e.u.ind.idx);
                if (e.u.ind.vt === ek.VLOCAL) {
                    /* is 't' in a register? */
                    freereg(fs, e.u.ind.t);
                    op = OpCodesI.OP_GETTABLE;
                } else {
                    assert(e.u.ind.vt === ek.VUPVAL);
                    op = OpCodesI.OP_GETTABUP; /* 't' is in an upvalue */
                }
                e.u.info = luaK_codeABC(fs, op, 0, e.u.ind.t, e.u.ind.idx);
                e.k = ek.VRELOCABLE;
                break;
            }
        case ek.VVARARG:case ek.VCALL:
            {
                luaK_setoneret(fs, e);
                break;
            }
        default:
            break; /* there is one value available (somewhere) */
    }
};

var code_loadbool = function code_loadbool(fs, A, b, jump) {
    luaK_getlabel(fs); /* those instructions may be jump targets */
    return luaK_codeABC(fs, OpCodesI.OP_LOADBOOL, A, b, jump);
};

/*
** Ensures expression value is in register 'reg' (and therefore
** 'e' will become a non-relocatable expression).
*/
var discharge2reg = function discharge2reg(fs, e, reg) {
    var ek = lparser.expkind;
    luaK_dischargevars(fs, e);
    switch (e.k) {
        case ek.VNIL:
            {
                luaK_nil(fs, reg, 1);
                break;
            }
        case ek.VFALSE:case ek.VTRUE:
            {
                luaK_codeABC(fs, OpCodesI.OP_LOADBOOL, reg, e.k === ek.VTRUE, 0);
                break;
            }
        case ek.VK:
            {
                luaK_codek(fs, reg, e.u.info);
                break;
            }
        case ek.VKFLT:
            {
                luaK_codek(fs, reg, luaK_numberK(fs, e.u.nval));
                break;
            }
        case ek.VKINT:
            {
                luaK_codek(fs, reg, luaK_intK(fs, e.u.ival));
                break;
            }
        case ek.VRELOCABLE:
            {
                var pc = getinstruction(fs, e);
                lopcodes.SETARG_A(pc, reg); /* instruction will put result in 'reg' */
                break;
            }
        case ek.VNONRELOC:
            {
                if (reg !== e.u.info) luaK_codeABC(fs, OpCodesI.OP_MOVE, reg, e.u.info, 0);
                break;
            }
        default:
            {
                assert(e.k === ek.VJMP);
                return; /* nothing to do... */
            }
    }
    e.u.info = reg;
    e.k = ek.VNONRELOC;
};

/*
** Ensures expression value is in any register.
*/
var discharge2anyreg = function discharge2anyreg(fs, e) {
    if (e.k !== lparser.expkind.VNONRELOC) {
        /* no fixed register yet? */
        luaK_reserveregs(fs, 1); /* get a register */
        discharge2reg(fs, e, fs.freereg - 1); /* put value there */
    }
};

/*
** check whether list has any jump that do not produce a value
** or produce an inverted value
*/
var need_value = function need_value(fs, list) {
    for (; list !== NO_JUMP; list = getjump(fs, list)) {
        var i = getjumpcontrol(fs, list);
        if (i.opcode !== OpCodesI.OP_TESTSET) return true;
    }
    return false; /* not found */
};

/*
** Ensures final expression result (including results from its jump
** lists) is in register 'reg'.
** If expression has jumps, need to patch these jumps either to
** its final position or to "load" instructions (for those tests
** that do not produce values).
*/
var exp2reg = function exp2reg(fs, e, reg) {
    var ek = lparser.expkind;
    discharge2reg(fs, e, reg);
    if (e.k === ek.VJMP) /* expression itself is a test? */
        e.t = luaK_concat(fs, e.t, e.u.info); /* put this jump in 't' list */
    if (hasjumps(e)) {
        var final = void 0; /* position after whole expression */
        var p_f = NO_JUMP; /* position of an eventual LOAD false */
        var p_t = NO_JUMP; /* position of an eventual LOAD true */
        if (need_value(fs, e.t) || need_value(fs, e.f)) {
            var fj = e.k === ek.VJMP ? NO_JUMP : luaK_jump(fs);
            p_f = code_loadbool(fs, reg, 0, 1);
            p_t = code_loadbool(fs, reg, 1, 0);
            luaK_patchtohere(fs, fj);
        }
        final = luaK_getlabel(fs);
        patchlistaux(fs, e.f, final, reg, p_f);
        patchlistaux(fs, e.t, final, reg, p_t);
    }
    e.f = e.t = NO_JUMP;
    e.u.info = reg;
    e.k = ek.VNONRELOC;
};

/*
** Ensures final expression result (including results from its jump
** lists) is in next available register.
*/
var luaK_exp2nextreg = function luaK_exp2nextreg(fs, e) {
    luaK_dischargevars(fs, e);
    freeexp(fs, e);
    luaK_reserveregs(fs, 1);
    exp2reg(fs, e, fs.freereg - 1);
};

/*
** Ensures final expression result (including results from its jump
** lists) is in some (any) register and return that register.
*/
var luaK_exp2anyreg = function luaK_exp2anyreg(fs, e) {
    luaK_dischargevars(fs, e);
    if (e.k === lparser.expkind.VNONRELOC) {
        /* expression already has a register? */
        if (!hasjumps(e)) /* no jumps? */
            return e.u.info; /* result is already in a register */
        if (e.u.info >= fs.nactvar) {
            /* reg. is not a local? */
            exp2reg(fs, e, e.u.info); /* put final result in it */
            return e.u.info;
        }
    }
    luaK_exp2nextreg(fs, e); /* otherwise, use next available register */
    return e.u.info;
};

/*
** Ensures final expression result is either in a register or in an
** upvalue.
*/
var luaK_exp2anyregup = function luaK_exp2anyregup(fs, e) {
    if (e.k !== lparser.expkind.VUPVAL || hasjumps(e)) luaK_exp2anyreg(fs, e);
};

/*
** Ensures final expression result is either in a register or it is
** a constant.
*/
var luaK_exp2val = function luaK_exp2val(fs, e) {
    if (hasjumps(e)) luaK_exp2anyreg(fs, e);else luaK_dischargevars(fs, e);
};

/*
** Ensures final expression result is in a valid R/K index
** (that is, it is either in a register or in 'k' with an index
** in the range of R/K indices).
** Returns R/K index.
*/
var luaK_exp2RK = function luaK_exp2RK(fs, e) {
    var ek = lparser.expkind;
    var vk = false;
    luaK_exp2val(fs, e);
    switch (e.k) {/* move constants to 'k' */
        case ek.VTRUE:
            e.u.info = boolK(fs, true);vk = true;break;
        case ek.VFALSE:
            e.u.info = boolK(fs, false);vk = true;break;
        case ek.VNIL:
            e.u.info = nilK(fs);vk = true;break;
        case ek.VKINT:
            e.u.info = luaK_intK(fs, e.u.ival);vk = true;break;
        case ek.VKFLT:
            e.u.info = luaK_numberK(fs, e.u.nval);vk = true;break;
        case ek.VK:
            vk = true;break;
        default:
            break;
    }

    if (vk) {
        e.k = ek.VK;
        if (e.u.info <= lopcodes.MAXINDEXRK) /* constant fits in 'argC'? */
            return lopcodes.RKASK(e.u.info);
    }

    /* not a constant in the right range: put it in a register */
    return luaK_exp2anyreg(fs, e);
};

/*
** Generate code to store result of expression 'ex' into variable 'var'.
*/
var luaK_storevar = function luaK_storevar(fs, vr, ex) {
    var ek = lparser.expkind;
    switch (vr.k) {
        case ek.VLOCAL:
            {
                freeexp(fs, ex);
                exp2reg(fs, ex, vr.u.info); /* compute 'ex' into proper place */
                return;
            }
        case ek.VUPVAL:
            {
                var e = luaK_exp2anyreg(fs, ex);
                luaK_codeABC(fs, OpCodesI.OP_SETUPVAL, e, vr.u.info, 0);
                break;
            }
        case ek.VINDEXED:
            {
                var op = vr.u.ind.vt === ek.VLOCAL ? OpCodesI.OP_SETTABLE : OpCodesI.OP_SETTABUP;
                var _e = luaK_exp2RK(fs, ex);
                luaK_codeABC(fs, op, vr.u.ind.t, vr.u.ind.idx, _e);
                break;
            }
    }
    freeexp(fs, ex);
};

/*
** Emit SELF instruction (convert expression 'e' into 'e:key(e,').
*/
var luaK_self = function luaK_self(fs, e, key) {
    luaK_exp2anyreg(fs, e);
    var ereg = e.u.info; /* register where 'e' was placed */
    freeexp(fs, e);
    e.u.info = fs.freereg; /* base register for op_self */
    e.k = lparser.expkind.VNONRELOC; /* self expression has a fixed register */
    luaK_reserveregs(fs, 2); /* function and 'self' produced by op_self */
    luaK_codeABC(fs, OpCodesI.OP_SELF, e.u.info, ereg, luaK_exp2RK(fs, key));
    freeexp(fs, key);
};

/*
** Negate condition 'e' (where 'e' is a comparison).
*/
var negatecondition = function negatecondition(fs, e) {
    var pc = getjumpcontrol(fs, e.u.info);
    assert(lopcodes.testTMode(pc.opcode) && pc.opcode !== OpCodesI.OP_TESTSET && pc.opcode !== OpCodesI.OP_TEST);
    lopcodes.SETARG_A(pc, !pc.A);
};

/*
** Emit instruction to jump if 'e' is 'cond' (that is, if 'cond'
** is true, code will jump if 'e' is true.) Return jump position.
** Optimize when 'e' is 'not' something, inverting the condition
** and removing the 'not'.
*/
var jumponcond = function jumponcond(fs, e, cond) {
    if (e.k === lparser.expkind.VRELOCABLE) {
        var ie = getinstruction(fs, e);
        if (ie.opcode === OpCodesI.OP_NOT) {
            fs.pc--; /* remove previous OP_NOT */
            return condjump(fs, OpCodesI.OP_TEST, ie.B, 0, !cond);
        }
        /* else go through */
    }
    discharge2anyreg(fs, e);
    freeexp(fs, e);
    return condjump(fs, OpCodesI.OP_TESTSET, lopcodes.NO_REG, e.u.info, cond);
};

/*
** Emit code to go through if 'e' is true, jump otherwise.
*/
var luaK_goiftrue = function luaK_goiftrue(fs, e) {
    var ek = lparser.expkind;
    var pc = void 0; /* pc of new jump */
    luaK_dischargevars(fs, e);
    switch (e.k) {
        case ek.VJMP:
            {
                /* condition? */
                negatecondition(fs, e); /* jump when it is false */
                pc = e.u.info; /* save jump position */
                break;
            }
        case ek.VK:case ek.VKFLT:case ek.VKINT:case ek.VTRUE:
            {
                pc = NO_JUMP; /* always true; do nothing */
                break;
            }
        default:
            {
                pc = jumponcond(fs, e, 0); /* jump when false */
                break;
            }
    }
    e.f = luaK_concat(fs, e.f, pc); /* insert new jump in false list */
    luaK_patchtohere(fs, e.t); /* true list jumps to here (to go through) */
    e.t = NO_JUMP;
};

/*
** Emit code to go through if 'e' is false, jump otherwise.
*/
var luaK_goiffalse = function luaK_goiffalse(fs, e) {
    var ek = lparser.expkind;
    var pc = void 0; /* pc of new jump */
    luaK_dischargevars(fs, e);
    switch (e.k) {
        case ek.VJMP:
            {
                pc = e.u.info; /* already jump if true */
                break;
            }
        case ek.VNIL:case ek.VFALSE:
            {
                pc = NO_JUMP; /* always false; do nothing */
                break;
            }
        default:
            {
                pc = jumponcond(fs, e, 1); /* jump if true */
                break;
            }
    }
    e.t = luaK_concat(fs, e.t, pc); /* insert new jump in 't' list */
    luaK_patchtohere(fs, e.f); /* false list jumps to here (to go through) */
    e.f = NO_JUMP;
};

/*
** Code 'not e', doing constant folding.
*/
var codenot = function codenot(fs, e) {
    var ek = lparser.expkind;
    luaK_dischargevars(fs, e);
    switch (e.k) {
        case ek.VNIL:case ek.VFALSE:
            {
                e.k = ek.VTRUE; /* true === not nil === not false */
                break;
            }
        case ek.VK:case ek.VKFLT:case ek.VKINT:case ek.VTRUE:
            {
                e.k = ek.VFALSE; /* false === not "x" === not 0.5 === not 1 === not true */
                break;
            }
        case ek.VJMP:
            {
                negatecondition(fs, e);
                break;
            }
        case ek.VRELOCABLE:
        case ek.VNONRELOC:
            {
                discharge2anyreg(fs, e);
                freeexp(fs, e);
                e.u.info = luaK_codeABC(fs, OpCodesI.OP_NOT, 0, e.u.info, 0);
                e.k = ek.VRELOCABLE;
                break;
            }
    }
    /* interchange true and false lists */
    {
        var temp = e.f;e.f = e.t;e.t = temp;
    }
    removevalues(fs, e.f); /* values are useless when negated */
    removevalues(fs, e.t);
};

/*
** Create expression 't[k]'. 't' must have its final result already in a
** register or upvalue.
*/
var luaK_indexed = function luaK_indexed(fs, t, k) {
    var ek = lparser.expkind;
    assert(!hasjumps(t) && (lparser.vkisinreg(t.k) || t.k === ek.VUPVAL));
    t.u.ind.t = t.u.info; /* register or upvalue index */
    t.u.ind.idx = luaK_exp2RK(fs, k); /* R/K index for key */
    t.u.ind.vt = t.k === ek.VUPVAL ? ek.VUPVAL : ek.VLOCAL;
    t.k = ek.VINDEXED;
};

/*
** Return false if folding can raise an error.
** Bitwise operations need operands convertible to integers; division
** operations cannot have 0 as divisor.
*/
var validop = function validop(op, v1, v2) {
    switch (op) {
        case defs.LUA_OPBAND:case defs.LUA_OPBOR:case defs.LUA_OPBXOR:
        case defs.LUA_OPSHL:case defs.LUA_OPSHR:case defs.LUA_OPBNOT:
            {
                /* conversion errors */
                return lvm.tointeger(v1) !== false && lvm.tointeger(v2) !== false;
            }
        case defs.LUA_OPDIV:case defs.LUA_OPIDIV:case defs.LUA_OPMOD:
            /* division by 0 */
            return v2.value !== 0;
        default:
            return 1; /* everything else is valid */
    }
};

/*
** Try to "constant-fold" an operation; return 1 iff successful.
** (In this case, 'e1' has the final result.)
*/
var constfolding = function constfolding(op, e1, e2) {
    var ek = lparser.expkind;
    var v1 = void 0,
        v2 = void 0;
    if (!(v1 = tonumeral(e1, true)) || !(v2 = tonumeral(e2, true)) || !validop(op, v1, v2)) return 0; /* non-numeric operands or not safe to fold */
    var res = new TValue(); /* FIXME */
    lobject.luaO_arith(null, op, v1, v2, res); /* does operation */
    if (res.ttisinteger()) {
        e1.k = ek.VKINT;
        e1.u.ival = res.value;
    } else {
        /* folds neither NaN nor 0.0 (to avoid problems with -0.0) */
        var n = res.value;
        if (isNaN(n) || n === 0) return false;
        e1.k = ek.VKFLT;
        e1.u.nval = n;
    }
    return true;
};

/*
** Emit code for unary expressions that "produce values"
** (everything but 'not').
** Expression to produce final result will be encoded in 'e'.
*/
var codeunexpval = function codeunexpval(fs, op, e, line) {
    var r = luaK_exp2anyreg(fs, e); /* opcodes operate only on registers */
    freeexp(fs, e);
    e.u.info = luaK_codeABC(fs, op, 0, r, 0); /* generate opcode */
    e.k = lparser.expkind.VRELOCABLE; /* all those operations are relocatable */
    luaK_fixline(fs, line);
};

/*
** Emit code for binary expressions that "produce values"
** (everything but logical operators 'and'/'or' and comparison
** operators).
** Expression to produce final result will be encoded in 'e1'.
** Because 'luaK_exp2RK' can free registers, its calls must be
** in "stack order" (that is, first on 'e2', which may have more
** recent registers to be released).
*/
var codebinexpval = function codebinexpval(fs, op, e1, e2, line) {
    var rk2 = luaK_exp2RK(fs, e2); /* both operands are "RK" */
    var rk1 = luaK_exp2RK(fs, e1);
    freeexps(fs, e1, e2);
    e1.u.info = luaK_codeABC(fs, op, 0, rk1, rk2); /* generate opcode */
    e1.k = lparser.expkind.VRELOCABLE; /* all those operations are relocatable */
    luaK_fixline(fs, line);
};

/*
** Emit code for comparisons.
** 'e1' was already put in R/K form by 'luaK_infix'.
*/
var codecomp = function codecomp(fs, opr, e1, e2) {
    var ek = lparser.expkind;

    var rk1 = void 0;
    if (e1.k === ek.VK) rk1 = lopcodes.RKASK(e1.u.info);else {
        assert(e1.k === ek.VNONRELOC);
        rk1 = e1.u.info;
    }

    var rk2 = luaK_exp2RK(fs, e2);
    freeexps(fs, e1, e2);
    switch (opr) {
        case BinOpr.OPR_NE:
            {
                /* '(a ~= b)' ==> 'not (a === b)' */
                e1.u.info = condjump(fs, OpCodesI.OP_EQ, 0, rk1, rk2);
                break;
            }
        case BinOpr.OPR_GT:case BinOpr.OPR_GE:
            {
                /* '(a > b)' ==> '(b < a)';  '(a >= b)' ==> '(b <= a)' */
                var op = opr - BinOpr.OPR_NE + OpCodesI.OP_EQ;
                e1.u.info = condjump(fs, op, 1, rk2, rk1); /* invert operands */
                break;
            }
        default:
            {
                /* '==', '<', '<=' use their own opcodes */
                var _op = opr - BinOpr.OPR_EQ + OpCodesI.OP_EQ;
                e1.u.info = condjump(fs, _op, 1, rk1, rk2);
                break;
            }
    }
    e1.k = ek.VJMP;
};

/*
** Apply prefix operation 'op' to expression 'e'.
*/
var luaK_prefix = function luaK_prefix(fs, op, e, line) {
    var ef = new lparser.expdesc();
    ef.k = lparser.expkind.VKINT;
    ef.u.ival = ef.u.nval = ef.u.info = 0;
    ef.t = NO_JUMP;
    ef.f = NO_JUMP;
    switch (op) {
        case UnOpr.OPR_MINUS:case UnOpr.OPR_BNOT:
            /* use 'ef' as fake 2nd operand */
            if (constfolding(op + defs.LUA_OPUNM, e, ef)) break;
        /* FALLTHROUGH */
        case UnOpr.OPR_LEN:
            codeunexpval(fs, op + OpCodesI.OP_UNM, e, line);
            break;
        case UnOpr.OPR_NOT:
            codenot(fs, e);break;
    }
};

/*
** Process 1st operand 'v' of binary operation 'op' before reading
** 2nd operand.
*/
var luaK_infix = function luaK_infix(fs, op, v) {
    switch (op) {
        case BinOpr.OPR_AND:
            {
                luaK_goiftrue(fs, v); /* go ahead only if 'v' is true */
                break;
            }
        case BinOpr.OPR_OR:
            {
                luaK_goiffalse(fs, v); /* go ahead only if 'v' is false */
                break;
            }
        case BinOpr.OPR_CONCAT:
            {
                luaK_exp2nextreg(fs, v); /* operand must be on the 'stack' */
                break;
            }
        case BinOpr.OPR_ADD:case BinOpr.OPR_SUB:
        case BinOpr.OPR_MUL:case BinOpr.OPR_DIV:case BinOpr.OPR_IDIV:
        case BinOpr.OPR_MOD:case BinOpr.OPR_POW:
        case BinOpr.OPR_BAND:case BinOpr.OPR_BOR:case BinOpr.OPR_BXOR:
        case BinOpr.OPR_SHL:case BinOpr.OPR_SHR:
            {
                if (!tonumeral(v, false)) luaK_exp2RK(fs, v);
                /* else keep numeral, which may be folded with 2nd operand */
                break;
            }
        default:
            {
                luaK_exp2RK(fs, v);
                break;
            }
    }
};

/*
** Finalize code for binary operation, after reading 2nd operand.
** For '(a .. b .. c)' (which is '(a .. (b .. c))', because
** concatenation is right associative), merge second CONCAT into first
** one.
*/
var luaK_posfix = function luaK_posfix(fs, op, e1, e2, line) {
    var ek = lparser.expkind;
    switch (op) {
        case BinOpr.OPR_AND:
            {
                assert(e1.t === NO_JUMP); /* list closed by 'luK_infix' */
                luaK_dischargevars(fs, e2);
                e2.f = luaK_concat(fs, e2.f, e1.f);
                e1.to(e2);
                break;
            }
        case BinOpr.OPR_OR:
            {
                assert(e1.f === NO_JUMP); /* list closed by 'luK_infix' */
                luaK_dischargevars(fs, e2);
                e2.t = luaK_concat(fs, e2.t, e1.t);
                e1.to(e2);
                break;
            }
        case BinOpr.OPR_CONCAT:
            {
                luaK_exp2val(fs, e2);
                var ins = getinstruction(fs, e2);
                if (e2.k === ek.VRELOCABLE && ins.opcode === OpCodesI.OP_CONCAT) {
                    assert(e1.u.info === ins.B - 1);
                    freeexp(fs, e1);
                    lopcodes.SETARG_B(ins, e1.u.info);
                    e1.k = ek.VRELOCABLE;e1.u.info = e2.u.info;
                } else {
                    luaK_exp2nextreg(fs, e2); /* operand must be on the 'stack' */
                    codebinexpval(fs, OpCodesI.OP_CONCAT, e1, e2, line);
                }
                break;
            }
        case BinOpr.OPR_ADD:case BinOpr.OPR_SUB:case BinOpr.OPR_MUL:case BinOpr.OPR_DIV:
        case BinOpr.OPR_IDIV:case BinOpr.OPR_MOD:case BinOpr.OPR_POW:
        case BinOpr.OPR_BAND:case BinOpr.OPR_BOR:case BinOpr.OPR_BXOR:
        case BinOpr.OPR_SHL:case BinOpr.OPR_SHR:
            {
                if (!constfolding(op + defs.LUA_OPADD, e1, e2)) codebinexpval(fs, op + OpCodesI.OP_ADD, e1, e2, line);
                break;
            }
        case BinOpr.OPR_EQ:case BinOpr.OPR_LT:case BinOpr.OPR_LE:
        case BinOpr.OPR_NE:case BinOpr.OPR_GT:case BinOpr.OPR_GE:
            {
                codecomp(fs, op, e1, e2);
                break;
            }
    }

    return e1;
};

/*
** Change line information associated with current position.
*/
var luaK_fixline = function luaK_fixline(fs, line) {
    fs.f.lineinfo[fs.pc - 1] = line;
};

/*
** Emit a SETLIST instruction.
** 'base' is register that keeps table;
** 'nelems' is #table plus those to be stored now;
** 'tostore' is number of values (in registers 'base + 1',...) to add to
** table (or LUA_MULTRET to add up to stack top).
*/
var luaK_setlist = function luaK_setlist(fs, base, nelems, tostore) {
    var c = (nelems - 1) / lopcodes.LFIELDS_PER_FLUSH + 1;
    var b = tostore === defs.LUA_MULTRET ? 0 : tostore;
    assert(tostore !== 0 && tostore <= lopcodes.LFIELDS_PER_FLUSH);
    if (c <= lopcodes.MAXARG_C) luaK_codeABC(fs, OpCodesI.OP_SETLIST, base, b, c);else if (c <= lopcodes.MAXARG_Ax) {
        luaK_codeABC(fs, OpCodesI.OP_SETLIST, base, b, 0);
        codeextraarg(fs, c);
    } else llex.luaX_syntaxerror(fs.ls, defs.to_luastring("constructor too long", true));
    fs.freereg = base + 1; /* free registers with list values */
};

module.exports.BinOpr = BinOpr;
module.exports.NO_JUMP = NO_JUMP;
module.exports.UnOpr = UnOpr;
module.exports.getinstruction = getinstruction;
module.exports.luaK_checkstack = luaK_checkstack;
module.exports.luaK_code = luaK_code;
module.exports.luaK_codeABC = luaK_codeABC;
module.exports.luaK_codeABx = luaK_codeABx;
module.exports.luaK_codeAsBx = luaK_codeAsBx;
module.exports.luaK_codek = luaK_codek;
module.exports.luaK_concat = luaK_concat;
module.exports.luaK_dischargevars = luaK_dischargevars;
module.exports.luaK_exp2RK = luaK_exp2RK;
module.exports.luaK_exp2anyreg = luaK_exp2anyreg;
module.exports.luaK_exp2anyregup = luaK_exp2anyregup;
module.exports.luaK_exp2nextreg = luaK_exp2nextreg;
module.exports.luaK_exp2val = luaK_exp2val;
module.exports.luaK_fixline = luaK_fixline;
module.exports.luaK_getlabel = luaK_getlabel;
module.exports.luaK_goiffalse = luaK_goiffalse;
module.exports.luaK_goiftrue = luaK_goiftrue;
module.exports.luaK_indexed = luaK_indexed;
module.exports.luaK_infix = luaK_infix;
module.exports.luaK_intK = luaK_intK;
module.exports.luaK_jump = luaK_jump;
module.exports.luaK_jumpto = luaK_jumpto;
module.exports.luaK_nil = luaK_nil;
module.exports.luaK_numberK = luaK_numberK;
module.exports.luaK_patchclose = luaK_patchclose;
module.exports.luaK_patchlist = luaK_patchlist;
module.exports.luaK_patchtohere = luaK_patchtohere;
module.exports.luaK_posfix = luaK_posfix;
module.exports.luaK_prefix = luaK_prefix;
module.exports.luaK_reserveregs = luaK_reserveregs;
module.exports.luaK_ret = luaK_ret;
module.exports.luaK_self = luaK_self;
module.exports.luaK_setlist = luaK_setlist;
module.exports.luaK_setmultret = luaK_setmultret;
module.exports.luaK_setoneret = luaK_setoneret;
module.exports.luaK_setreturns = luaK_setreturns;
module.exports.luaK_storevar = luaK_storevar;
module.exports.luaK_stringK = luaK_stringK;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = __webpack_require__(0);

var defs = __webpack_require__(1);
var ldo = __webpack_require__(6);
var lfunc = __webpack_require__(11);
var lobject = __webpack_require__(3);
var lopcodes = __webpack_require__(15);
var lstring = __webpack_require__(8);
var lzio = __webpack_require__(16);

var LUAC_DATA = [0x19, 0x93, defs.char["\r"], defs.char["\n"], 0x1a, defs.char["\n"]];

var BytecodeParser = function () {
    function BytecodeParser(L, Z, name) {
        _classCallCheck(this, BytecodeParser);

        this.intSize = 4;
        this.size_tSize = 4;
        this.instructionSize = 4;
        this.integerSize = 4;
        this.numberSize = 8;

        assert(Z instanceof lzio.ZIO, "BytecodeParser only operates on a ZIO");
        assert(defs.is_luastring(name));

        if (name[0] == defs.char["@"] || name[0] == defs.char["="]) this.name = name.slice(1);else if (name[0] == defs.LUA_SIGNATURE.charCodeAt(0)) this.name = defs.to_luastring("binary string", true);else this.name = name;

        this.L = L;
        this.Z = Z;

        // Used to do buffer to number conversions
        this.arraybuffer = new ArrayBuffer(Math.max(this.intSize, this.size_tSize, this.instructionSize, this.integerSize, this.numberSize));
        this.dv = new DataView(this.arraybuffer);
        this.u8 = new Uint8Array(this.arraybuffer);
    }

    _createClass(BytecodeParser, [{
        key: 'read',
        value: function read(size) {
            var u8 = new Uint8Array(size);
            if (lzio.luaZ_read(this.Z, u8, 0, size) !== 0) this.error("truncated");
            return Array.from(u8);
        }
    }, {
        key: 'readByte',
        value: function readByte() {
            if (lzio.luaZ_read(this.Z, this.u8, 0, 1) !== 0) this.error("truncated");
            return this.u8[0];
        }
    }, {
        key: 'readInteger',
        value: function readInteger() {
            if (lzio.luaZ_read(this.Z, this.u8, 0, this.integerSize) !== 0) this.error("truncated");
            return this.dv.getInt32(0, true);
        }
    }, {
        key: 'readSize_t',
        value: function readSize_t() {
            return this.readInteger();
        }
    }, {
        key: 'readInt',
        value: function readInt() {
            if (lzio.luaZ_read(this.Z, this.u8, 0, this.intSize) !== 0) this.error("truncated");
            return this.dv.getInt32(0, true);
        }
    }, {
        key: 'readNumber',
        value: function readNumber() {
            if (lzio.luaZ_read(this.Z, this.u8, 0, this.numberSize) !== 0) this.error("truncated");
            return this.dv.getFloat64(0, true);
        }
    }, {
        key: 'readString',
        value: function readString() {
            var size = Math.max(this.readByte() - 1, 0);

            if (size + 1 === 0xFF) size = this.readSize_t() - 1;

            if (size === 0) {
                return null;
            }

            return lstring.luaS_bless(this.L, this.read(size));
        }

        /* creates a mask with 'n' 1 bits at position 'p' */

    }, {
        key: 'readInstruction',
        value: function readInstruction() {
            if (lzio.luaZ_read(this.Z, this.u8, 0, this.instructionSize) !== 0) this.error("truncated");
            return this.dv.getUint32(0, true);
        }
    }, {
        key: 'readCode',
        value: function readCode(f) {
            var n = this.readInt();
            var o = lopcodes;
            var p = BytecodeParser;

            for (var i = 0; i < n; i++) {
                var ins = this.readInstruction();
                f.code[i] = {
                    code: ins,
                    opcode: ins >> o.POS_OP & p.MASK1(o.SIZE_OP, 0),
                    A: ins >> o.POS_A & p.MASK1(o.SIZE_A, 0),
                    B: ins >> o.POS_B & p.MASK1(o.SIZE_B, 0),
                    C: ins >> o.POS_C & p.MASK1(o.SIZE_C, 0),
                    Bx: ins >> o.POS_Bx & p.MASK1(o.SIZE_Bx, 0),
                    Ax: ins >> o.POS_Ax & p.MASK1(o.SIZE_Ax, 0),
                    sBx: (ins >> o.POS_Bx & p.MASK1(o.SIZE_Bx, 0)) - o.MAXARG_sBx
                };
            }
        }
    }, {
        key: 'readUpvalues',
        value: function readUpvalues(f) {
            var n = this.readInt();

            for (var i = 0; i < n; i++) {
                f.upvalues[i] = {
                    name: null,
                    instack: this.readByte(),
                    idx: this.readByte()
                };
            }
        }
    }, {
        key: 'readConstants',
        value: function readConstants(f) {
            var n = this.readInt();

            for (var i = 0; i < n; i++) {
                var t = this.readByte();

                switch (t) {
                    case defs.CT.LUA_TNIL:
                        f.k.push(new lobject.TValue(defs.CT.LUA_TNIL, null));
                        break;
                    case defs.CT.LUA_TBOOLEAN:
                        f.k.push(new lobject.TValue(defs.CT.LUA_TBOOLEAN, this.readByte() !== 0));
                        break;
                    case defs.CT.LUA_TNUMFLT:
                        f.k.push(new lobject.TValue(defs.CT.LUA_TNUMFLT, this.readNumber()));
                        break;
                    case defs.CT.LUA_TNUMINT:
                        f.k.push(new lobject.TValue(defs.CT.LUA_TNUMINT, this.readInteger()));
                        break;
                    case defs.CT.LUA_TSHRSTR:
                    case defs.CT.LUA_TLNGSTR:
                        f.k.push(new lobject.TValue(defs.CT.LUA_TLNGSTR, this.readString()));
                        break;
                    default:
                        this.error('unrecognized constant \'' + t + '\'');
                }
            }
        }
    }, {
        key: 'readProtos',
        value: function readProtos(f) {
            var n = this.readInt();

            for (var i = 0; i < n; i++) {
                f.p[i] = new lfunc.Proto(this.L);
                this.readFunction(f.p[i], f.source);
            }
        }
    }, {
        key: 'readDebug',
        value: function readDebug(f) {
            var n = this.readInt();
            for (var i = 0; i < n; i++) {
                f.lineinfo[i] = this.readInt();
            }n = this.readInt();
            for (var _i = 0; _i < n; _i++) {
                f.locvars[_i] = {
                    varname: this.readString(),
                    startpc: this.readInt(),
                    endpc: this.readInt()
                };
            }

            n = this.readInt();
            for (var _i2 = 0; _i2 < n; _i2++) {
                f.upvalues[_i2].name = this.readString();
            }
        }
    }, {
        key: 'readFunction',
        value: function readFunction(f, psource) {
            f.source = this.readString();
            if (f.source === null) /* no source in dump? */
                f.source = psource; /* reuse parent's source */
            f.linedefined = this.readInt();
            f.lastlinedefined = this.readInt();
            f.numparams = this.readByte();
            f.is_vararg = this.readByte() !== 0;
            f.maxstacksize = this.readByte();
            this.readCode(f);
            this.readConstants(f);
            this.readUpvalues(f);
            this.readProtos(f);
            this.readDebug(f);
        }
    }, {
        key: 'checkliteral',
        value: function checkliteral(s, msg) {
            var buff = this.read(s.length);
            if (buff.join() !== s.join()) this.error(msg);
        }
    }, {
        key: 'checkHeader',
        value: function checkHeader() {
            this.checkliteral(defs.to_luastring(defs.LUA_SIGNATURE.substring(1)), "not a"); /* 1st char already checked */

            if (this.readByte() !== 0x53) this.error("version mismatch in");

            if (this.readByte() !== 0) this.error("format mismatch in");

            this.checkliteral(LUAC_DATA, "corrupted");

            this.intSize = this.readByte();
            this.size_tSize = this.readByte();
            this.instructionSize = this.readByte();
            this.integerSize = this.readByte();
            this.numberSize = this.readByte();

            this.checksize(this.intSize, 4, "int");
            this.checksize(this.size_tSize, 4, "size_t");
            this.checksize(this.instructionSize, 4, "instruction");
            this.checksize(this.integerSize, 4, "integer");
            this.checksize(this.numberSize, 8, "number");

            if (this.readInteger() !== 0x5678) this.error("endianness mismatch in");

            if (this.readNumber() !== 370.5) this.error("float format mismatch in");
        }
    }, {
        key: 'error',
        value: function error(why) {
            lobject.luaO_pushfstring(this.L, defs.to_luastring("%s: %s precompiled chunk"), this.name, defs.to_luastring(why));
            ldo.luaD_throw(this.L, defs.thread_status.LUA_ERRSYNTAX);
        }
    }, {
        key: 'checksize',
        value: function checksize(byte, size, tname) {
            if (byte !== size) this.error(tname + ' size mismatch in');
        }
    }], [{
        key: 'MASK1',
        value: function MASK1(n, p) {
            return ~(~0 << n) << p;
        }

        /* creates a mask with 'n' 0 bits at position 'p' */

    }, {
        key: 'MASK0',
        value: function MASK0(n, p) {
            return ~BytecodeParser.MASK1(n, p);
        }
    }]);

    return BytecodeParser;
}();

var luaU_undump = function luaU_undump(L, Z, name) {
    var S = new BytecodeParser(L, Z, name);
    S.checkHeader();
    var cl = lfunc.luaF_newLclosure(L, S.readByte());
    ldo.luaD_inctop(L);
    L.stack[L.top - 1].setclLvalue(cl);
    cl.p = new lfunc.Proto(L);
    S.readFunction(cl.p, null);
    assert(cl.nupvalues === cl.p.upvalues.length);
    /* luai_verifycode */
    return cl;
};

module.exports.luaU_undump = luaU_undump;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defs = __webpack_require__(1);
var CT = defs.constant_types;

var LUAC_DATA = "\x19\x93\r\n\x1a\n";
var LUAC_INT = 0x5678;
var LUAC_NUM = 370.5;
var LUAC_VERSION = Number.parseInt(defs.LUA_VERSION_MAJOR) * 16 + Number.parseInt(defs.LUA_VERSION_MINOR);
var LUAC_FORMAT = 0; /* this is the official format */

var DumpState = function DumpState() {
    _classCallCheck(this, DumpState);

    this.L = null;
    this.write = null;
    this.data = null;
    this.strip = NaN;
    this.status = NaN;
};

var DumpBlock = function DumpBlock(b, size, D) {
    if (D.status === 0 && size > 0) D.status = D.writer(D.L, b, size, D.data);
};

var DumpLiteral = function DumpLiteral(s, D) {
    s = defs.to_luastring(s);
    DumpBlock(s, s.length, D);
};

var DumpByte = function DumpByte(y, D) {
    DumpBlock([y], 1, D);
};

var DumpInt = function DumpInt(x, D) {
    var dv = new DataView(new ArrayBuffer(4));
    dv.setInt32(0, x, true);
    var t = [];
    for (var i = 0; i < 4; i++) {
        t.push(dv.getUint8(i, true));
    }DumpBlock(t, 4, D);
};

var DumpInteger = function DumpInteger(x, D) {
    var dv = new DataView(new ArrayBuffer(4));
    dv.setInt32(0, x, true);
    var t = [];
    for (var i = 0; i < 4; i++) {
        t.push(dv.getUint8(i, true));
    }DumpBlock(t, 4, D);
};

var DumpNumber = function DumpNumber(x, D) {
    var dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, x, true);
    var t = [];
    for (var i = 0; i < 8; i++) {
        t.push(dv.getUint8(i, true));
    }DumpBlock(t, 8, D);
};

var DumpString = function DumpString(s, D) {
    if (s === null) DumpByte(0, D);else {
        var size = s.tsslen() + 1;
        var str = s.getstr();
        if (size < 0xFF) DumpByte(size, D);else {
            DumpByte(0xFF, D);
            DumpInteger(size, D);
        }
        DumpBlock(str, size - 1, D); /* no need to save '\0' */
    }
};

var DumpCode = function DumpCode(f, D) {
    var s = f.code.map(function (e) {
        return e.code;
    });
    DumpInt(s.length, D);

    for (var i = 0; i < s.length; i++) {
        DumpInt(s[i], D);
    }
};

var DumpConstants = function DumpConstants(f, D) {
    var n = f.k.length;
    DumpInt(n, D);
    for (var i = 0; i < n; i++) {
        var o = f.k[i];
        DumpByte(o.ttype(), D);
        switch (o.ttype()) {
            case CT.LUA_TNIL:
                break;
            case CT.LUA_TBOOLEAN:
                DumpByte(o.value ? 1 : 0, D);
                break;
            case CT.LUA_TNUMFLT:
                DumpNumber(o.value, D);
                break;
            case CT.LUA_TNUMINT:
                DumpInteger(o.value, D);
                break;
            case CT.LUA_TSHRSTR:
            case CT.LUA_TLNGSTR:
                DumpString(o.tsvalue(), D);
                break;
        }
    }
};

var DumpProtos = function DumpProtos(f, D) {
    var n = f.p.length;
    DumpInt(n, D);
    for (var i = 0; i < n; i++) {
        DumpFunction(f.p[i], f.source, D);
    }
};

var DumpUpvalues = function DumpUpvalues(f, D) {
    var n = f.upvalues.length;
    DumpInt(n, D);
    for (var i = 0; i < n; i++) {
        DumpByte(f.upvalues[i].instack ? 1 : 0, D);
        DumpByte(f.upvalues[i].idx, D);
    }
};

var DumpDebug = function DumpDebug(f, D) {
    var n = D.strip ? 0 : f.lineinfo.length;
    DumpInt(n, D);
    for (var i = 0; i < n; i++) {
        DumpInt(f.lineinfo[i], D);
    }n = D.strip ? 0 : f.locvars.length;
    DumpInt(n, D);
    for (var _i = 0; _i < n; _i++) {
        DumpString(f.locvars[_i].varname, D);
        DumpInt(f.locvars[_i].startpc, D);
        DumpInt(f.locvars[_i].endpc, D);
    }
    n = D.strip ? 0 : f.upvalues.length;
    DumpInt(n, D);
    for (var _i2 = 0; _i2 < n; _i2++) {
        DumpString(f.upvalues[_i2].name, D);
    }
};

var DumpFunction = function DumpFunction(f, psource, D) {
    if (D.strip || f.source === psource) DumpString(null, D); /* no debug info or same source as its parent */
    else DumpString(f.source, D);
    DumpInt(f.linedefined, D);
    DumpInt(f.lastlinedefined, D);
    DumpByte(f.numparams, D);
    DumpByte(f.is_vararg ? 1 : 0, D);
    DumpByte(f.maxstacksize, D);
    DumpCode(f, D);
    DumpConstants(f, D);
    DumpUpvalues(f, D);
    DumpProtos(f, D);
    DumpDebug(f, D);
};

var DumpHeader = function DumpHeader(D) {
    DumpLiteral(defs.LUA_SIGNATURE, D);
    DumpByte(LUAC_VERSION, D);
    DumpByte(LUAC_FORMAT, D);
    var cdata = LUAC_DATA.split('').map(function (e) {
        return e.charCodeAt(0);
    });
    DumpBlock(cdata, cdata.length, D);
    DumpByte(4, D); // intSize
    DumpByte(4, D); // size_tSize
    DumpByte(4, D); // instructionSize
    DumpByte(4, D); // integerSize
    DumpByte(8, D); // numberSize
    DumpInteger(LUAC_INT, D);
    DumpNumber(LUAC_NUM, D);
};

/*
** dump Lua function as precompiled chunk
*/
var luaU_dump = function luaU_dump(L, f, w, data, strip) {
    var D = new DumpState();
    D.L = L;
    D.writer = w;
    D.data = data;
    D.strip = strip;
    D.status = 0;
    DumpHeader(D);
    DumpByte(f.upvalues.length, D);
    DumpFunction(f, null, D);
    return D.status;
};

module.exports.luaU_dump = luaU_dump;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);
var lbaselib = __webpack_require__(39);
var lcorolib = __webpack_require__(24);
var lmathlib = __webpack_require__(25);
var lstrlib = __webpack_require__(26);
var ltablib = __webpack_require__(27);
var lutf8lib = __webpack_require__(28);
var ldblib = __webpack_require__(29);
var loslib = __webpack_require__(30);
var loadlib = __webpack_require__(31);
var lualib = __webpack_require__(23);

var luaL_openlibs = function luaL_openlibs(L) {
    var _loadedlibs;

    var loadedlibs = (_loadedlibs = {}, _defineProperty(_loadedlibs, lualib.LUA_LOADLIBNAME, loadlib.luaopen_package), _defineProperty(_loadedlibs, lualib.LUA_COLIBNAME, lcorolib.luaopen_coroutine), _defineProperty(_loadedlibs, lualib.LUA_DBLIBNAME, ldblib.luaopen_debug), _defineProperty(_loadedlibs, lualib.LUA_MATHLIBNAME, lmathlib.luaopen_math), _defineProperty(_loadedlibs, lualib.LUA_OSLIBNAME, loslib.luaopen_os), _defineProperty(_loadedlibs, lualib.LUA_STRLIBNAME, lstrlib.luaopen_string), _defineProperty(_loadedlibs, lualib.LUA_TABLIBNAME, ltablib.luaopen_table), _defineProperty(_loadedlibs, lualib.LUA_UTF8LIBNAME, lutf8lib.luaopen_utf8), _defineProperty(_loadedlibs, "_G", lbaselib.luaopen_base), _loadedlibs);

    if (false) loadedlibs[lualib.LUA_IOLIBNAME] = require('./liolib.js').luaopen_io;

    /* "require" functions from 'loadedlibs' and set results to global table */
    for (var lib in loadedlibs) {
        lauxlib.luaL_requiref(L, lua.to_luastring(lib), loadedlibs[lib], 1);
        lua.lua_pop(L, 1); /* remove lib */
    }
};

module.exports.luaL_openlibs = luaL_openlibs;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lua = __webpack_require__(2);
var lauxlib = __webpack_require__(5);

var lua_writestring = void 0;
var lua_writeline = void 0;
if (true) {
    var buff = [];
    lua_writestring = function lua_writestring(s) {
        buff = buff.concat(s);
    };
    lua_writeline = function lua_writeline() {
        console.log(lua.to_jsstring(buff));
        buff = [];
    };
} else {
    lua_writestring = function lua_writestring(s) {
        process.stdout.write(Buffer.from(s));
    };
    lua_writeline = function lua_writeline() {
        process.stdout.write("\n");
    };
}
var luaB_print = function luaB_print(L) {
    var n = lua.lua_gettop(L); /* number of arguments */
    lua.lua_getglobal(L, lua.to_luastring("tostring", true));
    for (var i = 1; i <= n; i++) {
        lua.lua_pushvalue(L, -1); /* function to be called */
        lua.lua_pushvalue(L, i); /* value to print */
        lua.lua_call(L, 1, 1);
        var s = lua.lua_tolstring(L, -1);
        if (s === null) return lauxlib.luaL_error(L, lua.to_luastring("'tostring' must return a string to 'print'", true));
        if (i > 1) lua_writestring(["\t".charCodeAt(0)]);
        lua_writestring(s);
        lua.lua_pop(L, 1);
    }
    lua_writeline();
    return 0;
};

var luaB_tostring = function luaB_tostring(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_tolstring(L, 1);

    return 1;
};

var luaB_getmetatable = function luaB_getmetatable(L) {
    lauxlib.luaL_checkany(L, 1);
    if (!lua.lua_getmetatable(L, 1)) {
        lua.lua_pushnil(L);
        return 1; /* no metatable */
    }
    lauxlib.luaL_getmetafield(L, 1, lua.to_luastring("__metatable", true));
    return 1; /* returns either __metatable field (if present) or metatable */
};

var luaB_setmetatable = function luaB_setmetatable(L) {
    var t = lua.lua_type(L, 2);
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lauxlib.luaL_argcheck(L, t === lua.LUA_TNIL || t === lua.LUA_TTABLE, 2, lua.to_luastring("nil or table expected", true));
    if (lauxlib.luaL_getmetafield(L, 1, lua.to_luastring("__metatable", true)) !== lua.LUA_TNIL) return lauxlib.luaL_error(L, lua.to_luastring("cannot change a protected metatable", true));
    lua.lua_settop(L, 2);
    lua.lua_setmetatable(L, 1);
    return 1;
};

var luaB_rawequal = function luaB_rawequal(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_checkany(L, 2);
    lua.lua_pushboolean(L, lua.lua_rawequal(L, 1, 2));
    return 1;
};

var luaB_rawlen = function luaB_rawlen(L) {
    var t = lua.lua_type(L, 1);
    lauxlib.luaL_argcheck(L, t === lua.LUA_TTABLE || t === lua.LUA_TSTRING, 1, lua.to_luastring("table or string expected", true));
    lua.lua_pushinteger(L, lua.lua_rawlen(L, 1));
    return 1;
};

var luaB_rawget = function luaB_rawget(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lauxlib.luaL_checkany(L, 2);
    lua.lua_settop(L, 2);
    lua.lua_rawget(L, 1);
    return 1;
};

var luaB_rawset = function luaB_rawset(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lauxlib.luaL_checkany(L, 2);
    lauxlib.luaL_checkany(L, 3);
    lua.lua_settop(L, 3);
    lua.lua_rawset(L, 1);
    return 1;
};

var opts = ["stop", "restart", "collect", "count", "step", "setpause", "setstepmul", "isrunning"].map(function (e) {
    return lua.to_luastring(e);
});
var luaB_collectgarbage = function luaB_collectgarbage(L) {
    lauxlib.luaL_checkoption(L, 1, lua.to_luastring("collect"), opts);
    lauxlib.luaL_optinteger(L, 2, 0);
    lauxlib.luaL_error(L, lua.to_luastring("lua_gc not implemented"));
};

var luaB_type = function luaB_type(L) {
    var t = lua.lua_type(L, 1);
    lauxlib.luaL_argcheck(L, t !== lua.LUA_TNONE, 1, lua.to_luastring("value expected", true));
    lua.lua_pushstring(L, lua.lua_typename(L, t));
    return 1;
};

var pairsmeta = function pairsmeta(L, method, iszero, iter) {
    lauxlib.luaL_checkany(L, 1);
    if (lauxlib.luaL_getmetafield(L, 1, method) === lua.LUA_TNIL) {
        /* no metamethod? */
        lua.lua_pushcfunction(L, iter); /* will return generator, */
        lua.lua_pushvalue(L, 1); /* state, */
        if (iszero) lua.lua_pushinteger(L, 0); /* and initial value */
        else lua.lua_pushnil(L);
    } else {
        lua.lua_pushvalue(L, 1); /* argument 'self' to metamethod */
        lua.lua_call(L, 1, 3); /* get 3 values from metamethod */
    }
    return 3;
};

var luaB_next = function luaB_next(L) {
    lauxlib.luaL_checktype(L, 1, lua.LUA_TTABLE);
    lua.lua_settop(L, 2); /* create a 2nd argument if there isn't one */
    if (lua.lua_next(L, 1)) return 2;else {
        lua.lua_pushnil(L);
        return 1;
    }
};

var luaB_pairs = function luaB_pairs(L) {
    return pairsmeta(L, lua.to_luastring("__pairs", true), 0, luaB_next);
};

/*
** Traversal function for 'ipairs'
*/
var ipairsaux = function ipairsaux(L) {
    var i = lauxlib.luaL_checkinteger(L, 2) + 1;
    lua.lua_pushinteger(L, i);
    return lua.lua_geti(L, 1, i) === lua.LUA_TNIL ? 1 : 2;
};

/*
** 'ipairs' function. Returns 'ipairsaux', given "table", 0.
** (The given "table" may not be a table.)
*/
var luaB_ipairs = function luaB_ipairs(L) {
    // Lua 5.2
    // return pairsmeta(L, "__ipairs", 1, ipairsaux);

    lauxlib.luaL_checkany(L, 1);
    lua.lua_pushcfunction(L, ipairsaux); /* iteration function */
    lua.lua_pushvalue(L, 1); /* state */
    lua.lua_pushinteger(L, 0); /* initial value */
    return 3;
};

var b_str2int = function b_str2int(s, base) {
    var r = /^[\t\v\f \n\r]*([\+\-]?)0*([0-9A-Za-z]+)[\t\v\f \n\r]*$/.exec(lua.to_jsstring(s));
    if (!r) return null;
    var neg = r[1] === "-";
    var digits = r[2];
    var n = 0;
    for (var si = 0; si < digits.length; si++) {
        var digit = /\d/.test(digits[si]) ? digits.charCodeAt(si) - '0'.charCodeAt(0) : digits[si].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        if (digit >= base) return null; /* invalid numeral */
        n = (n * base | 0) + digit;
    }
    return (neg ? -n : n) | 0;
};

var luaB_tonumber = function luaB_tonumber(L) {
    if (lua.lua_type(L, 2) <= 0) {
        /* standard conversion? */
        lauxlib.luaL_checkany(L, 1);
        if (lua.lua_type(L, 1) === lua.LUA_TNUMBER) {
            /* already a number? */
            lua.lua_settop(L, 1);
            return 1;
        } else {
            var s = lua.lua_tostring(L, 1);
            if (s !== null && lua.lua_stringtonumber(L, s) === s.length + 1) return 1; /* successful conversion to number */
        }
    } else {
        var base = lauxlib.luaL_checkinteger(L, 2);
        lauxlib.luaL_checktype(L, 1, lua.LUA_TSTRING); /* no numbers as strings */
        var _s = lua.lua_tostring(L, 1);
        lauxlib.luaL_argcheck(L, 2 <= base && base <= 36, 2, lua.to_luastring("base out of range", true));
        var n = b_str2int(_s, base);
        if (n !== null) {
            lua.lua_pushinteger(L, n);
            return 1;
        }
    }

    lua.lua_pushnil(L);
    return 1;
};

var luaB_error = function luaB_error(L) {
    var level = lauxlib.luaL_optinteger(L, 2, 1);
    lua.lua_settop(L, 1);
    if (lua.lua_type(L, 1) === lua.LUA_TSTRING && level > 0) {
        lauxlib.luaL_where(L, level); /* add extra information */
        lua.lua_pushvalue(L, 1);
        lua.lua_concat(L, 2);
    }
    return lua.lua_error(L);
};

var luaB_assert = function luaB_assert(L) {
    if (lua.lua_toboolean(L, 1)) /* condition is true? */
        return lua.lua_gettop(L); /* return all arguments */
    else {
            lauxlib.luaL_checkany(L, 1); /* there must be a condition */
            lua.lua_remove(L, 1); /* remove it */
            lua.lua_pushliteral(L, "assertion failed!"); /* default message */
            lua.lua_settop(L, 1); /* leave only message (default if no other one) */
            return luaB_error(L); /* call 'error' */
        }
};

var luaB_select = function luaB_select(L) {
    var n = lua.lua_gettop(L);
    if (lua.lua_type(L, 1) === lua.LUA_TSTRING && lua.lua_tostring(L, 1)[0] === "#".charCodeAt(0)) {
        lua.lua_pushinteger(L, n - 1);
        return 1;
    } else {
        var i = lauxlib.luaL_checkinteger(L, 1);
        if (i < 0) i = n + i;else if (i > n) i = n;
        lauxlib.luaL_argcheck(L, 1 <= i, 1, lua.to_luastring("index out of range", true));
        return n - i;
    }
};

/*
** Continuation function for 'pcall' and 'xpcall'. Both functions
** already pushed a 'true' before doing the call, so in case of success
** 'finishpcall' only has to return everything in the stack minus
** 'extra' values (where 'extra' is exactly the number of items to be
** ignored).
*/
var finishpcall = function finishpcall(L, status, extra) {
    if (status !== lua.LUA_OK && status !== lua.LUA_YIELD) {
        /* error? */
        lua.lua_pushboolean(L, 0); /* first result (false) */
        lua.lua_pushvalue(L, -2); /* error message */
        return 2; /* return false, msg */
    } else return lua.lua_gettop(L) - extra;
};

var luaB_pcall = function luaB_pcall(L) {
    lauxlib.luaL_checkany(L, 1);
    lua.lua_pushboolean(L, 1); /* first result if no errors */
    lua.lua_insert(L, 1); /* put it in place */
    var status = lua.lua_pcallk(L, lua.lua_gettop(L) - 2, lua.LUA_MULTRET, 0, 0, finishpcall);
    return finishpcall(L, status, 0);
};

/*
** Do a protected call with error handling. After 'lua_rotate', the
** stack will have <f, err, true, f, [args...]>; so, the function passes
** 2 to 'finishpcall' to skip the 2 first values when returning results.
*/
var luaB_xpcall = function luaB_xpcall(L) {
    var n = lua.lua_gettop(L);
    lauxlib.luaL_checktype(L, 2, lua.LUA_TFUNCTION); /* check error function */
    lua.lua_pushboolean(L, 1); /* first result */
    lua.lua_pushvalue(L, 1); /* function */
    lua.lua_rotate(L, 3, 2); /* move them below function's arguments */
    var status = lua.lua_pcallk(L, n - 2, lua.LUA_MULTRET, 2, 2, finishpcall);
    return finishpcall(L, status, 2);
};

// TODO: does it overwrite the upvalue of the previous closure ?
var load_aux = function load_aux(L, status, envidx) {
    if (status === lua.LUA_OK) {
        if (envidx !== 0) {
            /* 'env' parameter? */
            lua.lua_pushvalue(L, envidx); /* environment for loaded function */
            if (!lua.lua_setupvalue(L, -2, 1)) /* set it as 1st upvalue */
                lua.lua_pop(L, 1); /* remove 'env' if not used by previous call */
        }
        return 1;
    } else {
        /* error (message is on top of the stack) */
        lua.lua_pushnil(L);
        lua.lua_insert(L, -2); /* put before error message */
        return 2; /* return nil plus error message */
    }
};

/*
** reserved slot, above all arguments, to hold a copy of the returned
** string to avoid it being collected while parsed. 'load' has four
** optional arguments (chunk, source name, mode, and environment).
*/
var RESERVEDSLOT = 5;

/*
** Reader for generic 'load' function: 'lua_load' uses the
** stack for internal stuff, so the reader cannot change the
** stack top. Instead, it keeps its resulting string in a
** reserved slot inside the stack.
*/
var generic_reader = function generic_reader(L, ud) {
    lauxlib.luaL_checkstack(L, 2, lua.to_luastring("too many nested functions", true));
    lua.lua_pushvalue(L, 1); /* get function */
    lua.lua_call(L, 0, 1); /* call it */
    if (lua.lua_isnil(L, -1)) {
        lua.lua_pop(L, 1); /* pop result */
        return null;
    } else if (!lua.lua_isstring(L, -1)) lauxlib.luaL_error(L, lua.to_luastring("reader function must return a string", true));
    lua.lua_replace(L, RESERVEDSLOT); /* save string in reserved slot */
    return lua.lua_tostring(L, RESERVEDSLOT);
};

var luaB_load = function luaB_load(L) {
    var s = lua.lua_tostring(L, 1);
    var mode = lauxlib.luaL_optstring(L, 3, lua.to_luastring("bt", true));
    var env = !lua.lua_isnone(L, 4) ? 4 : 0; /* 'env' index or 0 if no 'env' */
    var status = void 0;
    if (s !== null) {
        /* loading a string? */
        var chunkname = lauxlib.luaL_optstring(L, 2, s);
        status = lauxlib.luaL_loadbufferx(L, s, s.length, chunkname, mode);
    } else {
        /* loading from a reader function */
        var _chunkname = lauxlib.luaL_optstring(L, 2, lua.to_luastring("=(load)", true));
        lauxlib.luaL_checktype(L, 1, lua.LUA_TFUNCTION);
        lua.lua_settop(L, RESERVEDSLOT); /* create reserved slot */
        status = lua.lua_load(L, generic_reader, null, _chunkname, mode);
    }
    return load_aux(L, status, env);
};

var luaB_loadfile = function luaB_loadfile(L) {
    var fname = lauxlib.luaL_optstring(L, 1, null);
    var mode = lauxlib.luaL_optstring(L, 2, null);
    var env = !lua.lua_isnone(L, 3) ? 3 : 0; /* 'env' index or 0 if no 'env' */
    var status = lauxlib.luaL_loadfilex(L, fname, mode);
    return load_aux(L, status, env);
};

var dofilecont = function dofilecont(L, d1, d2) {
    return lua.lua_gettop(L) - 1;
};

var luaB_dofile = function luaB_dofile(L) {
    var fname = lauxlib.luaL_optstring(L, 1, null);
    lua.lua_settop(L, 1);
    if (lauxlib.luaL_loadfile(L, fname) !== lua.LUA_OK) return lua.lua_error(L);
    lua.lua_callk(L, 0, lua.LUA_MULTRET, 0, dofilecont);
    return dofilecont(L, 0, 0);
};

var base_funcs = {
    "assert": luaB_assert,
    "collectgarbage": luaB_collectgarbage,
    "dofile": luaB_dofile,
    "error": luaB_error,
    "getmetatable": luaB_getmetatable,
    "ipairs": luaB_ipairs,
    "load": luaB_load,
    "loadfile": luaB_loadfile,
    "next": luaB_next,
    "pairs": luaB_pairs,
    "pcall": luaB_pcall,
    "print": luaB_print,
    "rawequal": luaB_rawequal,
    "rawget": luaB_rawget,
    "rawlen": luaB_rawlen,
    "rawset": luaB_rawset,
    "select": luaB_select,
    "setmetatable": luaB_setmetatable,
    "tonumber": luaB_tonumber,
    "tostring": luaB_tostring,
    "type": luaB_type,
    "xpcall": luaB_xpcall
};

var luaopen_base = function luaopen_base(L) {
    /* open lib into global table */
    lua.lua_pushglobaltable(L);
    lauxlib.luaL_setfuncs(L, base_funcs, 0);
    /* set global _G */
    lua.lua_pushvalue(L, -1);
    lua.lua_setfield(L, -2, lua.to_luastring("_G", true));
    /* set global _VERSION */
    lua.lua_pushliteral(L, lua.LUA_VERSION);
    lua.lua_setfield(L, -2, lua.to_luastring("_VERSION", true));
    return 1;
};

module.exports.luaopen_base = luaopen_base;

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//
// strftime
// github.com/samsonjs/strftime
// @_sjs
//
// Copyright 2010 - 2016 Sami Samhuri <sami@samhuri.net>
//
// MIT License
// http://sjs.mit-license.org
//

;(function () {

    var Locales = {
        de_DE: {
            days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d.%m.%Y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        en_CA: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            ordinalSuffixes: ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d/%m/%y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%r',
                x: '%D'
            }
        },

        en_US: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            ordinalSuffixes: ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%m/%d/%y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%r',
                x: '%D'
            }
        },

        es_MX: {
            days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', ' diciembre'],
            shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d/%m/%Y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        fr_FR: {
            days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
            months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
            shortMonths: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d/%m/%Y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        it_IT: {
            days: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
            shortDays: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
            months: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
            shortMonths: ['pr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d/%m/%Y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        nl_NL: {
            days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
            shortDays: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
            months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
            shortMonths: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d-%m-%y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        pt_BR: {
            days: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
            shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
            shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d-%m-%Y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        ru_RU: {
            days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            shortDays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                c: '%a %d %b %Y %X',
                D: '%d.%m.%y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        tr_TR: {
            days: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
            shortDays: ['Paz', 'Pzt', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cts'],
            months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
            shortMonths: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
            AM: 'ÖÖ',
            PM: 'ÖS',
            am: 'ÖÖ',
            pm: 'ÖS',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d-%m-%Y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%T',
                x: '%D'
            }
        },

        // By michaeljayt<michaeljayt@gmail.com>
        // https://github.com/michaeljayt/strftime/commit/bcb4c12743811d51e568175aa7bff3fd2a77cef3
        zh_CN: {
            days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            shortDays: ['日', '一', '二', '三', '四', '五', '六'],
            months: ['一月份', '二月份', '三月份', '四月份', '五月份', '六月份', '七月份', '八月份', '九月份', '十月份', '十一月份', '十二月份'],
            shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            AM: '上午',
            PM: '下午',
            am: '上午',
            pm: '下午',
            formats: {
                c: '%a %d %b %Y %X %Z',
                D: '%d/%m/%y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                r: '%I:%M:%S %p',
                T: '%H:%M:%S',
                v: '%e-%b-%Y',
                X: '%r',
                x: '%D'
            }
        }
    };

    var DefaultLocale = Locales['en_US'],
        defaultStrftime = new Strftime(DefaultLocale, 0, false),
        isCommonJS = typeof module !== 'undefined',
        namespace;

    // CommonJS / Node module
    if (isCommonJS) {
        namespace = module.exports = defaultStrftime;
    }
    // Browsers and other environments
    else {
            // Get the global object. Works in ES3, ES5, and ES5 strict mode.
            namespace = function () {
                return this || (1, eval)('this');
            }();
            namespace.strftime = defaultStrftime;
        }

    // Polyfill Date.now for old browsers.
    if (typeof Date.now !== 'function') {
        Date.now = function () {
            return +new Date();
        };
    }

    function Strftime(locale, customTimezoneOffset, useUtcTimezone) {
        var _locale = locale || DefaultLocale,
            _customTimezoneOffset = customTimezoneOffset || 0,
            _useUtcBasedDate = useUtcTimezone || false,


        // we store unix timestamp value here to not create new Date() each iteration (each millisecond)
        // Date.now() is 2 times faster than new Date()
        // while millisecond precise is enough here
        // this could be very helpful when strftime triggered a lot of times one by one
        _cachedDateTimestamp = 0,
            _cachedDate;

        function _strftime(format, date) {
            var timestamp;

            if (!date) {
                var currentTimestamp = Date.now();
                if (currentTimestamp > _cachedDateTimestamp) {
                    _cachedDateTimestamp = currentTimestamp;
                    _cachedDate = new Date(_cachedDateTimestamp);

                    timestamp = _cachedDateTimestamp;

                    if (_useUtcBasedDate) {
                        // how to avoid duplication of date instantiation for utc here?
                        // we tied to getTimezoneOffset of the current date
                        _cachedDate = new Date(_cachedDateTimestamp + getTimestampToUtcOffsetFor(_cachedDate) + _customTimezoneOffset);
                    }
                } else {
                    timestamp = _cachedDateTimestamp;
                }
                date = _cachedDate;
            } else {
                timestamp = date.getTime();

                if (_useUtcBasedDate) {
                    var utcOffset = getTimestampToUtcOffsetFor(date);
                    date = new Date(timestamp + utcOffset + _customTimezoneOffset);
                    // If we've crossed a DST boundary with this calculation we need to
                    // adjust the new date accordingly or it will be off by an hour in UTC.
                    if (getTimestampToUtcOffsetFor(date) !== utcOffset) {
                        var newUTCOffset = getTimestampToUtcOffsetFor(date);
                        date = new Date(timestamp + newUTCOffset + _customTimezoneOffset);
                    }
                }
            }

            return _processFormat(format, date, _locale, timestamp);
        }

        function _processFormat(format, date, locale, timestamp) {
            var resultString = '',
                padding = null,
                isInScope = false,
                length = format.length,
                extendedTZ = false;

            for (var i = 0; i < length; i++) {

                var currentCharCode = format.charCodeAt(i);

                if (isInScope === true) {
                    // '-'
                    if (currentCharCode === 45) {
                        padding = '';
                        continue;
                    }
                    // '_'
                    else if (currentCharCode === 95) {
                            padding = ' ';
                            continue;
                        }
                        // '0'
                        else if (currentCharCode === 48) {
                                padding = '0';
                                continue;
                            }
                            // ':'
                            else if (currentCharCode === 58) {
                                    if (extendedTZ) {
                                        warn("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime");
                                    }
                                    extendedTZ = true;
                                    continue;
                                }

                    switch (currentCharCode) {

                        // Examples for new Date(0) in GMT

                        // '%'
                        // case '%':
                        case 37:
                            resultString += '%';
                            break;

                        // 'Thursday'
                        // case 'A':
                        case 65:
                            resultString += locale.days[date.getDay()];
                            break;

                        // 'January'
                        // case 'B':
                        case 66:
                            resultString += locale.months[date.getMonth()];
                            break;

                        // '19'
                        // case 'C':
                        case 67:
                            resultString += padTill2(Math.floor(date.getFullYear() / 100), padding);
                            break;

                        // '01/01/70'
                        // case 'D':
                        case 68:
                            resultString += _processFormat(locale.formats.D, date, locale, timestamp);
                            break;

                        // '1970-01-01'
                        // case 'F':
                        case 70:
                            resultString += _processFormat(locale.formats.F, date, locale, timestamp);
                            break;

                        // '00'
                        // case 'H':
                        case 72:
                            resultString += padTill2(date.getHours(), padding);
                            break;

                        // '12'
                        // case 'I':
                        case 73:
                            resultString += padTill2(hours12(date.getHours()), padding);
                            break;

                        // '000'
                        // case 'L':
                        case 76:
                            resultString += padTill3(Math.floor(timestamp % 1000));
                            break;

                        // '00'
                        // case 'M':
                        case 77:
                            resultString += padTill2(date.getMinutes(), padding);
                            break;

                        // 'am'
                        // case 'P':
                        case 80:
                            resultString += date.getHours() < 12 ? locale.am : locale.pm;
                            break;

                        // '00:00'
                        // case 'R':
                        case 82:
                            resultString += _processFormat(locale.formats.R, date, locale, timestamp);
                            break;

                        // '00'
                        // case 'S':
                        case 83:
                            resultString += padTill2(date.getSeconds(), padding);
                            break;

                        // '00:00:00'
                        // case 'T':
                        case 84:
                            resultString += _processFormat(locale.formats.T, date, locale, timestamp);
                            break;

                        // '00'
                        // case 'U':
                        case 85:
                            resultString += padTill2(weekNumber(date, 'sunday'), padding);
                            break;

                        // '00'
                        // case 'W':
                        case 87:
                            resultString += padTill2(weekNumber(date, 'monday'), padding);
                            break;

                        // '16:00:00'
                        // case 'X':
                        case 88:
                            resultString += _processFormat(locale.formats.X, date, locale, timestamp);
                            break;

                        // '1970'
                        // case 'Y':
                        case 89:
                            resultString += date.getFullYear();
                            break;

                        // 'GMT'
                        // case 'Z':
                        case 90:
                            if (_useUtcBasedDate && _customTimezoneOffset === 0) {
                                resultString += "GMT";
                            } else {
                                // fixme optimize
                                var tzString = date.toString().match(/\(([\w\s]+)\)/);
                                resultString += tzString && tzString[1] || '';
                            }
                            break;

                        // 'Thu'
                        // case 'a':
                        case 97:
                            resultString += locale.shortDays[date.getDay()];
                            break;

                        // 'Jan'
                        // case 'b':
                        case 98:
                            resultString += locale.shortMonths[date.getMonth()];
                            break;

                        // ''
                        // case 'c':
                        case 99:
                            resultString += _processFormat(locale.formats.c, date, locale, timestamp);
                            break;

                        // '01'
                        // case 'd':
                        case 100:
                            resultString += padTill2(date.getDate(), padding);
                            break;

                        // ' 1'
                        // case 'e':
                        case 101:
                            resultString += padTill2(date.getDate(), padding == null ? ' ' : padding);
                            break;

                        // 'Jan'
                        // case 'h':
                        case 104:
                            resultString += locale.shortMonths[date.getMonth()];
                            break;

                        // '000'
                        // case 'j':
                        case 106:
                            var y = new Date(date.getFullYear(), 0, 1);
                            var day = Math.ceil((date.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
                            resultString += padTill3(day);
                            break;

                        // ' 0'
                        // case 'k':
                        case 107:
                            resultString += padTill2(date.getHours(), padding == null ? ' ' : padding);
                            break;

                        // '12'
                        // case 'l':
                        case 108:
                            resultString += padTill2(hours12(date.getHours()), padding == null ? ' ' : padding);
                            break;

                        // '01'
                        // case 'm':
                        case 109:
                            resultString += padTill2(date.getMonth() + 1, padding);
                            break;

                        // '\n'
                        // case 'n':
                        case 110:
                            resultString += '\n';
                            break;

                        // '1st'
                        // case 'o':
                        case 111:
                            // Try to use an ordinal suffix from the locale, but fall back to using the old
                            // function for compatibility with old locales that lack them.
                            var day = date.getDate();
                            if (locale.ordinalSuffixes) {
                                resultString += String(day) + (locale.ordinalSuffixes[day - 1] || ordinal(day));
                            } else {
                                resultString += String(day) + ordinal(day);
                            }
                            break;

                        // 'AM'
                        // case 'p':
                        case 112:
                            resultString += date.getHours() < 12 ? locale.AM : locale.PM;
                            break;

                        // '12:00:00 AM'
                        // case 'r':
                        case 114:
                            resultString += _processFormat(locale.formats.r, date, locale, timestamp);
                            break;

                        // '0'
                        // case 's':
                        case 115:
                            resultString += Math.floor(timestamp / 1000);
                            break;

                        // '\t'
                        // case 't':
                        case 116:
                            resultString += '\t';
                            break;

                        // '4'
                        // case 'u':
                        case 117:
                            var day = date.getDay();
                            resultString += day === 0 ? 7 : day;
                            break; // 1 - 7, Monday is first day of the week

                        // ' 1-Jan-1970'
                        // case 'v':
                        case 118:
                            resultString += _processFormat(locale.formats.v, date, locale, timestamp);
                            break;

                        // '4'
                        // case 'w':
                        case 119:
                            resultString += date.getDay();
                            break; // 0 - 6, Sunday is first day of the week

                        // '12/31/69'
                        // case 'x':
                        case 120:
                            resultString += _processFormat(locale.formats.x, date, locale, timestamp);
                            break;

                        // '70'
                        // case 'y':
                        case 121:
                            resultString += ('' + date.getFullYear()).slice(2);
                            break;

                        // '+0000'
                        // case 'z':
                        case 122:
                            if (_useUtcBasedDate && _customTimezoneOffset === 0) {
                                resultString += extendedTZ ? "+00:00" : "+0000";
                            } else {
                                var off;
                                if (_customTimezoneOffset !== 0) {
                                    off = _customTimezoneOffset / (60 * 1000);
                                } else {
                                    off = -date.getTimezoneOffset();
                                }
                                var sign = off < 0 ? '-' : '+';
                                var sep = extendedTZ ? ':' : '';
                                var hours = Math.floor(Math.abs(off / 60));
                                var mins = Math.abs(off % 60);
                                resultString += sign + padTill2(hours) + sep + padTill2(mins);
                            }
                            break;

                        default:
                            if (isInScope) {
                                resultString += '%';
                            }
                            resultString += format[i];
                            break;
                    }

                    padding = null;
                    isInScope = false;
                    continue;
                }

                // '%'
                if (currentCharCode === 37) {
                    isInScope = true;
                    continue;
                }

                resultString += format[i];
            }

            return resultString;
        }

        var strftime = _strftime;

        strftime.localize = function (locale) {
            return new Strftime(locale || _locale, _customTimezoneOffset, _useUtcBasedDate);
        };

        strftime.localizeByIdentifier = function (localeIdentifier) {
            var locale = Locales[localeIdentifier];
            if (!locale) {
                warn('[WARNING] No locale found with identifier "' + localeIdentifier + '".');
                return strftime;
            }
            return strftime.localize(locale);
        };

        strftime.timezone = function (timezone) {
            var customTimezoneOffset = _customTimezoneOffset;
            var useUtcBasedDate = _useUtcBasedDate;

            var timezoneType = typeof timezone === 'undefined' ? 'undefined' : _typeof(timezone);
            if (timezoneType === 'number' || timezoneType === 'string') {
                useUtcBasedDate = true;

                // ISO 8601 format timezone string, [-+]HHMM
                if (timezoneType === 'string') {
                    var sign = timezone[0] === '-' ? -1 : 1,
                        hours = parseInt(timezone.slice(1, 3), 10),
                        minutes = parseInt(timezone.slice(3, 5), 10);

                    customTimezoneOffset = sign * (60 * hours + minutes) * 60 * 1000;
                    // in minutes: 420
                } else if (timezoneType === 'number') {
                    customTimezoneOffset = timezone * 60 * 1000;
                }
            }

            return new Strftime(_locale, customTimezoneOffset, useUtcBasedDate);
        };

        strftime.utc = function () {
            return new Strftime(_locale, _customTimezoneOffset, true);
        };

        return strftime;
    }

    function padTill2(numberToPad, paddingChar) {
        if (paddingChar === '' || numberToPad > 9) {
            return numberToPad;
        }
        if (paddingChar == null) {
            paddingChar = '0';
        }
        return paddingChar + numberToPad;
    }

    function padTill3(numberToPad) {
        if (numberToPad > 99) {
            return numberToPad;
        }
        if (numberToPad > 9) {
            return '0' + numberToPad;
        }
        return '00' + numberToPad;
    }

    function hours12(hour) {
        if (hour === 0) {
            return 12;
        } else if (hour > 12) {
            return hour - 12;
        }
        return hour;
    }

    // firstWeekday: 'sunday' or 'monday', default is 'sunday'
    //
    // Pilfered & ported from Ruby's strftime implementation.
    function weekNumber(date, firstWeekday) {
        firstWeekday = firstWeekday || 'sunday';

        // This works by shifting the weekday back by one day if we
        // are treating Monday as the first day of the week.
        var weekday = date.getDay();
        if (firstWeekday === 'monday') {
            if (weekday === 0) // Sunday
                weekday = 6;else weekday--;
        }

        var firstDayOfYearUtc = Date.UTC(date.getFullYear(), 0, 1),
            dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
            yday = Math.floor((dateUtc - firstDayOfYearUtc) / 86400000),
            weekNum = (yday + 7 - weekday) / 7;

        return Math.floor(weekNum);
    }

    // Get the ordinal suffix for a number: st, nd, rd, or th
    function ordinal(number) {
        var i = number % 10;
        var ii = number % 100;

        if (ii >= 11 && ii <= 13 || i === 0 || i >= 4) {
            return 'th';
        }
        switch (i) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
        }
    }

    function getTimestampToUtcOffsetFor(date) {
        return (date.getTimezoneOffset() || 0) * 60000;
    }

    function warn(message) {
        if (typeof console !== 'undefined' && typeof console.warn == 'function') {
            console.warn(message);
        }
    }
})();

/***/ })
/******/ ]);
});