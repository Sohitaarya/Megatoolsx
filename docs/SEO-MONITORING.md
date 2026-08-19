# SEO Monitoring — Secure Setup & Ops (Phase 3.7)

## How it works
`src/seo/monitoring/` provides a provider-agnostic monitoring layer. Every external
provider reports an **availability status** — `available | unavailable | disabled`.
When unconfigured it is **`unavailable`** (never fabricated into zeros or fake
indexing counts). The website never blocks rendering on monitoring; RUM is sampled
and sent only through the existing privacy-safe analytics layer.

## CLI

```bash
npm run seo:monitor              # local audits + live HTTP + provider status
npm run seo:monitor -- --http    # live HTTP only
npm run seo:audit                # indexability + crawl-efficiency audits
```

Default works with **no credentials**. Optional providers are reported unavailable;
**exit code 0** as long as no critical technical check fails.

## Credentials — SERVER-SIDE ONLY

Never set any of these as `VITE_*` (they would be inlined into the public bundle):

```
# Cloudflare Pages → Settings → Environment variables (secret)
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS   # full JSON service-account (Google Search Console API)
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://megatoolsx.com/
GOOGLE_ACCESS_TOKEN                   # optional pre-fetched OAuth token (short-lived)
CLOUDFLARE_ANALYTICS_ENABLED=false
RUM_ENABLED=false                     # client RUM (uses VITE_RUM_SAMPLE_RATE on client)
SEO_MONITORING_ENABLED=true
SEO_ALERT_INDEXED_DROP_PERCENT=20
```

Client-side (build-time, non-secret) only:

```
VITE_RUM_SAMPLE_RATE=0.1   # 10% sampling; respects DNT + analytics-disabled
VITE_RUM_ENABLED=false
```

## Search Console API (official)

1. Create a **Google Cloud service account** with the **Search Console API** enabled.
2. Grant it **read-only** access to the property (Site settings → Users → add the
   service account email as a user; **no destructive permissions**).
3. Put the service-account JSON in `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` (secret).
4. Default monitoring is read-only; it never requests indexing in bulk.

## What we DO and DON'T claim

- **We DO** prove technical discoverability: route == canonical == sitemap == links,
  orphan/duplicate/robots/sitemap audits, live HTTP status on representative URLs.
- **We DO NOT** claim Google indexing, rankings, or traffic unless real Search
  Console / analytics data proves it. If Search Console is not connected, the
  dashboard and CLI report `unavailable`.

## Live API (Phase 3.8)

`GET /api/seo/monitoring` (Cloudflare Pages Function, server-side only) returns the
normalized monitoring report: search console, indexing, http, sitemap, cwv, alerts,
opportunities. **Auth:** `Authorization: Bearer <SEO_ADMIN_TOKEN>` (server secret).

> ⚠️ **Search Console data is unavailable until the production property is authorized.**
> The API returns `{ "status": "unavailable", "reason": "credentials_not_configured" }`
> until `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` (or a pre-fetched `GOOGLE_ACCESS_TOKEN`)
> is configured on the server and the service account has read-only access to the
> property. No metrics are fabricated.

### Environment (server secrets — NEVER `VITE_*`)
```
SEO_MONITORING_ENABLED=true
SEO_ADMIN_TOKEN=<random-secret-for-admin-api>
GOOGLE_SEARCH_CONSOLE_ENABLED=true
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS=<service-account-json>   # secret
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://megatoolsx.com/
GOOGLE_ACCESS_TOKEN=<pre-fetched-oauth-token>                # optional short-lived
SEO_INSPECTION_LIMIT=20
SEO_CACHE_TTL=900
RUM_ENABLED=false
VITE_RUM_SAMPLE_RATE=0.1
CLOUDFLARE_ANALYTICS_ENABLED=false
```

### Google Cloud setup (official API, read-only)
1. Create a GCP project → enable **Search Console API**.
2. Create a **service account**; download its JSON key → put it in
   `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` (server secret).
3. In **Search Console**, add the service-account email as a **user** on the
   property (read-only — no destructive permissions).
4. Deploy. The function fetches real search-analytics via the official API.

### Troubleshooting
- `401 Unauthorized` → wrong/missing `SEO_ADMIN_TOKEN`.
- `503 monitoring_disabled` → `SEO_MONITORING_ENABLED=false` or no admin token.
- `searchConsole: { status: 'unavailable' }` → credentials not configured **or**
  the GSC API call failed (check the service account is a Search Console user).
- **Search Console data is unavailable until the production property is authorized.**

## Files
- `functions/api/seo/monitoring.ts` — live API (Phase 3.8)
- `src/seo/monitoring/` — types, config, providers (Search Console / live HTTP / RUM),
  opportunities, alerts, reports, history, barrel
- `src/pages/admin/SeoMonitoring.tsx` — admin dashboard (`/admin/seo`), honest about
  unavailable providers
- `scripts/seo-monitor.mjs` — CLI (`npm run seo:monitor`)
- `reports/seo-monitoring.json` — generated report
