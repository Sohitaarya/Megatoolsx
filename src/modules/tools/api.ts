/**
 * Tools module — REST/API service.
 *
 * Works against any backend that implements the tools endpoints. On the current
 * static deployment the app reads the CSV directly; when a Workers/DB backend is
 * added (Cloudflare D1 + Pages Functions) these endpoints become live with zero
 * UI changes. GraphQL can be layered by swapping the transport on apiClient.
 */

import { apiClient } from '@/core/infrastructure/api/apiClient'
import type { ToolEntity } from '@/core/domain/entities'

export interface ToolApi {
  listTools: () => Promise<ToolEntity[]>
  getTool: (slug: string) => Promise<ToolEntity>
  runTool: (slug: string, input: string) => Promise<{ output: string; mode: 'ai' | 'local' }>
}

export const toolApi: ToolApi = {
  async listTools() {
    const res = await apiClient.request<ToolEntity[]>('/api/tools', { cacheTtlMs: 60_000 })
    if (!res.ok) throw res.error
    return res.data
  },
  async getTool(slug) {
    const res = await apiClient.request<ToolEntity>(`/api/tools/${encodeURIComponent(slug)}`, { cacheTtlMs: 60_000 })
    if (!res.ok) throw res.error
    return res.data
  },
  async runTool(slug, input) {
    const res = await apiClient.request<{ output: string; mode: 'ai' | 'local' }>(`/api/tools/${encodeURIComponent(slug)}/run`, {
      method: 'POST',
      body: { input },
      retries: 1,
      timeoutMs: 30_000,
    })
    if (!res.ok) throw res.error
    return res.data
  },
}