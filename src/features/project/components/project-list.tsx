import { messages } from "@/lib/i18n/messages";
import { type Locale, localizedPath } from "@/lib/i18n/ui";

interface ProjectListItem {
	id: string;
	data: {
		slug: string;
		lang: string;
		name: string;
		description: string;
	};
}

interface ProjectListProps {
	projects: readonly ProjectListItem[];
	headingLevel?: 2 | 3;
	locale?: Locale;
}

export function ProjectList({
	projects,
	headingLevel = 2,
	locale = "en",
}: ProjectListProps) {
	const Heading = headingLevel === 2 ? "h2" : "h3";
	if (projects.length === 0) {
		return <p className="empty-state">{messages[locale].noProjects}</p>;
	}

	return (
		<ul className="project-list">
			{projects.map(({ id, data: project }) => (
				<li key={id}>
					<a
						className="project-link"
						href={localizedPath(
							`/projects/${project.slug.split("/").map(encodeURIComponent).join("/")}/`,
							locale,
						)}
					>
						<Heading lang={project.lang}>{project.name}</Heading>
						<p lang={project.lang}>{project.description}</p>
					</a>
				</li>
			))}
		</ul>
	);
}
