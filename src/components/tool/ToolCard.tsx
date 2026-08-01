import { Tool } from '@/types/tool'
import { Card, Badge, StarRating } from '@/components/ui'
import { ExternalLink, Users, Clock, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ToolCardProps {
  tool: Tool
  featured?: boolean
  className?: string
}

export function ToolCard({ tool, featured, className }: ToolCardProps) {
  return (
    <Link to={`/tools/${tool.slug}`}>
      <Card hover className={cn('h-full group', className)}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {tool.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate group-hover:text-indigo-400 transition-colors">
              {tool.name}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">{tool.category}</p>
          </div>
          <Badge className="flex-shrink-0">{tool.difficulty}</Badge>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {tool.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <StarRating rating={tool.rating} size="sm" />
            <span className="ml-1">{tool.rating}</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {tool.totalUsers}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tool.platform.slice(0, 3).map(p => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
              {p}
            </span>
          ))}
          {featured && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Featured
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}

interface ToolGridProps {
  tools: Tool[]
  featured?: boolean
  columns?: 2 | 3 | 4
}

export function ToolGrid({ tools, featured, columns = 3 }: ToolGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid grid-cols-1 gap-6', gridCols[columns])}>
      {tools.map(tool => (
        <ToolCard key={tool.id} tool={tool} featured={featured} />
      ))}
    </div>
  )
}
