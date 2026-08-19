# MegaToolsX — Deployment & Platform Operations

## Cloud architecture (serverless-first, edge-first)

```
Browser ──► Cloudflare CDN/Edge (HTTP/3, Brotli, Cache)
                │
                ├── /tools.csv, /assets/*        Static (immutable cache)
                ├── /* (SPA)                     index.html  (_redirects)
                └── /api/*                       Pages Functions (Workers)
                        ├── /api/ai              Secure LLM proxy (functions/api/ai.ts)
                        ├── /api/analytics       Analytics ingest (add when ready)
                        └── /api/db              D1/KV-backed APIs (add when ready)
```

## Environment variables

### Client (build-time, public — inlined by Vite)
| Variable | Purpose |
|---|---|
| `VITE_SITE_URL` | Canonical origin (default `https://megatoolsx.com`) |
| `VITE_DB_DRIVER` | `local` (localStorage) \| `memory` |
| `VITE_FEATURE_*` | Feature flags (`AI`, `AUTH`, `OFFLINE`, `ADMIN`) |

### Server-side secrets (Cloudflare Pages → Settings → Environment variables → **secret**)
| Variable | Purpose |
|---|---|
| `AI_API_KEY` | LLM provider key — **never exposed to the browser** |
| `AI_BASE_URL` | OpenAI-compatible endpoint (Groq/OpenRouter/Mistral/vLLM…) |
| `AI_MODEL` | Model id (e.g. `gpt-4o-mini`) |

> Never prefix secrets with `VITE_` — anything with that prefix is inlined into the
> public bundle.

## Deploy (two supported paths)

1. **Git-connected (recommended):** push to `main` → the CI workflow
   (`.github/workflows/ci.yml`) type-checks, lints, builds, validates the sitemap,
   then deploys. PRs get preview deployments automatically.
2. **Direct upload:** `npm run build` then upload the `dist/` folder in the
   Cloudflare dashboard (Direct Upload).

## Cache policy (public/_headers)

- Hashed `/assets/*` → `max-age=31536000, immutable`
- HTML routes → `max-age=0, must-revalidate` (fresh on every deploy)
- Sitemaps / robots / llms / RSS → `3600`
- `tools.csv` → `3600`
- Brotli/gzip compression + HTTP/3 are handled automatically at the edge.

## Multi-region / failover

Cloudflare Pages serves from its edge network automatically. For geo/latency routing
at the app level, add a Worker (or `_redirects` rules) keyed on `CF-IPCountry`; the
frontend is fully static, so any edge PoP can serve it. Regional failover is provided
by Cloudflare's anycast + the global CDN — no per-region ops required for static
frontends.

## Rolling back

- **Git flow:** revert the commit/PR and redeploy; Pages keeps prior deployments
  (Project → Deployments → select previous → **Rollback**).
- **Config-only rollback:** the tool catalog (`tools.csv` + `toolConfig.ts`) is
  separate from code, so content/config fixes can deploy independently of features.

## Local development with Functions

```bash
# inject .dev.vars (AI_API_KEY etc.) into the Functions runtime
npx wrangler pages dev dist --binding AI_API_KEY=sk-...
```
