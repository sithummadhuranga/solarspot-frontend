import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useResetPasswordMutation } from '@/features/auth/authApi'

/**
 * ResetPasswordPage — PATCH /api/auth/reset-password/:token
 *
 * Mounted at /reset-password/:token.
 * Extracts the token from the URL, collects new password + confirmation,
 * then submits to the backend which invalidates all existing sessions.
 */
export default function ResetPasswordPage() {
  const { token }  = useParams<{ token: string }>()
  const navigate   = useNavigate()

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error,           setError]           = useState<string | null>(null)
  const [fieldErrors,     setFieldErrors]     = useState<string[]>([])
  const [success,         setSuccess]         = useState(false)

  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors([])

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!token) {
      setError('Invalid reset link — token is missing.')
      return
    }

    try {
      await resetPassword({ token, password, confirmPassword }).unwrap()
      setSuccess(true)
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string; errors?: string[] } }
      if (e.status === 400) {
        setError('Password reset link is invalid or has expired. Please request a new one.')
      } else if (e.status === 422 && e.data?.errors?.length) {
        setFieldErrors(e.data.errors)
      } else {
        setError(e.data?.message ?? 'Something went wrong. Please try again.')
      }
    }
  }

  if (success) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Password changed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been updated. All existing sessions have been signed out.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate('/login', { replace: true })}>
            Sign in
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account. Must be 8–72 characters.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}{' '}
              {error.includes('invalid or has expired') && (
                <Link to="/forgot-password" className="underline font-medium">Request new link</Link>
              )}
            </div>
          )}
          {fieldErrors.length > 0 && (
            <ul className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 list-disc list-inside space-y-1">
              {fieldErrors.map((fe, i) => <li key={i}>{fe}</li>)}
            </ul>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving…' : 'Set new password'}
          </Button>
        </form>
      </div>
    </Layout>
  )
}
