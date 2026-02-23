import { useParams } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useGetStationQuery } from '@/features/stations/stationsApi'
import { PermissionGuard } from '@/guards/PermissionGuard'

/**
 * StationDetailPage — single station view with reviews, weather, and actions.
 *
 * TODO (Member 1): implement full station info panel + operator contact.
 * TODO (Member 2): embed <ReviewsList /> and <AddReviewForm /> below the station header.
 * TODO (Member 3): embed <WeatherWidget stationId={id} /> and <BestTimeWidget stationId={id} />.
 * TODO (Member 4): show approve/reject/feature buttons when user has permission.
 */
export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useGetStationQuery(id!)

  const station = data?.data

  return (
    <Layout>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error     && <p className="text-sm text-destructive">Station not found.</p>}

      {station && (
        <>
          <PageHeader
            title={station.name}
            description={station.address.formattedAddress ?? station.address.city}
            actions={
              <>
                <PermissionGuard action="stations.edit-own">
                  {/* TODO (Member 1): <EditStationButton /> */}
                  <button className="rounded border px-3 py-1.5 text-sm">Edit</button>
                </PermissionGuard>
                <PermissionGuard action="stations.approve">
                  {/* TODO (Member 1): <ApproveRejectButtons stationId={id} /> */}
                  <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white">Approve</button>
                </PermissionGuard>
              </>
            }
          />

          {/* TODO (Member 1): <StationInfoGrid station={station} /> */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              Station info — Member 1
            </div>

            {/* TODO (Member 3): <WeatherWidget stationId={id!} /> */}
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              Weather widget — Member 3 (you)
            </div>
          </div>

          {/* TODO (Member 2): <ReviewsSection stationId={id!} /> */}
          <div className="mt-6 rounded-lg border p-4 text-sm text-muted-foreground">
            Reviews section — Member 2
          </div>
        </>
      )}
    </Layout>
  )
}
