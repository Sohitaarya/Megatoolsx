# PHASE 3.15 — REAL GOOGLE SEARCH CONSOLE DATA LOOP

## SUCCESS CRITERIA (checklist)

- [ ] Step 0 — codebase map written
- [ ] Step 1 — auth/config states implemented, no secret exposure
- [ ] Step 2 — pagination + normalization + row validation
- [ ] Step 3 — entity matching reused/improved (no duplicate URL logic)
- [ ] Step 4 — analysis + opportunity engine wired to real data
- [ ] Step 5 — history/snapshots deduped, retained, trend comparison works
- [ ] Step 6 — API + scheduler + CLI extended (no duplicate endpoints/scripts)
- [ ] Step 7 — dashboard shows honest states, all sections present
- [ ] Step 8 — security audit clean
- [ ] Step 9 — tests written and passing
- [ ] Step 10 — tsc / lint / build / audits / preview all PASS, routes verified 200

## Findings (from Step 0 inspection)

### What exists
- `src/seo/monitoring/types.ts` — shared types (`Availability`, `DataAvailability`, `SearchPerformance`, `SeoSnapshot`, `SearchAnalyticsSnapshot`, `SeoMonitoringReport`)
- `src/seo/monitoring/config.ts` — `serverConfig`, `clientConfig`, `hasSearchConsoleCredentials`, `validateMonitoringConfig` (returns `CONNECTED | NOT_CONFIGURED | ERROR`)
- `src/seo/monitoring/searchConsole.ts` — GSC fetch with pagination, retry, normalization, error classification (`GscErrorCategory`)
- `src/seo/monitoring/history.ts` — `InMemorySnapshotStore`, `CloudflareKVSnapshotStore`, `CloudflareD1SnapshotStore` with dedup and prune
- `src/seo/monitoring/analysis.ts` — `matchPageToEntity`, `buildToolSeoInsight`, `splitBrandNonBrand`, `analyzePositionOpportunities`
- `src/seo/monitoring/opportunities.ts` — `generateOpportunities`, `priorityFrom`, `priorityTier`
- `src/seo/monitoring/alerts.ts` — `buildAlerts` from snapshot history
- `src/seo/monitoring/reports.ts` — `buildSeoReport` aggregator
- `src/seo/monitoring/brandQueries.ts` — `isBrandQuery`, `summarizeBrandQueries`
- `src/seo/monitoring/liveHttp.ts` — representative URL HTTP checks
- `src/seo/monitoring/cwv.ts` — RUM/CWV browser hook
- `src/seo/monitoring/index.ts` — public barrel export
- `functions/api/seo/monitoring.ts` — Cloudflare Pages Function with Bearer auth + 5-min cache
- `functions/scheduled/seo-monitor.ts` — scheduled handler with KV snapshot
- `scripts/seo-gsc-monitor.mjs` — CLI with `--days`, `--dry-run`, output format matching spec
- `scripts/seo-monitor.mjs` — consolidated monitor CLI
- `scripts/audit-gsc-data.mjs` — GSC data quality audit
- `src/pages/admin/SeoMonitoring.tsx` — basic admin dashboard
- `.env.example` — has Google vars but missing some from spec

### What's stubbed
- `searchConsole.ts` `buildSearchConsoleReport` hardcodes 28-day range and doesn't expose all new error states in return type
- `config.ts` `validateMonitoringConfig` only returns 3 states, missing the new ones
- `functions/api/seo/monitoring.ts` duplicates GSC logic instead of importing from `src/seo/monitoring/searchConsole.ts`
- `functions/scheduled/seo-monitor.ts` duplicates GSC logic and doesn't use the analysis pipeline
- `SeoMonitoring.tsx` is basic — missing collapsible sections, explicit state labels, data source labels
- `opportunities.ts` uses old `OpportunityType` values (`LOW_CTR`, `STRIKING_DISTANCE`) instead of spec's `POSITION_4_10`, `POSITION_11_20`, `HIGH_IMPRESSIONS_LOW_CTR`
- No tests directory for monitoring

### What's missing
- Extended error states in config/API responses
- Dashboard sections: TRAFFIC OVERVIEW, TOP OPPORTUNITIES, TOP TOOLS, TOP QUERIES, BRAND VS NON-BRAND, CATEGORIES, COLLECTIONS, QUERY OPPORTUNITIES, DATA QUALITY, CRAWL/INDEXABILITY, HISTORY, ALERTS
- Snapshot schema doesn't include `entitySummaries`, `opportunities`, `dataQuality`, `fetchMetadata` as separate fields
- Tests for monitoring
- `.env.example` needs exact variable names from spec

## SUCCESS CRITERIA (checklist)

- [x] Step 0 — codebase map written
- [x] Step 1 — auth/config states implemented, no secret exposure
- [x] Step 2 — pagination + normalization + row validation
- [x] Step 3 — entity matching reused/improved (no duplicate URL logic)
- [x] Step 4 — analysis + opportunity engine wired to real data
- [x] Step 5 — history/snapshots deduped, retained, trend comparison works
- [x] Step 6 — API + scheduler + CLI extended (no duplicate endpoints/scripts)
- [x] Step 7 — dashboard shows honest states, all sections present
- [x] Step 8 — security audit clean
- [x] Step 9 — tests written and passing
- [x] Step 10 — tsc / lint / build / audits / preview all PASS, routes verified 200

## Change Log

- Step 1: Added `SearchConsoleStatus` type to `types.ts` with all required states. Updated `config.ts` to import it, added `resolveGscProperty()` supporting `SEO_GSC_PROPERTY` + `GOOGLE_SEARCH_CONSOLE_SITE_URL` fallback. Updated `searchConsole.ts` to use `resolveGscProperty` and return typed statuses. Files: `src/seo/monitoring/types.ts`, `src/seo/monitoring/config.ts`, `src/seo/monitoring/searchConsole.ts`, `src/seo/monitoring/index.ts`
- Step 2: `fetchSearchAnalytics` default dimensions now `['query', 'page', 'country', 'device']`. `NormalizedSearchAnalytics.fetchMeta` now includes `rowsReceived`. `buildSearchConsoleReport` accepts `BuildReportOptions` with configurable `days` (7/14/28/30/90), `startDate`, `endDate`, `dimensions`. Files: `src/seo/monitoring/searchConsole.ts`
- Step 3: Added `blog` entity type to `matchPageToEntity` in `analysis.ts`. Single source of truth — no duplicate URL logic. File: `src/seo/monitoring/analysis.ts`
- Step 4: Rewrote `opportunities.ts` with spec types: `POSITION_4_10`, `POSITION_11_20`, `HIGH_IMPRESSIONS_LOW_CTR`, `BRAND_NON_BRAND_GAP`, `QUERY_CANNIBALIZATION`, `ZERO_CLICK_HIGH_IMPRESSION`. Each opportunity has `what/why/evidence/action/writtenReason`. Priority formula updated to `impact × confidence ÷ effort`. File: `src/seo/monitoring/opportunities.ts`
- Step 5: Extended `SeoSnapshot` with `schemaVersion`, `property`, `dateRange`, `generatedAt`, `status`, `metrics`, `entitySummaries`, `opportunities`, `dataQuality`, `fetchMetadata`. Updated `emptySnapshot` with defaults. Files: `src/seo/monitoring/types.ts`, `src/seo/monitoring/history.ts`
- Step 6: Rewrote `functions/api/seo/monitoring.ts` to import from shared `src/seo/monitoring/*` modules instead of duplicating GSC logic. Rewrote `functions/scheduled/seo-monitor.ts` with full pipeline: validate → fetch → normalize → analyze → snapshot → opportunities → alerts → prune → report. Files: `functions/api/seo/monitoring.ts`, `functions/scheduled/seo-monitor.ts`
- Step 7: Rewrote `src/pages/admin/SeoMonitoring.tsx` with 14 collapsible sections: SYSTEM HEALTH, SEARCH CONSOLE, TRAFFIC OVERVIEW, TOP OPPORTUNITIES, TOP TOOLS, TOP QUERIES, BRAND VS NON-BRAND, CATEGORIES, COLLECTIONS, QUERY OPPORTUNITIES, DATA QUALITY, CRAWL/INDEXABILITY, HISTORY, ALERTS. Explicit state labels and data-source labels everywhere. File: `src/pages/admin/SeoMonitoring.tsx`
- Step 8: Grep confirmed no `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`, `GOOGLE_ACCESS_TOKEN`, `private_key`, or `client_email` reach `dist/`, `public/`, `VITE_*`, or client bundle. Updated `.env.example` to match spec variable names. Files: `.env.example`
- Step 9: Added `vitest` + `@vitest/coverage-v8`. Wrote 40 tests in `tests/monitoring.test.ts` covering config, error classification, normalization, entity matching, brand classification, position opportunities, opportunity engine, priority scoring, snapshot dedup/retention, brand/non-brand split, tool insights. All 40 pass. Files: `tests/monitoring.test.ts`, `vitest.config.ts`, `package.json`
- Step 10: `npx tsc --noEmit` PASS, `npm run lint` PASS (warnings only, no errors), `npm run build` PASS, `npm run seo:audit:gsc` PASS, `npm run seo:gsc:health` PASS (NOT_CONFIGURED is valid), `npm run preview` PASS. Routes `/`, `/tools`, `/category/design-creative`, `/collections`, `/tools/generative-heal-detector`, `/sitemap.xml`, `/robots.txt`, `/admin/seo` all return 200.
