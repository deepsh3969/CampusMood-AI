import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps {
  tone?: Tone
  title?: string
  children: ReactNode
  className?: string
  role?: 'alert' | 'status'
  action?: ReactNode
}

const tones: Record<Tone, { wrapper: string; icon: LucideIcon; iconTone: string }> = {
  info: { wrapper: 'border-brand/30 bg-brand-soft/70', icon: Info, iconTone: 'text-brand' },
  success: { wrapper: 'border-success/30 bg-success/10', icon: CheckCircle2, iconTone: 'text-success' },
  warning: { wrapper: 'border-warning/35 bg-warning/10', icon: AlertTriangle, iconTone: 'text-warning' },
  danger: { wrapper: 'border-danger/35 bg-danger/10', icon: XCircle, iconTone: 'text-danger' },
}

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  role = 'status',
  action,
}: AlertProps) {
  const config = tones[tone]
  const Icon = config.icon
  return (
    <div
      role={role}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed text-ink',
        config.wrapper,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconTone)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="mb-0.5 font-semibold">{title}</p> : null}
        <div className="text-muted">{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
