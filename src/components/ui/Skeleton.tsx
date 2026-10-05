import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  rounded?: 'md' | 'lg' | 'xl' | 'full'
}

const roundedMap = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

export function Skeleton({ className, rounded = 'lg' }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('skeleton h-4 w-full', roundedMap[rounded], className)} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('surface-card animate-pulse p-5', className)}
      aria-hidden="true"
      data-testid="skeleton"
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-32" />
      <Skeleton className="mt-3 h-3 w-40" />
    </div>
  )
}
