/**
 * SaaS — Notifications.
 * Channel-agnostic interface (email / SMS / push / in-app / webhook). In-app is
 * implemented; external channels plug in via a channel adapter.
 */

export type NotificationChannel = 'email' | 'sms' | 'push' | 'inapp' | 'webhook'

export interface NotificationMessage {
  userId: string
  channel: NotificationChannel[]
  title: string
  body: string
  link?: string
  data?: Record<string, unknown>
}

export interface NotificationChannelAdapter {
  channel: NotificationChannel
  send(message: NotificationMessage): Promise<void>
}

class InAppChannel implements NotificationChannelAdapter {
  channel = 'inapp' as const
  private store = new Map<string, NotificationMessage[]>()
  async send(message: NotificationMessage): Promise<void> {
    const list = this.store.get(message.userId) ?? []
    list.push({ ...message, at: new Date().toISOString() } as NotificationMessage & { at: string })
    this.store.set(message.userId, list)
  }
  listFor(userId: string) { return this.store.get(userId) ?? [] }
}

export class NotificationService {
  private adapters = new Map<NotificationChannel, NotificationChannelAdapter>()

  constructor() { this.register(new InAppChannel()) }

  register(adapter: NotificationChannelAdapter): void { this.adapters.set(adapter.channel, adapter) }

  async send(message: NotificationMessage): Promise<void> {
    for (const channel of message.channel) {
      const adapter = this.adapters.get(channel)
      if (!adapter) continue
      try { await adapter.send(message) } catch { /* never break on a channel */ }
    }
  }
}

export const notificationService = new NotificationService()
export const inAppChannel = new InAppChannel()