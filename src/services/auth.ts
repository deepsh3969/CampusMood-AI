import type { AuthSession, AuthResult, UserProfile, AuthProviderKind } from '@/types'
import { STORAGE_KEYS } from '@/constants/app'
import { createId } from '@/utils/id'

/** Local-only auth adapter (no Supabase). Stores session in localStorage. */
export function createLocalAuthAdapter() {
  const KEY = STORAGE_KEYS.auth

  async function load(): Promise<AuthResult> {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { ok: false, session: null, error: 'no-session' }
      const parsed = JSON.parse(raw) as AuthSession
      if (!parsed.user || !parsed.provider) return { ok: false, session: null, error: 'invalid' }
      return { ok: true, session: parsed, error: null }
    } catch {
      return { ok: false, session: null, error: 'parse-error' }
    }
  }

  function save(session: AuthSession): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(session))
    } catch {
      // Ignore localStorage errors (e.g., quota exceeded, private browsing)
    }
  }

  function clear(): void {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Ignore
    }
  }

  async function signUp(email: string, password: string, displayName: string, studentId?: string): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 350))
    const users = getUsers()
    if (users.find((u) => u.email === email)) {
      return { ok: false, session: null, error: 'email-exists' }
    }
    const user: UserProfile = {
      id: createId('usr'),
      email,
      displayName,
      studentId: studentId ?? null,
      plan: 'student',
      createdAt: new Date().toISOString(),
    }
    const session: AuthSession = { user, provider: 'local' }
    save(session)
    users.push({ ...user, passwordHash: hashPassword(password) })
    saveUsers(users)
    return { ok: true, session, error: null }
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 350))
    const users = getUsers()
    const match = users.find((u) => u.email === email && u.passwordHash === hashPassword(password))
    if (!match) return { ok: false, session: null, error: 'invalid-credentials' }
    const { passwordHash: _, ...user } = match
    const session: AuthSession = { user, provider: 'local' }
    save(session)
    return { ok: true, session, error: null }
  }

  async function signOut(): Promise<void> {
    clear()
  }

  async function resetPassword(email: string): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 350))
    const users = getUsers()
    const user = users.find((u) => u.email === email)
    if (!user) return { ok: false, session: null, error: 'not-found' }
    return { ok: true, session: null, error: null }
  }

  return { load, save, clear, signUp, signIn, signOut, resetPassword }
}

function getUsers(): Array<UserProfile & { passwordHash: string }> {
  try {
    return JSON.parse(localStorage.getItem('campusmood.users') ?? '[]')
  } catch {
    return []
  }
}

function saveUsers(users: Array<UserProfile & { passwordHash: string }>): void {
  try {
    localStorage.setItem('campusmood.users', JSON.stringify(users))
  } catch {
    // Ignore
  }
}

function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i += 1) {
    hash = ((hash << 5) - hash + password.charCodeAt(i)) | 0
  }
  return `local_${hash.toString(16)}`
}

/** Supabase adapter placeholder — activated when env vars are present. */
export async function createSupabaseAuthAdapter(): Promise<{
  load: () => Promise<AuthResult>
  save: (session: AuthSession) => Promise<void>
  clear: () => Promise<void>
  signUp: (email: string, password: string, displayName: string, studentId?: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
} | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) return null

  let createClient: (url: string, key: string) => ReturnType<typeof import('@supabase/supabase-js').createClient>
  try {
    const mod = await import('@supabase/supabase-js')
    createClient = mod.createClient
  } catch {
    // Supabase not available or failed to load - fall back to local auth
    return null
  }

  const supabase = createClient(url, key)

  return {
    async load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return { ok: false, session: null, error: 'no-session' }
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        const user: UserProfile = profile ?? {
          id: session.user.id,
          email: session.user.email ?? '',
          displayName: session.user.user_metadata?.display_name ?? 'Student',
          studentId: session.user.user_metadata?.student_id ?? null,
          plan: 'student',
          createdAt: session.user.created_at,
        }
        return { ok: true, session: { user, provider: 'supabase' }, error: null }
      } catch {
        return { ok: false, session: null, error: 'supabase-load-failed' }
      }
    },
    async save(session: AuthSession) {
      try {
        await supabase.auth.setSession({
          access_token: session.provider === 'supabase' ? '' : '',
          refresh_token: '',
        })
      } catch {
        // Ignore
      }
    },
    async clear() {
      try {
        await supabase.auth.signOut()
      } catch {
        // Ignore
      }
    },
    async signUp(email: string, password: string, displayName: string, studentId?: string) {
      try {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName, student_id: studentId } } })
        if (error) return { ok: false, session: null, error: error.message }
        return { ok: true, session: null, error: null }
      } catch (e) {
        return { ok: false, session: null, error: e instanceof Error ? e.message : 'supabase-signup-failed' }
      }
    },
    async signIn(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return { ok: false, session: null, error: error.message }
        if (data.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          const user: UserProfile = profile ?? {
            id: data.user.id,
            email: data.user.email ?? '',
            displayName: data.user.user_metadata?.display_name ?? 'Student',
            studentId: data.user.user_metadata?.student_id ?? null,
            plan: 'student',
            createdAt: data.user.created_at,
          }
          return { ok: true, session: { user, provider: 'supabase' }, error: null }
        }
        return { ok: false, session: null, error: 'no-session' }
      } catch (e) {
        return { ok: false, session: null, error: e instanceof Error ? e.message : 'supabase-signin-failed' }
      }
    },
    async signOut() {
      try {
        await supabase.auth.signOut()
      } catch {
        // Ignore
      }
    },
    async resetPassword(email: string) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password` })
        if (error) return { ok: false, session: null, error: error.message }
        return { ok: true, session: null, error: null }
      } catch (e) {
        return { ok: false, session: null, error: e instanceof Error ? e.message : 'supabase-reset-failed' }
      }
    },
  }
}

interface AuthAdapter {
  load: () => Promise<AuthResult>
  save: (session: AuthSession) => void | Promise<void>
  clear: () => void | Promise<void>
  signUp: (email: string, password: string, displayName: string, studentId?: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => void | Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  kind: AuthProviderKind
}

/** Factory that picks the right adapter. */
export async function getAuthAdapter(): Promise<AuthAdapter> {
  try {
    const supabase = await createSupabaseAuthAdapter()
    if (supabase) return { ...supabase, kind: 'supabase' as AuthProviderKind }
  } catch {
    // Supabase adapter failed - fall back to local
  }
  return { ...createLocalAuthAdapter(), kind: 'local' as AuthProviderKind }
}