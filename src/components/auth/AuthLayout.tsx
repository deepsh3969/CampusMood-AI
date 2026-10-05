import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Container } from '@/components/ui/Container'
import { APP_NAME, DISCLAIMER_SHORT } from '@/constants/app'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border bg-bg/80 backdrop-blur-xl px-4 py-4">
        <Container className="flex items-center justify-between">
          <Logo size="md" to="/" />
          <Link to="/" className="btn-ghost text-sm hidden sm:inline-flex">
            Back to home
          </Link>
        </Container>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Container size="narrow">
          <div className="surface-card w-full p-8 sm:p-10">
            {title ? (
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && <p className="mt-2 text-sm text-muted">{description}</p>}
              </div>
            ) : null}
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-muted/80">
            {APP_NAME} — {DISCLAIMER_SHORT}
          </p>
        </Container>
      </main>
    </div>
  )
}