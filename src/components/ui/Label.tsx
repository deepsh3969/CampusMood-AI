import { cn } from '@/utils/cn'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ className, children, ...props }: LabelProps) {
  return <label className={cn('label', className)} {...props}>{children}</label>
}