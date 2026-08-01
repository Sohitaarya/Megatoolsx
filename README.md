# MegaToolsX

The world's largest Digital Tools Knowledge Platform — teaches users everything about 2,500+ digital tools generated from a CSV database.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- React Router v7 (BrowserRouter)
- Tailwind CSS v4
- Framer Motion
- PapaParse (CSV)
- React Helmet Async (SEO)
- Zustand (state)

## Getting Started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
```

## Data

- `public/tools.csv` — primary tool database (2,500+ rows). Only rows with `Status = Present` are included.
- `public/sitemap.xml` — auto-generated on every build (8,080 URLs).
- `public/rss.xml` — blog RSS feed, auto-generated on every build.

Adding/removing rows in `tools.csv` and rebuilding automatically updates every tool page, the sitemap, and the RSS feed.

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

- No backend required. All data is bundled at build time.
- BrowserRouter is used throughout (no HashRouter) — clean, SEO-friendly URLs.
- Verify a route doesn't 404 on refresh after deploying: open any tool page and press F5.
