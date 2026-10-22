import { readdir } from "node:fs/promises";

// Keep this list in sync with the feature-folder contract in README.md.
const allowed = new Set([
	"components",
	"sections",
	"layouts",
	"lib",
	"scripts",
]);
const pageFile = /^(?:Page|[A-Z][A-Za-z0-9]*Page)\.astro$/;
const root = new URL("../src/features/", import.meta.url);
const errors = [];

for (const feature of await readdir(root, { withFileTypes: true })) {
	if (!feature.isDirectory()) {
		errors.push(
			`src/features/${feature.name}: feature roots must be directories`,
		);
		continue;
	}

	for (const entry of await readdir(new URL(`${feature.name}/`, root), {
		withFileTypes: true,
	})) {
		const allowedDirectory = entry.isDirectory() && allowed.has(entry.name);
		const allowedPage = entry.isFile() && pageFile.test(entry.name);
		if (!allowedDirectory && !allowedPage) {
			errors.push(
				`src/features/${feature.name}/${entry.name}: use one of ${[...allowed].join(", ")} or a Page.astro / PascalCase *Page.astro entry point`,
			);
		}
	}
}

if (errors.length > 0) {
	console.error(errors.join("\n"));
	process.exitCode = 1;
} else {
	console.log("Feature directory structure is valid.");
}
