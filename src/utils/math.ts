export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/** Normalises an array of raw scores to sum to 1 (returns uniform on all-zero input). */
export function normalizeToSum1(values: number[]): number[] {
  const safe = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0))
  const total = safe.reduce((sum, v) => sum + v, 0)
  if (total <= 0) {
    const uniform = 1 / Math.max(safe.length, 1)
    return safe.map(() => uniform)
  }
  return safe.map((v) => v / total)
}

/** Numerically stable softmax with temperature. */
export function softmax(values: number[], temperature = 1): number[] {
  const t = temperature > 0 ? temperature : 1
  const scaled = values.map((v) => v / t)
  const max = scaled.reduce((m, v) => (Number.isFinite(v) ? Math.max(m, v) : m), -Infinity)
  const exps = scaled.map((v) => Math.exp(Number.isFinite(v) ? v - max : -1e4))
  const total = exps.reduce((s, v) => s + v, 0)
  if (total <= 0) return values.map(() => 1 / Math.max(values.length, 1))
  return exps.map((v) => v / total)
}

export function round(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** Pearson correlation coefficient; returns 0 when variance is undefined. */
export function correlation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 2) return 0
  const xs = a.slice(0, n)
  const ys = b.slice(0, n)
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < n; i += 1) {
    const x = (xs[i] ?? 0) - mx
    const y = (ys[i] ?? 0) - my
    num += x * y
    dx += x * x
    dy += y * y
  }
  const denom = Math.sqrt(dx * dy)
  return denom === 0 ? 0 : clamp(num / denom, -1, 1)
}
