# MegaToolsX — Platform Architecture

## Layered design (clean architecture, hexagonal)

```
src/
├── core/            Domain + application + infrastructure (framework-agnostic)
│   ├── domain/      Entities + repository contracts (pure model)
│   ├── application/ Use-case services (tools, auth)
│   ├── infrastructure/
│   │   ├── api/     Unified API client (retry, cache, queue, error mapping)
│   │   ├── db/      Database port + localStorage/memory drivers (swappable)
│   │   ├── auth/    AuthProvider contract + email/PBKDF2 provider
│   │   ├── tools/   Config-driven tool registry
│   │   ├── plugins/ Plugin system
│   │   ├── cache/   TTL cache service
│   │   └── logging/ Structured logger
│   ├── container.ts Composition root (dependency injection)
│   └── errors/      Typed error hierarchy
├── os/              Tool Operating System
│   ├── manifest.ts  ToolManifest schema + validator
│   ├── toolEngine.ts Universal tool engine (install/update/enable/remove)
│   ├── events.ts    Typed event bus
│   ├── hooks.ts     Lifecycle hook system
│   ├── templates.ts Auto Tool Builder (12 templates)
│   ├── seo.ts       Manifest → dynamic SEO
│   └── bootstrap.ts Registers the CSV catalog as installed tools
├── search/          Central SEO Engine (automated, no manual edits)
│   ├── textEngines.ts  Title / description / keyword engines
│   ├── schemaEngine.ts JSON-LD dispatch (18 schema types)
│   ├── linkEngines.ts  Canonical + internal-link engines
│   ├── seoEngine.ts    Orchestrator → SeoResult
│   ├── useSeo.tsx      React hook (pages call this; nothing else)
│   ├── validation.ts   Google-ready validation + reports
│   └── monitor.ts      Health events + logging
├── saas/            SaaS core (plans, RBAC, credits, billing, rate-limit, notifications)
├── automation/      Automation platform (workflow graph engine, queue, agents, no-code)
├── modules/         Feature modules (tools, seo, auth) — barrels
├── shared/          Shared UI + hooks + lib
└── lib/ai/          Secure AI client + deterministic tool engine (compute + domain)
```

## Key decisions

1. **Database abstraction** — the app depends on `IDatabasePort` + repository
   interfaces, never a vendor. Swap PostgreSQL/MySQL/MongoDB/D1/localStorage by
   providing a driver in `src/core/container.ts`.
2. **No hardcoded tools** — tools are config (`ToolConfig` + `ToolManifest`). Adding
   a tool = adding a config entry (+ a CSV row for SEO/sitemap). The Tool OS
   registers the whole CSV catalog at boot.
3. **Provider-agnostic AI** — the LLM client calls a secure Pages Function
   (`/api/ai`) with the key server-side. Failover to the deterministic local engine
   is automatic.
4. **Automated SEO** — `useSeo(ctx)` derives title/description/keywords/canonical/
   schema/links/robots from a structured page context. Validation + monitoring are
   part of the module (`src/search/validation.ts`).

## Request flow

```
Route → ErrorBoundary → Suspense → Page
                                  ├── useSeo(ctx) → <SEOHead/> + JSON-LD
                                  ├── useToolsStore (async CSV) 
                                  └── CapabilityTool → runEngine(tool, input)
                                                       ├── compute.ts (real algorithms)
                                                       ├── domain handlers (35+)
                                                       └── /api/ai proxy (LLM, optional)
```

## See also
- `docs/DEPLOYMENT.md` — Cloudflare env, secrets, cache, rollback
- `docs/MONITORING.md` — observability wiring
- `docs/DISASTER-RECOVERY.md` — RPO/RTO + runbooks
