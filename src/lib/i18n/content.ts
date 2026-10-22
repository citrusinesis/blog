interface Variant {
	id: string;
	data: { slug: string; lang: string };
}

export function contentIdentity(file: string): { slug: string; lang: string } {
	const stem = file.replace(/\.(md|mdx|json)$/, "");
	const match = stem.match(/^(.*)\.([a-z]{2,3}(?:-[a-z0-9]{2,8})*)$/i);
	const slug = match ? match[1] : stem;
	const lang = match
		? Intl.getCanonicalLocales(match[2])[0].toLowerCase()
		: "en";
	if (
		!slug ||
		slug.split("/").some((part) => !part || part === "." || part === "..")
	) {
		throw new Error(`Invalid content slug in ${file}`);
	}
	return { slug, lang };
}

export function assertUniqueVariants(entries: readonly Variant[]): void {
	const seen = new Map<string, string>();
	for (const entry of entries) {
		const key = `${entry.data.slug}:${entry.data.lang}`;
		const previous = seen.get(key);
		if (previous !== undefined) {
			throw new Error(
				`Duplicate content variant ${key}: ${previous} and ${entry.id}`,
			);
		}
		seen.set(key, entry.id);
	}
}

export function selectVariants<T extends Variant>(
	entries: readonly T[],
	locale: string,
): T[] {
	assertUniqueVariants(entries);
	const groups = new Map<string, T[]>();
	for (const entry of entries) {
		const group = groups.get(entry.data.slug) ?? [];
		group.push(entry);
		groups.set(entry.data.slug, group);
	}
	const preferred = [...new Set([locale, "en", "ko"])];
	const priority = (lang: string) => {
		const index = preferred.indexOf(lang);
		return index === -1 ? preferred.length : index;
	};
	return [...groups.values()].map(
		(group) =>
			group.toSorted(
				(a, b) =>
					priority(a.data.lang) - priority(b.data.lang) ||
					(a.data.lang < b.data.lang ? -1 : a.data.lang > b.data.lang ? 1 : 0),
			)[0],
	);
}
