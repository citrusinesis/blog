export type JsonLd = Record<string, unknown>;

export function serializeJsonLd(data: JsonLd): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function webSiteJsonLd(input: {
	name: string;
	url: string;
	description: string;
	inLanguage: string;
}): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: input.name,
		url: input.url,
		description: input.description,
		inLanguage: input.inLanguage,
	};
}

export function personJsonLd(input: {
	name: string;
	url: string;
	description?: string;
	jobTitle?: string;
	worksFor?: string;
	sameAs?: readonly string[];
}): JsonLd {
	const sameAs = input.sameAs?.filter(Boolean) ?? [];
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: input.name,
		url: input.url,
		...(input.description ? { description: input.description } : {}),
		...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
		...(input.worksFor
			? { worksFor: { "@type": "Organization", name: input.worksFor } }
			: {}),
		...(sameAs.length > 0 ? { sameAs } : {}),
	};
}

export function blogPostingJsonLd(input: {
	headline: string;
	description: string;
	url: string;
	datePublished: Date;
	dateModified?: Date;
	inLanguage: string;
	authorName: string;
	authorUrl: string;
	image?: string;
}): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: input.headline,
		description: input.description,
		url: input.url,
		mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
		datePublished: input.datePublished.toISOString(),
		...(input.dateModified
			? { dateModified: input.dateModified.toISOString() }
			: {}),
		inLanguage: input.inLanguage,
		author: {
			"@type": "Person",
			name: input.authorName,
			url: input.authorUrl,
		},
		...(input.image ? { image: input.image } : {}),
	};
}
