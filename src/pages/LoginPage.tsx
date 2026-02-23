import { useLocation, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
// TODO (Member 4): import useLoginMutation from authApi and wire form submit

/**
 * LoginPage — email + password sign-in form.
 *
 * TODO (Member 4):
 *  - Wire up useLoginMutation hook
 *  - On success: dispatch setCredentials, redirect to state.from or /dashboard
 *  - Show field-level validation errors from 422 response
 *  - Add rate-limit error handling (429)
 */
export default function LoginPage() {
  const navigate  = useNavigate()
  const location   = useLocation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO (Member 4): wire loginMutation, then navigate to:
    //   (location.state as { from?: Location })?.from?.pathname ?? '/stations'
    void navigate
    void location
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back to SolarSpot
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* TODO (Member 4): replace with shadcn Input components */}
          <input type="email"    name="email"    placeholder="Email"    className="border rounded px-3 py-2 text-sm w-full" />
          <input type="password" name="password" placeholder="Password" className="border rounded px-3 py-2 text-sm w-full" />

          <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account? <a href="/register" className="underline">Register</a>
          {' · '}
          <a href="/forgot-password" className="underline">Forgot password?</a>
        </p>
      </div>
    </Layout>
  )
}
