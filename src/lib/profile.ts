import { getCollection } from "astro:content";
import { selectVariants } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/ui";

export async function getProfile(locale: Locale = "en") {
	const profiles = await getCollection("profile");
	const profile = selectVariants(profiles, locale).find(
		(entry) => entry.data.slug === "profile",
	);
	if (!profile)
		throw new Error(
			"Required profile content is missing: src/content/profile/profile.json",
		);
	return profile.data;
}
