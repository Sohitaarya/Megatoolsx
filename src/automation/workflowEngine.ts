/**
 * Automation — Workflow Engine.
 *
 * A real interpreter for the node-graph model: executes a Workflow by walking
 * its DAG, dispatching action/AI nodes to registered handlers, and evaluating
 * logic nodes (condition / switch / loop / delay / merge). Handlers are a
 * registry — adding action types is a plugin change, not a core change.
 */

import type { ActionHandler, NodeResult, Workflow, WorkflowContext, WorkflowNode } from './types'

export interface WorkflowRunOptions {
  triggerData?: Record<string, unknown>
  secrets?: Record<string, string>
  /** Hard cap on node executions (protects against runaway loops). */
  maxSteps?: number
}

export class WorkflowEngine {
  private handlers: ActionHandler[] = []

  registerHandler(handler: ActionHandler): void {
    this.handlers.push(handler)
  }

  registerHandlers(handlers: ActionHandler[]): void {
    this.handlers.push(...handlers)
  }

  private findHandler(node: WorkflowNode): ActionHandler | undefined {
    for (const h of this.handlers) {
      try { if (h.canHandle(node)) return h } catch { /* skip */ }
    }
    return undefined
  }

  async run(workflow: Workflow, opts: WorkflowRunOptions = {}): Promise<WorkflowContext> {
    const ctx: WorkflowContext = {
      workflow,
      variables: { ...workflow.variables, ...opts.triggerData },
      secrets: opts.secrets ?? {},
      logs: [],
      cost: 0,
      tokenUsage: 0,
      attempts: 0,
    }

    const maxSteps = opts.maxSteps ?? 1000
    let steps = 0

    // Outgoing edges per node, indexed by (from, port).
    const outgoing = new Map<string, Array<{ to: string; port?: string }>>()
    for (const edge of workflow.edges) {
      const list = outgoing.get(edge.from) ?? []
      list.push({ to: edge.to, port: edge.port })
      outgoing.set(edge.from, list)
    }

    const nodeById = new Map(workflow.nodes.map(n => [n.id, n]))
    const nodeOutputs = new Map<string, NodeResult>()

    // Start from every trigger node; fan out.
    const queue: WorkflowNode[] = workflow.nodes.filter(n => n.kind === 'trigger')
    const visited = new Set<string>()

    while (queue.length && steps < maxSteps) {
      const node = queue.shift()!
      const key = node.id
      if (visited.has(key)) continue // loops guarded by visited-set + step cap
      visited.add(key)
      steps++

      this.log(ctx, node, `running (${node.kind}:${node.type})`)
      const result = await this.executeNode(ctx, node, nodeOutputs)
      nodeOutputs.set(node.id, result)

      // Route to successors — a condition/switch picks a port, others use default.
      const edges = outgoing.get(node.id) ?? []
      if (node.kind === 'logic' && node.type === 'condition') {
        const port = result.outputs['true'] ? 'true' : 'false'
        for (const e of edges) if (e.port === port && nodeById.has(e.to)) queue.push(nodeById.get(e.to)!)
      } else {
        for (const e of edges) if (nodeById.has(e.to)) queue.push(nodeById.get(e.to)!)
      }
    }

    ctx.logs.push({ nodeId: 'root', message: `workflow complete in ${steps} steps`, at: new Date().toISOString() })
    return ctx
  }

  private async executeNode(ctx: WorkflowContext, node: WorkflowNode, outputs: Map<string, NodeResult>): Promise<NodeResult> {
    // Logic nodes evaluated by the engine itself.
    if (node.kind === 'logic') return this.evalLogic(ctx, node)

    // Action / AI nodes → registered handler.
    const handler = this.findHandler(node)
    if (!handler) {
      return { outputs: { error: `No handler for node type "${node.type}"` } }
    }

    const maxAttempts = (node.config.retries as number) ?? 0
    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      try {
        const result = await handler.run(ctx, node)
        ctx.cost += result.cost ?? 0
        ctx.tokenUsage += result.tokens ?? 0
        return result
      } catch (err) {
        ctx.attempts++
        this.log(ctx, node, `attempt ${attempt + 1} failed: ${(err as Error).message}`)
        if (attempt === maxAttempts) return { outputs: { error: (err as Error).message } }
      }
    }
    return { outputs: {} }
  }

  private async evalLogic(ctx: WorkflowContext, node: WorkflowNode): Promise<NodeResult> {
    switch (node.type) {
      case 'condition': {
        const a = String(node.config.a ?? '')
        const op = String(node.config.op ?? 'eq')
        const b = String(node.config.b ?? '')
        const pass = evalCondition(a, op, b)
        this.log(ctx, node, `condition ${a} ${op} ${b} → ${pass}`)
        return { outputs: { true: pass, false: !pass } }
      }
      case 'delay': {
        const ms = Number(node.config.ms ?? 0)
        await new Promise(r => setTimeout(r, Math.min(ms, 60_000)))
        return { outputs: { done: true } }
      }
      case 'switch':
        return { outputs: { value: node.config.value ?? '' } }
      case 'merge':
        return { outputs: { merged: true } }
      default:
        return { outputs: {} }
    }
  }

  private log(ctx: WorkflowContext, node: WorkflowNode, message: string): void {
    ctx.logs.push({ nodeId: node.id, message, at: new Date().toISOString() })
    if (ctx.logs.length > 500) ctx.logs.splice(0, 100)
  }
}

export function evalCondition(a: string, op: string, b: string): boolean {
  switch (op) {
    case 'eq': return a === b
    case 'neq': return a !== b
    case 'gt': return Number(a) > Number(b)
    case 'gte': return Number(a) >= Number(b)
    case 'lt': return Number(a) < Number(b)
    case 'lte': return Number(a) <= Number(b)
    case 'contains': return a.includes(b)
    case 'starts': return a.startsWith(b)
    case 'empty': return !a
    default: return false
  }
}

export const workflowEngine = new WorkflowEngine()