import { type ElementType } from "react"
import { cn } from "@/lib/utils"
export { StatusBadge } from './StatusBadge'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  icon?: ElementType
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function Button(props: ButtonProps) {
  const { children, onClick, variant = "primary", size = "md", icon: Icon, className, disabled, type = "button" } = props
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    outline: "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(base, variants[variant], sizes[size], "hover:scale-[1.02] active:scale-[0.98] transition-transform", className)}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card(props: CardProps) {
  const { children, className, hover, onClick } = props
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm p-6",
        hover && "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/20",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge(props: BadgeProps) {
  const { children, className } = props
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
      className
    )}>
      {children}
    </span>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  description?: string
  className?: string
}

export function SectionHeader(props: SectionHeaderProps) {
  const { title, subtitle, description, className } = props
  return (
    <div className={cn("text-center max-w-3xl mx-auto mb-12", className)}>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-indigo-400 text-sm font-medium mb-2 uppercase tracking-wider">
          {subtitle}
        </p>
      )}
      {description && (
        <p className="text-gray-400 text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

interface InputProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  icon?: ElementType
  className?: string
  type?: string
}

export function Input(props: InputProps) {
  const { value, onChange, placeholder, icon: Icon, className, type = "text" } = props
  return (
    <div className={cn("relative", className)}>
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
          "transition-all duration-200",
          Icon && "pl-12"
        )}
      />
    </div>
  )
}

export function Skeleton(props: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-white/5", props.className)} />
  )
}

interface StarRatingProps {
  rating: number
  size?: "sm" | "md"
}

export function StarRating(props: StarRatingProps) {
  const { rating, size = "sm" } = props
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5"
  return (
    <div className="flex gap-0.5">
      {stars.map(star => {
        const isFilled = star <= Math.round(rating)
        return (
          <svg key={star} className={cn(sizeClass, isFilled ? "text-yellow-500" : "text-gray-600")} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      })}
    </div>
  )
}
