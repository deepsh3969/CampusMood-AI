import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/Panel'
import { DISCLAIMER_LONG, NON_MEDICAL_STATEMENT } from '@/constants/app'
import { LANDING_FAQ, RESPONSIBLE_AI_PILLARS } from '@/constants/navigation'

export function ResponsibleAI() {
  return (
    <section id="responsible-ai" className="scroll-mt-24 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Responsible AI"
          title="Designed around what the technology cannot do"
          description="Facial expressions are an unreliable proxy for internal states. The product is engineered to never claim otherwise."
          align="center"
          className="mb-12"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RESPONSIBLE_AI_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.title} className="surface-card p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand/30 bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.body}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-warning/35 bg-warning/10 p-5 sm:p-6">
            <p className="text-sm font-semibold text-ink">{NON_MEDICAL_STATEMENT}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{DISCLAIMER_LONG}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-border bg-surface/50 py-20 sm:py-24">
      <Container size="narrow">
        <SectionHeading
          eyebrow="FAQ"
          title="Straight answers"
          description="The questions students ask before turning on a camera."
          align="center"
          className="mb-10"
        />

        <div className="space-y-3">
          {LANDING_FAQ.map((item, index) => (
            <details
              key={item.q}
              className="group surface-card overflow-hidden open:shadow-lift"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold marker:hidden sm:text-base">
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
