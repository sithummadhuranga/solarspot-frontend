import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'

/**
 * HomePage — public landing page.
 *
 * TODO (Member 1): replace placeholder with hero banner + featured stations map.
 * TODO (Member 3): embed a mini solar-index heatmap widget.
 */
export default function HomePage() {
  return (
    <Layout>
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          🌞 SolarSpot
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Discover, submit, and rate solar-powered charging stations across Sri Lanka.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/stations"
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Browse Stations
          </Link>
          <Link
            to="/register"
            className="rounded-md border px-6 py-2 text-sm font-medium"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* TODO (Member 1): <FeaturedStationsSection /> */}
      {/* TODO (Member 3): <SolarIndexOverview /> */}
    </Layout>
  )
}
