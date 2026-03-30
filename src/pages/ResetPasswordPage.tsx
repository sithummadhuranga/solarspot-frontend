import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { useResetPasswordMutation } from '@/features/auth/authApi'
import { resetPasswordSchema } from '@/lib/validators'
import { getApiErrorMessage } from '@/lib/errors'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!token) {
      setErrorMessage('Reset token is missing from URL.')
      return
    }

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Please check your input.')
      return
    }

    try {
      const response = await resetPassword({ token, ...parsed.data }).unwrap()
      toast.success(response.message)
      navigate('/login', { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not reset password.'))
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md py-16">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">New Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Confirm Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Back to <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </Layout>
  )
}
