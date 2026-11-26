export interface CvSubEntry {
	title: string;
	start?: string;
	end?: string;
	currentLabel?: string;
	highlights?: readonly string[];
}

interface Props {
	lang?: string;
	title: string;
	subtitle?: string;
	description?: string;
	location?: string;
	start?: string;
	end?: string;
	endLabel?: string;
	currentLabel?: string;
	dateLocale?: string;
	url?: string;
	highlights?: readonly string[];
	subEntries?: readonly CvSubEntry[];
}
function formatDate(value: string, locale: string) {
	if (!value.includes("-")) return value;
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "short",
		timeZone: "UTC",
	}).format(new Date(`${value}-01T00:00:00Z`));
}
export function CvEntry({
	lang,
	title,
	subtitle,
	description,
	location,
	start,
	end,
	endLabel,
	currentLabel,
	dateLocale = "en",
	url,
	highlights = [],
	subEntries = [],
}: Props) {
	return (
		<div className="cv-entry" lang={lang}>
			<div className="cv-entry-heading">
				<div className="cv-entry-identity">
					<h3>
						{url ? (
							<a href={url} data-print-url={url}>
								{title}
							</a>
						) : (
							title
						)}
					</h3>
					{subtitle && <p className="cv-subtitle">{subtitle}</p>}
				</div>
				{(start || end || endLabel || currentLabel) && (
					<p className="cv-dates" lang={dateLocale}>
						{start && (
							<time dateTime={start}>{formatDate(start, dateLocale)}</time>
						)}
						{start && (end || endLabel || currentLabel) && " - "}
						{end ? (
							<time dateTime={end}>{formatDate(end, dateLocale)}</time>
						) : (
							(endLabel ?? currentLabel)
						)}
					</p>
				)}
			</div>
			{location && <p className="cv-location">{location}</p>}
			{description && <p>{description}</p>}
			{highlights.length > 0 && (
				<ul className="cv-highlights">
					{highlights.map((highlight) => (
						<li key={highlight}>{highlight}</li>
					))}
				</ul>
			)}
			{subEntries.length > 0 && (
				<div className="cv-subentries">
					{subEntries.map((sub) => (
						<div
							className="cv-subentry"
							key={`${sub.title}-${sub.start ?? ""}`}
						>
							<div className="cv-subentry-heading">
								<h4>{sub.title}</h4>
								{(sub.start || sub.end || sub.currentLabel) && (
									<p className="cv-dates" lang={dateLocale}>
										{sub.start && (
											<time dateTime={sub.start}>
												{formatDate(sub.start, dateLocale)}
											</time>
										)}
										{sub.start && (sub.end || sub.currentLabel) && " - "}
										{sub.end ? (
											<time dateTime={sub.end}>
												{formatDate(sub.end, dateLocale)}
											</time>
										) : (
											sub.currentLabel
										)}
									</p>
								)}
							</div>
							{sub.highlights && sub.highlights.length > 0 && (
								<ul className="cv-highlights">
									{sub.highlights.map((highlight) => (
										<li key={highlight}>{highlight}</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
