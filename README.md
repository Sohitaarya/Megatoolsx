# MegaToolsX

The world's largest Digital Tools Knowledge Platform — teaches users everything about 2,500+ digital tools generated from a CSV database.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- React Router v7 (BrowserRouter, route-level code-splitting)
- Tailwind CSS v4
- Framer Motion
- PapaParse (XMLHttpRequest CSV, fetched at runtime — not bundled)
- React Helmet Async (SEO)
- Self-hosted variable fonts (@fontsource Inter + JetBrains Mono)
- Zustand (state)

## Getting Started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
```

## Data

- `public/tools.csv` — primary tool database (2,500+ rows). Rows with
  `Status = Present / Generative / Future` are included. It is **fetched at runtime**
  from `/tools.csv` (NOT embedded in the JS bundle) — this removes ~700KB from the
  initial payload and is the single biggest Core Web Vitals improvement.
- `public/sitemap.xml` + `public/sitemap-index.xml` — sitemap index (20,396 URLs)
  pointing to split per-type sitemaps. Generated every build.
- `public/llms.txt` + `public/llms-full.txt` — LLM/AI-crawler discovery files.
- `public/robots.txt` — crawl rules + sitemap declaration.
- `public/rss.xml` — blog RSS feed.

Adding/removing rows in `tools.csv` and rebuilding automatically updates every tool
page, the sitemap index, the split sitemaps, `llms-full.txt`, and the RSS feed.

## SEO & Performance (production-ready)

- **Per-page SEO component** `src/components/seo/SEOHead.tsx` emits unique title,
  meta description, canonical, Open Graph, Twitter cards, hreflang, and JSON-LD.
- **Schema builders** `src/components/seo/schemas.ts`: Organization, WebSite +
  SearchAction, WebPage, BreadcrumbList, CollectionPage, ItemList, SoftwareApplication,
  FAQPage, BlogPosting, AboutPage, ContactPage. Organization/WebSite live statically in
  `index.html` so JS-less crawlers see them.
- **Sitemap generation** `scripts/generate-sitemap.mjs` splits URLs into static /
  categories / blog / tools-N / ai-tools / images sitemaps under a root index, well
  under Google's 50k-URL and 50MB limits. Thin placeholder tool sub-pages are `noindex`.
- **Code-splitting**: every route is `React.lazy`, so first paint ships only the Home
  kernel (~165KB gzip). Tool pages pull the ToolEngine on demand.
- **Security headers** in `public/_headers`: CSP, HSTS, X-Content-Type-Options,
  X-Frame-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy,
  plus immutable cache for hashed assets.
- **Self-hosted fonts** eliminate the render-blocking Google Fonts request.

## AI integration (optional but recommended)

The tool engine is **fully functional without any API key** — it uses deterministic,
real algorithms and domain templates. To turn generative tools into genuine LLM-powered
assistants, configure the **secure server-side proxy** (Cloudflare Pages Function at
`functions/api/ai.ts`). The key never ships to the browser.

Set these in the Cloudflare Pages dashboard (Project → Settings → Environment variables):

```
AI_API_KEY  = sk-...                       # secret — stored server-side
AI_BASE_URL = https://api.openai.com/v1   # or Groq / OpenRouter / Mistral / etc.
AI_MODEL    = gpt-4o-mini
```

Any OpenAI-compatible provider works. When a key is present, AI-natured tools call the
LLM through the proxy; otherwise they fall back to the offline engine. The active mode
is shown on each tool page ("AI powered" vs "Local engine"). To develop locally with
the proxy, run `npx wrangler pages dev` (it injects `.dev.vars`).

## Tool engine architecture

- `src/lib/ai/client.ts` — provider-agnostic LLM client (Chat Completions).
- `src/lib/ai/compute.ts` — real deterministic algorithms (converters, calculators,
  hashes via Web Crypto, base64/JSON codecs, counters, secure generators).
- `src/lib/ai/engine.ts` — classifier + ~30 domain handlers that give **every tool a
  genuinely useful result** from its name/category/input (resumes, business plans,
  diet/workout/travel/lesson planners, SEO content, financial & tax calculators, etc.).
- `src/components/tool-engine/CapabilityTool.tsx` — the universal UI every tool routes
  through when no hand-crafted sub-component exists.

Because coverage is driven by a classifier + capability registry (not one component per
tool), **any number of tools can be added to `tools.csv` without architectural changes** —
they get SEO (title/meta/canonical/JSON-LD/sitemap) and a real working interface
automatically.

## Deployment

### Option A: Cloudflare Pages (recommended)

1. Push the repo to GitHub/GitLab.
2. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Framework preset: **Vite** (or React).
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. SPA routing is handled by `public/_redirects` (`/* /index.html 200`), so **refresh never 404s**.
5. Security/cache headers are applied via `public/_headers`.
6. Cloudflare Pages config lives in `wrangler.json`.

Or upload the built `dist/` folder directly through the **Direct Upload** option.

### Option B: Vercel

- Connect the repo, framework preset **Vite**, output `dist`.
- SPA rewrites handled by `vercel.json`.

### Option C: Netlify

- Build command `npm run build`, publish directory `dist`.
- `public/_redirects` also works on Netlify.

> No `.htaccess` or shared-hosting config is required. This project is built for Cloudflare Pages.

## Features

- **2,500+ auto-generated tool pages** from CSV (Overview, How to Use, Features, Pricing, FAQ, Problems & Solutions, Alternatives, Download, History, Reviews, Community, and more).
- **30+ AI tools** in a separate collection.
- **Enterprise search** with instant results, filters, and debounce.
- **User features**: Bookmarks, Favorites, Recently Viewed, Compare (up to 4 tools), Ratings, Share, Copy Link, Print — all persisted to `localStorage` under `megatoolsx-user`.
- **SEO**: dynamic titles/meta, canonical, Open Graph, Twitter cards, JSON-LD (Website, Tool, FAQ, Breadcrumb, Organization), auto-sitemap, robots.txt, RSS, PWA manifest.
- **Dark/Light mode**, glassmorphism, animations, responsive layout.
- **Blog** with detail pages and related posts.
- **Compare page** (`/compare`) and **My Tools** (`/my-tools`).

## Scripts

```bash
npm run build          # prebuild: sitemap+RSS → build → postbuild: write into dist/
npm run lint           # oxlint
npm run preview        # preview the built app
```

## Project Structure

```
src/
  components/   layouts, ui, tool, tool-engine, seo
  hooks/        useTrackView
  pages/        Home, Tools, Categories, AI Tools, Blog, Compare, MyTools, Company pages
  store/        toolsStore (CSV), searchStore, userStore, adminStore
  data/         csvData, tools, blog
  context/      AppContext (theme, etc.)
  lib/          utils
  types/        tool, index
  i18n/         translations
```

## Notes

- No backend required. The tool catalog is fetched at runtime from `/tools.csv`.
- BrowserRouter is used throughout (no HashRouter) — clean, SEO-friendly URLs.
- Verify a route doesn't 404 on refresh after deploying: open any tool page and press F5.
  (Missing routes render the `<meta noindex>` NotFound page via the `/* /index.html 200` rule.)
