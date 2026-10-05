import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { SectionHeading, Panel, Alert } from '@/components/ui'
import { ShieldCheck, Lock, EyeOff, Fingerprint, HardDrive, Camera, Link as LinkIcon, Mail, AlertTriangle } from 'lucide-react'
import { APP_NAME, DISCLAIMER_LONG, NON_MEDICAL_STATEMENT, SUPPORT_EMAIL, CONSENT_VERSION } from '@/constants/app'

const WE_DO = [
  { title: 'Facial landmarks', body: '478 geometric points per frame, held in memory only during the session.' },
  { title: 'Expression estimates', body: 'Probabilities across seven visible-expression labels, derived from landmark geometry and blendshapes.' },
  { title: 'Session statistics', body: 'Duration, distribution, confidence, and consistency — stored locally in your browser.' },
]

const WE_DO_NOT = [
  { icon: Fingerprint, title: 'Facial recognition', body: 'No identity matching, no biometric template, ever.' },
  { icon: EyeOff, title: 'Hidden recording', body: 'No background capture. Frames are discarded each processing tick.' },
  { icon: HardDrive, title: 'Video upload', body: 'Camera frames are never transmitted to any server.' },
  { icon: Camera, title: 'Academic decisions', body: 'Never used for grading, attendance, discipline, or hiring.' },
  { icon: AlertTriangle, title: 'Medical diagnosis', body: 'This is not a medical or mental-health diagnosis system.' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-bg/80 backdrop-blur-xl px-4 py-4">
        <Container className="flex items-center justify-between">
          <Logo size="md" to="/" />
          <a href="/" className="btn-ghost text-sm hidden sm:inline-flex">Back to home</a>
        </Container>
      </header>

      <main className="py-16 px-4">
        <Container size="narrow">
          <div className="surface-card p-8 sm:p-10 animate-fade-up">
            <div className="text-center mb-10">
              <ShieldCheck className="mx-auto h-12 w-12 text-brand" />
              <h1 className="mt-4 text-3xl font-bold">Privacy Center</h1>
              <p className="mt-2 text-base text-muted">Your camera. Your device. Your call.</p>
            </div>

            <Alert tone="warning" title={NON_MEDICAL_STATEMENT} className="mb-8">
              {DISCLAIMER_LONG}
            </Alert>

            <SectionHeading eyebrow="What we process" title="Data handled locally in your browser" className="mb-6" />
            <dl className="space-y-4 mb-10">
              {WE_DO.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-elevated/60 p-4">
                  <dt className="text-sm font-semibold text-ink">{item.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{item.body}</dd>
                </div>
              ))}
            </dl>

            <SectionHeading eyebrow="What we never do" title="Hard product boundaries" className="mb-6" />
            <ul className="space-y-3 mb-10">
              {WE_DO_NOT.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-elevated/60 p-4">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.body}</p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <SectionHeading eyebrow="Your rights" title="Control and transparency" className="mb-6" />
            <div className="grid gap-4 sm:grid-cols-2 mb-10">
              <div className="surface-card p-5">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold">Camera consent</h3>
                </div>
                <p className="mt-2 text-sm text-muted">Camera access requires explicit permission each session. You can revoke it anytime in browser settings.</p>
              </div>
              <div className="surface-card p-5">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold">Data deletion</h3>
                </div>
                <p className="mt-2 text-sm text-muted">One click in Settings erases all local session records. No server-side data to request removal of.</p>
              </div>
              <div className="surface-card p-5">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold">No third-party sharing</h3>
                </div>
                <p className="mt-2 text-sm text-muted">No analytics SDKs, no tracking pixels, no data sold or shared. The app works offline after first load.</p>
              </div>
              <div className="surface-card p-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold">Consent version</h3>
                </div>
                <p className="mt-2 text-sm text-muted">Current consent version: <code className="font-mono text-xs bg-elevated px-1.5 py-0.5 rounded">{CONSENT_VERSION}</code>. Re-consent required on material changes.</p>
              </div>
            </div>

            <SectionHeading eyebrow="Contact" title="Questions or concerns?" className="mb-6" />
            <Panel>
              <p className="text-sm leading-relaxed text-muted">
                Email our privacy team at <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand hover:underline">{SUPPORT_EMAIL}</a>.
                We respond within 5 business days.
              </p>
            </Panel>
          </div>
        </Container>
      </main>

      <footer className="border-t border-border bg-surface/60 py-8">
        <Container size="narrow" className="text-center text-xs text-muted">
          © {new Date().getFullYear()} {APP_NAME}. For educational wellbeing support only.
        </Container>
      </footer>
    </div>
  )
}