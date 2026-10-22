import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { glob, type Loader } from "astro/loaders";
import { assertUniqueVariants, contentIdentity } from "./content";

// Let Astro keep Markdown/MDX rendering, dependencies and file watching.
export function localizedContent(
	base: string,
	extensions: readonly string[] = ["md", "mdx"],
): Loader {
	const loader = glob({
		base,
		pattern: extensions.map((extension) => `**/*.${extension}`),
		generateId: ({ entry }) => entry,
	});
	return {
		name: "localized-content",
		async load(context) {
			const directory = fileURLToPath(
				new URL(`${base.replace(/\/$/, "")}/`, context.config.root),
			);
			const files = (await readdir(directory, { recursive: true })).filter(
				(file) =>
					extensions.some((extension) => file.endsWith(`.${extension}`)),
			);
			assertUniqueVariants(
				files.map((id) => ({ id, data: contentIdentity(id) })),
			);
			await loader.load({
				...context,
				parseData: (options) => {
					const identity = contentIdentity(options.id);
					if (
						options.data.lang !== undefined &&
						options.data.lang !== identity.lang
					) {
						throw new Error(
							`Content language must come from the filename: ${options.id}`,
						);
					}
					if (
						options.data.slug !== undefined &&
						options.data.slug !== identity.slug
					) {
						throw new Error(
							`Content slug must come from the filename: ${options.id}`,
						);
					}
					return context.parseData({
						...options,
						data: { ...options.data, ...identity },
					});
				},
			});
		},
	};
}
