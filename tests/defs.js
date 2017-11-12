const test = require('tape');

global.WEB = false;
const defs = require('../src/defs.js');

test('to_luastring', function (t) {
    t.deepEqual(
        defs.to_luastring("foo"),
        ["f".charCodeAt(0), "o".charCodeAt(0), "o".charCodeAt(0)],
        "Convert normal ascii string"
    );

    t.deepEqual(
        defs.to_luastring("fo\0o"),
        ["f".charCodeAt(0), "o".charCodeAt(0), 0, "o".charCodeAt(0)],
        "Convert ascii string containing null byte"
    );

    t.deepEqual(
        defs.to_luastring("Café"),
        [67, 97, 102, 195, 169],
        "Convert string with BMP unicode chars"
    );

    t.deepEqual(
        defs.to_luastring(""),
        [239, 163, 191],
        "Convert string with codepoint in PUA (U+E000 to U+F8FF)"
    );

    t.deepEqual(
        defs.to_luastring("❤️🍾"),
        [226, 157, 164, 239, 184, 143, 240, 159, 141, 190],
        "Convert string with surrogate pair"
    );

    t.deepEqual(
        defs.to_luastring("\uD800a"),
        [237, 160, 128, 97],
        "Convert string with broken surrogate pair"
    );

    t.deepEqual(
        defs.to_luastring("\uD823"),
        [237, 160, 163],
        "Convert string with broken surrogate pair at end of string"
    );

    t.end();
});
