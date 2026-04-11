import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ChevronRight,
  Download,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  Sun,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { ForecastChart } from '@/features/weather/ForecastChart'
import { SolarReportList } from '@/features/weather/SolarReportList'
import { SolarWidget } from '@/features/weather/SolarWidget'
import { StationAnalyticsPanel } from '@/features/weather/StationAnalyticsPanel'
import { useGetSolarReportsQuery } from '@/features/weather/solarApi'
import { useBulkRefreshMutation, useExportWeatherMutation } from '@/features/weather/weatherApi'
import { useStationsList } from '@/hooks/useStations'
import { getApiErrorMessage } from '@/lib/errors'
import type { Station } from '@/types/station.types'

function downloadExport(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = href
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(href)
}

function StationPickerCard({ station, selected, onClick }: {
  station: Station
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-[#8cc63f]/50 bg-[#f4faea] shadow-sm'
          : 'border-gray-200 bg-white hover:border-[#8cc63f]/35 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#133c1d]">{station.name}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{station.address?.city ?? station.address?.street ?? 'Sri Lanka'}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
            <Zap className="h-3 w-3" />
            {station.solarPanelKw} kW
          </span>
        </div>
      </div>
    </button>
  )
}

function SummaryCard({ icon, label, value, tone }: {
  icon: React.ReactNode
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className={`text-3xl font-black tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}

export default function AdminSolarAnalyticsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const { data: stationsData, isLoading: stationsLoading } = useStationsList({
    search: debouncedSearch || undefined,
    sortBy: 'featured',
    page: 1,
    limit: 12,
  })

  const stations = useMemo(() => stationsData?.data ?? [], [stationsData?.data])
  const selectedStation = useMemo(
    () => stations.find((station) => station._id === selectedStationId) ?? stations[0] ?? null,
    [selectedStationId, stations]
  )

  const [bulkRefresh, { isLoading: isRefreshing }] = useBulkRefreshMutation()
  const [exportWeather, { isLoading: isExporting }] = useExportWeatherMutation()

  const totalPublishedReports = useGetSolarReportsQuery({ status: 'published', limit: 1 })
  const totalArchivedReports = useGetSolarReportsQuery({ status: 'archived', limit: 1 })
  const selectedStationReports = useGetSolarReportsQuery(
    { stationId: selectedStation?._id, limit: 1, sort: 'newest' },
    { skip: !selectedStation?._id }
  )

  const handleRefresh = async (stationIds?: string[]) => {
    try {
      const result = await bulkRefresh({ stationIds, force: Boolean(stationIds?.length) }).unwrap()
      toast.success(`Weather refresh completed: ${result.data.refreshed} refreshed, ${result.data.failed} failed.`)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Could not refresh solar weather data.'))
    }
  }

  const handleExport = async () => {
    try {
      const result = await exportWeather({
        format: 'csv',
        stationId: selectedStation?._id,
      }).unwrap()

      downloadExport(result.blob, result.filename)
      toast.success(selectedStation ? 'Selected station export downloaded.' : 'Solar weather export downloaded.')
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Could not export solar weather data.'))
    }
  }

  return (
    <Layout showSidebar>
      <PageHeader
        title="Solar Analytics Control"
        description="Operator view for solar intelligence, weather refresh, exports, and station-level analytics."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleRefresh(selectedStation ? [selectedStation._id] : undefined)}
              disabled={isRefreshing || !selectedStation}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh selected
            </button>
            <button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Activity className="h-3.5 w-3.5" />
              Refresh all
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <Link
              to="/admin/solar/reports"
              className="flex items-center gap-1.5 rounded-lg bg-[#133c1d] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3117]"
            >
              <Shield className="h-3.5 w-3.5" />
              Review Reports
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Sun className="h-4 w-4 text-amber-500" />}
          label="Stations In View"
          value={stationsData?.pagination.total ?? stations.length}
          tone="text-[#133c1d]"
        />
        <SummaryCard
          icon={<FileText className="h-4 w-4 text-emerald-500" />}
          label="Published Reports"
          value={totalPublishedReports.data?.pagination.total ?? 0}
          tone="text-emerald-700"
        />
        <SummaryCard
          icon={<Shield className="h-4 w-4 text-amber-500" />}
          label="Archived Reports"
          value={totalArchivedReports.data?.pagination.total ?? 0}
          tone="text-amber-700"
        />
        <SummaryCard
          icon={<Zap className="h-4 w-4 text-sky-500" />}
          label="Selected Station Reports"
          value={selectedStationReports.data?.pagination.total ?? 0}
          tone="text-sky-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Station Control</p>
                <p className="text-sm text-gray-500">Choose a station to inspect live solar intelligence.</p>
              </div>
              <span className="rounded-full bg-[#f4faea] px-2.5 py-1 text-[11px] font-semibold text-[#133c1d]">
                {stations.length} loaded
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stations"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#8cc63f] focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/25"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {stationsLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                ))
              ) : stations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  No stations matched the current search.
                </div>
              ) : (
                stations.map((station) => (
                  <StationPickerCard
                    key={station._id}
                    station={station}
                    selected={selectedStation?._id === station._id}
                    onClick={() => setSelectedStationId(station._id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          {!selectedStation ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4faea]">
                <Sun className="h-8 w-8 text-[#8cc63f]" />
              </div>
              <h2 className="text-base font-bold text-[#133c1d]">Select a station</h2>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Pick a station from the left to inspect live weather, forecast windows, analytics, and public report activity.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      <Shield className="h-3.5 w-3.5 text-[#8cc63f]" />
                      Solar Operations Station View
                    </div>
                    <h2 className="mt-2 text-xl font-black text-[#133c1d]">{selectedStation.name}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedStation.address?.city ?? selectedStation.address?.street ?? 'Sri Lanka'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <Zap className="h-3 w-3" />
                        {selectedStation.solarPanelKw} kW array
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/stations/${selectedStation._id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#133c1d] transition-colors hover:text-[#0f3117]"
                  >
                    Open station detail
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <SolarWidget stationId={selectedStation._id} />
                <ForecastChart stationId={selectedStation._id} />
              </div>

              <StationAnalyticsPanel stationId={selectedStation._id} />

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Public Report Feed</p>
                    <p className="text-sm text-gray-500">Review the latest community solar observations for the selected station.</p>
                  </div>
                  <Link
                    to="/admin/solar/reports"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Moderate reports
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <SolarReportList stationId={selectedStation._id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
