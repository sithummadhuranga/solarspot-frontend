import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRegisterMutation } from '@/features/auth/authApi'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [error,       setError]       = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [success,     setSuccess]     = useState(false)
  /** True while the 429 rate-limit window is active. Cleared by setTimeout. */
  const [isRateLimited, setIsRateLimited] = useState(false)

  const [register, { isLoading }] = useRegisterMutation()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isRateLimited) return
    setError(null)
    setFieldErrors([])

    try {
      await register({ displayName, email, password }).unwrap()
      setSuccess(true)
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string; errors?: string[] } }
      if (e.status === 429) {
        setError(e.data?.message ?? 'Too many attempts. Try again in 15 minutes.')
        setIsRateLimited(true)
        setTimeout(() => setIsRateLimited(false), 15 * 60 * 1000)
      } else if (e.status === 409) {
        setError('An account with that email already exists.')
      } else if (e.status === 422 && e.data?.errors?.length) {
        setFieldErrors(e.data.errors)
      } else {
        setError(e.data?.message ?? 'Registration failed. Please try again.')
      }
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a verification link to <strong>{email}</strong>.
            Click the link to activate your account before signing in.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate('/login')}>
            Go to Sign in
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join SolarSpot and start sharing stations
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {fieldErrors.length > 0 && (
            <ul className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 list-disc list-inside space-y-1">
              {fieldErrors.map((fe, i) => <li key={i}>{fe}</li>)}
            </ul>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

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
            <Label htmlFor="password">Password</Label>
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

          <Button
            type="submit"
            disabled={isLoading || isRateLimited}
            className="w-full"
          >
            {isLoading ? 'Creating account…' : isRateLimited ? 'Too many attempts — wait 15 min' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </Layout>
  )
}
