# MegaToolsX — Disaster Recovery

## RPO / RTO targets (static-first platform)

| Tier | RPO | RTO |
|---|---|---|
| Frontend (static) | n/a (immutable builds) | minutes (rollback to prior Pages deployment) |
| Config (tools.csv, toolConfig) | source-controlled | minutes (redeploy) |
| User data (localStorage) | n/a (client-side) | n/a |
| Future server data (D1/KV) | 5 min | 15 min |

## Recovery runbook

### 1. Bad deploy (UI broken)
1. Open Cloudflare Pages → **Deployments**.
2. Select the last known-good deployment → **Rollback**.
3. Fix forward on `main`; CI re-deploys.
4. Verify `/robots.txt`, `/sitemap-index.xml`, `/` all 200.

### 2. LLM provider outage
The app is **resilient by design**: `generateText()` fails fast and every tool falls
back to the deterministic local engine. No action required for availability — users
keep working with the local engine. When the provider returns, AI mode resumes.

### 3. tools.csv corruption
1. `git checkout HEAD -- public/tools.csv` (source of truth in git).
2. Rebuild → sitemap/robots/llms regenerate from the fixed CSV.
3. Redeploy.

### 4. Account/access loss
- Cloudflare API token + account id are required secrets in GitHub; rotate them in
  both GitHub Secrets and Cloudflare if compromised.
- Enable Cloudflare **WAF + DDoS + Bot** protections on the zone.

## Backup strategy
- **Code + data-as-config** (`tools.csv`, `toolConfig.ts`, manifests) live in git —
  every deploy is a recoverable snapshot.
- **User data:** localStorage is ephemeral by design; if server-side storage is
  added, enable automatic D1 backups + Point-in-Time recovery in the dashboard.
- **LLM keys:** never commit; store as Pages secrets with rotation policy.

## Region failover
Static + edge-first means any Cloudflare PoP serves the site. For a future
Worker-backed API, deploy Workers across regions via Cloudflare's global runtime;
D1 supports replication with failover.
