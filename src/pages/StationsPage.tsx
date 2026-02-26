import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useListStationsQuery } from '@/features/stations/stationsApi'
import { PermissionGuard } from '@/guards/PermissionGuard'

/**
 * StationsPage — paginated list of approved stations with filter sidebar.
 *
 * TODO (Member 1):
 *  - Replace stub card grid with real StationCard components
 *  - Add filter panel (connector type, amenities, radius)
 *  - Add sort controls (rating, distance, newest)
 *  - Wire pagination controls
 *  - Add map toggle (switch to MapPage)
 */
export default function StationsPage() {
  const { data, isLoading, error } = useListStationsQuery({})

  return (
    <Layout showSidebar>
      <PageHeader
        title="Charging Stations"
        description="Find solar-powered charging stations near you"
        actions={
          <PermissionGuard action="stations.create">
            <Link to="/stations/new" className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              + Add Station
            </Link>
          </PermissionGuard>
        }
      />

      {/* TODO (Member 1): replace with real filter + sort panel */}
      <div className="mb-4 flex gap-2 text-sm text-muted-foreground">
        <span>Filters: [connector type] [amenity] [rating] [radius]</span>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading stations…</p>}
      {error     && <p className="text-sm text-destructive">Failed to load stations.</p>}

      {/* TODO (Member 1): replace with <StationCard station={station} /> grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((station) => (
          <div key={station._id} className="rounded-lg border p-4">
            <p className="font-medium">{station.name}</p>
            <p className="text-sm text-muted-foreground">{station.address.city}</p>
            <p className="text-sm">⭐ {station.averageRating.toFixed(1)}</p>
            <Link to={`/stations/${station._id}`} className="mt-2 block text-sm underline">
              View details →
            </Link>
          </div>
        ))}
      </div>

      {/* TODO (Member 1): <Pagination /> component */}
    </Layout>
  )
}
