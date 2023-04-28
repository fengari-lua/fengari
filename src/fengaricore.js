/* Fengari specific functions
 *
 * This file includes fengari-specific data or and functionality for users to
 * manipulate fengari's string type.
 * The fields are exposed to the user on the 'fengari' entry point; however to
 * avoid a dependency on defs.js from lauxlib.js they are defined in this file.
 */

const defs = require("./defs.js");

const FENGARI_VERSION_MAJOR   = "0";
const FENGARI_VERSION_MINOR   = "1";
const FENGARI_VERSION_NUM     = 1;
const FENGARI_VERSION_RELEASE = "4";
const FENGARI_VERSION         = "Fengari " + FENGARI_VERSION_MAJOR + "." + FENGARI_VERSION_MINOR;
const FENGARI_RELEASE         = FENGARI_VERSION + "." + FENGARI_VERSION_RELEASE;
const FENGARI_AUTHORS         = "B. Giannangeli, Daurnimator";
const FENGARI_COPYRIGHT       = FENGARI_RELEASE + "  Copyright (C) 2017-2019 " + FENGARI_AUTHORS + "\nBased on: " + defs.LUA_COPYRIGHT;

module.exports = {
    FENGARI_AUTHORS:          FENGARI_AUTHORS,
    FENGARI_COPYRIGHT:        FENGARI_COPYRIGHT,
    FENGARI_RELEASE:          FENGARI_RELEASE,
    FENGARI_VERSION:          FENGARI_VERSION,
    FENGARI_VERSION_MAJOR:    FENGARI_VERSION_MAJOR,
    FENGARI_VERSION_MINOR:    FENGARI_VERSION_MINOR,
    FENGARI_VERSION_NUM:      FENGARI_VERSION_NUM,
    FENGARI_VERSION_RELEASE:  FENGARI_VERSION_RELEASE,
    is_luastring:             defs.is_luastring,
    luastring_eq:             defs.luastring_eq,
    luastring_from:           defs.luastring_from,
    luastring_indexOf:        defs.luastring_indexOf,
    luastring_of:             defs.luastring_of,
    to_jsstring:              defs.to_jsstring,
    to_luastring:             defs.to_luastring,
    to_uristring:             defs.to_uristring,
    from_userstring:          defs.from_userstring
};
