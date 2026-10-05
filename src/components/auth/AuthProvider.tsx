import { useEffect } from 'react'
import { getAuthAdapter } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true
    getAuthAdapter().then((adapter) => {
      if (!mounted) return
      adapter.load().then((result) => {
        if (mounted) {
          setSession(result.ok ? result.session : null)
          setLoading(false)
        }
      })
    })
    return () => {
      mounted = false
    }
  }, [setSession, setLoading])

  return <>{children}</>
}