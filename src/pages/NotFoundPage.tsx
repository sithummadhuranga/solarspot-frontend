import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'

/**
 * NotFoundPage — 404 fallback rendered by the catch-all route.
 */
export default function NotFoundPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-md py-16 px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          <p className="text-6xl font-bold text-solar-green-600 font-sg">404</p>
          <h1 className="mt-6 text-2xl font-bold font-sg text-[#133c1d]">Page not found</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#8cc63f] hover:bg-[#7ab32e] text-base font-medium text-[#133c1d] transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </Layout>
  )
}
