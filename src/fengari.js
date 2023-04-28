/**
@license MIT

Copyright © 2017-2019 Benoit Giannangeli
Copyright © 2017-2019 Daurnimator
Copyright © 1994–2017 Lua.org, PUC-Rio.
*/

"use strict";

const core = require("./fengaricore.js");

module.exports = {
    FENGARI_AUTHORS:          core.FENGARI_AUTHORS,
    FENGARI_COPYRIGHT:        core.FENGARI_COPYRIGHT,
    FENGARI_RELEASE:          core.FENGARI_RELEASE,
    FENGARI_VERSION:          core.FENGARI_VERSION,
    FENGARI_VERSION_MAJOR:    core.FENGARI_VERSION_MAJOR,
    FENGARI_VERSION_MINOR:    core.FENGARI_VERSION_MINOR,
    FENGARI_VERSION_NUM:      core.FENGARI_VERSION_NUM,
    FENGARI_VERSION_RELEASE:  core.FENGARI_VERSION_RELEASE,

    luastring_eq:             core.luastring_eq,
    luastring_indexOf:        core.luastring_indexOf,
    luastring_of:             core.luastring_of,
    to_jsstring:              core.to_jsstring,
    to_luastring:             core.to_luastring,
    to_uristring:             core.to_uristring,

    luaconf:                  require('./luaconf.js'),
    lua:                      require('./lua.js'),
    lauxlib:                  require('./lauxlib.js'),
    lualib:                   require('./lualib.js'),
};
