# blog

Jiho Song’s personal site for projects and writing, built with [Astro](https://astro.build).

## Development environment

The toolchain (Node.js 24, pnpm, Biome, treefmt, and the git hook tools) is pinned by `flake.nix`.

```sh
direnv allow   # or: nix develop
pnpm install
pnpm dev --background
```

Entering the dev shell installs the git hooks automatically. The development watcher excludes `.direnv/` so Nix input sources do not trigger unrelated configuration reloads.

## Site address

The production address is `https://jihosong.dev`, configured both in Astro and the Wrangler Custom Domain route. Set the build environment variable `SITE_URL` to override the metadata base URL; changing the public hostname also requires updating `wrangler.jsonc`. Canonical URLs, alternate links, RSS and the sitemap derive from this setting. This setting does not deploy the site or modify DNS.

## Commands

| Command                       | Action                                                     |
| ----------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                    | Start the dev server at `localhost:4321`                   |
| `pnpm build`                  | Build the site into `./dist/`                              |
| `pnpm run deploy`                 | Build and deploy to Cloudflare Workers                     |
| `pnpm deploy:dry-run`         | Build and validate Wrangler deployment without publishing |
| `pnpm preview`                | Preview the build locally                                  |
| `pnpm test:cv`               | Validate CV fields and empty-section data defaults           |
| `pnpm test:i18n`             | Test language selection and content identity rules          |
| `pnpm check`                  | Validate feature folders and type-check Astro/content      |
| `treefmt`                     | Format everything (Biome for web files, nixfmt for Nix)    |
| `biome lint`                  | Lint JS/TS/JSON/CSS/Astro                                  |
| `pre-commit run --all-files`  | Run every pre-commit hook against the whole repo           |
| `nix flake check`             | Run treefmt and the pre-commit hooks in the Nix sandbox    |

## Deployment

The site is pre-rendered Astro HTML served with Cloudflare Workers Static Assets. `wrangler.jsonc` deploys `dist/` to the `jihosong` Worker and connects `jihosong.dev` as a Custom Domain. No SSR adapter or Worker entry script is needed. `packageManager` pins pnpm for CI; Node.js 24 matches the development shell. `pnpm-workspace.yaml` allows the native install scripts used by esbuild, sharp and workerd.

### Local deployment

```sh
pnpm install --frozen-lockfile
pnpm deploy:dry-run
pnpm exec wrangler login
pnpm run deploy
```

The dry run builds and validates the asset deployment locally, without publishing or attaching the domain. It does not verify Cloudflare credentials, account permissions, DNS or certificate issuance. `pnpm run deploy` builds before uploading; a successful deployment applies the configured Custom Domain as well.

Before the first deployment, add `jihosong.dev` to the target Cloudflare account and ensure the zone is active. Preserve the domain's existing email MX/TXT records if moving DNS. Resolve any conflicting DNS record on the hostname before attaching the Custom Domain. Cloudflare manages its DNS record and TLS certificate. No Cloudflare credentials belong in this repository.

### GitHub Actions

`.github/workflows/deploy.yml` deploys on pushes to `main`, and supports **Actions → Deploy to Cloudflare Workers → Run workflow** on `main`. Other branches cannot deploy through this workflow. It installs with the frozen lockfile, runs the CV/i18n tests and `pnpm check`, then builds and deploys. Production runs are serialized to avoid overlapping deployments.

Under **Repository Settings → Secrets and variables → Actions → Repository secrets**, add:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A scoped Cloudflare API token for Workers deployment |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID that owns the Worker and domain |

Use Cloudflare's **Edit Cloudflare Workers** token template, limited to the intended account and the `jihosong.dev` zone. For the current granular roles, creating the Worker initially requires **Admin at the Workers product scope**. Deploying an existing Worker requires **Editor**; Custom Domains currently require product-level access rather than per-Worker roles, plus **Zone → Workers Routes → Write** scoped to `jihosong.dev`. The Edit Cloudflare Workers template is the official starting point; confirm these capabilities before the first deployment. Find Account ID under **Workers & Pages → Account Details**, or use dashboard search (`Cmd/Ctrl+K`) and **Copy account ID**. Local `pnpm exec wrangler login` uses browser OAuth and can authenticate deployments from this computer; it does not authenticate GitHub-hosted Actions runners. The workflow's GitHub token only needs `contents: read`; Cloudflare secrets are passed only to the deployment step.

Push this configuration and the site to the repository's `main` branch after adding the secrets to enable automatic deployment. Do not also enable Workers Builds for the same branch unless duplicate deployment triggers are intentional. Changing these files alone does not create GitHub secrets, publish the site, or modify DNS.

References: [Static Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/#if-you-have-a-static-site), [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [GitHub Actions authentication](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).

## UI components

Styling is Tailwind CSS v4 with [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) (`base-nova` preset).
Theme tokens live in `src/styles/global.css`. Without a saved choice, the theme follows the system preference. The footer’s borderless `Theme` button switches only between light and dark; choices are saved in local storage and synced across tabs. `features/theme/components/theme-toggle.tsx` wraps the existing shadcn Button, renders as static HTML, and uses the head theme script for immediate changes without client-side React hydration.
Post bodies use `@tailwindcss/typography` (`prose`).

```sh
pnpm shadcn add dialog   # components land in src/components/ui/
```

React components render as static HTML by default; add a `client:*` directive where one needs interactivity on the page.

## Component architecture

Organize code by domain under `src/features/`. Reserve `src/components/ui/` for shadcn source; feature-specific wrappers live with their feature, and shared custom UI lives directly in `src/components/`.

### Feature folder contract

Each feature may contain only the five top-level directories below, plus optional page entry points named `Page.astro` or PascalCase `*Page.astro` (for example `PostPage.astro` and `AboutPage.astro`). Other files belong in the appropriate directory. Create only what is needed; do not add empty placeholders.

| Directory | Responsibility | Current examples |
| --- | --- | --- |
| `components/` | Reusable UI, normally TSX; thin Astro integration adapters where required | `post-list.tsx`, `project-list.tsx`, `date-time.tsx`, `theme-toggle.tsx` |
| `sections/` | Page sections that assemble headings, UI, and navigation | `Writing.astro`, `Introduction.astro`, `Projects.astro` |
| `layouts/` | Feature-specific page/content frames | `BlogPost.astro` |
| `lib/` | Domain types, queries, transformations, and helpers | `queries.ts`, `routes.ts` |
| `scripts/` | Browser initialization/entry scripts | `bootstrap.ts` |

Do not introduce parallel layer names such as `markdown/`, `services/`, `utils/`, or `hooks/` at a feature root. Keep that code in the appropriate directory above. If a new top-level directory becomes necessary, revise this shared contract and its validator first rather than adding a feature-specific exception.

`pnpm check` validates this directory contract before running Astro's type checker. The validator is `scripts/check-feature-structure.mjs`.

```text
src/
  features/
    blog/
      Page.astro           # Blog index screen
      PostPage.astro       # Individual post screen
      components/          # post-list.tsx, date-time.tsx
      sections/Writing.astro
      layouts/BlogPost.astro
      lib/                 # queries.ts, routes.ts, rss.ts
    project/
      Page.astro           # All projects
      ProjectPage.astro    # Individual project screen
      components/project-list.tsx
      sections/Projects.astro
      layouts/Project.astro
      lib/                 # queries.ts, routes.ts
    home/
      Page.astro           # Compose profile, project, and blog features
    profile/
      sections/Introduction.astro
    about/
      Page.astro           # CV screen and print document
      components/cv-entry.tsx
      sections/            # Experience, Projects, Education, AwardsAndCertifications, Skills
      lib/                 # CV query and schema
    theme/
      components/theme-toggle.tsx
      scripts/bootstrap.ts
  components/
    ui/button.tsx          # shadcn source only
    text-link.tsx          # Shared custom UI
    MermaidDiagrams.astro  # Shared diagram rendering integration
  layouts/                 # Base document, metadata, header, footer
  pages/                   # Thin route wrappers and handler re-exports
  content/
    profile/               # Language-specific profile JSON files
    cv/                    # Language-specific CV JSON files
    project/               # Project Markdown/MDX entries
    blog/                  # Blog Markdown/MDX entries
  content.config.ts        # Astro collection registration
  lib/                     # Shared profile query, Markdown plugin, utilities
  consts.ts                # Shared site title and description
  styles/                  # Global theme tokens and styling
```

- Folder names describe responsibility; file extensions describe implementation. UI uses TSX by default, while current sections/layouts use Astro. Astro-specific script adapters may remain `.astro` inside `components/`.
- Feature-root pages own their input contracts, content rendering, page presentation, and section composition. Collection-backed Astro pages may accept collection entries directly; do not re-fetch entries already supplied by the route. The home is a composition feature: `features/home/Page.astro` gathers data through existing queries and arranges Introduction from profile, Projects from project, and Writing from blog. Keep domain queries, types, and section implementations in their owning features; home owns only their page-level composition.
- Keep framework entry points (`pages/`, `content.config.ts`) in their conventional Astro locations.
- Prefer existing shadcn components. Customize their source in `components/ui/`, or create a feature wrapper outside that directory.
- Render TSX as static HTML by default. Add `client:*` only when React needs to own browser state. Theme initialization is authored in `features/theme/scripts/bootstrap.ts`. `BaseHead.astro` embeds the compiled, self-contained initializer before first paint; raw TypeScript is never inserted into the browser.
- Keep small UI components independent of Astro APIs and content queries; pass the minimal data needed through props.
- Extract reusable behavior or coherent sections; ordinary HTML does not need a wrapper for every tag.
- TSX files use kebab-case names to match shadcn. Astro sections/layouts use PascalCase. Import modules directly rather than through barrel exports.

### Route boundary

`src/pages/` is a routing adapter only. Keep URL parameter mapping, required framework exports, type bridges, and necessary prop forwarding there. Keep content queries, Markdown rendering APIs, page text, layouts, and section composition out of route files. Feature pages render content; feature `lib/` modules provide reusable queries and path generators.

Astro screen routes use a minimal wrapper because the feature page owns the rendered document:

```astro
---
import Page from "@/features/home/Page.astro";
---

<Page />
```

Feature pages own their input types. Collection-backed Astro pages and layouts reuse `CollectionEntry` types from `astro:content`: `PostPage.astro` accepts `{ post: CollectionEntry<"blog"> }`, while `BlogPost.astro` uses `CollectionEntry<"blog">["data"]`. This keeps validated content, dates, and image metadata aligned with the collection schema without duplicate presentation types or pass-through mapping adapters.

Keep reusable TSX components independent of Astro and collection types. Define structural props containing only the values the UI needs, as in `post-list.tsx` and `date-time.tsx`. Add a separate data adapter only when a real transformation or another data source requires it.

Dynamic routes re-export `getStaticPaths` from feature `lib/routes.ts` and explicitly pass the collection entry to the feature page. The feature page renders Markdown without another lookup:

```astro
---
import PostPage, { type Props as PostPageProps } from "@/features/blog/PostPage.astro";

export { getStaticPaths } from "@/features/blog/lib/routes";

type Props = PostPageProps;
const { post, metadata } = Astro.props;
---

<PostPage post={post} metadata={metadata} />
```

Path generators check their supplied props against the page-owned type with `satisfies PostPageProps`. Pass named props explicitly instead of spreading `Astro.props` into feature pages. Passing typed collection data to a content layout (`<BlogPost {...post.data}>`) is allowed. Endpoint routes re-export handlers, e.g. `src/pages/rss.xml.ts` exports `GET` from `features/blog/lib/rss.ts`. Existing URLs remain unchanged.

## Personalizing the site

Edit `src/content/profile/profile.json` (English) and `profile.ko.json` (Korean) to set your name, introduction, and contact links. Both are validated by the `profile` collection and selected through `src/lib/profile.ts` using the same fallback rules as other content. Do not nest translations inside a profile. Optional contact fields can be omitted; the pending replacement email is intentionally absent. Site metadata derives from this content without depending on the project feature. Empty or omitted GitHub and email values are hidden.

Add project entries under `src/content/project/` as Markdown or MDX. The `project` collection validates required `name` and `description`, optional `href` (a link to the actual project), optional integer `order` (default `0`), optional `role`/`start`/`end`, and a `printSummary` array of concise bullets (default empty) for CV printing. Dates use `YYYY` or `YYYY-MM`. Lower `order` values appear first; ties use the logical slug, after selecting a language variant. The home shows the first five projects and links to `/projects/`, which lists all projects. Each list item links to `/projects/<slug>/`, where the Markdown body is rendered and an optional project-visit link uses `href`. No project entries hides the home Projects section and shows an empty state on the listing page.

`features/project/` follows the blog structure: `Page.astro` for the listing, `ProjectPage.astro` for a single entry, a TSX list, a home section, a content layout, queries, and a dynamic path generator. `features/profile/` owns the home Introduction section; `features/about/` owns the CV screen at `/about/` and `/ko/about/`. `features/home/Page.astro` owns the home screen and composes profile, project, and blog sections using their existing queries. Route files only connect these feature pages.

Keep authored profile and project data in `src/content/`, not feature TypeScript constants or a configuration folder. Features contain queries and presentation, and Astro components reuse collection types. The schemas live in `src/content.config.ts`.

Demo posts, sample projects, generic About prose, stock images, and Astro-branded favicons have been removed. The blog collection is empty and retained by `.gitkeep`. The project collection contains the owner’s source-backed Network Tunneler and Speacher entries in English and Korean. CV files contain source-backed career information and no invented entries. Add real content to populate them. Do not reintroduce demonstration content into published collections.

The home page lists the five most recent posts from `src/content/blog/`; `/blog/` lists all posts. Both use the same date-sorted list component. Add Markdown or MDX files to publish new entries.

## Language and i18n

English UI lives at the existing paths; Korean UI lives under `/ko/` (home, About, writing, projects, details, and RSS). Astro i18n uses `defaultLocale: "en"` and `prefixDefaultLocale: false`. The footer's ordinary language link preserves the same logical page. The URL is authoritative: there are no automatic browser-language redirects, language cookies, or client hydration.

UI dictionaries, URL helpers, content selection, loader integration, and content metadata live in `src/lib/i18n/`:

```text
src/lib/i18n/
  ui.ts                   # Locale types and URL helpers
  messages.ts             # Dictionary imports and English-key type contract
  messages/
    en.json
    ko.json
  content.ts              # Filename parsing and variant selection
  loader.ts               # Astro collection loading integration
  metadata.ts             # Canonical and alternate URLs
```

Keep menu/button labels, empty states, navigation descriptions, and accessibility messages in the language JSON files. `messages.ts` checks required keys against English; `pnpm test:i18n` checks exact key parity, including extra keys. Keep logic out of the JSON files and prose out of the UI dictionaries.

About is the CV screen, backed by `src/content/cv/cv.json` and `cv.ko.json`. CV JSON uses the same filename, duplicate and fallback rules as profiles. It replaces the old optional About Markdown collection. Keep CV content in these JSON files and section labels in the UI dictionaries; the profile JSON remains the separate short introduction used on the home screen.

Features are shared across both route trees. Reusable TSX receives structural content data and a plain UI locale; it never imports Astro APIs. Profiles use separate JSON files under `src/content/profile/`, selected by the same filename and fallback rules.

### Content filenames and selection

Use the same logical slug for variants under `src/content/blog/` and `src/content/project/`:

```text
hello-world.md          # English, equivalent to hello-world.en.md
hello-world.ko.md       # Korean
hello-world.ja.mdx      # Japanese
nested/hello.zh-Hant.md # A nested slug with a language tag
```

Profiles and CVs use the same convention with `.json` files. A final two- or three-letter language code, optionally followed by BCP 47 subtags, is treated as a language suffix. Tags are validated and normalized to lowercase (e.g. `zh-Hant` becomes `zh-hant`). A missing suffix means `en`; no language is guessed from the text. That final language-shaped segment is reserved for the suffix, so use hyphens for similar words inside a slug. Markdown and MDX follow the same rules. Public URLs use only the logical slug, never the filename's language suffix or extension.

The loader wraps Astro's `glob()` so Markdown/MDX rendering, JSON loading, and file watching remain available. It retains every physical file with a unique ID, adds schema-validated `data.slug` and `data.lang` from the filename, and rejects duplicate logical slug/language pairs before loading. Therefore `hello-world.md` plus `hello-world.en.md`, or `.md` plus `.mdx` for the same pair, is an error. Do not override slug or language in frontmatter; conflicting values are rejected. Collection IDs are internal file identities, not public slugs.

Queries group by `data.slug` and choose **requested UI language → en → ko → remaining languages in language-code order**, skipping repeated preferences. Each logical item appears once. Choose variants before sorting and applying the home limit; use the same helper for listings, details, and RSS. Blog sorting uses the selected variant's publication date, then slug; projects use the selected variant's order, then slug. Translation metadata should generally retain the same publication date/order across variants.

A translation is optional. Korean UI can show an English-only post, and English UI can show a Korean-only post. Documents carry the UI language; articles, titles, and descriptions carry the actual content language. Details show the actual language when fallback occurs. The selector retains the slug and lets the target UI apply the same fallback rules.

Detail canonical links point to the selected content's native UI route (`/ko/` for Korean, unprefixed for English or other languages). Content `hreflang` links advertise only real English/Korean variants. Fallback pages are not advertised as translations. Other content languages are supported for fallback without adding new UI routes. Static UI screens advertise the two localized UI variants. Both RSS feeds select one item per slug and use their own localized detail links.

Run `pnpm test:i18n` for filename parsing, duplicate detection, selection priority, list grouping, URL switching, and dictionary-key checks.

References: [Astro internationalization](https://docs.astro.build/en/guides/internationalization/) and [content loaders](https://docs.astro.build/en/reference/content-loader-reference/).

## CV and printing

`features/about/Page.astro` renders one semantic CV article for the web and browser printing. `/about/` and `/ko/about/` are thin wrappers around the same feature. `lib/queries.ts` selects the requested CV variant and produces canonical/alternate URLs for the About route. The schema lives in `features/about/lib/schema.ts` and is registered as the `cv` collection.

CV fields:

- `name` is required; `headline`, `summary`, `email`, and `phone` are optional.
- `links` contains `{ label, href }` HTTP(S) links.
- `experience` entries have `organization`, `role`, required `start`, optional `team`, `end`, `location`, `url`, and `current` (default false). A current role must omit `end`. `highlights` holds existing concise bullets; `responsibilities` holds recurring scope. `achievements` holds `{ action, result?, evidence?, technologies? }` records. `action` is required; `evidence` can contain a measured before/after change, period, scale, or attributable result. Only use verified, public information.
- `education` entries have `institution`, `qualification`, optional `location`, `start`, completed `end`, `expectedGraduation: { year, semester?: 1 | 2 }`, and `highlights`. Do not set both completed `end` and expected graduation. Semester dates are displayed as semesters, never converted into invented months.
- `printProjects` contains only logical slugs from the site’s `project` collection, in print order (for example `["network-tunneler", "speacher"]`). The CV contacts omit the Projects link. The web Projects section shows only project-name links to localized internal detail pages; the heading is plain text and a small All projects link below the list leads to the listing. Print hides the web project links and All projects link and shows the selected project summaries instead. The printed CV resolves those entries using requested language → en → ko → remaining languages and uses their `name`, `description`, optional `role`/`start`/`end`, `href`, and `printSummary` bullet array. Author print summaries in project frontmatter, never copy project content into CV JSON. Duplicate slugs, missing projects, and selected projects without a print summary fail validation/build. An empty list omits the print section and heading. The full Markdown body remains the web project detail content.
- `awards` contains `{ name, distinction, year?, highlights? }`; `certifications` contains `{ name, issuer, date? }`. Omit unknown award/certification dates. Render both arrays under one Awards & Certifications section (수상 및 자격증), awards first then certifications, without separate subheadings. Hide the section only when both arrays are empty.
- `skills` contains `{ name, items }` groups.

Dates use `YYYY` or `YYYY-MM` and are displayed in the UI locale. For experience, `current: true` explicitly means Present and cannot coexist with an end date. For education, expected graduation retains its year/semester precision. Arrays default to empty. Missing data omits its section entirely, including its heading; never add sample employers, qualifications, dates, or skills to populate the layout. The current files use the supplied resume, with current Asteromorph employment (Head, DX Team, January 2026 to Present) and expected graduation in the second semester of 2028 supplied directly by the owner. Current-role responsibilities and achievements remain empty pending detailed input. The profile and CV summary reflect the owner-confirmed Rust focus, systems/data work (ETL and crawlers), Kubernetes/OpenTofu infrastructure, GPU server operations, and agent VMM development. Rust is listed first; these areas do not imply unprovided ML/CUDA expertise, virtualization backends, metrics, or outcomes. Do not assume what DX stands for, invent leadership scope/metrics, or recast projects as employment. The owner-confirmed email is `me@jihosong.dev` in both profile and CV language variants. Phone numbers remain omitted.

`src/styles/cv.css` styles the web view. `src/styles/print.css` is imported by the CV page only and uses `@media print`/`@page` for A4 with 13 mm vertical and 15 mm horizontal margins, white paper, dark text, serif print typography, and thin section rules. Printing hides the site header/footer, language/theme controls, skip link, and Astro toolbar. HTTP(S) links expose their destinations in print. The same HTML supplies both modes; there is no duplicated print document, JavaScript interception of Ctrl-P, print button, or client hydration.

The print layout uses one column and linear DOM order for role, organization, dates, and bullets. Contact information is normal document content, not a repeated page header/footer. Avoid tables, text boxes, graphical skill bars, photos, and hidden keyword stuffing. These choices improve parseability but do not guarantee ATS parsing or recruiter screening outcomes. Section headings stay with the following content. Entry headings and short bullets avoid breaks, while long entries can flow across pages. Browser print settings can override paper/margins and add their own headers/footers; disable browser headers/footers for a clean PDF. Ctrl-P (Cmd-P on macOS) and Save as PDF use these styles. Do not shrink arbitrary CV content to force one page.

## Diagrams and code blocks

Markdown goes through Astro's default Sätteri processor (`markdown.processor` in `astro.config.mjs`).

- ` ```mermaid ` fences are rendered in the browser by [pele](https://pele.run); `src/lib/mermaid.ts` turns them into `pre.pele-diagram`, and `src/components/MermaidDiagrams.astro` loads pele only on pages that contain one.
- All other fences are highlighted at build time by [Expressive Code](https://expressive-code.com), configured in `ec.config.mjs` (titles, terminal frames, `{n}` / `ins` / `del` markers, `showLineNumbers`, `collapse`).

Code blocks use `frame: "none"` by default, with a subtle background, no border or shadow, and a copy button. Title metadata stays in the Markdown source. Add `frame="code"` or `frame="terminal"` to an individual fence if a visible title bar is useful.

Code and diagram rendering remains available for real posts; the demonstration article has been removed.

## Git hooks

Managed by [git-hooks.nix](https://github.com/cachix/git-hooks.nix); the generated `.pre-commit-config.yaml` is not tracked.

- pre-commit: treefmt, biome lint, typos, markdownlint, statix, deadnix
- pre-push: `astro check` (needs `node_modules`, so it is excluded from `nix flake check`)
