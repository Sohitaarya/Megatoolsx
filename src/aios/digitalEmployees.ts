/**
 * AIOS — Digital Workers.
 * A framework for specialized AI employees (SEO Manager, Developer, Designer…).
 * Each role has a capability list, permissions and a run() that delegates to the
 * brain + AI router (LLM when configured, deterministic otherwise).
 */

import { brain } from './brain'

export interface DigitalEmployeeDef {
  role: string
  name: string
  capabilities: string[]
  permissions: string[]
  systemPrompt: string
}

export interface EmployeeRunInput {
  task: string
  context?: string
}

export const DIGITAL_EMPLOYEES: Record<string, DigitalEmployeeDef> = {
  'seo-manager': { role: 'seo-manager', name: 'SEO Manager', capabilities: ['audit', 'keywords', 'content'], permissions: ['seo:edit'], systemPrompt: 'You are an SEO manager. Optimize titles, meta, structure and internal links.' },
  'marketing-manager': { role: 'marketing-manager', name: 'Marketing Manager', capabilities: ['campaigns', 'copy', 'analytics'], permissions: ['marketing:write'], systemPrompt: 'You plan and write marketing campaigns.' },
  developer: { role: 'developer', name: 'Developer', capabilities: ['code', 'debug', 'review'], permissions: ['code:write'], systemPrompt: 'You write clean, tested code.' },
  designer: { role: 'designer', name: 'Designer', capabilities: ['ui', 'brand', 'assets'], permissions: ['design:write'], systemPrompt: 'You produce design briefs and visual specs.' },
  'qa-engineer': { role: 'qa-engineer', name: 'QA Engineer', capabilities: ['test', 'verify'], permissions: ['qa:run'], systemPrompt: 'You verify correctness and report issues.' },
  'security-engineer': { role: 'security-engineer', name: 'Security Engineer', capabilities: ['audit', 'scan'], permissions: ['security:read'], systemPrompt: 'You audit for vulnerabilities.' },
  'support-agent': { role: 'support-agent', name: 'Support Agent', capabilities: ['faq', 'triage'], permissions: ['support:respond'], systemPrompt: 'You resolve user questions helpfully.' },
  researcher: { role: 'researcher', name: 'Research Analyst', capabilities: ['research', 'summarize'], permissions: ['research:read'], systemPrompt: 'You gather and summarize factual information.' },
  'content-writer': { role: 'content-writer', name: 'Content Writer', capabilities: ['write', 'rewrite', 'seo'], permissions: ['content:write'], systemPrompt: 'You write clear, well-structured content.' },
  translator: { role: 'translator', name: 'Translator', capabilities: ['translate'], permissions: ['content:write'], systemPrompt: 'You translate accurately while preserving tone.' },
  'video-editor': { role: 'video-editor', name: 'Video Editor', capabilities: ['scripts', 'cuts', 'captions'], permissions: ['video:write'], systemPrompt: 'You plan video edits and scripts.' },
  'image-designer': { role: 'image-designer', name: 'Image Designer', capabilities: ['image', 'thumbnails', 'posters'], permissions: ['image:write'], systemPrompt: 'You specify image assets and prompts.' },
  'pdf-expert': { role: 'pdf-expert', name: 'PDF Expert', capabilities: ['pdf'], permissions: ['document:write'], systemPrompt: 'You handle PDF creation and conversion.' },
  'ocr-expert': { role: 'ocr-expert', name: 'OCR Expert', capabilities: ['ocr'], permissions: ['document:read'], systemPrompt: 'You extract text from documents and images.' },
  'finance-assistant': { role: 'finance-assistant', name: 'Finance Assistant', capabilities: ['budget', 'tax', 'reports'], permissions: ['finance:read'], systemPrompt: 'You produce financial summaries and plans.' },
  'business-analyst': { role: 'business-analyst', name: 'Business Analyst', capabilities: ['analysis', 'plans'], permissions: ['analytics:read'], systemPrompt: 'You analyze business data and write plans.' },
  'documentation-writer': { role: 'documentation-writer', name: 'Documentation Writer', capabilities: ['docs'], permissions: ['content:write'], systemPrompt: 'You write clear technical documentation.' },
}

export class DigitalWorkerRegistry {
  private workers = new Map<string, DigitalEmployeeDef>()

  constructor() { this.registerAll(Object.values(DIGITAL_EMPLOYEES)) }

  register(def: DigitalEmployeeDef): void { this.workers.set(def.role, def) }
  registerAll(defs: DigitalEmployeeDef[]): void { defs.forEach(d => this.register(d)) }
  get(role: string): DigitalEmployeeDef | undefined { return this.workers.get(role) }
  list(): DigitalEmployeeDef[] { return Array.from(this.workers.values()) }

  /** Run a digital worker on a task (delegates to the brain/reason engine). */
  async run(role: string, input: EmployeeRunInput): Promise<{ role: string; output: string }> {
    const worker = this.workers.get(role)
    if (!worker) throw new Error(`Unknown worker role: ${role}`)
    const output = await brain.reason(`[${worker.name}] ${input.task}${input.context ? `\nContext: ${input.context}` : ''}`)
    return { role, output }
  }
}

export const digitalWorkers = new DigitalWorkerRegistry()