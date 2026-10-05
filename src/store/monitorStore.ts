import { create } from 'zustand'
import type { SessionSample, ExpressionLabel, ExpressionScores, SessionInsight, Distribution, VariationLevel } from '@/types'
import { buildDistribution, dominantExpression, variationLevel, detectionRate as calcDetectionRate, averageConfidence } from '@/utils/analytics'
import { useSessionsStore } from './sessionsStore'

export type MonitorMode = 'quick' | 'study'

export interface MonitorSessionState {
  mode: MonitorMode
  plannedDurationSec: number | null
  startedAt: number | null
  pausedAt: number | null
  totalPausedMs: number
  samples: SessionSample[]
  lastSampleAt: number
  faceDetected: boolean
  faceCount: number
  currentExpression: ExpressionLabel | null
  currentScores: ExpressionScores | null
  currentConfidence: number
  // Session summary (persists after endSession until next start)
  lastSessionSummary: {
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
  } | null
  showSessionSummary: boolean
}

interface MonitorStore extends MonitorSessionState {
  setMode: (mode: MonitorMode) => void
  setPlannedDuration: (sec: number | null) => void
  startSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  endSession: () => void
  addSample: (sample: SessionSample) => void
  updateFaceStatus: (detected: boolean, count: number) => void
  updateExpression: (expression: ExpressionLabel | null, scores: ExpressionScores | null, confidence: number) => void
  showSessionSummaryModal: () => void
  dismissSessionSummaryModal: () => void
  reset: () => void
}

const initialState: MonitorSessionState = {
  mode: 'quick',
  plannedDurationSec: null,
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
  samples: [],
  lastSampleAt: 0,
  faceDetected: false,
  faceCount: 0,
  currentExpression: null,
  currentScores: null,
  currentConfidence: 0,
  lastSessionSummary: null,
  showSessionSummary: false,
}

export const useMonitorStore = create<MonitorStore>((set, get) => ({
  ...initialState,

  setMode: (mode) => set({ mode, plannedDurationSec: mode === 'study' ? 25 * 60 : null }),

  setPlannedDuration: (sec) => set({ plannedDurationSec: sec }),

  startSession: () => set({
    startedAt: Date.now(),
    pausedAt: null,
    totalPausedMs: 0,
    samples: [],
    lastSampleAt: Date.now(),
    showSessionSummary: false,
  }),

  pauseSession: () => set({ pausedAt: Date.now() }),

  resumeSession: () => set((_state) => {
    const state = _state
    if (!state.pausedAt) return {}
    const now = Date.now()
    return {
      totalPausedMs: state.totalPausedMs + (now - state.pausedAt),
      pausedAt: null,
    }
  }),

endSession: () => {
    const state = get()
    if (!state.startedAt) return set({ ...initialState, mode: state.mode })

    // Compute session summary from samples
    const { samples, startedAt } = state
    // const _endedAt = new Date().toISOString()
    const startedAtISO = new Date(startedAt).toISOString()
    const durationSec = Math.round((Date.now() - startedAt) / 1000)

    // Compute distribution from samples
    const faceSamples = samples.filter(s => s.faceDetected)
    const distribution = buildDistribution(faceSamples)
    const dominantExpr = dominantExpression(distribution)
    const variation = variationLevel(distribution)
    const detectionRate = calcDetectionRate(samples)
    const avgConfidence = averageConfidence(samples)

    const insights = generateInsights(samples, {
      dominantExpression: dominantExpr,
      distribution,
      variation,
      detectionRate,
      avgConfidence,
      durationSec,
    })

    const summary = {
      durationSec,
      dominantExpression: dominantExpr ?? 'neutral',
      distribution,
      variation,
      detectionRate,
      avgConfidence,
      sampleCount: faceSamples.length,
      insights,
      startedAt: startedAtISO,
      endedAt: new Date().toISOString(),
    }

    set({
      ...initialState,
      mode: state.mode,
      lastSessionSummary: summary,
      showSessionSummary: true,
    })
    // Save session to persistent storage
    useSessionsStore.getState().addSession({
      ...summary,
      sessionType: state.mode,
      plannedDurationSec: state.plannedDurationSec,
      timeline: state.samples.map(s => ({
        t: s.t,
        expression: s.expression,
        confidence: s.confidence,
        faceDetected: s.faceDetected,
      })),
      screenshot: null,
      consentVersion: '2026-10-01',
      userId: 'local-user',
      detectedSampleCount: state.samples.filter(s => s.faceDetected).length,
    })
  },

  addSample: (sample) => set((state) => ({
    samples: [...state.samples, sample],
    lastSampleAt: sample.t,
  })),

  updateFaceStatus: (detected, count) => set({ faceDetected: detected, faceCount: count }),

  updateExpression: (expression, scores, confidence) => set({
    currentExpression: expression,
    currentScores: scores,
    currentConfidence: confidence,
  }),

  showSessionSummaryModal: () => set({ showSessionSummary: true }),

  dismissSessionSummaryModal: () => set({ showSessionSummary: false }),

  reset: () => set(initialState),
}))

function generateInsights(
  _samples: SessionSample[],
  context: {
    dominantExpression: string | null
    distribution: Record<string, number>
    variation: string | null
    detectionRate: number
    avgConfidence: number
    durationSec: number
  }
): SessionInsight[] {
  const insights: SessionInsight[] = []
  const { dominantExpression: _dominantExpression, distribution: _distribution, variation, detectionRate, avgConfidence, durationSec } = context

  // Face detection consistency
  if (detectionRate > 0.9) {
    insights.push({
      id: 'detection-stable',
      tone: 'positive',
      title: 'Stable face detection',
      body: 'A single face was visible for almost the entire session.',
    })
  } else if (detectionRate < 0.5) {
    insights.push({
      id: 'detection-low',
      tone: 'suggestion',
      title: 'Intermittent face detection',
      body: 'The face left the frame frequently. Try positioning the camera to keep your face in view.',
    })
  }

  // Expression variation
  if (variation === 'low') {
    insights.push({
      id: 'variation-low',
      tone: 'neutral',
      title: 'Stable expression pattern',
      body: 'Your visible expressions remained relatively consistent through this session.',
    })
  } else if (variation === 'high') {
    insights.push({
      id: 'variation-high',
      tone: 'suggestion',
      title: 'Frequent expression changes',
      body: 'Your visible expressions changed frequently. Consider taking a short break if this was a focused work session.',
    })
  }

  // Session duration
  if (durationSec > 3600) {
    insights.push({
      id: 'long-session',
      tone: 'positive',
      title: 'Extended focus session',
      body: `You maintained a ${Math.floor(durationSec / 60)}-minute session.`,
    })
  }

  // Confidence
  if (avgConfidence > 0.8) {
    insights.push({
      id: 'high-confidence',
      tone: 'positive',
      title: 'High expression confidence',
      body: 'Expression estimates were consistently clear throughout the session.',
    })
  } else if (avgConfidence < 0.5) {
    insights.push({
      id: 'low-confidence',
      tone: 'suggestion',
      title: 'Low expression confidence',
      body: 'Expression estimates had lower confidence. Ensure good lighting and camera positioning.',
    })
  }

  return insights
}

export function getElapsedMs(state: MonitorSessionState): number {
  if (!state.startedAt) return 0
  const now = Date.now()
  if (state.pausedAt) {
    return state.pausedAt - state.startedAt - state.totalPausedMs
  }
  return now - state.startedAt - state.totalPausedMs
}

export function isSessionExpired(state: MonitorSessionState): boolean {
  if (!state.plannedDurationSec) return false
  return getElapsedMs(state) >= state.plannedDurationSec * 1000
}