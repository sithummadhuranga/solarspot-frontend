import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { useForgotPasswordMutation } from '@/features/auth/authApi'
import { forgotPasswordSchema } from '@/lib/validators'
import { getApiErrorMessage } from '@/lib/errors'

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorMessage(null)

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Please enter a valid email.')
      return
    }

    try {
      const response = await forgotPassword(parsed.data).unwrap()
      setSubmitted(true)
      toast.success(response.message)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not request password reset.'))
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md py-16">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we will send you a password reset link.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
            If the email exists, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {errorMessage && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Back to <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </Layout>
  )
}
