import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: ReactNode
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'outline'
  className?: string
  dot?: boolean
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'border-border bg-elevated text-muted',
  brand: 'border-brand/40 bg-brand-soft text-brand',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  outline: 'border-border bg-transparent text-muted',
}

export function Badge({ children, variant = 'neutral', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
