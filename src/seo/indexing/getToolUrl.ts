/**
 * Backward-compatible re-export. The single source of truth now lives in
 * ./toolSlug.ts — keep imports of '@/seo/indexing/getToolUrl' working.
 */
export { getToolUrl, getToolAbsoluteUrl, normalizeSlug, cleanToolSlug } from './toolSlug'