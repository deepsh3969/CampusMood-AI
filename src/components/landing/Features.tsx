import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/Panel'
import { LANDING_FEATURES, LANDING_TECH } from '@/constants/navigation'

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything a focused study session needs"
          description="A monitoring studio, timed study blocks, and analytics that stay observational and neutral."
          align="center"
          className="mb-12"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="surface-card group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lift"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-elevated text-brand transition-colors group-hover:border-brand/50 group-hover:bg-brand-soft">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export function Technology() {
  return (
    <section
      id="technology"
      className="scroll-mt-24 border-y border-border bg-surface/50 py-20 sm:py-24"
    >
      <Container>
        <SectionHeading
          eyebrow="Technology"
          title="Built on proven, browser-native tooling"
          description="No plugins, no desktop install, no server-side video processing."
          align="center"
          className="mb-12"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_TECH.map((tech) => (
            <div
              key={tech.name}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
            >
              <p className="font-mono text-sm font-semibold text-ink">{tech.name}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{tech.role}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
