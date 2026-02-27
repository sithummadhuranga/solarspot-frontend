import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useGetHeatmapQuery } from '@/features/weather/weatherApi'
import { PermissionGuard } from '@/guards/PermissionGuard'

/**
 * WeatherPage — nationwide solar intelligence dashboard (Member 3's page).
 *
 * TODO (Member 3 — you):
 *  - Render SolarIndex heatmap on a Leaflet map using useGetHeatmapQuery data
 *  - Add station selector to show per-station forecast (useGetStationForecastQuery)
 *  - Add "Best Time" panel for selected station (useGetBestTimeQuery)
 *  - Admin: add bulk-refresh trigger button (guarded by weather.bulk-refresh)
 *  - Analyst: add export button (guarded by weather.export)
 */
export default function WeatherPage() {
  const { data: heatmapData, isLoading } = useGetHeatmapQuery()

  return (
    <Layout showSidebar>
      <PageHeader
        title="Solar Weather Intelligence"
        description="Nationwide solar irradiance index and charging forecasts"
        actions={
          <>
            <PermissionGuard action="weather.bulk-refresh">
              {/* TODO (Member 3): <BulkRefreshButton /> */}
              <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Refresh all</button>
            </PermissionGuard>
            <PermissionGuard action="weather.export">
              {/* TODO (Member 3): <ExportButton /> */}
              <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Export CSV</button>
            </PermissionGuard>
          </>
        }
      />

      {/* TODO (Member 3): replace with Leaflet heatmap layer */}
      <div className="h-80 rounded-[20px] border border-gray-100 bg-white shadow-sm flex items-center justify-center text-sm text-muted-foreground">
        {isLoading ? 'Loading heatmap…' : `Heatmap: ${heatmapData?.data.length ?? 0} data points`}
        {' — Leaflet map — Member 3 (you)'}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* TODO (Member 3): <StationForecastPanel /> */}
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm text-sm text-muted-foreground">Station forecast — Member 3</div>
        {/* TODO (Member 3): <BestTimePanel /> */}
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm text-sm text-muted-foreground">Best charging time — Member 3</div>
      </div>
    </Layout>
  )
}
