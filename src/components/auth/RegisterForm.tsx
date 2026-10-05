import { Link, useNavigate } from 'react-router-dom'
import { useState, FormEvent } from 'react'
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getAuthAdapter } from '@/services/auth'
import { DISCLAIMER_SHORT } from '@/constants/app'
import { Label, Alert, Spinner } from '@/components/ui'
import { cn } from '@/utils/cn'

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

function strengthMeter(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  const labels: readonly string[] = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
  const colors: readonly string[] = ['text-danger', 'text-warning', 'text-yellow-500', 'text-success', 'text-success']
  const idx = Math.min(score, 4)
  return { score, label: labels[idx]!, color: colors[idx]! }
}

export function RegisterForm() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()
  const [form, setForm] = useState({ displayName: '', studentId: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.displayName.trim()) newErrors.displayName = 'Display name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) newErrors.confirm = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setGeneralError('')
    const adapter = await getAuthAdapter()
    const studentId = form.studentId.trim()
    const result = await adapter.signUp(form.email, form.password, form.displayName, studentId || undefined)
    if (result.ok && result.session) {
      setSession(result.session)
      navigate('/dashboard', { replace: true })
    } else {
      setGeneralError(result.error === 'email-exists'
        ? 'An account with this email already exists'
        : result.error ?? 'Registration failed')
    }
    setIsSubmitting(false)
  }

  const { score, label, color } = strengthMeter(form.password)

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-2 text-sm text-muted">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <span>Local demo mode — no server required</span>
      </div>

      <div>
        <Label htmlFor="displayName">Display name</Label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          value={form.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          onBlur={() => validate()}
          disabled={isSubmitting}
          className={cn('input', errors.displayName && 'border-danger focus:border-danger focus:ring-danger/30')}
          aria-invalid={!!errors.displayName}
        />
        {errors.displayName && <p className="mt-1.5 text-xs text-danger" role="alert">{errors.displayName}</p>}
      </div>

      <div>
        <Label htmlFor="studentId">Student ID <span className="text-muted font-normal">(optional)</span></Label>
        <input
          id="studentId"
          type="text"
          value={form.studentId}
          onChange={(e) => handleChange('studentId', e.target.value)}
          disabled={isSubmitting}
          className="input"
          placeholder="e.g. 2024CS1234"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => validate()}
            disabled={isSubmitting}
            className={cn('input pl-10', errors.email && 'border-danger focus:border-danger focus:ring-danger/30')}
            aria-invalid={!!errors.email}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-danger" role="alert">{errors.email}</p>}
      </div>

      <PasswordInput
        label="Password"
        id="password"
        value={form.password}
        onChange={(v) => handleChange('password', v)}
        error={errors.password}
        disabled={isSubmitting}
      />

      {form.password && (
        <div className="space-y-1.5" aria-live="polite">
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(score / 4) * 100}%`, backgroundColor: `rgb(var(--c-${color.replace('text-', '')}))` }}
            />
          </div>
          <p className={cn('text-xs font-medium', color)}>{label}</p>
        </div>
      )}

      <PasswordInput
        label="Confirm password"
        id="confirm"
        value={form.confirm}
        onChange={(v) => handleChange('confirm', v)}
        error={errors.confirm}
        disabled={isSubmitting}
      />

      {generalError && <Alert tone="danger">{generalError}</Alert>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn('btn-primary w-full py-3', isSubmitting && 'opacity-70')}
      >
        {isSubmitting ? <Spinner label="Creating account..." /> : 'Create account'}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link>
      </p>

      <p className="text-center text-xs text-muted/80 mt-4">{DISCLAIMER_SHORT}</p>
    </form>
  )
}