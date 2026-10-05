import { EXPRESSION_KEYS } from '@/constants/expressions'
import type {
  Distribution,
  ExpressionLabel,
  SessionInsightSummary,
  SessionRecord,
  SessionSample,
  VariationLevel,
} from '@/types'
import { clamp, mean, normalizeToSum1, round } from '@/utils/math'

/** Distribution of expressions across samples where a single face was present. */
export function buildDistribution(samples: SessionSample[]): Distribution {
  const counts: Distribution = {
    happy: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0,
  }
  let total = 0
  for (const sample of samples) {
    if (!sample.faceDetected || !sample.expression) continue
    counts[sample.expression] += 1
    total += 1
  }
  if (total === 0) return counts
  const normalised = normalizeToSum1(EXPRESSION_KEYS.map((key) => counts[key]))
  EXPRESSION_KEYS.forEach((key, index) => {
    counts[key] = normalised[index] ?? 0
  })
  return counts
}

export function dominantExpression(distribution: Distribution): ExpressionLabel {
  let best: ExpressionLabel = 'neutral'
  let bestValue = -1
  for (const key of EXPRESSION_KEYS) {
    const value = distribution[key] ?? 0
    if (value > bestValue) {
      bestValue = value
      best = key
    }
  }
  return best
}

/** Normalised Shannon entropy (0 = one constant expression, 1 = evenly spread). */
export function normalizedEntropy(distribution: Distribution): number {
  const values = EXPRESSION_KEYS.map((key) => distribution[key] ?? 0).filter((v) => v > 0)
  if (values.length <= 1) return 0
  const entropy = -values.reduce((sum, p) => sum + p * Math.log(p), 0)
  return clamp(entropy / Math.log(EXPRESSION_KEYS.length), 0, 1)
}

/** How often the primary expression changes between consecutive detected samples. */
export function switchRate(samples: SessionSample[]): number {
  const detected = samples.filter((s) => s.faceDetected && s.expression)
  if (detected.length < 2) return 0
  let changes = 0
  for (let i = 1; i < detected.length; i += 1) {
    if (detected[i]?.expression !== detected[i - 1]?.expression) changes += 1
  }
  return changes / (detected.length - 1)
}

export function variationLevel(distribution: Distribution): VariationLevel {
  const entropy = normalizedEntropy(distribution)
  if (entropy < 0.45) return 'low'
  if (entropy < 0.75) return 'moderate'
  return 'high'
}

export function detectionRate(samples: SessionSample[]): number {
  if (samples.length === 0) return 0
  const detected = samples.filter((s) => s.faceDetected).length
  return detected / samples.length
}

export function averageConfidence(samples: SessionSample[]): number {
  const withFace = samples.filter((s) => s.faceDetected && s.confidence > 0)
  if (withFace.length === 0) return 0
  return mean(withFace.map((s) => s.confidence))
}

export function averageConfidenceByExpression(
  samples: SessionSample[],
): Record<ExpressionLabel, number> {
  const buckets: Record<ExpressionLabel, number[]> = {
    happy: [],
    neutral: [],
    sad: [],
    angry: [],
    surprised: [],
    fearful: [],
    disgusted: [],
  }
  for (const sample of samples) {
    if (!sample.faceDetected || !sample.expression) continue
    buckets[sample.expression].push(sample.confidence)
  }
  const result = { ...({} as Record<ExpressionLabel, number>) }
  for (const key of EXPRESSION_KEYS) {
    result[key] = buckets[key].length > 0 ? mean(buckets[key]) : 0
  }
  return result
}

/** Keeps at most one sample per `intervalMs`, always preserving the first and last. */
export function downsample(samples: SessionSample[], intervalMs: number): SessionSample[] {
  if (samples.length <= 2 || intervalMs <= 0) return samples
  const result: SessionSample[] = [samples[0]!]
  let lastT = samples[0]!.t
  for (let i = 1; i < samples.length - 1; i += 1) {
    const sample = samples[i]!
    if (sample.t - lastT >= intervalMs) {
      result.push(sample)
      lastT = sample.t
    }
  }
  const last = samples[samples.length - 1]!
  if (result[result.length - 1]!.t !== last.t) result.push(last)
  return result
}

export interface SessionStats {
  distribution: Distribution
  dominant: ExpressionLabel
  variation: VariationLevel
  detectionRate: number
  avgConfidence: number
  sampleCount: number
  detectedSampleCount: number
  entropy: number
  switches: number
}

export function computeSessionStats(samples: SessionSample[]): SessionStats {
  const distribution = buildDistribution(samples)
  const detected = samples.filter((s) => s.faceDetected && s.expression)
  return {
    distribution,
    dominant: dominantExpression(distribution),
    variation: variationLevel(distribution),
    detectionRate: round(detectionRate(samples), 4),
    avgConfidence: round(averageConfidence(samples), 4),
    sampleCount: samples.length,
    detectedSampleCount: detected.length,
    entropy: round(normalizedEntropy(distribution), 4),
    switches: switchRate(samples),
  }
}

/** Buckets timeline samples into fixed-size windows for the trend chart. */
export interface TrendPoint {
  t: number
  label: string
  expression: ExpressionLabel | null
  confidence: number
  faceDetected: boolean
}

export function buildTimelineSeries(
  samples: SessionSample[],
  maxPoints = 60,
): TrendPoint[] {
  if (samples.length <= maxPoints) {
    return samples.map((s) => ({
      t: s.t,
      label: formatT(s.t),
      expression: s.expression,
      confidence: round(s.confidence, 3),
      faceDetected: s.faceDetected,
    }))
  }
  const bucketSize = Math.ceil(samples.length / maxPoints)
  const points: TrendPoint[] = []
  for (let i = 0; i < samples.length; i += bucketSize) {
    const bucket = samples.slice(i, i + bucketSize)
    const detected = bucket.filter((s) => s.expression)
    const pick = detected.length > 0 ? detected[Math.floor(detected.length / 2)]! : bucket[0]!
    points.push({
      t: pick.t,
      label: formatT(pick.t),
      expression: pick.expression,
      confidence: round(averageConfidence(bucket), 3),
      faceDetected: bucket.some((s) => s.faceDetected),
    })
  }
  return points
}

function formatT(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const VARIATION_COPY: Record<VariationLevel, string> = {
  low: 'Stable',
  moderate: 'Moderate',
  high: 'Frequent changes',
}

export function variationDescription(level: VariationLevel): string {
  switch (level) {
    case 'low':
      return 'Your visible expressions stayed fairly consistent through this session.'
    case 'moderate':
      return 'Your visible expressions changed several times during this session.'
    case 'high':
      return 'Your visible expressions changed often during this session.'
    default:
      return 'Expression variation could not be determined.'
  }
}

export function detectionDescription(rate: number): string {
  if (rate >= 0.9) return 'Stable — a single face was visible for almost the whole session.'
  if (rate >= 0.7) return 'Mostly consistent, with short periods where no single face was visible.'
  if (rate >= 0.4) return 'Intermittent — the face left the frame or was obscured at times.'
  return 'Limited — a single face was visible for only a small part of the session.'
}

/** Aggregates a list of sessions inside an inclusive day window. */
export function aggregateSessions(
  sessions: SessionRecord[],
  rangeDays: 7 | 30 | 90 = 30,
  now: Date = new Date(),
): SessionInsightSummary {
  const cutoff = new Date(now)
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (rangeDays - 1))

  const inRange = sessions.filter((s) => new Date(s.endedAt).getTime() >= cutoff.getTime())

  const distribution: Distribution = {
    happy: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0,
  }
  let weight = 0
  for (const session of inRange) {
    const sessionWeight = Math.max(session.detectedSampleCount, 1)
    weight += sessionWeight
    for (const key of EXPRESSION_KEYS) {
      distribution[key] += (session.distribution[key] ?? 0) * sessionWeight
    }
  }
  if (weight > 0) {
    const normalised = normalizeToSum1(EXPRESSION_KEYS.map((key) => distribution[key]))
    EXPRESSION_KEYS.forEach((key, index) => {
      distribution[key] = normalised[index] ?? 0
    })
  }

  const totalDurationSec = inRange.reduce((sum, s) => sum + s.durationSec, 0)
  return {
    totalSessions: inRange.length,
    totalDurationSec,
    avgDurationSec: inRange.length > 0 ? Math.round(totalDurationSec / inRange.length) : 0,
    mostCommonExpression: weight > 0 ? dominantExpression(distribution) : 'neutral',
    distribution,
    avgDetectionRate:
      inRange.length > 0 ? mean(inRange.map((s) => s.detectionRate)) : 0,
    avgConfidence: inRange.length > 0 ? mean(inRange.map((s) => s.avgConfidence)) : 0,
  }
}

/** Per-day totals used by the calendar heatmap and trend line. */
export interface DailyBucket {
  date: string
  sessions: number
  durationSec: number
}

export function dailyBuckets(
  sessions: SessionRecord[],
  rangeDays: 7 | 30 | 90 = 30,
  now: Date = new Date(),
): DailyBucket[] {
  const buckets: DailyBucket[] = []
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (rangeDays - 1))

  for (let i = 0; i < rangeDays; i += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    buckets.push({ date: toISODate(day), sessions: 0, durationSec: 0 })
  }
  const index = new Map(buckets.map((b) => [b.date, b]))
  for (const session of sessions) {
    const key = toISODate(new Date(session.endedAt))
    const bucket = index.get(key)
    if (!bucket) continue
    bucket.sessions += 1
    bucket.durationSec += session.durationSec
  }
  return buckets
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
