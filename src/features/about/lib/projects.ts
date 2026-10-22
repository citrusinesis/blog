interface PrintProject {
	data: { slug: string; printSummary: readonly string[] };
}

export function selectPrintProjects<T extends PrintProject>(
	slugs: readonly string[],
	projects: readonly T[],
): T[] {
	const bySlug = new Map(
		projects.map((project) => [project.data.slug, project]),
	);
	return slugs.map((slug) => {
		const project = bySlug.get(slug);
		if (!project) throw new Error(`CV print project not found: ${slug}`);
		if (!project.data.printSummary.length)
			throw new Error(`CV print project requires printSummary: ${slug}`);
		return project;
	});
}
