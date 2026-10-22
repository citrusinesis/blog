import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE_TITLE } from "@/consts";
import { getPosts } from "@/features/blog/lib/queries";
import { type Locale, localizedPath } from "@/lib/i18n/ui";
import { getProfile } from "@/lib/profile";

function feed(locale: Locale): APIRoute {
	return async ({ site }) => {
		if (!site)
			throw new Error("Set site in astro.config.mjs to generate the RSS feed.");
		const [posts, profile] = await Promise.all([
			getPosts(locale),
			getProfile(locale),
		]);
		return rss({
			title: SITE_TITLE,
			description: `${profile.intro} ${profile.description}`,
			site,
			customData: `<language>${locale}</language>`,
			items: posts.map((post) => ({
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: localizedPath(
					`/blog/${post.data.slug.split("/").map(encodeURIComponent).join("/")}/`,
					locale,
				),
			})),
		});
	};
}
export const GET = feed("en");
export const GET_KO = feed("ko");
