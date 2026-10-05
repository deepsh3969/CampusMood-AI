import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import type { Distribution } from '@/types'
import { EXPRESSION_KEYS, expressionColor, expressionDisplay } from '@/constants/expressions'

interface ExpressionDistributionChartProps {
  distribution: Distribution
  height?: number
  showValues?: boolean
  horizontal?: boolean
}

export function ExpressionDistributionChart({
  distribution,
  height = 200,
  showValues = true,
  horizontal = false,
}: ExpressionDistributionChartProps) {
  const total = EXPRESSION_KEYS.reduce((sum, key) => sum + (distribution[key] ?? 0), 0)
  const hasData = total > 0

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        No expression data available
      </div>
    )
  }

  const chartData = EXPRESSION_KEYS.map((key) => ({
    name: expressionDisplay(key),
    value: distribution[key] ?? 0,
    color: expressionColor(key),
    percentage: Math.round((distribution[key] ?? 0) * 100),
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0]; color: string }> }) => {
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
  }

  if (horizontal) {
    return (
      <div className="w-full h-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-border))" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
              axisLine={{ stroke: 'rgb(var(--c-border))' }}
              tickLine={false}
              tickFormatter={(value) => Math.round(value * 100) + '%'}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11, fill: 'rgb(var(--c-ink))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            {showValues && (
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                {chartData.map((_entry, index) => (
                  <Cell key={`label-${index}`} fill="transparent" />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-full h-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-border))" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
            axisLine={{ stroke: 'rgb(var(--c-border))' }}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            domain={[0, 'dataMax']}
            tick={{ fontSize: 10, fill: 'rgb(var(--c-muted))' }}
            axisLine={{ stroke: 'rgb(var(--c-border))' }}
            tickLine={false}
            tickFormatter={(value) => Math.round(value * 100) + '%'}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}