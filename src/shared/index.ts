/**
 * Shared layer — reusable, framework-agnostic code reused across modules.
 */

// UI kit
export * from '@/components/ui'

// Utilities
export {
  slugify, cn, formatDate, truncate, getInitials,
  getColorForCategory, getCsvCategoryColor, getIconForCategory,
} from '@/lib/utils'

// Hooks
export { useTrackView } from '@/hooks/useTrackView'

// Domain-agnostic helpers from the core
export { AppError, NotFoundError, ValidationError, UnauthorizedError, RateLimitError, NetworkError, toAppError } from '@/core/errors/appError'
export { logger } from '@/core/infrastructure/logging/logger'
export { cacheService } from '@/core/infrastructure/cache/cacheService'
export { apiClient } from '@/core/infrastructure/api/apiClient'
export { pluginSystem } from '@/core/infrastructure/plugins/pluginSystem'
export { buildContainer, useContainer } from '@/core/container'
