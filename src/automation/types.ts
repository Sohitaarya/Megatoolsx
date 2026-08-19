/**
 * Automation — workflow node-graph model.
 * A workflow is a directed graph of nodes connected by edges. Nodes are typed:
 * trigger / action / logic / ai. Adding new node types is a registry change.
 */

export type NodeKind = 'trigger' | 'action' | 'logic' | 'ai'

export type LogicType = 'condition' | 'switch' | 'loop' | 'delay' | 'merge'
export type TriggerType =
  | 'manual' | 'schedule' | 'cron' | 'webhook' | 'api' | 'email' | 'rss' | 'db'
  | 'file' | 'cloud' | 'github' | 'user' | 'payment' | 'ai' | 'custom'
export type ActionType =
  | 'http' | 'db' | 'ai' | 'email' | 'sms' | 'push' | 'pdf' | 'image' | 'video'
  | 'ocr' | 'translate' | 'text' | 'sheet' | 'upload' | 'storage' | 'webhook' | 'queue' | 'custom'

export interface WorkflowNodeConfig {
  /** Type discriminator, e.g. 'http', 'condition', 'prompt'. */
  type: string
  [key: string]: unknown
}

export interface WorkflowNode {
  id: string
  kind: NodeKind
  label: string
  /** trigger|action|logic|ai subtype. */
  type: TriggerType | ActionType | LogicType | 'prompt' | 'reasoning' | 'vision' | 'ocr' | 'translation' | 'summarization' | 'imageEdit' | 'speech' | 'embedding' | 'rag' | 'memory' | 'agent'
  config: WorkflowNodeConfig
  /** Which outputs the node exposes (e.g. 'true'/'false' for a condition). */
  outputs?: string[]
}

export interface WorkflowEdge {
  id: string
  from: string
  to: string
  /** Output port label when the source has multiple outputs. */
  port?: string
}

export interface Workflow {
  id: string
  name: string
  version: number
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  /** Runtime variables with a default/seed. */
  variables: Record<string, unknown>
  enabled: boolean
  createdAt: string
  updatedAt: string
}

/** Runtime execution context shared across nodes. */
export interface WorkflowContext {
  workflow: Workflow
  variables: Record<string, unknown>
  secrets: Record<string, string>
  logs: Array<{ nodeId: string; message: string; at: string }>
  cost: number
  tokenUsage: number
  attempts: number
}

export interface NodeResult {
  /** Output payload keyed by port. */
  outputs: Record<string, unknown>
  cost?: number
  tokens?: number
}

export interface ActionHandler {
  canHandle(node: WorkflowNode): boolean
  run(ctx: WorkflowContext, node: WorkflowNode): Promise<NodeResult>
}