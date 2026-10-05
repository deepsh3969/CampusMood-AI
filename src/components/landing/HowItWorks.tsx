import { LANDING_HOW_IT_WORKS } from '@/constants/navigation'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/Panel'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-24" aria-labelledby="how-title">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Four steps from camera to insight"
          description="Every stage is visible to you: permission, detection, estimation, and a neutral end-of-session summary."
          align="center"
          className="mb-12"
        />
        <div id="how-title" className="sr-only">
          How CampusMood AI works
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_HOW_IT_WORKS.map((item) => {
            const Icon = item.icon
            return (
              <li
                key={item.step}
                className="surface-card relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/30 bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm font-semibold text-muted/70">{item.step}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
