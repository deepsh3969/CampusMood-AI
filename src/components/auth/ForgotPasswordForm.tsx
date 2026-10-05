import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2 } from 'lucide-react'
import { Label, Spinner } from '@/components/ui'
import { DISCLAIMER_SHORT } from '@/constants/app'
import { getAuthAdapter } from '@/services/auth'
import { cn } from '@/utils/cn'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email')
      return
    }
    setIsSubmitting(true)
    const adapter = await getAuthAdapter()
    const result = await adapter.resetPassword(email)
    if (result.ok) {
      setSuccess(true)
    } else {
      setError(result.error ?? 'Failed to send reset email')
    }
    setIsSubmitting(false)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="mt-2 text-sm text-muted">
          If an account exists for {email}, a password reset link has been sent.
        </p>
        <Link to="/login" className="mt-6 inline-block btn-secondary">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">Reset your password</h2>
        <p className="mt-1 text-sm text-muted">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className={cn('input pl-10', error && 'border-danger focus:border-danger focus:ring-danger/30')}
            aria-invalid={!!error}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-danger" role="alert">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn('btn-primary w-full py-3', isSubmitting && 'opacity-70')}
      >
        {isSubmitting ? <Spinner label="Sending..." /> : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-muted">
        Remember your password? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link>
      </p>

      <p className="text-center text-xs text-muted/80 mt-4">{DISCLAIMER_SHORT}</p>
    </form>
  )
}