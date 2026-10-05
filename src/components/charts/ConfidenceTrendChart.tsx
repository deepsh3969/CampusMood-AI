import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { SessionSample } from '@/types'

interface ConfidenceTrendChartProps {
  samples: SessionSample[]
  height?: number
}

export function ConfidenceTrendChart({ samples, height = 150 }: ConfidenceTrendChartProps) {
  if (!samples.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        No confidence data available
      </div>
    )
  }

  // Filter samples with face detected and confidence > 0
  const filteredSamples = samples.filter((s) => s.faceDetected && s.confidence > 0)

  if (!filteredSamples.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        No face-detected samples with confidence data
      </div>
    )
  }

  const chartData = filteredSamples.map((sample, index) => ({
    index,
    label: formatTime(sample.t),
    time: sample.t,
    confidence: sample.confidence,
    expression: sample.expression ?? 'none',
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0]; color: string }> }) => {
    if (!active || !payload || !payload.length) return null
    const entry = payload[0]?.payload
    if (!entry) return null
    return (
      <div className="surface-card p-3 rounded-lg border border-border shadow-lift">
        <p className="font-semibold text-ink">{entry.label}</p>
        <p className="text-sm text-muted mt-1">
          Confidence: <span className="font-medium">{Math.round(entry.confidence * 100)}%</span>
        </p>
        <p className="text-sm text-muted">
          Expression: <span className="font-medium capitalize">{entry.expression}</span>
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
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="rgb(var(--c-brand))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, fill: 'rgb(var(--c-brand))' }}
            isAnimationActive={false}
          />
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