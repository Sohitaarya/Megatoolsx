import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Tool Page — reusable section wrapper. Standardizes every content section's
 * heading structure (single h2 with aria label) so all tool pages look alike.
 */
export function ToolSection({ title, icon, children, className }: {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section aria-label={title} className={cn('space-y-4', className)}>
      <h2 className="text-xl font-bold text-white flex items-center gap-3">
        <span className="w-1 h-6 bg-indigo-500 rounded-full inline-block" aria-hidden="true" />
        {icon && <span aria-hidden="true" className="text-indigo-400">{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  )
}