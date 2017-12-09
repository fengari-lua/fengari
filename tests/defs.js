const test = require('tape');

const defs = require('../src/defs.js');

const unicode_tests = [
	{
        description: "Convert normal ascii string",
		literal: "foo",
		byte_array: ["f".charCodeAt(0), "o".charCodeAt(0), "o".charCodeAt(0)]
    },
	{
        description: "Convert ascii string containing null byte",
		literal: "fo\0o",
		byte_array: ["f".charCodeAt(0), "o".charCodeAt(0), 0, "o".charCodeAt(0)]
    },
	{
        description: "Convert string with BMP unicode chars",
		literal: "Café",
		byte_array: [67, 97, 102, 195, 169]
    },
	{
        description: "Convert string with codepoint in PUA (U+E000 to U+F8FF)",
		literal: "",
		byte_array: [239, 163, 191]
    },
	{
        description: "Convert string with surrogate pair",
		literal: "❤️🍾",
		byte_array: [226, 157, 164, 239, 184, 143, 240, 159, 141, 190]
    },
	{
        description: "Convert string with broken surrogate pair",
		literal: "\uD800a",
		byte_array: [237, 160, 128, 97]
    },
	{
        description: "Convert string with broken surrogate pair at end of string",
		literal: "\uD823",
		byte_array: [237, 160, 163]
    }
];

test('to_luastring', function (t) {
	t.plan(unicode_tests.length);

	unicode_tests.forEach(function(v) {
		t.deepEqual(defs.to_luastring(v.literal), v.byte_array, v.description);
	});
});

test('to_jsstring', function (t) {
	t.plan(unicode_tests.length);

	unicode_tests.forEach(function(v) {
		t.deepEqual(defs.to_jsstring(v.byte_array), v.literal, v.description);
	});
});

test('to_jsstring fails on invalid unicode', function (t) {
	t.plan(7);

	t.throws(function() {
		defs.to_jsstring([165]);
	}, "non-utf8 char");

	t.throws(function() {
		defs.to_jsstring([208, 60]);
	}, "invalid continuation byte");

	t.throws(function() {
		defs.to_jsstring([225, 60, 145]);
	}, "invalid continuation byte");

	t.throws(function() {
		defs.to_jsstring([225, 145, 60]);
	}, "invalid continuation byte");

	t.throws(function() {
		defs.to_jsstring([242, 60, 145, 145]);
	}, "invalid continuation byte");

	t.throws(function() {
		defs.to_jsstring([242, 145, 60, 145]);
	}, "invalid continuation byte");

	t.throws(function() {
		defs.to_jsstring([242, 145, 145, 60]);
	}, "invalid continuation byte");
});
