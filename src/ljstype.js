"use strict";

const lisdigit = function(c) {
    return /^\d$/.test(String.fromCharCode(c));
};

const lisxdigit = function(c) {
    return /^[0-9a-fA-F]$/.test(String.fromCharCode(c));
};

const lisspace = function(c) {
    return /^\s$/.test(String.fromCharCode(c));
};

const lislalpha = function(c) {
    return /^[_a-zA-Z]$/.test(String.fromCharCode(c));
};

const lislalnum = function(c) {
    return /^[_a-zA-Z0-9]$/.test(String.fromCharCode(c));
};

module.exports.lisdigit   = lisdigit;
module.exports.lislalnum  = lislalnum;
module.exports.lislalpha  = lislalpha;
module.exports.lisspace   = lisspace;
module.exports.lisxdigit  = lisxdigit;
