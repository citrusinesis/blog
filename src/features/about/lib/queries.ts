import { getCollection } from "astro:content";
import { getProjects } from "@/features/project/lib/queries";
import { selectVariants } from "@/lib/i18n/content";
import { contentMetadata } from "@/lib/i18n/metadata";
import { type Locale, localizedPath } from "@/lib/i18n/ui";
import { selectPrintProjects } from "./projects";

export async function getCv(locale: Locale = "en") {
	const entries = await getCollection("cv");
	const cv = selectVariants(entries, locale).find(
		(entry) => entry.data.slug === "cv",
	);
	if (!cv)
		throw new Error("Required CV content is missing: src/content/cv/cv.json");
	const metadata = contentMetadata(entries, cv, "");
	// The CV's logical content name is cv; its public screen remains /about/.
	return {
		cv: cv.data,
		printProjects: selectPrintProjects(
			cv.data.printProjects,
			await getProjects(locale),
		),
		metadata: {
			canonicalPath: localizedPath(
				"/about/",
				cv.data.lang === "ko" ? "ko" : "en",
			),
			alternates: metadata.alternates.map((alternate) => ({
				...alternate,
				href: localizedPath("/about/", alternate.lang),
			})),
		},
	};
}
