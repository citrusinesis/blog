import assert from "node:assert/strict";
import test from "node:test";
import {
	assertUniqueVariants,
	contentIdentity,
	selectVariants,
} from "../src/lib/i18n/content.ts";
import { messages } from "../src/lib/i18n/messages.ts";
import { localeFromPath, localizedPath } from "../src/lib/i18n/ui.ts";

const entry = (id) => ({ id, data: contentIdentity(id) });

test("filenames define language, default English, and preserve nested logical slugs", () => {
	assert.deepEqual(contentIdentity("hello-world.md"), {
		slug: "hello-world",
		lang: "en",
	});
	assert.deepEqual(contentIdentity("hello-world.en.mdx"), {
		slug: "hello-world",
		lang: "en",
	});
	assert.deepEqual(contentIdentity("guides/hello-world.ko.md"), {
		slug: "guides/hello-world",
		lang: "ko",
	});
	assert.deepEqual(contentIdentity("hello-world.zh-Hant.md"), {
		slug: "hello-world",
		lang: "zh-hant",
	});
	assert.deepEqual(contentIdentity("release.v2.md"), {
		slug: "release.v2",
		lang: "en",
	});
	assert.deepEqual(contentIdentity("profile.json"), {
		slug: "profile",
		lang: "en",
	});
	assert.deepEqual(contentIdentity("profile.ko.json"), {
		slug: "profile",
		lang: "ko",
	});
	assert.throws(() => contentIdentity(".en.md"), /Invalid content slug/);
});

test("implicit and explicit English, extension variants and case variants cannot collide", () => {
	for (const files of [
		["hello.md", "hello.en.md"],
		["hello.en.md", "hello.en.mdx"],
		["hello.en.md", "hello.EN.md"],
	]) {
		assert.throws(
			() => assertUniqueVariants(files.map(entry)),
			/Duplicate content variant hello:en/,
		);
	}
	assert.doesNotThrow(() =>
		assertUniqueVariants(
			["hello.md", "hello.ko.md", "other/hello.md"].map(entry),
		),
	);
});

test("requested language wins, followed by English, Korean, then deterministic remaining languages", () => {
	const variants = [
		"hello.ja.md",
		"hello.fr.md",
		"hello.ko.md",
		"hello.md",
	].map(entry);
	assert.equal(selectVariants(variants, "ko")[0].data.lang, "ko");
	assert.equal(selectVariants(variants, "en")[0].data.lang, "en");
	assert.equal(selectVariants(variants, "ja")[0].data.lang, "ja");
	assert.equal(selectVariants(variants, "de")[0].data.lang, "en");
	assert.equal(selectVariants(variants.slice(0, 3), "en")[0].data.lang, "ko");
	assert.equal(selectVariants(variants.slice(0, 2), "ko")[0].data.lang, "fr");
	assert.equal(
		selectVariants(variants.slice(0, 2).reverse(), "ko")[0].data.lang,
		"fr",
	);
});

test("each logical entry appears once before home limiting", () => {
	const selected = selectVariants(
		["a.md", "a.ko.md", "b.md", "b.ko.md", "c.ja.md"].map(entry),
		"ko",
	);
	assert.deepEqual(
		selected.map(({ data }) => [data.slug, data.lang]),
		[
			["a", "ko"],
			["b", "ko"],
			["c", "ja"],
		],
	);
	assert.equal(selected.slice(0, 2).length, 2);
	assert.deepEqual(selectVariants([], "en"), []);
	assert.throws(
		() => selectVariants([entry("a.md"), entry("a.en.md")], "ko"),
		/Duplicate/,
	);
});

test("language links preserve logical paths, and dictionary keys match", () => {
	for (const path of [
		"/",
		"/about/",
		"/blog/a/",
		"/projects/nested/a/",
		"/rss.xml",
	]) {
		assert.equal(localizedPath(localizedPath(path, "ko"), "en"), path);
		assert.equal(localeFromPath(localizedPath(path, "ko")), "ko");
		assert.equal(localeFromPath(path), "en");
	}
	assert.equal(localizedPath("/ko", "en"), "/");
	assert.equal(localeFromPath("/korea/"), "en");
	assert.deepEqual(
		Object.keys(messages.en).sort(),
		Object.keys(messages.ko).sort(),
	);
});

test("profile JSON follows the same duplicate and fallback policy", () => {
	const entries = [entry("profile.json"), entry("profile.ko.json")];
	assert.equal(selectVariants(entries, "ko")[0].data.lang, "ko");
	assert.equal(selectVariants(entries, "en")[0].data.lang, "en");
	assert.equal(
		selectVariants([entry("profile.ko.json")], "en")[0].data.lang,
		"ko",
	);
	assert.throws(
		() =>
			assertUniqueVariants([entry("profile.json"), entry("profile.en.json")]),
		/Duplicate content variant profile:en/,
	);
});
