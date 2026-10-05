import { Link, useNavigate } from 'react-router-dom'
import { useState, FormEvent } from 'react'
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getAuthAdapter } from '@/services/auth'
import { DISCLAIMER_SHORT } from '@/constants/app'
import { Label, Alert, Spinner } from '@/components/ui'
import { cn } from '@/utils/cn'

function InputWithIcon({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof Mail }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input {...props} className="pl-10 pr-4" />
    </div>
  )
}

function PasswordInput({ label, id, value, onChange, error, disabled }: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  error?: string
  disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1.5">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type={show ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn('input pl-10 pr-12', error ? 'border-danger focus:border-danger focus:ring-danger/30' : '')}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-xs text-danger" role="alert">{error}</p> : null}
    </div>
  )
}

export function LoginForm() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email'
    if (!password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setGeneralError('')
    const adapter = await getAuthAdapter()
    const result = await adapter.signIn(email, password)
    if (result.ok && result.session) {
      setSession(result.session)
      navigate('/dashboard', { replace: true })
    } else {
      setGeneralError(result.error === 'invalid-credentials'
        ? 'Invalid email or password'
        : result.error ?? 'Sign in failed')
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-2 text-sm text-muted">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <span>Local demo mode — no server required</span>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <InputWithIcon
          icon={Mail}
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validate()}
          disabled={isSubmitting}
          className={cn('input', errors.email && 'border-danger focus:border-danger focus:ring-danger/30')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email ? <p id="email-error" className="mt-1.5 text-xs text-danger" role="alert">{errors.email}</p> : null}
      </div>

      <PasswordInput
        label="Password"
        id="password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        disabled={isSubmitting}
      />

      {generalError && <Alert tone="danger">{generalError}</Alert>}

      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-border text-brand focus:ring-brand/30" />
          <span className="text-sm text-muted">Remember me</span>
        </Label>
        <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn('btn-primary w-full py-3', isSubmitting && 'opacity-70')}
      >
        {isSubmitting ? <Spinner label="Signing in..." /> : 'Sign in'}
      </button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account? <Link to="/register" className="font-medium text-brand hover:underline">Create one</Link>
      </p>

      <p className="text-center text-xs text-muted/80 mt-4">{DISCLAIMER_SHORT}</p>
    </form>
  )
}