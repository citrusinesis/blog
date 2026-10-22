import { getCollection } from "astro:content";
import type { GetStaticPaths } from "astro";
import type { Props as PageProps } from "@/features/blog/PostPage.astro";
import { selectVariants } from "@/lib/i18n/content";
import { contentMetadata } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/ui";

async function pathsForLocale(locale: Locale) {
	const entries = await getCollection("blog");
	return selectVariants(entries, locale).map((post) => ({
		params: { slug: post.data.slug },
		props: {
			post,
			metadata: contentMetadata(entries, post, "/blog"),
		} satisfies PageProps,
	}));
}

export const getStaticPaths = (() =>
	pathsForLocale("en")) satisfies GetStaticPaths;
export const getKoreanStaticPaths = (() =>
	pathsForLocale("ko")) satisfies GetStaticPaths;
