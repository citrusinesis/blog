import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { cvSchema } from "./features/about/lib/schema";
import { localizedContent } from "./lib/i18n/loader";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: localizedContent("./src/content/blog"),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			slug: z.string(),
			lang: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const profile = defineCollection({
	loader: localizedContent("./src/content/profile", ["json"]),
	schema: z.object({
		name: z.string(),
		intro: z.string(),
		description: z.string(),
		slug: z.string(),
		lang: z.string(),
		github: z.string().default(""),
		email: z.string().default(""),
	}),
});

const project = defineCollection({
	loader: localizedContent("./src/content/project"),
	schema: z.object({
		name: z.string(),
		description: z.string(),
		slug: z.string(),
		lang: z.string(),
		href: z.string().optional(),
		order: z.number().int().default(0),
		role: z.string().optional(),
		start: z
			.string()
			.regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/)
			.optional(),
		end: z
			.string()
			.regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/)
			.optional(),
		printSummary: z.array(z.string().min(1)).default([]),
	}),
});

const cv = defineCollection({
	loader: localizedContent("./src/content/cv", ["json"]),
	schema: cvSchema,
});

export const collections = { blog, profile, project, cv };
