import { Timer, BarChart3, History, Eye, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard, SectionHeading, EmptyState, Panel } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const QUICK_STATS = [
  { label: 'Current Session', value: '00:00', icon: Timer, hint: 'No active session' },
  { label: 'Sessions Completed', value: '0', icon: History, hint: 'Start your first session' },
  { label: 'Avg. Expression Stability', value: '—', icon: Sparkles, hint: 'Requires session data' },
  { label: 'Total Focus Time', value: '0 min', icon: Timer, hint: 'Tracked across sessions' },
]

const QUICK_ACTIONS = [
  { to: '/monitor', label: 'Quick Check', description: 'Real-time expression estimate', icon: Eye },
  { to: '/monitor?mode=study', label: 'Study Session', description: 'Timed session with insights', icon: Timer },
  { to: '/sessions', label: 'View History', description: 'Past sessions and reports', icon: History },
  { to: '/insights', label: 'Insights', description: 'Trends and analytics', icon: BarChart3 },
]

export default function DashboardPage() {
  const { session } = useAuthStore()

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Welcome back, {session?.user.displayName ?? 'Student'}</p>
        </div>
        <Link to="/monitor" className="btn-primary">
          Start Monitoring
        </Link>
      </div>

      <SectionHeading eyebrow="Overview" title="Your study wellbeing at a glance" className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_STATS.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            icon={stat.icon}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      <SectionHeading eyebrow="Quick actions" title="Start a new session" className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action, i) => (
          <Link
            key={action.to}
            to={action.to}
            className="surface-card group p-5 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lift animate-fade-up"
            style={{ animationDelay: `${i * 80 + 160}ms` }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-elevated text-brand transition-colors group-hover:border-brand/50 group-hover:bg-brand-soft">
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="text-base font-semibold">{action.label}</h3>
            <p className="text-sm leading-relaxed text-muted">{action.description}</p>
          </Link>
        ))}
      </div>

      <SectionHeading eyebrow="Recent activity" title="Your last sessions" className="mb-6" />

      <Panel>
        <EmptyState
          icon={History}
          title="No sessions yet"
          description="Your session history will appear here after you complete your first monitoring session."
          action={<Link to="/monitor" className="btn-primary">Start your first session</Link>}
        />
      </Panel>
    </div>
  )
}