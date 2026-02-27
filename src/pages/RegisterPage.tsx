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
        <div className="mx-auto max-w-md py-16 px-4 sm:px-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-sg text-[#133c1d]">Check your email</h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We've sent a verification link to <strong className="text-gray-900">{email}</strong>.
              Click the link to activate your account before signing in.
            </p>
            <Button className="mt-8 h-11 w-full rounded-xl text-base font-medium bg-[#8cc63f] hover:bg-[#7ab32e] text-[#133c1d]" onClick={() => navigate('/login')}>
              Go to Sign in
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
            <h1 className="text-3xl font-bold font-sg text-[#133c1d]">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join SolarSpot and start sharing stations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700 font-medium">Display name</Label>
              <Input
                id="displayName"
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
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

            <Button
              type="submit"
              disabled={isLoading || isRateLimited}
              className="mt-2 h-11 w-full rounded-xl text-base font-medium bg-[#8cc63f] hover:bg-[#7ab32e] text-[#133c1d]"
            >
              {isLoading ? 'Creating account…' : isRateLimited ? 'Too many attempts — wait 15 min' : 'Create account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#8cc63f] hover:text-[#7ab32e]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}
