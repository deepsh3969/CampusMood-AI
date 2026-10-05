import { ArrowRight, Info, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { APP_TAGLINE, DISCLAIMER_SHORT } from '@/constants/app'
import { EXPRESSIONS } from '@/constants/expressions'

const preview = [
  { key: 'happy', value: 0.78 },
  { key: 'neutral', value: 0.14 },
  { key: 'surprised', value: 0.05 },
  { key: 'fearful', value: 0.03 },
] as const

const meta = Object.fromEntries(EXPRESSIONS.map((e) => [e.key, e]))

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-24" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 hero-grid" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[-10%] top-1/3 h-72 w-72 rounded-full bg-accent/15 blur-[110px]"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" aria-hidden="true" />
              On-device inference · no facial recognition
            </span>

            <h1
              id="hero-title"
              className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Understand your study moments.{' '}
              <span className="gradient-text">Support your wellbeing.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {APP_TAGLINE.replace('Understand your study moments. ', '')} CampusMood AI estimates{' '}
              <strong className="font-semibold text-ink">visible facial expressions</strong> from
              your webcam during study sessions and turns them into supportive, non-medical
              insights — with your camera fully under your control.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-5 py-3 text-base">
                Start a Session
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className="btn-secondary px-5 py-3 text-base">
                Learn More
              </a>
            </div>

            <div className="mt-7 flex items-start gap-2.5 rounded-xl border border-border bg-surface/70 p-3.5 backdrop-blur sm:max-w-xl">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-muted">{DISCLAIMER_SHORT}</p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                No hidden recording
              </span>
              <span>Frames never uploaded</span>
              <span>Single-face analysis only</span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="glass-card relative overflow-hidden p-5 shadow-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger/70" aria-hidden="true" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" aria-hidden="true" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" aria-hidden="true" />
                </div>
                <span className="chip">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" aria-hidden="true" />
                  LIVE ESTIMATE
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="rounded-xl border border-border bg-elevated/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    Current expression
                  </p>
                  <p className="mt-1.5 text-3xl font-bold tracking-tight">Happy-looking</p>
                  <p className="mt-1 text-xs text-muted">Confidence 78% · 1 face detected</p>
                </div>
                <div className="rounded-xl border border-border bg-elevated/70 p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    Session
                  </p>
                  <p className="mt-1.5 font-mono text-2xl font-semibold">00:43</p>
                  <p className="mt-1 text-xs text-muted">FPS 12 · local</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Expression distribution
                </p>
                {preview.map((row, index) => {
                  const colour = meta[row.key]?.color ?? '#94A3B8'
                  const label = meta[row.key]?.display ?? row.key
                  return (
                    <div key={row.key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
                      <span className="truncate text-xs text-muted">{label}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-border/70">
                        <span
                          className="block h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${row.value * 100}%`,
                            background: colour,
                            animation: `fade-up .8s ${0.15 * index + 0.2}s both`,
                          }}
                        />
                      </span>
                      <span className="text-right font-mono text-xs text-muted">
                        {Math.round(row.value * 100)}%
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="chip">Landmarks: ON</span>
                <span className="chip">WebGL accelerated</span>
                <span className="chip">Video not uploaded</span>
              </div>
            </div>

            <div className="glass-card absolute -bottom-6 -left-4 hidden w-44 p-3 sm:block" aria-hidden="true">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Landmark mesh
              </p>
              <svg viewBox="0 0 120 90" className="mt-2 h-20 w-full text-brand">
                <ellipse cx="60" cy="45" rx="34" ry="40" fill="none" stroke="currentColor" strokeOpacity="0.35" />
                {Array.from({ length: 46 }).map((_, i) => {
                  const angle = (i / 46) * Math.PI * 2
                  const rx = 34 * (0.75 + 0.2 * Math.sin(i))
                  const ry = 40 * (0.75 + 0.2 * Math.cos(i))
                  return (
                    <circle
                      key={i}
                      cx={60 + Math.cos(angle) * rx}
                      cy={45 + Math.sin(angle) * ry}
                      r="1.4"
                      fill="currentColor"
                      fillOpacity="0.7"
                    />
                  )
                })}
                <path d="M46 40 h10 M64 40 h10 M60 44 v10 M48 62 q12 9 24 0" stroke="currentColor" strokeOpacity="0.6" fill="none" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
