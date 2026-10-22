type Theme = "system" | "light" | "dark";

// Keep this function self-contained: BaseHead embeds its compiled body before first paint.
export function initializeTheme(): void {
	const storageKey = "blog-theme-v1";
	const media = window.matchMedia("(prefers-color-scheme: dark)");
	const root = document.documentElement;
	const isTheme = (value: unknown): value is Theme =>
		value === "system" || value === "light" || value === "dark";
	let preference: Theme = "system";

	try {
		const stored = localStorage.getItem(storageKey);
		if (isTheme(stored)) preference = stored;
	} catch {
		// Private browsing or blocked storage should not disable the toggle.
	}

	function applyTheme() {
		const dark =
			preference === "dark" || (preference === "system" && media.matches);
		root.classList.toggle("dark", dark);
		root.dataset.theme = preference;
		root.style.colorScheme = dark ? "dark" : "light";
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute("content", dark ? "#171717" : "#fdfdfc");
		const label = dark
			? "Theme: dark mode, switch to light"
			: "Theme: light mode, switch to dark";
		for (const button of document.querySelectorAll<HTMLButtonElement>(
			"button[data-theme-toggle]",
		)) {
			const localizedLabel =
				(dark
					? button.getAttribute("data-theme-dark-label")
					: button.getAttribute("data-theme-light-label")) ?? label;
			button.setAttribute("aria-label", localizedLabel);
			button.setAttribute("title", localizedLabel);
		}
	}

	applyTheme();
	document.addEventListener("DOMContentLoaded", applyTheme, { once: true });
	media.addEventListener("change", () => {
		if (preference === "system") applyTheme();
	});
	document.addEventListener("click", (event) => {
		const button =
			event.target instanceof Element
				? event.target.closest("button[data-theme-toggle]")
				: null;
		if (!button) return;
		// The first click leaves system mode for the opposite of the resolved theme.
		preference = root.classList.contains("dark") ? "light" : "dark";
		applyTheme();
		try {
			localStorage.setItem(storageKey, preference);
		} catch {
			// The selected theme still works for the current page.
		}
	});
	window.addEventListener("storage", (event) => {
		if (event.key !== storageKey && event.key !== null) return;
		preference = isTheme(event.newValue) ? event.newValue : "system";
		applyTheme();
	});
}
