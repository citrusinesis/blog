import { type LanguageMetadata, type Locale, localizedPath } from "./ui";

interface Variant {
	data: { slug: string; lang: string };
}

export function contentMetadata(
	entries: readonly Variant[],
	selected: Variant,
	base: string,
): LanguageMetadata {
	const path = `${base}/${selected.data.slug.split("/").map(encodeURIComponent).join("/")}/`;
	const variants = entries.filter(
		(entry) => entry.data.slug === selected.data.slug,
	);
	const alternates = variants.flatMap(({ data }) =>
		data.lang === "en" || data.lang === "ko"
			? [{ lang: data.lang as Locale, href: localizedPath(path, data.lang) }]
			: [],
	);
	return {
		canonicalPath: localizedPath(
			path,
			selected.data.lang === "ko" ? "ko" : "en",
		),
		alternates,
	};
}
