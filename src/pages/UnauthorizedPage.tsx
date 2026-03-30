import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'

export default function UnauthorizedPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-5xl font-bold text-muted-foreground">403</p>
        <h1 className="mt-4 text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have permission to view this page.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Go to dashboard
          </Link>
          <Link
            to="/"
            className="rounded border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Back to home
          </Link>
        </div>
      </div>
    </Layout>
  )
}
