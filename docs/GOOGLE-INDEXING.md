# Google Indexing — How MegaToolsX Tools Get Discovered

This document explains, accurately, how search engines discover and index the
2500+ tool pages. **It does not claim Google will index everything** — Google
decides crawling and indexing. What the platform guarantees is *technical
discoverability*.

## 1. Submit the sitemap once
1. In Google Search Console, verify the property `https://megatoolsx.com/`.
2. Sitemaps → Add a new sitemap → `sitemap-index.xml`.
3. Google revisits the sitemap on its own schedule; there is no need to resubmit
   on every deploy.

## 2. New eligible tools automatically enter the sitemap
The sitemap is **generated at build time from `tools.csv`** (the same source of
truth as routing). Adding a row to the CSV:
- creates the route (`/tools/<slug>`),
- gets SEO metadata + canonical automatically,
- is included in the generated `sitemap-tools-*.xml`,
- is listed in its category page and internal-link graph.

No manual sitemap editing is ever needed.

## 3. Internal links make tools discoverable without the sitemap
Beyond the sitemap, every tool is reachable through real HTML `<Link>` anchors:
```
Home → Categories → ToolFeed → individual tool
Tool → Category → Related/Similar tools → Collections
```
Because the sitemap + internal links both point at the same `/tools/<slug>` URLs,
crawlers can find new pages even between sitemap crawls.

## 4. Google decides indexing
- A valid sitemap + internal links only make pages *eligible*.
- Whether (and how quickly) Google indexes a URL depends on quality, crawl budget
  and Google's own decisions.
- The `indexability-report.json` (build-time) proves **technical** readiness only —
  it is not a Google indexing report.

## 5. Sitemap submission does not guarantee indexing
Submitting a sitemap is a **hint**, not a command. Do not expect instant
indexing. Organic discovery is normal.

## 6. URL Inspection / Request Indexing
Use Search Console **URL Inspection → Request Indexing** only for a small number
of **priority URLs** (new important pages). Do not request indexing for thousands
of URLs — Google ignores mass requests and it wastes crawl budget.

## 7. No fake indexing APIs
There is no public API that forces Google to index a URL. MegaToolsX does **not**
implement any such thing. If a tool claims "instant Google indexing," it is not
genuine.

## Canonical URL policy
Every tool page's canonical is its own:
```
https://megatoolsx.com/tools/<existing-slug>
```
Slugs are **never regenerated** from display names and `/tools/` is never removed,
so indexed URLs stay stable across deploys.

## Monitoring in Search Console (Phase 3.6)
After submitting the sitemap, use these reports to guide technical work:

1. **Pages / Indexing** — which URLs are indexed vs. "discovered–not indexed". If
   Google discovers but does not index a page, improve its content/quality first.
2. **Sitemaps** — confirm the sitemap was read and how many URLs were submitted.
3. **Core Web Vitals** — monitor LCP/INP/CLS for the pages you care about.
4. **Performance (Search results)** — queries, impressions, CTR, average position.
5. **URL Inspection** — check one URL at a time; use "Request Indexing" only for a
   small number of priority pages.

**Sitemap submission ≠ guaranteed indexing.** A sitemap is a hint. Google decides
crawling and indexing. The build-time audits prove *technical* discoverability only.

## Crawl efficiency (Phase 3.6)
- **Crawl depth model:** Home(0) → static(1) → Category/Collection/AI/Blog(2) → Tool(2).
  Preferred depth for tools is ≤ 3 clicks; the audit reports depth > 3 without
  failing the build (a legitimately deeper page is not an error).
- **Filter/search URLs are not landing pages.** `/category/x?q=&sort=&page=&filter=`
  combos canonicalize to the base category URL and are not separately indexable.
  Internal search URLs (`?q=`) are not added to the sitemap.
- **Sitemap hygiene:** only 200 + indexable + canonical URLs; no filter/search URLs;
  HTTPS + same-host; per-file limits respected; validated at build time by
  `scripts/audit-crawl-efficiency.mjs` and `scripts/audit-indexability.mjs`.
