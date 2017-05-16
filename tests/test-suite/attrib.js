"use strict";

const test     = require('tape');

global.WEB = false;
global.LUA_USE_ASSERT = true;

const lua     = require('../../src/lua.js');
const lauxlib = require('../../src/lauxlib.js');
const lualib  = require('../../src/lualib.js');


test("[test-suite] attrib: testing require", function (t) {
    let luaCode = `
        assert(require"string" == string)
        assert(require"math" == math)
        assert(require"table" == table)
        assert(require"io" == io)
        assert(require"os" == os)
        assert(require"coroutine" == coroutine)

        assert(type(package.path) == "string")
        assert(type(package.cpath) == "string")
        assert(type(package.loaded) == "table")
        assert(type(package.preload) == "table")

        assert(type(package.config) == "string")
        print("package config: "..string.gsub(package.config, "\\n", "|"))

        do
          -- create a path with 'max' templates,
          -- each with 1-10 repetitions of '?'
          local max = _soft and 100 or 2000
          local t = {}
          for i = 1,max do t[i] = string.rep("?", i%10 + 1) end
          t[#t + 1] = ";"    -- empty template
          local path = table.concat(t, ";")
          -- use that path in a search
          local s, err = package.searchpath("xuxu", path)
          -- search fails; check that message has an occurence of
          -- '??????????' with ? replaced by xuxu and at least 'max' lines
          assert(not s and
                 string.find(err, string.rep("xuxu", 10)) and
                 #string.gsub(err, "[^\\n]", "") >= max)
          -- path with one very long template
          local path = string.rep("?", max)
          local s, err = package.searchpath("xuxu", path)
          assert(not s and string.find(err, string.rep('xuxu', max)))
        end

        do
          local oldpath = package.path
          package.path = {}
          local s, err = pcall(require, "no-such-file")
          assert(not s and string.find(err, "package.path"))
          package.path = oldpath
        end
    `, L;
    
    t.plan(2);

    t.doesNotThrow(function () {

        L = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(L);

        lauxlib.luaL_loadstring(L, lua.to_luastring(luaCode));

    }, "Lua program loaded without error");

    t.doesNotThrow(function () {

        lua.lua_call(L, 0, -1);

    }, "Lua program ran without error");

});
