import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/button'
import { useLazyVerifyEmailQuery } from '@/features/auth/authApi'

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>()
  const [verifyEmail, { isFetching, isSuccess, error }] = useLazyVerifyEmailQuery()

  useEffect(() => {
    if (!token) return
    // StrictMode mounts → unmounts → remounts in development.
    // `preferCacheValue: true` avoids double-hitting the verification endpoint.
    void verifyEmail(token, true)
  }, [token, verifyEmail])

  const apiMessage = error && 'data' in error
    ? (error.data as { message?: string })?.message
    : undefined

  return (
    <Layout>
      <div className="mx-auto max-w-xl py-24 text-center">
        <h1 className="text-2xl font-semibold">Email verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {token ? 'Completing verification…' : 'Verification link is missing a token.'}
        </p>

        <div className="mt-8 rounded-xl border bg-card p-6">
          {(!token || error) && (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {token
                  ? (apiMessage ?? 'Verification link is invalid or has expired.')
                  : 'Please open the full link from your email.'}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <Button asChild variant="secondary">
                  <Link to="/register">Back to register</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Go to login</Link>
                </Button>
              </div>
            </div>
          )}

          {token && isFetching && !isSuccess && !error && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Verifying your email…</p>
            </div>
          )}

          {token && isSuccess && !error && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <p className="text-sm text-muted-foreground">
                Your email has been verified. You can now sign in.
              </p>
              <Button asChild>
                <Link to="/login">Continue to login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
