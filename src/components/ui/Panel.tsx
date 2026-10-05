import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PanelProps {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

export function Panel({ children, className, as: Tag = 'section' }: PanelProps) {
  return <Tag className={cn('surface-card', className)}>{children}</Tag>
}

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  icon?: LucideIcon
  trend?: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function StatCard({ label, value, hint, icon: Icon, trend, className, style }: StatCardProps) {
  return (
    <div className={cn('surface-card group p-5 transition-shadow hover:shadow-lift', className)} style={style}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-elevated text-brand transition-colors group-hover:border-brand/50">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p> : null}
      {trend ? <div className="mt-3">{trend}</div> : null}
    </div>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  actions?: ReactNode
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn(align === 'center' && 'mx-auto max-w-2xl')}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {description ? (
          <p className={cn('mt-3 text-sm leading-relaxed text-muted sm:text-base', align === 'center' && 'mx-auto')}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}
