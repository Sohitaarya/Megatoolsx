# MegaToolsX — Observability

## Signals

| Layer | Signal | Source |
|---|---|---|
| Edge | Requests, bandwidth, cache hit ratio, status | Cloudflare Web Analytics / Analytics Engine |
| Frontend | Core Web Vitals (LCP/CLS/INP), RUM | `vitals` events → `/api/analytics` |
| AI | Latency, tokens, cost, model, mode (ai/local), failures | `logger` + `analytics:event` (eventBus) |
| SEO | Title/desc/schema validation, sitemap health | `src/search/validation.ts` + `monitor.ts` |
| Errors | Caught/uncaught errors, boundary resets | `ErrorBoundary` + `logger.error` |

## Wiring

- `src/core/infrastructure/logging/logger.ts` — structured JSON logs, swappable transport.
- `src/search/monitor.ts` — `auditSeo()` validates + emits `seo:health` events.
- `src/os/events.ts` — typed event bus (`analytics:event`, `ai:request`, `tool:installed`…)
  consumed by a Cloudflare Analytics proxy when present.

## Uptime & synthetic checks

Add a **Cron Trigger → Worker** (or an external uptime service) hitting:
- `GET /robots.txt` → 200
- `GET /sitemap-index.xml` → 200 + contains `sitemap-tools-1.xml`
- `GET /tools/chatgpt` → 200 (SPA)

## Alerting

The `analytics:event` bus is the adapter point for Slack/Discord/email/PagerDuty
webhooks: register a listener that forwards error-rate and cost spikes.

## Cost dashboard

Track `ai:request` events (mode, model, tokens) in Analytics Engine; multiply by
model input/output rates to build a per-tool cost table.
