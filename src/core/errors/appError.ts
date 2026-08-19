/**
 * Core error hierarchy — every layer throws typed errors.
 */

export type ErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'CONFLICT'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UPSTREAM'
  | 'DATABASE'
  | 'UNKNOWN'

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly cause?: unknown

  constructor(code: ErrorCode, message: string, opts?: { status?: number; cause?: unknown }) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = opts?.status ?? defaultStatus(code)
    this.cause = opts?.cause
  }

  toJSON() {
    return { name: this.name, code: this.code, message: this.message, status: this.status }
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', opts?: { cause?: unknown }) {
    super('NOT_FOUND', message, { status: 404, ...opts })
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input', opts?: { cause?: unknown }) {
    super('VALIDATION', message, { status: 400, ...opts })
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', opts?: { cause?: unknown }) {
    super('UNAUTHORIZED', message, { status: 401, ...opts })
    this.name = 'UnauthorizedError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', opts?: { cause?: unknown }) {
    super('RATE_LIMITED', message, { status: 429, ...opts })
    this.name = 'RateLimitError'
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error', opts?: { cause?: unknown }) {
    super('NETWORK', message, { status: 0, ...opts })
    this.name = 'NetworkError'
  }
}

function defaultStatus(code: ErrorCode): number {
  switch (code) {
    case 'NOT_FOUND': return 404
    case 'VALIDATION': return 400
    case 'UNAUTHORIZED': return 401
    case 'FORBIDDEN': return 403
    case 'RATE_LIMITED': return 429
    case 'CONFLICT': return 409
    case 'UPSTREAM': return 502
    case 'TIMEOUT': return 504
    default: return 500
  }
}

/** Normalizes any thrown value into an AppError (safe for logging/UI). */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof Error) return new AppError('UNKNOWN', err.message, { cause: err })
  return new AppError('UNKNOWN', typeof err === 'string' ? err : 'Unknown error')
}