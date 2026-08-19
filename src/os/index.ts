/**
 * Tool OS — public surface.
 * A unified entry point for the whole dynamic tool platform.
 */
export { toolEngine } from './toolEngine'
export { eventBus } from './events'
export type { EventMap } from './events'
export { hooks } from './hooks'
export type { HookPoint, HookContext } from './hooks'
export { parseManifest } from './manifest'
export type { ToolManifest, ManifestSeo, ManifestAi, ManifestRoutes, ToolKind, ToolPermission } from './manifest'
export { TOOL_TEMPLATES, templateForName, slugifyToolName } from './templates'
export type { ToolTemplate } from './templates'
export { deriveSeo } from './seo'
export type { DerivedSeo } from './seo'