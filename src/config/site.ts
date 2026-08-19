/**
 * Central site configuration — single source of truth for all SEO values.
 * Import this everywhere instead of hardcoding the domain.
 */
export const SITE_URL = 'https://megatoolsx.com'
export const SITE_NAME = 'MegatoolsX'
export const SITE_TAGLINE = "World's Largest Digital Tools Knowledge Platform"
export const SITE_DESCRIPTION =
  'Learn how to use any digital tool, AI tool, software, website, app, and browser extension. Step-by-step guides, tutorials, and solutions for 2500+ tools.'
export const SITE_DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`

/** Raster social-preview banner (1200x630 PNG — required by Meta/LinkedIn/X). */
export const OG_IMAGE = `${SITE_URL}/og-image.png`
/** Site logo for schema.org (Organization.logo, SoftwareApplication.image). */
export const LOGO_IMAGE = `${SITE_URL}/favicon.svg`

export const TWITTER_HANDLE = '@megatoolsx'
export const CONTACT_EMAIL = 'hello@megatoolsx.com'

/** Build an absolute URL from a path (e.g. "/tools/chatgpt" → full URL). */
export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${clean}`
}
