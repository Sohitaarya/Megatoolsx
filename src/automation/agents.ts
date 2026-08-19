/**
 * Automation — Multi-Agent framework.
 * Agents are roles with a system prompt + tool permissions. They share memory
 * through an AgentMemory and can delegate tasks to each other. Provider-agnostic:
 * the actual LLM call goes through the secure AI proxy.
 */

export type AgentRole =
  | 'planning' | 'research' | 'coding' | 'seo' | 'marketing' | 'content'
  | 'image' | 'video' | 'analytics' | 'qa' | 'security' | 'testing' | 'support'

export interface AgentDefinition {
  role: AgentRole
  name: string
  description: string
  systemPrompt: string
  /** Which other agents this agent may delegate to. */
  canDelegateTo: AgentRole[]
  /** Which tools/plugins the agent may call. */
  tools: string[]
}

export interface AgentMessage {
  from: AgentRole
  to: AgentRole
  content: string
  at: string
}

export interface AgentMemoryEntry {
  key: string
  value: string
  scope: 'private' | 'shared'
  at: string
}

export class AgentMemory {
  private entries: AgentMemoryEntry[] = []

  remember(key: string, value: string, scope: 'private' | 'shared' = 'shared'): void {
    this.entries = this.entries.filter(e => !(e.key === key && e.scope === scope))
    this.entries.push({ key, value, scope, at: new Date().toISOString() })
  }

  recall(key: string, scope: 'private' | 'shared' = 'shared'): string | undefined {
    return this.entries.find(e => e.key === key && e.scope === scope)?.value
  }

  search(query: string): AgentMemoryEntry[] {
    const q = query.toLowerCase()
    return this.entries.filter(e => e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q))
  }
}

export class MultiAgentSystem {
  private agents = new Map<AgentRole, AgentDefinition>()
  private memoryStore = new AgentMemory()
  private messages: AgentMessage[] = []

  register(def: AgentDefinition): void { this.agents.set(def.role, def) }
  registerMany(defs: AgentDefinition[]): void { defs.forEach(d => this.register(d)) }
  get(role: AgentRole): AgentDefinition | undefined { return this.agents.get(role) }
  list(): AgentDefinition[] { return Array.from(this.agents.values()) }

  /** Send a message from one agent to another (validates delegation permission). */
  send(from: AgentRole, to: AgentRole, content: string): boolean {
    const source = this.agents.get(from)
    if (!source || !source.canDelegateTo.includes(to)) return false
    this.messages.push({ from, to, content, at: new Date().toISOString() })
    return true
  }

  messagesFor(role: AgentRole): AgentMessage[] {
    return this.messages.filter(m => m.to === role || m.from === role)
  }

  memory(): AgentMemory { return this.memoryStore }
}

export const multiAgentSystem = new MultiAgentSystem()

/** Seed the default agent roster (config-driven — add roles without code). */
export function registerDefaultAgents(): void {
  multiAgentSystem.registerMany([
    { role: 'planning', name: 'Planning Agent', description: 'Breaks tasks into executable steps', systemPrompt: 'You plan and decompose tasks into concrete steps.', canDelegateTo: ['research', 'coding', 'content', 'qa'], tools: ['workflow'] },
    { role: 'research', name: 'Research Agent', description: 'Gathers and verifies information', systemPrompt: 'You research topics and return cited, factual summaries.', canDelegateTo: ['content', 'analytics'], tools: ['search', 'web'] },
    { role: 'coding', name: 'Coding Agent', description: 'Writes and debugs code', systemPrompt: 'You write clean, tested code for the requested task.', canDelegateTo: ['qa', 'testing'], tools: ['code', 'run'] },
    { role: 'seo', name: 'SEO Agent', description: 'Optimizes content for search', systemPrompt: 'You optimize titles, meta, keywords and structure for search engines.', canDelegateTo: ['content'], tools: ['seo', 'keywords'] },
    { role: 'marketing', name: 'Marketing Agent', description: 'Creates marketing copy', systemPrompt: 'You write persuasive marketing copy and campaign plans.', canDelegateTo: ['content', 'image'], tools: ['content', 'image'] },
    { role: 'content', name: 'Content Agent', description: 'Drafts and edits content', systemPrompt: 'You write clear, well-structured content.', canDelegateTo: ['seo', 'qa'], tools: ['content'] },
    { role: 'image', name: 'Image Agent', description: 'Creates and edits images', systemPrompt: 'You describe and generate image assets.', canDelegateTo: [], tools: ['image'] },
    { role: 'video', name: 'Video Agent', description: 'Creates and edits video', systemPrompt: 'You plan video assets and scripts.', canDelegateTo: ['image', 'content'], tools: ['video'] },
    { role: 'analytics', name: 'Analytics Agent', description: 'Analyzes data and metrics', systemPrompt: 'You analyze data and produce clear reports.', canDelegateTo: ['planning'], tools: ['data'] },
    { role: 'qa', name: 'QA Agent', description: 'Tests and verifies outputs', systemPrompt: 'You verify correctness and report issues.', canDelegateTo: [], tools: ['test'] },
    { role: 'security', name: 'Security Agent', description: 'Audits for vulnerabilities', systemPrompt: 'You audit inputs and configs for security issues.', canDelegateTo: ['qa'], tools: ['scan'] },
    { role: 'testing', name: 'Testing Agent', description: 'Runs tests', systemPrompt: 'You run and interpret test suites.', canDelegateTo: [], tools: ['test'] },
    { role: 'support', name: 'Support Agent', description: 'Answers user questions', systemPrompt: 'You resolve user questions helpfully.', canDelegateTo: ['research'], tools: ['search'] },
  ])
}