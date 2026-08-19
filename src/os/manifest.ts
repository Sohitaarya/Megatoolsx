/**
 * Tool OS — Manifest contract.
 *
 * Every tool (built-in or third-party) is described by a ToolManifest. This is
 * the single source of truth the Tool Engine uses to register, render, SEO-ify
 * and serve a tool. Nothing is hardcoded; adding a tool = providing a manifest +
 * config. The manifest schema is versioned and validated on load.
 */

export type ToolKind =
  | 'calculator' | 'converter' | 'text' | 'code' | 'image' | 'video' | 'audio' | 'pdf' | 'document'
  | 'ocr' | 'finance' | 'education' | 'developer' | 'seo' | 'security' | 'ai' | 'custom'

export type ToolPermission =
  | 'guest' | 'user' | 'premium' | 'admin' | 'developer' | 'enterprise'

export interface ManifestRoutes {
  /** Main route, e.g. "/tools/my-tool". */
  main: string
  /** Optional sub-routes rendered from the same manifest. */
  sub?: Record<string, { title: string; description?: string }>
}

export interface ManifestSeo {
  title?: string
  description?: string
  keywords?: string
  /** JSON-LD @type override ("SoftwareApplication", "WebApplication", …). */
  schemaType?: string
  image?: string
}

export interface ManifestAi {
  /** Whether this tool should prefer an LLM when configured. */
  aiFirst?: boolean
  /** System prompt override for AI-natured tools. */
  systemPrompt?: string
  /** Explicit capability overrides. */
  capability?: { kind?: 'ai' | 'utility'; verb?: string; handler?: string; compute?: string }
}

export interface ToolManifest {
  /** Schema version. */
  schema: '1'
  /** Stable id, e.g. "org.megatoolsx.word-counter". */
  id: string
  /** URL slug — becomes the dynamic route. */
  slug: string
  name: string
  description: string
  /** Icon key resolved by the theme engine. */
  icon?: string
  banner?: string
  version: string
  author: string
  license: string
  tags: string[]
  keywords?: string[]
  category: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  status?: 'Present' | 'Generative' | 'Future'
  permissions?: ToolPermission[]
  dependencies?: string[]
  rating?: number
  downloads?: number
  createdAt?: string
  updatedAt?: string
  routes?: ManifestRoutes
  seo?: ManifestSeo
  ai?: ManifestAi
  /** Feature flags. */
  enabled?: boolean
}

/** Validate + normalize an untrusted manifest object. Returns errors or a ToolManifest. */
export function parseManifest(input: unknown): { ok: true; manifest: ToolManifest } | { ok: false; errors: string[] } {
  if (!input || typeof input !== 'object') return { ok: false, errors: ['manifest must be an object'] }
  const m = input as Record<string, unknown>
  const errors: string[] = []

  if (m.schema !== '1') errors.push('manifest.schema must be "1"')
  if (typeof m.id !== 'string' || !m.id) errors.push('manifest.id is required')
  if (typeof m.slug !== 'string' || !/^[a-z0-9-]+$/.test(m.slug)) errors.push('manifest.slug must be a lowercase slug')
  if (typeof m.name !== 'string' || !m.name) errors.push('manifest.name is required')
  if (typeof m.description !== 'string' || !m.description) errors.push('manifest.description is required')
  if (typeof m.version !== 'string' || !m.version) errors.push('manifest.version is required')
  if (typeof m.author !== 'string' || !m.author) errors.push('manifest.author is required')

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    manifest: {
      schema: '1',
      id: m.id as string,
      slug: m.slug as string,
      name: m.name as string,
      description: m.description as string,
      version: m.version as string,
      author: m.author as string,
      license: (m.license as string) ?? 'MIT',
      tags: Array.isArray(m.tags) ? (m.tags as string[]) : [],
      category: (m.category as string) ?? 'Tools',
      keywords: Array.isArray(m.keywords) ? (m.keywords as string[]) : undefined,
      icon: typeof m.icon === 'string' ? m.icon : undefined,
      banner: typeof m.banner === 'string' ? m.banner : undefined,
      difficulty: m.difficulty as ToolManifest['difficulty'],
      status: m.status as ToolManifest['status'],
      permissions: Array.isArray(m.permissions) ? (m.permissions as ToolPermission[]) : undefined,
      dependencies: Array.isArray(m.dependencies) ? (m.dependencies as string[]) : undefined,
      rating: typeof m.rating === 'number' ? m.rating : undefined,
      downloads: typeof m.downloads === 'number' ? m.downloads : undefined,
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : undefined,
      updatedAt: typeof m.updatedAt === 'string' ? m.updatedAt : undefined,
      routes: m.routes as ManifestRoutes | undefined,
      seo: m.seo as ManifestSeo | undefined,
      ai: m.ai as ManifestAi | undefined,
      enabled: (m.enabled as boolean) ?? true,
    },
  }
}