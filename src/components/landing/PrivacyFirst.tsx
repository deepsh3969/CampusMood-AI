import { Camera, EyeOff, Fingerprint, HardDrive, Lock, ScanFace } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/Panel'

const weDo = [
  { title: 'Facial landmarks', body: '478 geometric points per frame, held in memory only.' },
  { title: 'Expression estimates', body: 'Probabilities across seven visible-expression labels.' },
  { title: 'Session statistics', body: 'Duration, distribution, confidence and consistency — stored locally.' },
]

const weDoNot = [
  { icon: Fingerprint, title: 'Facial recognition', body: 'No identity matching, no biometric template, ever.' },
  { icon: EyeOff, title: 'Hidden recording', body: 'No background capture. Frames are discarded each tick.' },
  { icon: HardDrive, title: 'Video upload', body: 'Camera frames are not transmitted to any server.' },
  { icon: Camera, title: 'Academic decisions', body: 'Never used for grading, attendance or discipline.' },
]

export function PrivacyFirst() {
  return (
    <section id="privacy" className="scroll-mt-24 border-y border-border bg-surface/50 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Privacy first"
          title="Your camera. Your device. Your call."
          description="CampusMood AI is built so that the sensitive part — your face — stays on your machine."
          align="center"
          className="mb-12"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-success/40 bg-success/10 text-success">
                <ScanFace className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">What we process</h3>
                <p className="text-xs text-muted">Locally, in your browser tab</p>
              </div>
            </div>
            <dl className="mt-6 space-y-4">
              {weDo.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-elevated/60 p-4">
                  <dt className="text-sm font-semibold text-ink">{item.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/40 bg-brand-soft text-brand">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">What we never do</h3>
                <p className="text-xs text-muted">Hard product boundaries</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {weDoNot.map((item) => {
                const Icon = item.icon
                return (
                  <li
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-elevated/60 p-4"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.body}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-5">
            <p className="text-sm font-semibold text-ink">Camera access is always controlled by you.</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              The camera only starts when you press Start, and stops the moment you press Stop or
              close the tab.
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm font-semibold text-ink">
              Expression estimates are not measurements of your actual feelings.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              They describe visible muscle patterns in the frame — nothing more.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/privacy" className="btn-secondary">
            Open the Privacy Center
          </Link>
        </div>
      </Container>
    </section>
  )
}
