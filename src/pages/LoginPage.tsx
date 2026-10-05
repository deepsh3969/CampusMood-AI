import { LoginForm } from '@/components/auth/LoginForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to continue to your dashboard">
      <LoginForm />
    </AuthLayout>
  )
}