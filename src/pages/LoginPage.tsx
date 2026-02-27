import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useLoginMutation, useResendVerificationMutation } from '@/features/auth/authApi'

/** Derive redirect target from role after login. */
function getRedirectPath(roleName: string, roleLevel: number, from?: string): string {
  if (roleName === 'admin')  return '/admin/dashboard'
  if (roleLevel >= 3)        return '/moderator/dashboard'
  return from ?? '/dashboard'
}

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: { pathname: string } } | null)?.from?.pathname

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  /** True while the 429 rate-limit window is active. Cleared by setTimeout. */
  const [isRateLimited, setIsRateLimited] = useState(false)
  /** True when the 403 is specifically "email not verified" */
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const [login, { isLoading }] = useLoginMutation()
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isRateLimited) return
    setError(null)
    setFieldErrors([])
    setNeedsVerification(false)
    setResendSent(false)

    try {
      const result = await login({ email, password }).unwrap()
      // onQueryStarted in authApi dispatches setCredentials automatically
      const { role } = result.data.user
      navigate(getRedirectPath(role.name, role.roleLevel, from), { replace: true })
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string; errors?: string[] } }
      if (e.status === 429) {
        setError(e.data?.message ?? 'Too many attempts. Try again in 15 minutes.')
        setIsRateLimited(true)
        setTimeout(() => setIsRateLimited(false), 15 * 60 * 1000)
      } else if (e.status === 403) {
        const msg = e.data?.message ?? ''
        if (msg.toLowerCase().includes('verify')) {
          setNeedsVerification(true)
        } else {
          setError(msg || 'Access denied.')
        }
      } else if (e.status === 422 && e.data?.errors?.length) {
        setFieldErrors(e.data.errors)
      } else {
        setError(e.data?.message ?? 'Invalid email or password.')
      }
    }
  }

  async function handleResend() {
    if (!email) return
    try {
      await resendVerification({ email }).unwrap()
      setResendSent(true)
    } catch {
      setResendSent(true) // show generic "check your inbox" either way
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back to SolarSpot</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Global error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email-not-verified banner */}
          {needsVerification && !resendSent && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 space-y-2">
              <p className="font-medium">Please verify your email address before signing in.</p>
              <p>Didn't receive the email?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className="underline font-semibold disabled:opacity-50"
                >
                  {isResending ? 'Sending…' : 'Resend verification email'}
                </button>
                {!email && <span className="text-amber-600"> (enter your email above first)</span>}
              </p>
            </div>
          )}
          {needsVerification && resendSent && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Verification email sent — check your inbox (and spam folder).
            </div>
          )}

          {/* Field validation errors */}
          {fieldErrors.length > 0 && (
            <ul className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 list-disc list-inside space-y-1">
              {fieldErrors.map((fe, i) => <li key={i}>{fe}</li>)}
            </ul>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || isRateLimited}
            className="w-full"
          >
            {isLoading ? 'Signing in…' : isRateLimited ? 'Too many attempts — wait 15 min' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link to="/register" className="underline">Register</Link>
        </p>
      </div>
    </Layout>
  )
}
