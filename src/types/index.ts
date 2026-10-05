/** Shared domain types for CampusMood AI. */

/** Visible facial expressions the engine is allowed to estimate. */
export type ExpressionLabel =
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted'

/** Normalised probability-like scores, 0..1, for every expression label. */
export type ExpressionScores = Record<ExpressionLabel, number>

/**
 * Result of one expression estimation pass.
 * `confidence` describes how dominant the primary label was relative to the
 * other labels — it is NOT a measure of how certain we are about the person's
 * true feelings.
 */
export interface ExpressionEstimate {
  primaryExpression: ExpressionLabel
  confidence: number
  scores: ExpressionScores
  timestamp: number
  faceDetected: boolean
}

/** Minimal landmark shape shared by detector adapters (MediaPipe normalised xyz). */
export interface LandmarkPoint {
  x: number
  y: number
  z: number
}

export interface FaceObservation {
  /** Normalised bounding box (0..1 relative to the frame). */
  boundingBox: { x: number; y: number; width: number; height: number }
  landmarks: LandmarkPoint[]
  /** ARKit-style blendshape coefficients (0..1) when the model provides them. */
  blendshapes: Record<string, number> | null
  /** Number of faces visible in the frame. */
  faceCount: number
  timestamp: number
}

export type CameraStatus = 'idle' | 'requesting' | 'connected' | 'paused' | 'stopped' | 'error'

export type InferenceStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error'

export type SessionType = 'quick' | 'study'

export type TimeRange = 7 | 30 | 90

export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed'

/** One downsampled point in a session timeline. */
export interface SessionSample {
  /** Milliseconds since session start. */
  t: number
  expression: ExpressionLabel | null
  confidence: number
  faceDetected: boolean
}

export type VariationLevel = 'low' | 'moderate' | 'high'

export type InsightTone = 'neutral' | 'positive' | 'suggestion'

export interface SessionInsight {
  id: string
  tone: InsightTone
  title: string
  body: string
}

export type Distribution = Record<ExpressionLabel, number>

export interface SessionRecord {
  id: string
  userId: string
  startedAt: string
  endedAt: string
  durationSec: number
  sessionType: SessionType
  plannedDurationSec: number | null
  dominantExpression: ExpressionLabel
  distribution: Distribution
  variation: VariationLevel
  /** Share of samples where exactly one face was visible, 0..1. */
  detectionRate: number
  /** Mean confidence across face-present samples, 0..1. */
  avgConfidence: number
  sampleCount: number
  /** Number of samples with a face detected (for weighted aggregation). */
  detectedSampleCount: number
  timeline: SessionSample[]
  insights: SessionInsight[]
  /** Optional local screenshot data URL. Never uploaded. */
  screenshot: string | null
  consentVersion: string
}

export interface SessionInsightSummary {
  totalSessions: number
  totalDurationSec: number
  avgDurationSec: number
  mostCommonExpression: ExpressionLabel
  distribution: Distribution
  avgDetectionRate: number
  avgConfidence: number
}

export type UserPlan = 'student'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  studentId: string | null
  plan: UserPlan
  createdAt: string
}

export type AuthProviderKind = 'local' | 'supabase'

export interface AuthSession {
  user: UserProfile
  provider: AuthProviderKind
}

export interface AuthResult {
  ok: boolean
  session: AuthSession | null
  error: string | null
}

export interface ConsentState {
  granted: boolean
  version: string
  grantedAt: string | null
  analytics: boolean
  reminders: boolean
}

export interface AppSettings {
  landmarkOverlay: boolean
  analyticsEnabled: boolean
  sessionReminders: boolean
  theme: 'dark' | 'light'
  inferenceFps: 8 | 12 | 15
  mirroredVideo: boolean
}

export type ThemeSetting = AppSettings['theme']

export type CameraErrorCode =
  | 'permission-denied'
  | 'not-found'
  | 'in-use'
  | 'not-readable'
  | 'over-constrained'
  | 'unsupported'
  | 'insecure-context'
  | 'disconnected'
  | 'unknown'

export interface CameraError {
  code: CameraErrorCode
  title: string
  message: string
  hint?: string
}
