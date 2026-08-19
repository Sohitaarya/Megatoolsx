/**
 * Structured logger — JSON lines to console + optional remote sink.
 * The transport is swappable (Cloudflare Analytics, Sentry, an audit API…).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  ts: string
  context?: Record<string, unknown>
}

export interface LogTransport {
  write(entry: LogEntry): void
}

class ConsoleTransport implements LogTransport {
  write(entry: LogEntry) {
    const line = JSON.stringify(entry)
    switch (entry.level) {
      case 'error': console.error(line); break
      case 'warn': console.warn(line); break
      case 'debug': console.debug(line); break
      default: console.info(line)
    }
  }
}

class Logger {
  private transports: LogTransport[] = [new ConsoleTransport()]
  private minLevel: LogLevel = 'info'

  addTransport(t: LogTransport): void { this.transports.push(t) }
  setMinLevel(level: LogLevel): void { this.minLevel = level }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const order: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }
    if (order[level] < order[this.minLevel]) return
    const entry: LogEntry = { level, message, ts: new Date().toISOString(), context }
    for (const t of this.transports) {
      try { t.write(entry) } catch { /* never let logging break the app */ }
    }
  }

  debug(message: string, context?: Record<string, unknown>) { this.log('debug', message, context) }
  info(message: string, context?: Record<string, unknown>) { this.log('info', message, context) }
  warn(message: string, context?: Record<string, unknown>) { this.log('warn', message, context) }
  error(message: string, context?: Record<string, unknown>) { this.log('error', message, context) }
}

export const logger = new Logger()