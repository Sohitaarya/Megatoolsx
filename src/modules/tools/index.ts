/**
 * Tools feature module — public surface.
 *
 * Components:   (UI lives in src/components/tool-engine — the engine is the tool)
 * Services:     ToolService, toolApi
 * Config:       toolConfig (config-driven registry)
 * Domain:       ToolEntity, ToolCapability
 */
export { ToolService, makeToolService } from '@/core/application/toolService'
export { toolApi, type ToolApi } from './api'
export { default as toolConfig } from './toolConfig'
export { toolRegistry, resolveCapability, loadBuiltinToolConfig, loadRemoteToolConfig } from '@/core/infrastructure/tools/toolRegistry'
export { classify } from '@/lib/ai/engine'
export type { ToolConfig } from '@/core/domain/entities'