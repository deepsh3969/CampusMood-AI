import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Faq, ResponsibleAI } from '@/components/landing/Content'
import { Features, Technology } from '@/components/landing/Features'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PrivacyFirst } from '@/components/landing/PrivacyFirst'
import { Container } from '@/components/ui/Container'
import { APP_NAME, DISCLAIMER_SHORT } from '@/constants/app'

function FinalCta() {
  return (
    <section className="py-20 sm:py-24" aria-labelledby="cta-title">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/15 via-card to-accent/10 p-8 text-center shadow-lift sm:p-14">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-[90px]"
            aria-hidden="true"
          />
          <h2 id="cta-title" className="relative text-2xl font-bold sm:text-4xl">
            Ready to understand your study moments?
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Create an account, grant camera access on your terms, and run a focused session with
            on-device expression estimation. {DISCLAIMER_SHORT}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">
              Start a Session
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/privacy" className="btn-secondary px-6 py-3 text-base">
              Read the Privacy Center
            </Link>
          </div>
          <p className="relative mt-6 text-xs text-muted">
            {APP_NAME} is not a medical or mental-health diagnosis system.
          </p>
        </div>
      </Container>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <LandingHeader />
      <main>
        <Hero />
        <HowItWorks />
        <PrivacyFirst />
        <Features />
        <Technology />
        <ResponsibleAI />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
