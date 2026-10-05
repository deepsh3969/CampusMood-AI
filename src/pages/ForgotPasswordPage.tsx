import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot password?" description="Enter your email to receive a reset link">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}