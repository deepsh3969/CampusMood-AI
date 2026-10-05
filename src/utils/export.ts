import type { SessionRecord } from '@/types'
import { EXPRESSION_KEYS, expressionDisplay } from '@/constants/expressions'
import { formatDate, formatDuration, humanDuration } from './format'

/** Convert session to CSV rows */
export function sessionToCSV(session: SessionRecord): string {
  const lines: string[] = []

  // Header
  lines.push('CampusMood AI - Session Report')
  lines.push(`Generated,${new Date().toISOString()}`)
  lines.push('')

  // Session metadata
  lines.push('Session Details')
  lines.push(`Session ID,${session.id}`)
  lines.push(`Date,${formatDate(session.endedAt)}`)
  lines.push(`Start Time,${session.startedAt}`)
  lines.push(`End Time,${session.endedAt}`)
  lines.push(`Duration (seconds),${session.durationSec}`)
  lines.push(`Duration (formatted),${humanDuration(session.durationSec)}`)
  lines.push(`Session Type,${session.sessionType}`)
  lines.push(`Planned Duration (seconds),${session.plannedDurationSec ?? ''}`)
  lines.push(`Dominant Expression,${expressionDisplay(session.dominantExpression)}`)
  lines.push(`Expression Variation,${session.variation}`)
  lines.push(`Face Detection Rate,${(session.detectionRate * 100).toFixed(1)}%`)
  lines.push(`Average Confidence,${(session.avgConfidence * 100).toFixed(1)}%`)
  lines.push(`Total Samples,${session.sampleCount}`)
  lines.push(`Face Detected Samples,${session.detectedSampleCount}`)
  lines.push('')

  // Expression distribution
  lines.push('Expression Distribution')
  lines.push('Expression,Count,Percentage')
  for (const key of EXPRESSION_KEYS) {
    const count = session.distribution[key] ?? 0
    const percentage = session.detectedSampleCount > 0
      ? ((count / session.detectedSampleCount) * 100).toFixed(1)
      : '0.0'
    lines.push(`${expressionDisplay(key)},${count},${percentage}%`)
  }
  lines.push('')

  // Timeline samples
  lines.push('Timeline Samples')
  lines.push('Time (ms),Time (formatted),Expression,Confidence,Face Detected')
  for (const sample of session.timeline) {
    const timeFormatted = formatDuration(Math.floor(sample.t / 1000))
    const expression = sample.expression ? expressionDisplay(sample.expression) : 'None'
    const confidence = (sample.confidence * 100).toFixed(1)
    const faceDetected = sample.faceDetected ? 'Yes' : 'No'
    lines.push(`${sample.t},${timeFormatted},${expression},${confidence}%,${faceDetected}`)
  }

  return lines.join('\n')
}

/** Convert all sessions to a combined CSV */
export function sessionsToCSV(sessions: SessionRecord[]): string {
  const lines: string[] = []

  // Header
  lines.push('CampusMood AI - All Sessions Report')
  lines.push(`Generated,${new Date().toISOString()}`)
  lines.push(`Total Sessions,${sessions.length}`)
  lines.push('')

  // Summary table
  lines.push('Session Summary')
  lines.push('Date,Duration,Type,Dominant Expression,Variation,Detection Rate,Avg Confidence,Samples,Face Samples')
  for (const session of sessions) {
    lines.push([
      formatDate(session.endedAt),
      humanDuration(session.durationSec),
      session.sessionType,
      expressionDisplay(session.dominantExpression),
      session.variation,
      `${(session.detectionRate * 100).toFixed(1)}%`,
      `${(session.avgConfidence * 100).toFixed(1)}%`,
      session.sampleCount.toString(),
      session.detectedSampleCount.toString(),
    ].join(','))
  }
  lines.push('')

  // Detailed timeline for each session
  for (const session of sessions) {
    lines.push(`--- Session: ${session.id} ---`)
    lines.push('Time (ms),Time (formatted),Expression,Confidence,Face Detected')
    for (const sample of session.timeline) {
      const timeFormatted = formatDuration(Math.floor(sample.t / 1000))
      const expression = sample.expression ? expressionDisplay(sample.expression) : 'None'
      const confidence = (sample.confidence * 100).toFixed(1)
      const faceDetected = sample.faceDetected ? 'Yes' : 'No'
      lines.push(`${sample.t},${timeFormatted},${expression},${confidence}%,${faceDetected}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/** Trigger download of CSV content */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}