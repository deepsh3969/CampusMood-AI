import { CheckCircle2, Timer, BarChart3, Download } from 'lucide-react'
import { useEffect } from 'react'
import { Modal, Panel, SectionHeading } from '@/components/ui'
import { expressionDisplay, expressionColor, EXPRESSION_KEYS, expressionVariationCopy } from '@/constants/expressions'
import type { Distribution, ExpressionLabel, VariationLevel, SessionInsight } from '@/types'
import { formatDuration, formatPercent } from '@/utils/format'

interface SessionSummaryModalProps {
  open: boolean
  onClose: () => void
  onExport: () => void
  sessionData: {
    durationSec: number
    dominantExpression: ExpressionLabel
    distribution: Distribution
    variation: VariationLevel
    detectionRate: number
    avgConfidence: number
    sampleCount: number
    insights: SessionInsight[]
    startedAt: string
    endedAt: string
  }
}

export function SessionSummaryModal({
  open,
  onClose,
  onExport,
  sessionData,
}: SessionSummaryModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

const { durationSec, dominantExpression, distribution, variation, detectionRate, avgConfidence, sampleCount, insights, startedAt } = sessionData

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Session Complete"
      description="Your study session has ended. Here's a neutral summary of your visible expression patterns."
      size="lg"
      dismissible={false}
      footer={
        <div className="flex w-full justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button onClick={onExport} className="btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Session metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Date</p>
            <p className="mt-1 text-sm font-medium">{new Date(startedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Duration</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{formatDuration(durationSec)}</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Samples</p>
            <p className="mt-1 text-lg font-bold">{sampleCount}</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-elevated/50">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Face Detected</p>
            <p className="mt-1 text-lg font-bold text-success">{Math.round(detectionRate * 100)}%</p>
          </div>
        </div>

        {/* Dominant expression & variation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Dominant Expression</p>
            <p className="mt-1 text-xl font-bold capitalize">{expressionDisplay(dominantExpression)}</p>
            <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(distribution[dominantExpression] ?? 0) * 100}%`,
                  backgroundColor: expressionColor(dominantExpression),
                }}
              />
            </div>
          </Panel>

          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Expression Variation</p>
            <p className="mt-1 text-lg font-bold">{expressionVariationCopy(variation)}</p>
            <p className="mt-1 text-sm text-muted">
              {variation === 'low'
                ? 'Your visible expressions remained relatively stable during this session.'
                : variation === 'moderate'
                ? 'Your visible expressions changed several times during this session.'
                : 'Your visible expressions changed frequently during this session.'}
            </p>
          </Panel>

          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Detection Consistency</p>
            <p className="mt-1 text-lg font-bold text-success">{Math.round(detectionRate * 100)}%</p>
            <p className="mt-1 text-sm text-muted">
              {detectionRate > 0.9
                ? 'A single face was visible for almost the entire session.'
                : detectionRate > 0.7
                ? 'The face was visible for most of the session with brief gaps.'
                : detectionRate > 0.4
                ? 'The face left the frame or was obscured at times.'
                : 'The face was visible for only a small portion of the session.'}
            </p>
          </Panel>
        </div>

        {/* Expression distribution */}
        <Panel>
          <SectionHeading title="Expression Distribution" className="mb-4" />
          <div className="space-y-2">
            {EXPRESSION_KEYS.map((key) => {
              const value = distribution[key] ?? 0
              return (
                <div key={key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
                  <span className="truncate text-sm text-muted capitalize">{expressionDisplay(key)}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-border/70">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${value * 100}%`,
                        backgroundColor: expressionColor(key),
                      }}
                    />
                  </div>
                  <span className="text-right font-mono text-sm text-muted">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Confidence */}
        <Panel>
          <SectionHeading title="Average Confidence" className="mb-4" />
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700"
                style={{ width: `${Math.round(avgConfidence * 100)}%` }}
              />
            </div>
            <span className="font-mono text-lg font-bold text-brand w-16 text-right">
              {formatPercent(avgConfidence)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Average confidence across face-detected samples. Higher values indicate clearer expression patterns.
          </p>
        </Panel>

        {/* Insights */}
        {insights.length > 0 && (
          <Panel>
            <SectionHeading title="Observations" className="mb-4" />
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={insight.tone === 'positive'
                    ? 'rounded-xl border border-success/30 bg-success/10 p-4'
                    : insight.tone === 'suggestion'
                    ? 'rounded-xl border border-warning/30 bg-warning/10 p-4'
                    : 'rounded-xl border border-brand/30 bg-brand-soft/50 p-4'
                  }
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${insight.tone === 'positive' ? 'bg-success/20 text-success' : ''} ${insight.tone === 'suggestion' ? 'bg-warning/20 text-warning' : ''} ${insight.tone === 'neutral' ? 'bg-brand/20 text-brand' : ''}`}>
                      {insight.tone === 'positive' && <CheckCircle2 className="h-3 w-3" />}
                      {insight.tone === 'suggestion' && <Timer className="h-3 w-3" />}
                      {insight.tone === 'neutral' && <BarChart3 className="h-3 w-3" />}
                    </span>
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="mt-1 text-sm text-muted">{insight.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-muted">
          <p className="font-semibold text-warning mb-2">Important reminder</p>
          <p>
            These insights are based only on visible facial-expression patterns captured during this session.
            They may not reflect how you actually feel and are not a medical or mental-health assessment.
          </p>
        </div>
      </div>
    </Modal>
  )
}