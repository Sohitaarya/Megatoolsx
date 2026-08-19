/**
 * Design/Creative — honest status system.
 * A tool is 'real' ONLY when its core workflow actually runs. Never label a
 * placeholder as working.
 */

export type DesignCreativeStatus =
  | 'real'
  | 'partial'
  | 'requires-ai'
  | 'requires-upload'
  | 'requires-external-api'
  | 'coming-soon'

export interface StatusMeta {
  label: string
  /** Rendered in the UI as a small badge. */
  tone: 'success' | 'warning' | 'info' | 'muted'
}

export const STATUS_META: Record<DesignCreativeStatus, StatusMeta> = {
  real: { label: 'Working', tone: 'success' },
  partial: { label: 'Beta', tone: 'warning' },
  'requires-ai': { label: 'Requires AI', tone: 'info' },
  'requires-upload': { label: 'Requires Upload', tone: 'info' },
  'requires-external-api': { label: 'Requires API', tone: 'warning' },
  'coming-soon': { label: 'Coming Soon', tone: 'muted' },
}

/** Is a status a truthful "it works" claim? */
export function isWorking(status: DesignCreativeStatus): boolean {
  return status === 'real' || status === 'partial'
}