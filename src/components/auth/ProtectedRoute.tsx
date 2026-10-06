import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute() {
  const { session, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="mt-4 text-sm text-muted">Loading session…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    // Use window.location safely
    const from = typeof window !== 'undefined' ? window.location.pathname : '/'
    return <Navigate to="/login" replace state={{ from }} />
  }

  return <Outlet />
}