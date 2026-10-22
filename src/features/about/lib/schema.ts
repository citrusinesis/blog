import { z } from "astro/zod";

const date = z
	.string()
	.regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/, "Use YYYY or YYYY-MM");
const url = z
	.url()
	.refine((value) => /^https?:\/\//.test(value), "Use an HTTP(S) URL");
const highlights = z.array(z.string().min(1)).default([]);

export const cvSchema = z.object({
	slug: z.string(),
	lang: z.string(),
	name: z.string().min(1),
	headline: z.string().optional(),
	summary: z.string().optional(),
	email: z.email().optional(),
	phone: z.string().min(1).optional(),
	links: z.array(z.object({ label: z.string().min(1), href: url })).default([]),
	experience: z
		.array(
			z
				.object({
					organization: z.string().min(1),
					role: z.string().min(1),
					team: z.string().optional(),
					start: date,
					end: date.optional(),
					current: z.boolean().default(false),
					location: z.string().optional(),
					url: url.optional(),
					highlights,
					responsibilities: highlights,
					achievements: z
						.array(
							z.object({
								action: z.string().min(1),
								result: z.string().optional(),
								evidence: z.string().optional(),
								technologies: z.array(z.string().min(1)).default([]),
							}),
						)
						.default([]),
				})
				.refine(
					(entry) => !(entry.current && entry.end),
					"A current role cannot have an end date",
				),
		)
		.default([]),
	education: z
		.array(
			z
				.object({
					institution: z.string().min(1),
					qualification: z.string().min(1),
					location: z.string().optional(),
					start: date.optional(),
					end: date.optional(),
					expectedGraduation: z
						.object({
							year: z.number().int().min(1900).max(2200),
							semester: z.union([z.literal(1), z.literal(2)]).optional(),
						})
						.optional(),
					highlights,
				})
				.refine(
					(entry) => !(entry.end && entry.expectedGraduation),
					"Use either completed end or expected graduation",
				),
		)
		.default([]),
	printProjects: z
		.array(z.string().min(1))
		.default([])
		.refine(
			(slugs) => new Set(slugs).size === slugs.length,
			"CV print project slugs must be unique",
		),
	awards: z
		.array(
			z.object({
				name: z.string().min(1),
				distinction: z.string().min(1),
				year: z.number().int().min(1900).max(2200).optional(),
				highlights,
			}),
		)
		.default([]),
	certifications: z
		.array(
			z.object({
				name: z.string().min(1),
				issuer: z.string().min(1),
				date: date.optional(),
			}),
		)
		.default([]),
	skills: z
		.array(
			z.object({
				name: z.string().min(1),
				items: z.array(z.string().min(1)).min(1),
			}),
		)
		.default([]),
});
