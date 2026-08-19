/**
 * Automation — No-Code Builder.
 * A block model that maps visual, draggable blocks onto the workflow node-graph.
 * The builder serializes blocks → Workflow, and renders Workflow → blocks, so
 * the canvas and the engine stay perfectly in sync.
 */

import type { Workflow, WorkflowEdge, WorkflowNode } from './types'

export interface BuilderBlock {
  blockId: string
  /** Which visual category the block belongs to (trigger/action/logic/ai). */
  category: 'trigger' | 'action' | 'logic' | 'ai'
  /** The node type this block becomes. */
  type: string
  label: string
  /** Visual position (used by the drag-drop canvas). */
  x: number
  y: number
  /** Form fields the user fills in. */
  fields: Record<string, unknown>
}

/** A canvas document (what the no-code builder edits). */
export interface NoCodeCanvas {
  blocks: BuilderBlock[]
  connections: Array<{ from: string; to: string; port?: string }>
  variables: Record<string, unknown>
}

/** Convert a canvas into an executable Workflow. */
export function canvasToWorkflow(canvas: NoCodeCanvas, name: string): Workflow {
  const nodes: WorkflowNode[] = canvas.blocks.map(b => {
    const kind = b.category === 'logic' ? 'logic' : b.category === 'ai' ? 'ai' : b.category === 'trigger' ? 'trigger' : 'action'
    return {
      id: b.blockId,
      kind,
      label: b.label,
      type: b.type as WorkflowNode['type'],
      config: { type: b.type, ...b.fields },
      outputs: kind === 'logic' && b.type === 'condition' ? ['true', 'false'] : undefined,
    }
  })
  const edges: WorkflowEdge[] = canvas.connections.map((c, i) => ({ id: `e_${i}`, from: c.from, to: c.to, port: c.port }))
  const now = new Date().toISOString()
  return { id: crypto.randomUUID(), name, version: 1, nodes, edges, variables: canvas.variables, enabled: true, createdAt: now, updatedAt: now }
}

/** Convert an executable Workflow back into a canvas (for editing). */
export function workflowToCanvas(wf: Workflow): NoCodeCanvas {
  const blocks: BuilderBlock[] = wf.nodes.map(n => ({
    blockId: n.id,
    category: n.kind === 'logic' ? 'logic' : n.kind === 'ai' ? 'ai' : n.kind === 'trigger' ? 'trigger' : 'action',
    type: n.type as string,
    label: n.label,
    x: 0,
    y: 0,
    fields: { ...n.config },
  }))
  const connections = wf.edges.map(e => ({ from: e.from, to: e.to, port: e.port }))
  return { blocks, connections, variables: wf.variables }
}

/** The visual block palette available in the builder. */
export const BLOCK_PALETTE: BuilderBlock[] = [
  { blockId: 't_manual', category: 'trigger', type: 'manual', label: 'Manual Trigger', x: 0, y: 0, fields: {} },
  { blockId: 't_schedule', category: 'trigger', type: 'schedule', label: 'Schedule', x: 0, y: 0, fields: { cron: '0 9 * * *' } },
  { blockId: 't_webhook', category: 'trigger', type: 'webhook', label: 'Webhook', x: 0, y: 0, fields: {} },
  { blockId: 'a_http', category: 'action', type: 'http', label: 'HTTP Request', x: 0, y: 0, fields: { method: 'GET', url: '' } },
  { blockId: 'a_ai', category: 'action', type: 'ai', label: 'AI Prompt', x: 0, y: 0, fields: { prompt: '' } },
  { blockId: 'a_email', category: 'action', type: 'email', label: 'Send Email', x: 0, y: 0, fields: { to: '', subject: '' } },
  { blockId: 'l_condition', category: 'logic', type: 'condition', label: 'If / Else', x: 0, y: 0, fields: { a: '', op: 'eq', b: '' } },
  { blockId: 'l_delay', category: 'logic', type: 'delay', label: 'Delay', x: 0, y: 0, fields: { ms: 1000 } },
  { blockId: 'ai_summarize', category: 'ai', type: 'summarization', label: 'Summarize', x: 0, y: 0, fields: { input: '' } },
  { blockId: 'ai_rag', category: 'ai', type: 'rag', label: 'RAG Query', x: 0, y: 0, fields: { collection: '', query: '' } },
]