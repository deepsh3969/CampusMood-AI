import type { ExpressionLabel, ExpressionScores } from '@/types'

export interface ExpressionMeta {
  key: ExpressionLabel
  display: string
  /** Short observational description used in tooltips and legends. */
  description: string
  /** Tailwind-friendly hex used by charts and bars. */
  color: string
}

/**
 * Product vocabulary. Labels are deliberately observational
 * ("Happy-looking", "Sad-looking") and never diagnostic.
 */
export const EXPRESSIONS: ExpressionMeta[] = [
  {
    key: 'neutral',
    display: 'Neutral',
    description: 'Relaxed facial muscles with no pronounced expression pattern.',
    color: '#94A3B8',
  },
  {
    key: 'happy',
    display: 'Happy-looking',
    description: 'Raised mouth corners and cheek lift visible in the frame.',
    color: '#34D399',
  },
  {
    key: 'sad',
    display: 'Sad-looking',
    description: 'Inner brow lift with the corners of the mouth pulled down.',
    color: '#60A5FA',
  },
  {
    key: 'angry',
    display: 'Angry-looking',
    description: 'Lowered brows, narrowed eyes and a tensed jaw region.',
    color: '#F87171',
  },
  {
    key: 'surprised',
    display: 'Surprised',
    description: 'Wide-open eyes with a raised brow and an open jaw.',
    color: '#FBBF24',
  },
  {
    key: 'fearful',
    display: 'Fearful-looking',
    description: 'Raised brows, widened eyes and a stretched mouth region.',
    color: '#C084FC',
  },
  {
    key: 'disgusted',
    display: 'Disgusted-looking',
    description: 'Raised upper lip with a wrinkled nose region.',
    color: '#FB923C',
  },
]

export const EXPRESSION_BY_KEY: Record<ExpressionLabel, ExpressionMeta> = EXPRESSIONS.reduce(
  (acc, meta) => {
    acc[meta.key] = meta
    return acc
  },
  {} as Record<ExpressionLabel, ExpressionMeta>,
)

export const EXPRESSION_KEYS: ExpressionLabel[] = EXPRESSIONS.map((e) => e.key)

export const EXPRESSION_DISPLAY: Record<ExpressionLabel, string> = EXPRESSION_KEYS.reduce(
  (acc, key) => {
    acc[key] = EXPRESSION_BY_KEY[key].display
    return acc
  },
  {} as Record<ExpressionLabel, string>,
)

export function expressionDisplay(label: ExpressionLabel): string {
  return EXPRESSION_BY_KEY[label]?.display ?? label
}

export function expressionColor(label: ExpressionLabel): string {
  return EXPRESSION_BY_KEY[label]?.color ?? '#94A3B8'
}

export function emptyScores(): ExpressionScores {
  return {
    happy: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0,
  }
}

/** Ordered rows used by distribution charts. */
export function sortedScores(scores: ExpressionScores): Array<[ExpressionLabel, number]> {
  return EXPRESSION_KEYS.map((key): [ExpressionLabel, number] => [key, scores[key] ?? 0]).sort(
    (a, b) => b[1] - a[1],
  )
}

export type VariationLevel = 'low' | 'moderate' | 'high'

export const VARIATION_COPY: Record<VariationLevel, string> = {
  low: 'Stable',
  moderate: 'Moderate',
  high: 'Frequent changes',
}

export function expressionVariationCopy(level: VariationLevel): string {
  switch (level) {
    case 'low':
      return 'Stable'
    case 'moderate':
      return 'Moderate'
    case 'high':
      return 'Frequent changes'
    default:
      return 'Unknown'
  }
}
