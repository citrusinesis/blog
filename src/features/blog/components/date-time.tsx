import type { Locale } from "@/lib/i18n/ui";

interface DateTimeProps {
	date: Date;
	locale?: Locale;
}

export function DateTime({ date, locale = "en" }: DateTimeProps) {
	const formatter = new Intl.DateTimeFormat(
		locale === "ko" ? "ko-KR" : "en-CA",
		{
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			timeZone: "UTC",
		},
	);
	return <time dateTime={date.toISOString()}>{formatter.format(date)}</time>;
}
