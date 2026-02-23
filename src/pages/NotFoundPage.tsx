import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'

/**
 * NotFoundPage — 404 fallback rendered by the catch-all route.
 */
export default function NotFoundPage() {
  return (
    <Layout>
      <div className="py-24 text-center">
        <p className="text-6xl font-bold text-muted-foreground">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-block rounded bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Back to home
        </Link>
      </div>
    </Layout>
  )
}
