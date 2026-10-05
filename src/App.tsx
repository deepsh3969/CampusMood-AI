import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import MonitorPage from '@/pages/MonitorPage'
import SessionsPage from '@/pages/SessionsPage'
import SessionDetailPage from '@/pages/SessionDetailPage'
import InsightsPage from '@/pages/InsightsPage'
import SettingsPage from '@/pages/SettingsPage'
import ProfilePage from '@/pages/ProfilePage'
import PrivacyPage from '@/pages/PrivacyPage'

function AuthRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  )
}

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
    </Routes>
  )
}

function ProtectedRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/monitor" element={<MonitorPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <Routes location={location}>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/login" element={<AuthRoutes />} />
        <Route path="/register" element={<AuthRoutes />} />
        <Route path="/forgot-password" element={<AuthRoutes />} />
        <Route path="/dashboard" element={<ProtectedRoutes />} />
        <Route path="/monitor" element={<ProtectedRoutes />} />
        <Route path="/sessions" element={<ProtectedRoutes />} />
        <Route path="/sessions/:id" element={<ProtectedRoutes />} />
        <Route path="/insights" element={<ProtectedRoutes />} />
        <Route path="/settings" element={<ProtectedRoutes />} />
        <Route path="/profile" element={<ProtectedRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm font-semibold text-brand">404</p>
      <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <a href="/" className="btn-primary mt-6">
        Back to home
      </a>
      <Navigate replace to="/" to-state />
    </main>
  )
}