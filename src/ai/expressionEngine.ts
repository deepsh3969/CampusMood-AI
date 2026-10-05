import type { ExpressionLabel } from '@/types'
import { EXPRESSION_KEYS } from '@/constants/expressions'
import { softmax, clamp } from '@/utils/math'

/** Weights for each expression derived from facial action units (FACS) */
const EXPRESSION_WEIGHTS: Record<ExpressionLabel, Map<string, number>> = EXPRESSION_KEYS.reduce((acc, key) => {
  acc[key] = new Map()
  return acc
}, {} as Record<ExpressionLabel, Map<string, number>>)

// Happy: mouthSmile, cheekSquint, mouthUpperUp
EXPRESSION_WEIGHTS.happy.set('mouthSmileLeft', 1.0)
EXPRESSION_WEIGHTS.happy.set('mouthSmileRight', 1.0)
EXPRESSION_WEIGHTS.happy.set('cheekSquintLeft', 0.8)
EXPRESSION_WEIGHTS.happy.set('cheekSquintRight', 0.8)
EXPRESSION_WEIGHTS.happy.set('mouthUpperUpLeft', 0.5)
EXPRESSION_WEIGHTS.happy.set('mouthUpperUpRight', 0.5)

// Sad: browInnerUp, mouthFrown, mouthLowerDown
EXPRESSION_WEIGHTS.sad.set('browInnerUp', 1.0)
EXPRESSION_WEIGHTS.sad.set('mouthFrownLeft', 0.9)
EXPRESSION_WEIGHTS.sad.set('mouthFrownRight', 0.9)
EXPRESSION_WEIGHTS.sad.set('mouthLowerDownLeft', 0.6)
EXPRESSION_WEIGHTS.sad.set('mouthLowerDownRight', 0.6)

// Angry: browDown, eyeSquint, noseSneer, jawClench
EXPRESSION_WEIGHTS.angry.set('browDownLeft', 1.0)
EXPRESSION_WEIGHTS.angry.set('browDownRight', 1.0)
EXPRESSION_WEIGHTS.angry.set('eyeSquintLeft', 0.8)
EXPRESSION_WEIGHTS.angry.set('eyeSquintRight', 0.8)
EXPRESSION_WEIGHTS.angry.set('noseSneerLeft', 0.6)
EXPRESSION_WEIGHTS.angry.set('noseSneerRight', 0.6)
EXPRESSION_WEIGHTS.angry.set('jawClench', 0.5)

// Surprised: browInnerUp (high), eyeWide, jawOpen
EXPRESSION_WEIGHTS.surprised.set('browInnerUp', 1.0)
EXPRESSION_WEIGHTS.surprised.set('eyeWideLeft', 1.0)
EXPRESSION_WEIGHTS.surprised.set('eyeWideRight', 1.0)
EXPRESSION_WEIGHTS.surprised.set('jawOpen', 0.9)
EXPRESSION_WEIGHTS.surprised.set('browOuterUpLeft', 0.7)
EXPRESSION_WEIGHTS.surprised.set('browOuterUpRight', 0.7)

// Fearful: browInnerUp, browOuterUp, eyeWide, mouthStretch
EXPRESSION_WEIGHTS.fearful.set('browInnerUp', 0.9)
EXPRESSION_WEIGHTS.fearful.set('browOuterUpLeft', 1.0)
EXPRESSION_WEIGHTS.fearful.set('browOuterUpRight', 1.0)
EXPRESSION_WEIGHTS.fearful.set('eyeWideLeft', 1.0)
EXPRESSION_WEIGHTS.fearful.set('eyeWideRight', 1.0)
EXPRESSION_WEIGHTS.fearful.set('mouthStretchLeft', 0.8)
EXPRESSION_WEIGHTS.fearful.set('mouthStretchRight', 0.8)

// Disgusted: noseSneer, upperLipRaise, cheekRaise, mouthFrown
EXPRESSION_WEIGHTS.disgusted.set('noseSneerLeft', 1.0)
EXPRESSION_WEIGHTS.disgusted.set('noseSneerRight', 1.0)
EXPRESSION_WEIGHTS.disgusted.set('mouthUpperUpLeft', 0.8)
EXPRESSION_WEIGHTS.disgusted.set('mouthUpperUpRight', 0.8)
EXPRESSION_WEIGHTS.disgusted.set('cheekRaiseLeft', 0.5)
EXPRESSION_WEIGHTS.disgusted.set('cheekRaiseRight', 0.5)
EXPRESSION_WEIGHTS.disgusted.set('mouthFrownLeft', 0.5)
EXPRESSION_WEIGHTS.disgusted.set('mouthFrownRight', 0.5)

// Neutral: absence of strong signals (handled as baseline)
EXPRESSION_WEIGHTS.neutral = new Map()

/** Expression classification result with confidence */
export interface ExpressionClassification {
  primaryExpression: ExpressionLabel
  confidence: number
  scores: Record<ExpressionLabel, number>
  timestamp: number
}

/**
 * ExpressionEngine - converts MediaPipe blendshapes to expression estimates
 * Uses weighted blendshape coefficients with softmax normalization
 */
export class ExpressionEngine {
  private temperature = 1.5

  /**
   * Classify expression from MediaPipe blendshape coefficients
   */
  classify(blendshapes: Map<string, number>): ExpressionClassification {
    const rawScores: Record<ExpressionLabel, number> = {
      happy: 0,
      neutral: 0.1, // small baseline for neutral
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
    }

    // Compute weighted scores for each expression
    for (const expression of EXPRESSION_KEYS) {
      const weights = EXPRESSION_WEIGHTS[expression]
      let score = 0
      let totalWeight = 0

      for (const [blendshapeName, weight] of weights.entries()) {
        const coefficient = blendshapes.get(blendshapeName) ?? 0
        score += coefficient * weight
        totalWeight += weight
      }

      // Normalize by total weight
      rawScores[expression] = totalWeight > 0 ? score / totalWeight : 0
    }

    // Apply softmax with temperature for confidence calibration
    const scoreArray = EXPRESSION_KEYS.map(key => rawScores[key] ?? 0)
    const probs = softmax(scoreArray, this.temperature)

    const scores: Record<ExpressionLabel, number> = EXPRESSION_KEYS.reduce(
      (acc, key, i) => {
        const prob = probs[i] ?? 0
        acc[key] = clamp(prob, 0, 1)
        return acc
      },
      {} as Record<ExpressionLabel, number>
    )

    // Find primary expression
    let primary: ExpressionLabel = 'neutral'
    let maxScore = -1
    for (const key of EXPRESSION_KEYS) {
      if (scores[key] > maxScore) {
        maxScore = scores[key]
        primary = key
      }
    }

    const confidence = clamp(maxScore, 0, 1)

    return {
      primaryExpression: primary,
      confidence,
      scores,
      timestamp: Date.now(),
    }
  }

  /**
   * Set temperature for softmax (higher = more uniform, lower = more peaky)
   */
  setTemperature(temp: number): void {
    this.temperature = clamp(temp, 0.1, 5.0)
  }
}

let sharedEngine: ExpressionEngine | null = null

export function getExpressionEngine(): ExpressionEngine {
  if (!sharedEngine) {
    sharedEngine = new ExpressionEngine()
  }
  return sharedEngine
}

export function disposeExpressionEngine(): void {
  sharedEngine = null
}

/**
 * Smooth expression estimates over time using exponential moving average
 */
export function smoothExpression(
  current: ExpressionClassification,
  previous: ExpressionClassification | null,
  alpha = 0.3
): ExpressionClassification {
  if (!previous) return current

  const smoothedScores: Record<ExpressionLabel, number> = {} as Record<ExpressionLabel, number>
  for (const key of EXPRESSION_KEYS) {
    smoothedScores[key] = previous.scores[key] * (1 - alpha) + current.scores[key] * alpha
  }

  // Renormalize
  const total = EXPRESSION_KEYS.reduce((sum, key) => sum + smoothedScores[key], 0)
  if (total > 0) {
    for (const key of EXPRESSION_KEYS) {
      smoothedScores[key] = smoothedScores[key] / total
    }
  }

  let primary: ExpressionLabel = 'neutral'
  let maxScore = -1
  for (const key of EXPRESSION_KEYS) {
    if (smoothedScores[key] > maxScore) {
      maxScore = smoothedScores[key]
      primary = key
    }
  }

  return {
    primaryExpression: primary,
    confidence: maxScore,
    scores: smoothedScores,
    timestamp: current.timestamp,
  }
}