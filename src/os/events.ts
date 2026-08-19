/**
 * Tool OS — typed global event bus.
 * Used for tool/plugin lifecycle, analytics, AI, auth and search events.
 */

export interface EventMap {
  'tool:installed': { slug: string; version: string }
  'tool:updated': { slug: string; version: string }
  'tool:removed': { slug: string }
  'plugin:installed': { id: string }
  'plugin:removed': { id: string }
  'auth:login': { provider: string; userId?: string }
  'auth:logout': Record<string, never>
  'ai:request': { toolSlug: string; mode: 'ai' | 'local'; model?: string }
  'analytics:event': { name: string; props?: Record<string, unknown> }
  'search:event': { query: string }
  'theme:changed': { theme: string }
  'locale:changed': { locale: string }
}

type AnyEvent = keyof EventMap
type Handler<K extends AnyEvent> = (payload: EventMap[K]) => void

export class EventBus {
  private handlers = new Map<AnyEvent, Set<Handler<any>>>()

  on<K extends AnyEvent>(event: K, handler: Handler<K>): () => void {
    let set = this.handlers.get(event)
    if (!set) { set = new Set(); this.handlers.set(event, set) }
    set.add(handler as Handler<any>)
    return () => { set.delete(handler as Handler<any>) }
  }

  emit<K extends AnyEvent>(event: K, payload: EventMap[K]): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const h of set) {
      try { h(payload) } catch { /* isolate listeners */ }
    }
  }

  off<K extends AnyEvent>(event: K, handler: Handler<K>): void {
    this.handlers.get(event)?.delete(handler as Handler<any>)
  }
}

/** Global singleton event bus. */
export const eventBus = new EventBus()