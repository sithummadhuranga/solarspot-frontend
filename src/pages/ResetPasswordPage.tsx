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
        <div className="mx-auto max-w-md py-16 px-4 sm:px-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-sg text-[#133c1d]">Password changed</h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your password has been updated. All existing sessions have been signed out.
            </p>
            <Button className="mt-8 h-11 w-full rounded-xl text-base font-medium bg-[#8cc63f] hover:bg-[#7ab32e] text-[#133c1d]" onClick={() => navigate('/login', { replace: true })}>
              Sign in
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md py-16 px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-sg text-[#133c1d]">Reset password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a new password for your account. Must be 8–72 characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">New password</Label>
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
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="h-11 rounded-xl"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="mt-2 h-11 w-full rounded-xl text-base font-medium bg-[#8cc63f] hover:bg-[#7ab32e] text-[#133c1d]">
              {isLoading ? 'Saving…' : 'Set new password'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
