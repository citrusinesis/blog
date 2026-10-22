// @ts-check

import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
	themes: ["github-light", "github-dark"],
	// Follow the root theme class, including saved overrides of the system theme.
	useDarkModeMediaQuery: false,
	themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : false),
	plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
	defaultProps: {
		frame: "none",
		showLineNumbers: false,
	},
	styleOverrides: {
		borderRadius: "0",
		borderWidth: "0",
		codeBackground: "var(--muted)",
		codeFontSize: "calc(0.8125rem + var(--font-size-step))",
		uiFontFamily: "var(--font-sans)",
		codeFontFamily: "var(--font-mono)",
		frames: {
			frameBoxShadowCssValue: "none",
		},
	},
});
