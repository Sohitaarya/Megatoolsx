/**
 * Typed environment configuration.
 *
 * VITE_* values are inlined at build time by Vite. Secrets (AI_API_KEY etc.)
 * live server-side in Cloudflare Pages Functions — never reference them here.
 */
export const env = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
  /** Public base URL of the deployed site. */
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://megatoolsx.com',
  /** Analytics endpoint (Cloudflare Analytics proxy) — empty when disabled. */
  analyticsEndpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT ?? '/api/analytics',
  /** Feature flags loaded from the environment. */
  features: {
    aiTools: (import.meta.env.VITE_FEATURE_AI ?? 'true') !== 'false',
    userAccounts: (import.meta.env.VITE_FEATURE_AUTH ?? 'false') !== 'false',
    offlineSupport: (import.meta.env.VITE_FEATURE_OFFLINE ?? 'false') !== 'false',
    adminPanel: (import.meta.env.VITE_FEATURE_ADMIN ?? 'false') !== 'false',
  } as Record<string, boolean>,
} as const

export type AppEnv = typeof env