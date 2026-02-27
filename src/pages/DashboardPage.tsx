import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/hooks/useAuth'

/**
 * DashboardPage — authenticated user's home hub.
 *
 * TODO (Member 4): show user stats summary (stations submitted, reviews written).
 * TODO (Member 1): embed "My Stations" quick list.
 * TODO (Member 2): embed "My Recent Reviews" list.
 * TODO (Member 3): embed current solar index widget for user's location.
 */
export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <Layout showSidebar>
      <PageHeader
        title={`Welcome back, ${user?.displayName ?? 'Explorer'}`}
        description="Here's an overview of your activity on SolarSpot."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* TODO (Member 1): <StationsSummaryCard /> */}
        {/* TODO (Member 2): <ReviewsSummaryCard /> */}
        {/* TODO (Member 3): <SolarIndexCard /> */}
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 text-sm font-medium text-gray-500 shadow-sm">
          Stations placeholder — Member 1
        </div>
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 text-sm font-medium text-gray-500 shadow-sm">
          Reviews placeholder — Member 2
        </div>
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 text-sm font-medium text-gray-500 shadow-sm">
          Solar index placeholder — Member 3 (you)
        </div>
      </div>
    </Layout>
  )
}
