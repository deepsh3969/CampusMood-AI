import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { SessionSample, ExpressionLabel } from '@/types'
import { EXPRESSION_KEYS, expressionColor } from '@/constants/expressions'

interface ExpressionTimelineChartProps {
  samples: SessionSample[]
  height?: number
  showDots?: boolean
}

export function ExpressionTimelineChart({ samples, height = 200, showDots = false }: ExpressionTimelineChartProps) {
  if (!samples.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        No expression data available
      </div>
    )
  }

  // Transform samples into series data per expression
  const expressionSeries: Record<ExpressionLabel, Array<{ time: number; value: number; label: string }>> = EXPRESSION_KEYS.reduce(
    (acc, key) => {
      acc[key] = []
      return acc
    },
    {} as Record<ExpressionLabel, Array<{ time: number; value: number; label: string }>>,
  )

  // Track the primary expression at each sample
  samples.forEach((sample) => {
    const timeLabel = formatTime(sample.t)
    if (sample.expression) {
      EXPRESSION_KEYS.forEach((key) => {
        expressionSeries[key].push({
          time: sample.t,
          value: key === sample.expression ? sample.confidence : 0,
          label: timeLabel,
        })
      })
    } else {
      EXPRESSION_KEYS.forEach((key) => {
        expressionSeries[key].push({ time: sample.t, value: 0, label: timeLabel })
      })
    }
  })

  // Use the samples array directly for the chart data
  const chartData = samples.map((sample) => ({
    time: sample.t,
    label: formatTime(sample.t),
    expression: sample.expression ?? 'none',
    confidence: sample.confidence,
    faceDetected: sample.faceDetected,
  }))

  // Custom tooltip to show expression info
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0]; color: string }> }) => {
    if (!active || !payload || !payload.length) return null
    const entry = payload[0]?.payload
    if (!entry) return null
    return (
      <div className="surface-card p-3 rounded-lg border border-border shadow-lift">
        <p className="font-semibold text-ink">{entry.label}</p>
        <p className="text-sm text-muted mt-1">
          Expression: <span className="font-medium capitalize">{entry.expression}</span>
        </p>
        <p className="text-sm text-muted">
          Confidence: <span className="font-medium">{Math.round(entry.confidence * 100)}%</span>
        </p>
        <p className="text-sm text-muted">
          Face: <span className="font-medium">{entry.faceDetected ? 'Detected' : 'Not detected'}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
            axisLine={{ stroke: 'rgb(var(--c-border))' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            dataKey="confidence"
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
            axisLine={{ stroke: 'rgb(var(--c-border))' }}
            tickLine={false}
            tickFormatter={(value) => Math.round(value * 100) + '%'}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {EXPRESSION_KEYS.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={expressionColor(key)}
              strokeWidth={2}
              dot={showDots}
              activeDot={{ r: 5, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}