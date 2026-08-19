/**
 * SEO feature module — public surface.
 * Single import point for all on-page SEO + structured data.
 */
export { SEOHead, DefaultHead } from '@/components/seo/SEOHead'
export {
  organizationSchema, webPageSchema, breadcrumbSchema, collectionPageSchema, itemListSchema,
  softwareAppSchema, faqSchema, blogPostingSchema, articleSchema, aboutPageSchema, contactPageSchema, aiToolSchema,
} from '@/components/seo/schemas'