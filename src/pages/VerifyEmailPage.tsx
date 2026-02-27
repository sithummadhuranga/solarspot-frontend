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
      <div className="mx-auto max-w-md py-16 px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          {/* Loading */}
          {isLoading && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-solar-green-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold font-sg text-[#133c1d]">Verifying your email…</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Please wait a moment.</p>
            </>
          )}

          {/* Success */}
          {isSuccess && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold font-sg text-[#133c1d]">Email verified!</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Your email address has been confirmed. You can now sign in.
              </p>
              <Link to="/login">
                <Button className="mt-8 h-11 w-full text-base font-medium bg-[#8cc63f] hover:bg-[#7ab32e] text-[#133c1d]">Sign in</Button>
              </Link>
            </>
          )}

          {/* Error */}
          {isError && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold font-sg text-[#133c1d]">Verification failed</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{errorMessage}</p>
              <div className="mt-8 flex flex-col gap-3">
                <Link to="/register">
                  <Button className="h-11 w-full text-base font-medium" variant="outline">Register again</Button>
                </Link>
                <Link to="/login">
                  <Button className="h-11 w-full text-base font-medium" variant="ghost">Back to Sign in</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
