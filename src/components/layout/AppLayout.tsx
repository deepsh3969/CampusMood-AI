import { LayoutDashboard, BarChart3, History, MonitorPlay, Settings, User, ShieldCheck, LogOut, Menu, X } from 'lucide-react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { useAuthStore } from '@/store/authStore'
import { getAuthAdapter } from '@/services/auth'
import { cn } from '@/utils/cn'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/monitor', label: 'Live Monitor', icon: MonitorPlay },
  { to: '/sessions', label: 'Sessions', icon: History },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppLayout() {
  const { session, setSession } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    const adapter = await getAuthAdapter()
    await adapter.signOut()
    setSession(null)
  }

  const isActive = (to: string) => (to === '/dashboard' ? location.pathname === to : location.pathname.startsWith(to))

  return (
    <div className="min-h-dvh bg-bg">
      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform bg-surface border-r border-border transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Logo size="md" to="/dashboard" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-ghost p-2"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-brand-soft text-brand'
                    : 'text-muted hover:bg-elevated hover:text-ink',
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-elevated hover:text-danger"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:bg-surface lg:border-r lg:border-border">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border px-4">
            <Logo size="md" to="/dashboard" subtitle />
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-brand-soft text-brand'
                    : 'text-muted hover:bg-elevated hover:text-ink',
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium">{session?.user.displayName ?? 'Student'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-elevated hover:text-danger"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg/80 backdrop-blur-xl px-4 lg:px-6">
          <button
            className="btn-ghost p-2 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs font-medium text-muted sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Local demo
            </div>
            <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold">
              {session?.user.displayName?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <Container size="wide">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  )
}