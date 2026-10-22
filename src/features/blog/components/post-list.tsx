import { DateTime } from "@/features/blog/components/date-time";
import { messages } from "@/lib/i18n/messages";
import { type Locale, localizedPath } from "@/lib/i18n/ui";

interface PostListItem {
	id: string;
	data: {
		slug: string;
		lang: string;
		title: string;
		pubDate: Date;
	};
}

interface PostListProps {
	posts: readonly PostListItem[];
	locale?: Locale;
}

export function PostList({ posts, locale = "en" }: PostListProps) {
	if (posts.length === 0) {
		return <p className="empty-state">{messages[locale].noPosts}</p>;
	}

	return (
		<ul className="post-list">
			{posts.map((post) => (
				<li key={post.id}>
					<a
						className="post-link"
						href={localizedPath(
							`/blog/${post.data.slug.split("/").map(encodeURIComponent).join("/")}/`,
							locale,
						)}
					>
						<span className="post-title" lang={post.data.lang}>
							{post.data.title}
						</span>
						<DateTime date={post.data.pubDate} locale={locale} />
					</a>
				</li>
			))}
		</ul>
	);
}
