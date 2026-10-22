import { getCollection } from "astro:content";
import type { GetStaticPaths } from "astro";
import type { Props as PageProps } from "@/features/project/ProjectPage.astro";
import { selectVariants } from "@/lib/i18n/content";
import { contentMetadata } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/ui";

async function pathsForLocale(locale: Locale) {
	const entries = await getCollection("project");
	return selectVariants(entries, locale).map((project) => ({
		params: { slug: project.data.slug },
		props: {
			project,
			metadata: contentMetadata(entries, project, "/projects"),
		} satisfies PageProps,
	}));
}

export const getStaticPaths = (() =>
	pathsForLocale("en")) satisfies GetStaticPaths;
export const getKoreanStaticPaths = (() =>
	pathsForLocale("ko")) satisfies GetStaticPaths;
