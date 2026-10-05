import { Panel, Alert, Badge } from '@/components/ui'
import { Link, useParams } from 'react-router-dom'
import { useSessionsStore } from '@/store/sessionsStore'
import { formatDate, formatDateTime, formatDuration, humanDuration } from '@/utils/format'
import { expressionDisplay, expressionColor, EXPRESSION_KEYS } from '@/constants/expressions'
import { sessionToCSV, downloadCSV } from '@/utils/export'
import type { ExpressionLabel } from '@/types'

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { sessions } = useSessionsStore()

  const session = sessions.find(s => s.id === id)
  if (!session) {
    return (
      <div className="space-y-6 animate-fade-up">
        <Link to="/sessions" className="btn-ghost inline-flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 19 12" />
          </svg>
          Back to sessions
        </Link>
        <Alert tone="danger" className="max-w-md">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-medium">Session not found</p>
              <p className="text-sm text-muted mt-1">The requested session could not be found.</p>
            </div>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <Link to="/sessions" className="btn-ghost inline-flex items-center gap-2">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <polyline points="12 19 5 12 19 12" />
        </svg>
        Back to sessions
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {session.sessionType === 'study' ? 'Study Session' : 'Quick Check'}
              </span>
              <h1 className="mt-1 text-2xl font-bold">{formatDate(session.endedAt)}</h1>
              <p className="mt-1 text-sm text-muted">
                {humanDuration(session.durationSec)} \u2022 {formatDateTime(session.endedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="text-xs">
                {expressionDisplay(session.dominantExpression as ExpressionLabel)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {Math.round(session.detectionRate * 100)}% detection
              </Badge>
            </div>
          </div>

          <Panel className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Expression Timeline</h3>
            <div className="space-y-3">
              {session.timeline.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted w-16">{formatDuration(point.t)}</span>
                  <div className="flex-1 h-2 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(point.confidence ?? 0) * 100}%`,
                        backgroundColor: point.expression ? expressionColor(point.expression as ExpressionLabel) : 'transparent',
                      }}
                    />
                  </div>
                  <span className="text-right font-mono text-xs text-muted w-16">
                    {point.expression ? expressionDisplay(point.expression as ExpressionLabel) : '\u2014'}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Face Detection Consistency</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="text-center p-4 rounded-xl bg-elevated/50">
                <p className="text-3xl font-bold text-success">
                  {Math.round(session.detectionRate * 100)}%
                </p>
                <p className="text-xs text-muted mt-1">Face Detected</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-elevated/50">
                <p className="text-3xl font-bold text-brand">{session.sampleCount}</p>
                <p className="text-xs text-muted mt-1">Total Samples</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-elevated/50">
                <p className="text-3xl font-bold text-brand">
                  {Math.round(session.avgConfidence * 100)}%
                </p>
                <p className="text-xs text-muted mt-1">Avg Confidence</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-elevated/50">
                <p className="text-3xl font-bold">{session.detectedSampleCount}</p>
                <p className="text-xs text-muted mt-1">Face Detected Samples</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Supportive Insights</h3>
            <div className="space-y-3">
              {session.insights.map(insight => (
                <div
                  key={insight.id}
                  className={[
                    'flex items-start gap-3 rounded-lg p-3 text-sm',
                    insight.tone === 'positive' ? 'border-success/30 bg-success/10' : '',
                    insight.tone === 'suggestion' ? 'border-warning/30 bg-warning/10' : '',
                    insight.tone === 'neutral' ? 'border-brand/30 bg-brand-soft/50' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span
                    className={[
                      'flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center',
                      insight.tone === 'positive' ? 'bg-success/20 text-success' : '',
                      insight.tone === 'suggestion' ? 'bg-warning/20 text-warning' : '',
                      insight.tone === 'neutral' ? 'bg-brand/20 text-brand' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {insight.tone === 'positive' && (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    )}
                    {insight.tone === 'suggestion' && (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                    {insight.tone === 'neutral' && (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0" />
                        <path d="M23 21l-6-6m2-5a7 7 0 1 1-14 0" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="font-medium">{insight.title}</p>
                    <p className="mt-1 text-sm text-muted">{insight.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Panel className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Expression Distribution</h3>
            <div className="space-y-3">
              {EXPRESSION_KEYS.map(key => {
                const value = session.distribution[key] ?? 0
                const pct = session.detectedSampleCount > 0
                  ? Math.round((value / session.detectedSampleCount) * 100)
                  : 0
                return (
                  <div key={key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
                    <span className="text-sm text-muted capitalize">{key}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-border/70">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${session.detectedSampleCount > 0 ? (session.distribution[key] ?? 0) / session.detectedSampleCount * 100 : 0}%`,
                          backgroundColor: expressionColor(key),
                        }}
                      />
                    </div>
                    <span className="text-right font-mono text-sm text-muted">
                      {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {EXPRESSION_KEYS.map(key => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: expressionColor(key) + '20',
                    borderColor: expressionColor(key),
                    color: expressionColor(key),
                  }}
                >
                  <span style={{ backgroundColor: expressionColor(key) }} className="h-2 w-2 rounded-full" />
                  {key}: {session.detectedSampleCount > 0
                    ? Math.round((session.distribution[key] ?? 0) / session.detectedSampleCount * 100)
                    : 0}%
                </span>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-elevated/50 text-sm text-muted">
              <p className="font-medium mb-2">Variation level: <span className="font-semibold text-ink">moderate</span></p>
              <p>Your visible expressions remained relatively stable across sessions.</p>
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Session Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <dt className="text-muted">Date</dt>
                <dd className="font-medium">{formatDate(session.endedAt)}</dd>
                <dt className="text-muted">Duration</dt>
                <dd className="font-mono font-medium">{formatDuration(session.durationSec)}</dd>
                <dt className="text-muted">Type</dt>
                <dd className="font-medium capitalize">{session.sessionType}</dd>
                <dt className="text-muted">Dominant Expression</dt>
                <dd className="font-medium capitalize">{expressionDisplay(session.dominantExpression as ExpressionLabel)}</dd>
                <dt className="text-muted">Face Detection</dt>
                <dd className="font-mono font-medium">{Math.round(session.detectionRate * 100)}%</dd>
                <dt className="text-muted">Avg Confidence</dt>
                <dd className="font-mono font-medium">{Math.round(session.avgConfidence * 100)}%</dd>
                <dt className="text-muted">Samples</dt>
                <dd className="font-mono font-medium">{session.sampleCount}</dd>
                <dt className="text-muted">Face Samples</dt>
                <dd className="font-mono font-medium">{session.detectedSampleCount}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={() => downloadCSV(sessionToCSV(session), `campusmood-session-${session.id}.csv`)}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
          </svg>
          Download Report (CSV)
        </button>
      </div>
    </div>
  )
}