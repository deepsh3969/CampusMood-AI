import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui'
import type { SessionSample } from '@/types'

interface FaceDetectionConsistencyProps {
  samples: SessionSample[]
  height?: number
}

export function FaceDetectionConsistencyChart({ samples, height = 150 }: FaceDetectionConsistencyProps) {
  if (!samples.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        No detection data available
      </div>
    )
  }

  const chartData = samples.map((sample, index) => ({
    index,
    label: formatTime(sample.t),
    time: sample.t,
    detected: sample.faceDetected ? 1 : 0,
  }))

  // Calculate detection rate for display
  const detectedCount = samples.filter((s) => s.faceDetected).length
  const detectionRate = samples.length > 0 ? detectedCount / samples.length : 0

  return (
    <div className="w-full h-full" style={{ height }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Face Detection Consistency</span>
        <Badge variant={detectionRate > 0.8 ? 'success' : detectionRate > 0.5 ? 'warning' : 'danger'}>
          {Math.round(detectionRate * 100)}% detection rate
        </Badge>
      </div>
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
              dataKey="detected"
              domain={[0, 1]}
              tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
              axisLine={{ stroke: 'rgb(var(--c-border))' }}
              tickLine={false}
              tickFormatter={(value) => (value === 1 ? 'Detected' : 'Lost')}
            />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null
              const entry = payload[0]?.payload
              if (!entry) return null
              return (
                <div className="surface-card p-3 rounded-lg border border-border shadow-lift">
                  <p className="font-semibold text-ink">{entry.label}</p>
                  <p className="text-sm text-muted mt-1">
                    Face: <span className="font-medium">{entry.detected ? 'Detected' : 'Not detected'}</span>
                  </p>
                </div>
              )
            }} />
            <Line
              type="stepAfter"
              dataKey="detected"
              stroke="rgb(var(--c-success))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}