/**
 * Automation — task queue.
 * Priority queue with retry, backoff, and a dead-letter queue. The transport is
 * swappable (in-memory for dev; Redis / Cloudflare Queues / R2 for production).
 */

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed' | 'dead'

export interface Task<T = unknown> {
  id: string
  queue: 'priority' | 'retry' | 'background' | 'parallel'
  priority: number
  payload: T
  status: TaskStatus
  attempts: number
  maxAttempts: number
  createdAt: number
  error?: string
}

export type TaskHandler<T = unknown> = (payload: T) => Promise<void>

export class TaskQueue<T = unknown> {
  private tasks: Task<T>[] = []
  private dlq: Task<T>[] = []
  private handler: TaskHandler<T>

  constructor(handler: TaskHandler<T>) { this.handler = handler }

  enqueue(payload: T, opts: { priority?: number; queue?: Task['queue']; maxAttempts?: number } = {}): Task<T> {
    const task: Task<T> = {
      id: crypto.randomUUID(),
      queue: opts.queue ?? 'priority',
      priority: opts.priority ?? 5,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: opts.maxAttempts ?? 3,
      createdAt: Date.now(),
    }
    this.tasks.push(task)
    return task
  }

  /** Pop the highest-priority pending task (lower number = higher priority). */
  private next(): Task<T> | undefined {
    const pending = this.tasks.filter(t => t.status === 'pending').sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt)
    return pending[0]
  }

  /** Process up to `limit` tasks (returns number processed). */
  async drain(limit = 10): Promise<number> {
    let processed = 0
    while (processed < limit) {
      const task = this.next()
      if (!task) break
      task.status = 'running'
      try {
        await this.handler(task.payload)
        task.status = 'done'
      } catch (err) {
        task.attempts += 1
        task.error = (err as Error).message
        if (task.attempts >= task.maxAttempts) {
          task.status = 'dead'
          this.dlq.push(task)
        } else {
          task.status = 'pending' // will be retried on next drain (with backoff by priority)
          task.priority += 2
        }
      }
      processed++
    }
    return processed
  }

  pendingCount(): number { return this.tasks.filter(t => t.status === 'pending').length }
  deadLetterCount(): number { return this.dlq.length }
  deadLetters(): Task<T>[] { return [...this.dlq] }
}

/** Simple in-memory queue instance (dev/test); production uses a shared backend. */
export const defaultQueue = new TaskQueue<{ workflowId: string; runId: string }>(async () => { /* wired by the platform */ })