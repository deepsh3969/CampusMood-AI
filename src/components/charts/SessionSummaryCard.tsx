import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Badge } from '@/components/ui'
import type { Distribution, ExpressionLabel, VariationLevel } from '@/types'
import { EXPRESSION_KEYS, expressionColor, expressionDisplay, expressionVariationCopy } from '@/constants/expressions'

interface SessionSummaryCardProps {
  distribution: Distribution
  dominantExpression: ExpressionLabel
  variation: VariationLevel
  detectionRate: number
  avgConfidence: number
  durationSec: number
  sampleCount: number
}

export function SessionSummaryCard({
  distribution,
  dominantExpression,
  variation,
  detectionRate,
  avgConfidence,
  durationSec,
  sampleCount,
}: SessionSummaryCardProps) {
  const total = EXPRESSION_KEYS.reduce((sum, key) => sum + (distribution[key] ?? 0), 0)
  const hasData = total > 0

  const chartData = EXPRESSION_KEYS.map((key) => ({
    name: expressionDisplay(key),
    value: distribution[key] ?? 0,
    color: expressionColor(key),
    percentage: total > 0 ? Math.round((distribution[key] ?? 0) * 100) : 0,
  }))

  const formatDuration = (sec: number) => {
    const hours = Math.floor(sec / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    const seconds = sec % 60
    return hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  return (
    <div className="surface-card p-5 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Duration</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatDuration(durationSec)}</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Dominant Expression</p>
          <p className="mt-1 text-lg font-semibold capitalize">{expressionDisplay(dominantExpression)}</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Expression Variation</p>
          <p className="mt-1 text-lg font-semibold">{expressionVariationCopy(variation)}</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Detection Rate</p>
          <p className="mt-1 text-lg font-semibold text-success">{Math.round(detectionRate * 100)}%</p>
        </div>
      </div>

      {hasData && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-ink">Expression Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
                  axisLine={{ stroke: 'rgb(var(--c-border))' }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 'dataMax']}
                  tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
                  axisLine={{ stroke: 'rgb(var(--c-border))' }}
                  tickLine={false}
                  tickFormatter={(value) => Math.round(value * 100) + '%'}
                />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const entry = payload[0]?.payload
                  if (!entry) return null
                  return (
                    <div className="surface-card p-3 rounded-lg border border-border shadow-lift">
                      <p className="font-semibold text-ink">{entry.name}</p>
                      <p className="text-sm text-muted mt-1">
                        <span className="font-medium">{entry.percentage}%</span> of session
                      </p>
                    </div>
                  )
                }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2">
            {chartData.map((entry) => (
              <Badge
                key={entry.name}
                variant={entry.name.toLowerCase().replace(' ', '-') as 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'outline'}
                dot
              >
                {entry.name}: {entry.percentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      {!hasData && (
        <div className="text-center py-8 text-muted">
          <p className="font-medium">No expression data recorded</p>
          <p className="text-sm mt-1">Complete a session to see distribution</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Avg Confidence</p>
          <p className="mt-1 text-lg font-bold text-brand">{Math.round(avgConfidence * 100)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Samples</p>
          <p className="mt-1 text-lg font-bold">{sampleCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Face Detected</p>
          <p className="mt-1 text-lg font-bold text-success">{Math.round(detectionRate * 100)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Variation</p>
          <p className="mt-1 text-lg font-bold">{expressionVariationCopy(variation)}</p>
        </div>
      </div>
    </div>
  )
}