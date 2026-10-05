import { useState, useMemo } from 'react'
import { Clock, Eye, History, Sparkles, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react'
import { Panel, SectionHeading, StatCard, Badge, Alert } from '@/components/ui'
import { useSessionsStore } from '@/store/sessionsStore'
import { humanDuration, formatDate } from '@/utils/format'
import { expressionDisplay, EXPRESSION_KEYS } from '@/constants/expressions'
import {
  ExpressionDistributionChart,
  ExpressionTimelineChart,
  ConfidenceTrendChart,
} from '@/components/charts'
import { aggregateSessions, dailyBuckets, DailyBucket, computeSessionStats } from '@/utils/analytics'
import type { ExpressionLabel } from '@/types'
import { cn } from '@/utils/cn'

type TimeRange = 7 | 30 | 90

function CalendarHeatmap({ buckets }: { buckets: DailyBucket[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-elevated/50 border border-border" />
          <span>No sessions</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-brand/20" />
          <span>1-2 sessions</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-brand/40" />
          <span>3-4 sessions</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-brand/60" />
          <span>5+ sessions</span>
        </span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted py-1">{day}</div>
        ))}
        {buckets.map((bucket, index) => {
          const date = new Date(bucket.date + 'T00:00:00')
          const dayOfWeek = date.getDay()
          const sessions = bucket.sessions
          let intensity = 0
          if (sessions === 0) intensity = 0
          else if (sessions <= 2) intensity = 1
          else if (sessions <= 4) intensity = 2
          else intensity = 3

          const colors = [
            'bg-elevated/50 border border-border',
            'bg-brand/20',
            'bg-brand/40',
            'bg-brand/60',
          ]

          return (
            <div
              key={bucket.date}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-colors',
                colors[intensity],
                intensity > 0 && 'text-brand',
                dayOfWeek === 0 && index === 0 && 'col-start-1',
                dayOfWeek === 1 && index === 0 && 'col-start-2',
                dayOfWeek === 2 && index === 0 && 'col-start-3',
                dayOfWeek === 3 && index === 0 && 'col-start-4',
                dayOfWeek === 4 && index === 0 && 'col-start-5',
                dayOfWeek === 5 && index === 0 && 'col-start-6',
                dayOfWeek === 6 && index === 0 && 'col-start-7',
              )}
              title={`${bucket.date}: ${bucket.sessions} session${bucket.sessions !== 1 ? 's' : ''}, ${humanDuration(bucket.durationSec)}`}
            >
              {intensity > 0 && <span>{sessions}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrendLineChart({ buckets }: { buckets: DailyBucket[] }) {
  const maxDuration = Math.max(...buckets.map(b => b.durationSec), 1)

  const pathData = buckets.length > 1
    ? buckets.map((b, i) => {
        const x = (i / (buckets.length - 1)) * 580 + 10
        const y = 140 - (b.durationSec / maxDuration) * 120
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ')
    : ''

  const areaData = buckets.length > 1
    ? pathData + ' L 590 140 L 10 140 Z'
    : ''

  const points = buckets.map((b, i) => {
    const x = (i / Math.max(buckets.length - 1, 1)) * 580 + 10
    const y = 140 - (b.durationSec / maxDuration) * 120
    return { x, y, sessions: b.sessions }
  })

  return (
    <div className="h-48 relative">
      <svg viewBox="0 0 600 150" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(var(--c-brand))" stopOpacity="0.3" />
            <stop offset="1" stopColor="rgb(var(--c-brand))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {buckets.length > 1 && (
          <>
            <path d={pathData} stroke="rgb(var(--c-brand))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={areaData} fill="url(#trend-gradient)" />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={p.sessions > 0 ? 4 : 2}
                fill={p.sessions > 0 ? 'rgb(var(--c-brand))' : 'rgb(var(--c-border))'}
                stroke="rgb(var(--c-bg))"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted">
        {buckets.map((b, i) => (i % Math.ceil(buckets.length / 6) === 0 || i === buckets.length - 1) && (
          <span key={i} style={{ left: `${(i / Math.max(buckets.length - 1, 1)) * 100}%` }}>
            {new Date(b.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  )
}

function InsightCard({ insight }: { insight: { id: string; tone: 'positive' | 'suggestion' | 'neutral'; title: string; body: string } }) {
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg p-3 text-sm',
      insight.tone === 'positive' ? 'border-success/30 bg-success/10' : '',
      insight.tone === 'suggestion' ? 'border-warning/30 bg-warning/10' : '',
      insight.tone === 'neutral' ? 'border-brand/30 bg-brand-soft/50' : '',
    )}>
      <span className={cn(
        'flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center',
        insight.tone === 'positive' ? 'bg-success/20 text-success' : '',
        insight.tone === 'suggestion' ? 'bg-warning/20 text-warning' : '',
        insight.tone === 'neutral' ? 'bg-brand/20 text-brand' : '',
      )}>
        {insight.tone === 'positive' && <CheckCircle2 className="h-3 w-3" />}
        {insight.tone === 'suggestion' && <HelpCircle className="h-3 w-3" />}
        {insight.tone === 'neutral' && <Sparkles className="h-3 w-3" />}
      </span>
      <div>
        <p className="font-medium">{insight.title}</p>
        <p className="mt-0.5 text-muted">{insight.body}</p>
      </div>
    </div>
  )
}

function InsightsPage() {
  const { sessions } = useSessionsStore()
  const [timeRange, setTimeRange] = useState<TimeRange>(30)

  const summary = useMemo(() => aggregateSessions(sessions, timeRange), [sessions, timeRange])
  const buckets = useMemo(() => dailyBuckets(sessions, timeRange), [sessions, timeRange])
  const stats = useMemo(() => {
    if (!sessions.length) return null
    const recentSessions = sessions.filter(s => {
      const start = new Date()
      start.setDate(new Date().getDate() - (timeRange - 1))
      start.setHours(0, 0, 0, 0)
      return new Date(s.endedAt) >= start
    })
    return recentSessions.map(s => computeSessionStats(s.timeline))
  }, [sessions, timeRange])

  const insights = useMemo(() => {
    const result: Array<{ id: string; tone: 'positive' | 'suggestion' | 'neutral'; title: string; body: string }> = []

    if (summary.totalSessions === 0) {
      return result
    }

    // Session frequency insight
    if (summary.totalSessions > 0) {
      const avgSessionsPerWeek = (summary.totalSessions / timeRange) * 7
      if (avgSessionsPerWeek >= 5) {
        result.push({
          id: 'frequency-high',
          tone: 'positive',
          title: 'Consistent study habit',
          body: `You've completed ${summary.totalSessions} sessions in the last ${timeRange} days (~${Math.round(avgSessionsPerWeek)} per week).`,
        })
      } else if (avgSessionsPerWeek < 2) {
        result.push({
          id: 'frequency-low',
          tone: 'suggestion',
          title: 'Consider more regular sessions',
          body: `Only ${summary.totalSessions} sessions in ${timeRange} days. Regular short sessions may be more beneficial than occasional long ones.`,
        })
      }
    }

    // Average duration insight
    if (summary.avgDurationSec > 0) {
      if (summary.avgDurationSec >= 1800) {
        result.push({
          id: 'duration-long',
          tone: 'positive',
          title: 'Extended focus sessions',
          body: `Your average session is ${humanDuration(summary.avgDurationSec)}. Great sustained focus!`,
        })
      }
    }

    // Detection rate insight
    if (summary.avgDetectionRate > 0.9) {
      result.push({
        id: 'detection-high',
        tone: 'positive',
        title: 'Excellent camera positioning',
        body: `Face detection rate is ${Math.round(summary.avgDetectionRate * 100)}%. Your camera setup is working well.`,
      })
    } else if (summary.avgDetectionRate < 0.6) {
      result.push({
        id: 'detection-low',
        tone: 'suggestion',
        title: 'Improve camera positioning',
        body: `Face detection rate is ${Math.round(summary.avgDetectionRate * 100)}%. Try adjusting lighting or camera angle for better results.`,
      })
    }

    // Confidence insight
    if (summary.avgConfidence > 0.8) {
      result.push({
        id: 'confidence-high',
        tone: 'positive',
        title: 'High expression confidence',
        body: `Average confidence is ${Math.round(summary.avgConfidence * 100)}%. Expression estimates are clear and consistent.`,
      })
    } else if (summary.avgConfidence < 0.5) {
      result.push({
        id: 'confidence-low',
        tone: 'suggestion',
        title: 'Low expression confidence',
        body: `Average confidence is ${Math.round(summary.avgConfidence * 100)}%. Ensure good lighting and face the camera directly.`,
      })
    }

    // Dominant expression insight
    if (summary.mostCommonExpression && summary.mostCommonExpression !== 'neutral') {
      result.push({
        id: 'dominant-expression',
        tone: 'neutral',
        title: 'Common expression pattern',
        body: `Your most frequent expression is ${expressionDisplay(summary.mostCommonExpression as ExpressionLabel).toLowerCase()}. This reflects your visible facial patterns during study.`,
      })
    }

    return result
  }, [summary, timeRange])

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="mt-1 text-sm text-muted">Wellbeing trends over the last {timeRange} days</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value) as TimeRange)}
          className="input max-w-xs sm:w-auto"
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {summary.totalSessions === 0 ? (
        <Panel>
          <Alert tone="info" className="max-w-2xl">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-brand mt-0.5" />
              <div>
                <p className="font-medium">No sessions yet</p>
                <p className="text-sm text-muted mt-1">
                  Complete a session from the Live Monitor to see your expression trends, distribution charts,
                  and personalized observations here.
                </p>
              </div>
            </div>
          </Alert>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            <StatCard
              label="Total Sessions"
              value={summary.totalSessions}
              icon={History}
              hint={`${timeRange} days`}
            />
            <StatCard
              label="Total Time"
              value={humanDuration(summary.totalDurationSec)}
              icon={Clock}
              hint="Across all sessions"
            />
            <StatCard
              label="Avg Session"
              value={summary.avgDurationSec > 0 ? humanDuration(summary.avgDurationSec) : '—'}
              icon={Clock}
              hint="Per session"
            />
            <StatCard
              label="Top Expression"
              value={expressionDisplay(summary.mostCommonExpression as ExpressionLabel)}
              icon={Sparkles}
              hint="Most frequent"
            />
            <StatCard
              label="Avg Detection"
              value={`${Math.round(summary.avgDetectionRate * 100)}%`}
              icon={Eye}
              hint="Face visibility"
            />
          </div>

          {/* Charts Row 1: Distribution and Daily Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel className="p-5">
              <SectionHeading title="Expression Distribution" className="mb-4" />
              <div className="h-64">
                <ExpressionDistributionChart
                  distribution={summary.distribution}
                  height={256}
                  horizontal
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {EXPRESSION_KEYS.map(key => {
                  const value = summary.distribution[key] ?? 0
                  return (
                    <Badge
                      key={key}
                      variant="outline"
                      dot
                      className="[--badge-color:var(--c-brand)]"
                    >
                      {expressionDisplay(key)}: {Math.round(value * 100)}%
                    </Badge>
                  )
                })}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading title="Daily Activity" description="Session frequency and duration over time" className="mb-4" />
              <CalendarHeatmap buckets={buckets} />
            </Panel>
          </div>

          {/* Charts Row 2: Duration Trend and Detection Consistency */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel className="p-5">
              <SectionHeading title="Session Duration Trend" description="Daily total study time" className="mb-4" />
              <TrendLineChart buckets={buckets} />
            </Panel>

            <Panel className="p-5">
              <SectionHeading title="Detection Consistency" className="mb-4" />
              {stats && stats.length > 0 && (
                <div className="space-y-3">
                  {stats.slice(0, 10).map((stat, index) => {
                    const session = sessions[index]
                    if (!session) return null
                    return (
                      <div key={index} className="surface-card p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatDate(session.endedAt)}</span>
                          <Badge variant={stat.detectionRate > 0.8 ? 'success' : stat.detectionRate > 0.5 ? 'warning' : 'danger'}>
                            {Math.round(stat.detectionRate * 100)}% detected
                          </Badge>
                        </div>
                        <div className="mt-2 h-4 bg-elevated/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full transition-all duration-500"
                            style={{ width: `${stat.detectionRate * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {(!stats || stats.length === 0) && (
                <p className="text-sm text-muted">Complete sessions to see detection consistency per session.</p>
              )}
            </Panel>
          </div>

          {/* Charts Row 3: Session Timeline and Confidence (if we have session data) */}
          {sessions.length > 0 && sessions[0] && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel className="p-5">
                <SectionHeading title="Recent Session Expression Timeline" className="mb-4" />
                <div className="h-64">
                  <ExpressionTimelineChart
                    samples={sessions[0].timeline}
                    height={256}
                  />
                </div>
              </Panel>

              <Panel className="p-5">
                <SectionHeading title="Confidence Trend" className="mb-4" />
                <div className="h-64">
                  <ConfidenceTrendChart
                    samples={sessions[0].timeline}
                    height={256}
                  />
                </div>
              </Panel>
            </div>
          )}

          {/* Supportive Observations */}
          <Panel className="p-5">
            <SectionHeading
              title="Supportive Observations"
              description="Neutral, observational insights based on your visible expression patterns"
              className="mb-4"
            />
            <Alert tone="info" className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <AlertCircle className="h-4 w-4" />
                <span>
                  These observations are based only on visible facial-expression estimates from the camera.
                  They do not measure your true feelings, mental state, or psychological wellbeing.
                </span>
              </div>
            </Alert>
            <div className="space-y-3">
              {insights.length > 0 ? (
                insights.map(insight => <InsightCard key={insight.id} insight={insight} />)
              ) : (
                <p className="text-sm text-muted">Complete more sessions to generate personalized observations.</p>
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}

export default InsightsPage