import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { APP_NAME, SUPPORT_EMAIL } from '@/constants/app'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Features', href: '/#features' },
      { label: 'Technology', href: '/#technology' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Application',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Live Monitor', href: '/monitor' },
    ],
  },
  {
    title: 'Trust & safety',
    links: [
      { label: 'Privacy Center', href: '/privacy' },
      { label: 'Responsible AI', href: '/privacy#responsible-ai' },
      { label: 'Settings', href: '/settings' },
      { label: `Contact ${APP_NAME}`, href: `mailto:${SUPPORT_EMAIL}` },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface/60">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo size="md" to="/" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Understand your study moments. Support your wellbeing — with visible-expression
              estimates processed on your device.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted/80">
              Not a medical or mental-health diagnosis system.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="divider mt-12" />
        <div className="mt-6 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. For educational wellbeing support only.
          </p>
          <p className="max-w-xl sm:text-right">
            Expression estimates reflect visible facial patterns only and may not reflect how you
            actually feel.
          </p>
        </div>
      </Container>
    </footer>
  )
}
