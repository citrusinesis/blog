export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];
export interface LanguageMetadata {
	canonicalPath: string;
	alternates: { lang: Locale; href: string }[];
}

export function localeFromPath(path: string): Locale {
	return path === "/ko" || path.startsWith("/ko/") ? "ko" : "en";
}

export function localizedPath(path: string, locale: Locale): string {
	const plain = path.replace(/^\/ko(?=\/|$)/, "") || "/";
	return locale === "ko" ? `/ko${plain}` : plain;
}
