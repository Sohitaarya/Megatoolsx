/**
 * Plugin system.
 *
 * Every feature can be packaged as a plugin: register once, enable/disable,
 * versioned, with install/uninstall hooks and lifecycle order. This is the
 * extension point for the marketplace and third-party modules.
 */

export interface PluginLifecycle {
  /** Called when the plugin is enabled/installed. */
  install?: (ctx: PluginContext) => void | Promise<void>
  /** Called when the plugin is disabled/uninstalled. */
  uninstall?: (ctx: PluginContext) => void | Promise<void>
}

export interface Plugin<TExports = unknown> extends PluginLifecycle {
  id: string
  name: string
  version: string
  description?: string
  /** Priority — lower runs first (default 100). */
  order?: number
  /** Exports surfaced to other plugins / the app. */
  exports?: TExports
}

export interface PluginContext {
  register: <T>(id: string, exports: T) => void
  resolve: <T>(id: string) => T | undefined
}

export type PluginState = 'registered' | 'enabled' | 'disabled'

class PluginSystem {
  private plugins = new Map<string, { plugin: Plugin; state: PluginState }>()
  private exports = new Map<string, unknown>()

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin already registered: ${plugin.id}`)
    }
    this.plugins.set(plugin.id, { plugin, state: 'registered' })
  }

  async enable(id: string): Promise<void> {
    const entry = this.plugins.get(id)
    if (!entry) throw new Error(`Plugin not found: ${id}`)
    if (entry.state === 'enabled') return
    entry.state = 'enabled'
    if (entry.plugin.exports) this.exports.set(id, entry.plugin.exports)
    await entry.plugin.install?.(this.context())
  }

  async disable(id: string): Promise<void> {
    const entry = this.plugins.get(id)
    if (!entry) return
    await entry.plugin.uninstall?.(this.context())
    this.exports.delete(id)
    entry.state = 'disabled'
  }

  isEnabled(id: string): boolean { return this.plugins.get(id)?.state === 'enabled' }

  list(): Array<{ id: string; name: string; version: string; state: PluginState; description?: string }> {
    return Array.from(this.plugins.values()).map(({ plugin, state }) => ({
      id: plugin.id, name: plugin.name, version: plugin.version, state, description: plugin.description,
    }))
  }

  resolve<T>(id: string): T | undefined { return this.exports.get(id) as T | undefined }

  /** Install all enabled plugins in dependency order (stable by order, then id). */
  async enableAll(): Promise<void> {
    const sorted = Array.from(this.plugins.values())
      .filter(p => p.state === 'enabled' || p.state === 'registered')
      .sort((a, b) => (a.plugin.order ?? 100) - (b.plugin.order ?? 100) || a.plugin.id.localeCompare(b.plugin.id))
    for (const entry of sorted) {
      if (entry.state !== 'enabled') await this.enable(entry.plugin.id)
    }
  }

  private context(): PluginContext {
    return {
      register: <T>(id: string, exports: T) => { this.exports.set(id, exports) },
      resolve: <T>(id: string): T | undefined => this.exports.get(id) as T | undefined,
    }
  }
}

export const pluginSystem = new PluginSystem()