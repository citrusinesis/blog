import { getCollection } from "astro:content";
import { selectVariants } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/ui";

export async function getProjects(locale: Locale = "en") {
	const projects = await getCollection("project");
	return selectVariants(projects, locale).toSorted(
		(a, b) =>
			a.data.order - b.data.order || a.data.slug.localeCompare(b.data.slug),
	);
}
