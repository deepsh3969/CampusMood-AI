import { Panel, SectionHeading, Alert, Label } from '@/components/ui'
import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'
import { User, Mail, BadgeCheck } from 'lucide-react'

interface UserRecord {
  id: string
  displayName: string
  studentId: string
  email: string
  passwordHash: string
}

export default function ProfilePage() {
  const { session, setSession } = useAuthStore()
  const [form, setForm] = useState({ displayName: session?.user.displayName ?? '', studentId: session?.user.studentId ?? '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!session) return
    setSaving(true)
    setMessage(null)
    const users = JSON.parse(localStorage.getItem('campusmood.users') ?? '[]') as UserRecord[]
    const idx = users.findIndex((u) => u.id === session.user.id)
    if (idx >= 0) {
      const existing = users[idx]!
      const updated: UserRecord = {
        id: existing.id,
        email: existing.email,
        passwordHash: existing.passwordHash,
        displayName: form.displayName,
        studentId: form.studentId,
      }
      users[idx] = updated
      localStorage.setItem('campusmood.users', JSON.stringify(users))
      const updatedUser = { ...session.user, displayName: form.displayName, studentId: form.studentId }
      setSession({ ...session, user: updatedUser })
      setMessage({ type: 'success', text: 'Profile updated' })
    }
    setSaving(false)
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-2xl">
      <SectionHeading
        eyebrow="Profile"
        title="Your account"
        description="Manage your display name and student ID."
        className="mb-6"
      />

      {message && <Alert tone={message.type === 'success' ? 'success' : 'danger'}>{message.text}</Alert>}

      <Panel>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand text-3xl font-bold">
            {form.displayName.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{form.displayName || 'Student'}</h2>
            <p className="text-sm text-muted">{session?.user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <BadgeCheck className="h-3 w-3" />
              Local demo account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                className="input pl-10"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="studentId">Student ID <span className="text-muted font-normal">(optional)</span></Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="studentId"
                value={form.studentId}
                onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                className="input pl-10"
                placeholder="e.g. 2024CS1234"
                disabled={saving}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionHeading title="Danger zone" className="mb-4" />
        <Alert tone="warning" title="Account deletion">
          Deleting your account will permanently remove all session data and cannot be undone.
        </Alert>
        <button type="button" className="btn-danger" onClick={() => alert('Account deletion not implemented in demo')}>
          Delete account
        </button>
      </Panel>
    </div>
  )
}