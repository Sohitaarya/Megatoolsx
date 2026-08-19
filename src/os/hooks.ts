/**
 * Tool OS — pipeline hook system.
 * Plugins/tools can register hooks around the core lifecycle.
 */

export type HookPoint =
  | 'before:render' | 'after:render'
  | 'before:install' | 'after:install'
  | 'before:uninstall' | 'after:uninstall'
  | 'before:ai' | 'after:ai'
  | 'before:seo' | 'after:seo'

export interface HookContext {
  slug?: string
  tool?: unknown
  input?: string
  output?: string
  seo?: Record<string, unknown>
  [key: string]: unknown
}

type HookFn = (ctx: HookContext) => HookContext | void | Promise<HookContext | void>

export class HookSystem {
  private hooks = new Map<HookPoint, Set<HookFn>>()

  add(point: HookPoint, fn: HookFn): () => void {
    let set = this.hooks.get(point)
    if (!set) { set = new Set(); this.hooks.set(point, set) }
    set.add(fn)
    return () => { set.delete(fn) }
  }

  /** Run a hook point synchronously-ish; await resolves all, merging returned ctx. */
  async run(point: HookPoint, ctx: HookContext): Promise<HookContext> {
    const set = this.hooks.get(point)
    if (!set) return ctx
    let current = { ...ctx }
    for (const fn of set) {
      try {
        const out = await fn(current)
        if (out) current = { ...current, ...out }
      } catch {
        /* a failing hook must not break the pipeline */
      }
    }
    return current
  }
}

export const hooks = new HookSystem()