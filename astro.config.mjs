// @ts-check

import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import { mermaid } from "./src/lib/mermaid.ts";

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL ?? "https://jihosong.dev",
	i18n: {
		locales: ["en", "ko"],
		defaultLocale: "en",
		routing: { prefixDefaultLocale: false },
	},
	// expressiveCode must precede mdx so MDX code blocks are highlighted too.
	integrations: [expressiveCode(), mdx(), sitemap(), react()],
	markdown: {
		processor: satteri({ mdastPlugins: [mermaid] }),
	},
	vite: {
		// Nix inputs contain unrelated configs that can trigger dev-server reloads.
		server: { watch: { ignored: ["**/.direnv/**"] } },
		// Prepare the lazily imported renderer before a diagram page requests it.
		optimizeDeps: { include: ["pele/lazy"] },
		plugins: [tailwindcss()],
	},
});
