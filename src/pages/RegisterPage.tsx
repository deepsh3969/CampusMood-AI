import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" description="Start tracking your study moments today">
      <RegisterForm />
    </AuthLayout>
  )
}