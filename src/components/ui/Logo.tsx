import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  to?: string | null
  className?: string
  subtitle?: boolean
}

const markSizes = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-9 w-9 rounded-xl',
  lg: 'h-11 w-11 rounded-xl',
}

const textSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative grid place-items-center bg-gradient-to-br from-brand to-accent text-white shadow-glow',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" fill="none" className="h-[62%] w-[62%]">
        <path
          d="M32 10c-9 0-15.5 6.4-15.5 16 0 5.8 2.7 10.3 6 14.1 2.1 2.4 3.8 4.9 4.5 7.8l.4 1.6h9.2l.4-1.6c.7-2.9 2.4-5.4 4.5-7.8 3.3-3.8 6-8.3 6-14.1C47.5 16.4 41 10 32 10Z"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M24.5 30.5c1.6 2.4 4.4 3.9 7.5 3.9s5.9-1.5 7.5-3.9"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="25" cy="24" r="2.6" fill="currentColor" />
        <circle cx="39" cy="24" r="2.6" fill="currentColor" />
      </svg>
    </span>
  )
}

export function Logo({ size = 'md', to = '/', className, subtitle = false }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markSizes[size]} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display font-bold tracking-tight text-ink', textSizes[size])}>
          CampusMood <span className="gradient-text">AI</span>
        </span>
        {subtitle ? (
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Expression insights
          </span>
        ) : null}
      </span>
    </span>
  )

  if (!to) return content
  return (
    <Link to={to} aria-label="CampusMood AI home" className="rounded-lg">
      {content}
    </Link>
  )
}
