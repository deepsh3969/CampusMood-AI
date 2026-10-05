import { CheckCircle2, HelpCircle, BarChart3 } from 'lucide-react'

interface InsightsContentProps {
  summary: ReturnType<typeof import('@/utils/analytics').aggregateSessions>
  insights: Array<{ id: string; tone: 'positive' | 'suggestion' | 'neutral'; title: string; body: string }>
}

export function InsightsContent({ summary, insights }: InsightsContentProps) {
  if (summary.totalSessions === 0) {
    return (
      <p className="text-sm text-muted">Complete sessions in the Live Monitor to generate personalized observations.</p>
    )
  }
  return (
    <>
      {insights.map(insight => (
        <div key={insight.id} className={'flex items-start gap-3 rounded-lg p-3 text-sm ' + (
          insight.tone === 'positive' ? 'border-success/30 bg-success/10' :
          insight.tone === 'suggestion' ? 'border-warning/30 bg-warning/10' :
          'border-brand/30 bg-brand-soft/50'
        )}>
          <span className={'flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ' + (
            insight.tone === 'positive' ? 'bg-success/20 text-success' :
            insight.tone === 'suggestion' ? 'bg-warning/20 text-warning' :
            'bg-brand/20 text-brand'
          )}>
            {insight.tone === 'positive' && <CheckCircle2 className="h-3 w-3" />}
            {insight.tone === 'suggestion' && <HelpCircle className="h-3 w-3" />}
            {insight.tone === 'neutral' && <BarChart3 className="h-3 w-3" />}
          </span>
          <div>
            <p className="font-medium">{insight.title}</p>
            <p className="mt-0.5 text-muted">{insight.body}</p>
          </div>
        </div>
      ))}
    </>
  )
}

export default InsightsContent