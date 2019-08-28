"use strict";

const isBrowser = ((typeof process === "undefined") || process.browser);
const isNode = !isBrowser;

module.exports.isBrowser = isBrowser;
module.exports.isNode    = isNode;
