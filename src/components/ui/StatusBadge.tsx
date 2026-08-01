import { getStatusInfo } from '@/data/csvData'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  const info = getStatusInfo(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        size === 'sm' ? 'text-[10px] px-2 py-0.5 rounded-full' : 'text-xs px-3 py-1 rounded-full',
        info.badge,
        className
      )}
    >
      <span>{info.emoji}</span>
      {info.label}
    </span>
  )
}
