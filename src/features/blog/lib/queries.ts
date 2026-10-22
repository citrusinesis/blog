import { getCollection } from "astro:content";
import { selectVariants } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/ui";

export async function getPosts(locale: Locale = "en") {
	const posts = await getCollection("blog");
	return selectVariants(posts, locale).toSorted(
		(a, b) =>
			b.data.pubDate.valueOf() - a.data.pubDate.valueOf() ||
			a.data.slug.localeCompare(b.data.slug),
	);
}
