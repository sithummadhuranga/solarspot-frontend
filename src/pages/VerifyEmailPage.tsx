import { Link, useParams } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/button'
import { useVerifyEmailQuery } from '@/features/auth/authApi'

/**
 * VerifyEmailPage — GET /api/auth/verify-email/:token
 *
 * Mounted at /verify-email/:token.
 * The token is extracted from the URL and the query is fired immediately on mount.
 * Shows success or an error if the link is invalid / expired.
 */
export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>()

  const {
    isLoading,
    isSuccess,
    isError,
    error,
  } = useVerifyEmailQuery(token ?? '', {
    skip: !token,
  })

  const errorMessage = (() => {
    if (!token) return 'Verification link is missing a token.'
    const err = error as { status?: number; data?: { message?: string } } | undefined
    return err?.data?.message ?? 'Verification link is invalid or has expired.'
  })()

  return (
    <Layout>
      <div className="mx-auto max-w-sm py-16 text-center">
        {/* Loading */}
        {isLoading && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-solar-green-600 animate-spin" />
            </div>
            <h1 className="text-xl font-bold">Verifying your email…</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please wait a moment.</p>
          </>
        )}

        {/* Success */}
        {isSuccess && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Email verified!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your email address has been confirmed. You can now sign in.
            </p>
            <Link to="/login">
              <Button className="mt-6 w-full">Sign in</Button>
            </Link>
          </>
        )}

        {/* Error */}
        {isError && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Verification failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/register">
                <Button className="w-full" variant="outline">Register again</Button>
              </Link>
              <Link to="/login">
                <Button className="w-full" variant="ghost">Back to Sign in</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
