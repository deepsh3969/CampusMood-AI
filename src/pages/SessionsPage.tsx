import { Calendar, Clock, Eye, History, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Panel, SectionHeading, EmptyState, StatCard, Badge } from '@/components/ui'
import { useSessionsStore } from '@/store/sessionsStore'
import { formatDuration, humanDuration, formatDate, formatDateTime } from '@/utils/format'
import { expressionDisplay } from '@/constants/expressions'

export default function SessionsPage() {
  const { sessions } = useSessionsStore()

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeading
        eyebrow="Sessions"
        title="Your session history"
        description="Review past monitoring sessions with expression trends and summaries."
        className="mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Sessions" value={sessions.length} icon={History} hint="Completed sessions" />
        <StatCard label="Total Time" value={humanDuration(sessions.reduce((sum, s) => sum + s.durationSec, 0))} icon={Calendar} hint="Across all sessions" />
        <StatCard label="Avg. Duration" value={sessions.length > 0 ? humanDuration(Math.round(sessions.reduce((sum, s) => sum + s.durationSec, 0) / sessions.length)) : '—'} icon={Clock} hint="Per session" />
        <StatCard label="Avg. Detection" value={sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.detectionRate, 0) / sessions.length * 100) + '%' : '—'} icon={Eye} hint="Face visibility rate" />
      </div>

      {sessions.length === 0 ? (
        <Panel>
          <EmptyState
            icon={History}
            title="No sessions recorded"
            description="Complete a session from the Live Monitor to see it here with full timeline, distribution, and exportable reports."
            action={<a href="/monitor" className="btn-primary">Start a session</a>}
          />
        </Panel>
      ) : (
        <Panel>
          <div className="space-y-3">
            {sessions.map(session => (
              <Link key={session.id} to={`/sessions/${session.id}`} className="surface-card p-4 flex items-center justify-between gap-4 hover:border-brand/50 transition-colors group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Calendar className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{formatDate(session.endedAt)}</p>
                    <p className="text-sm text-muted truncate">{formatDuration(session.durationSec)} • {session.sessionType === 'study' ? 'Study Session' : 'Quick Check'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="brand" className="text-xs">{expressionDisplay(session.dominantExpression)}</Badge>
                    <Badge variant="outline" className="text-xs">{Math.round(session.detectionRate * 100)}% detection</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm text-muted hidden sm:block">
                    <p className="font-mono">{formatDuration(session.durationSec)}</p>
                    <p className="text-xs text-muted/70">{formatDateTime(session.endedAt)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted group-hover:text-brand transition-colors" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}