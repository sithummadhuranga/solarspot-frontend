import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useForgotPasswordMutation } from '@/features/auth/authApi'

/**
 * ForgotPasswordPage — POST /api/auth/forgot-password
 *
 * Always shows a generic success message after submission to prevent email
 * enumeration attacks (server returns 200 regardless of whether the email exists).
 */
export default function ForgotPasswordPage() {
  const [email,       setEmail]       = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null)

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const isRateLimited = rateLimitUntil != null && Date.now() < rateLimitUntil

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isRateLimited) return
    setError(null)

    try {
      await forgotPassword({ email }).unwrap()
      setSubmitted(true)
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string } }
      if (e.status === 429) {
        setError(e.data?.message ?? 'Too many attempts. Try again in 15 minutes.')
        setRateLimitUntil(Date.now() + 15 * 60 * 1000)
      } else {
        // On any other error still show generic success to prevent enumeration
        setSubmitted(true)
      }
    }
  }

  if (submitted) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account with that email exists, we've sent a password reset link.
            The link expires in 1 hour.
          </p>
          <Link to="/login">
            <Button className="mt-6 w-full" variant="outline">Back to Sign in</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" disabled={isLoading || isRateLimited} className="w-full">
            {isLoading ? 'Sending…' : isRateLimited ? 'Too many attempts — wait 15 min' : 'Send reset link'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </Layout>
  )
}
