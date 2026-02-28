import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sun, MapPin, Zap, BarChart2, ChevronRight, X, RefreshCw, Download } from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { SolarWidget } from '@/features/weather/SolarWidget'
import { ForecastChart } from '@/features/weather/ForecastChart'
import { SolarReportList } from '@/features/weather/SolarReportList'
import { StationAnalyticsPanel } from '@/features/weather/StationAnalyticsPanel'
import { useListStationsQuery } from '@/features/stations/stationsApi'
import { useBulkRefreshMutation } from '@/features/weather/weatherApi'
import { PermissionGuard } from '@/guards/PermissionGuard'
import type { Station } from '@/types/station.types'

//  Station Picker Card 
function StationPickerCard({
  station,
  selected,
  onClick,
}: {
  station: Station
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md ${
        selected
          ? 'border-[#8cc63f] bg-[#f0fdf4] shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{station.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
            <p className="text-xs text-gray-500 truncate">
              {station.address?.city ?? station.address?.street ?? 'Sri Lanka'}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-[#1a6b3c]">
            <Zap className="h-3 w-3" />
            {station.solarPanelKw} kW
          </span>
          {selected && <ChevronRight className="h-3.5 w-3.5 text-[#8cc63f]" />}
        </div>
      </div>
    </button>
  )
}

//  Skeleton 
function StationCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 animate-pulse space-y-2">
      <div className="h-4 w-3/4 rounded bg-gray-100" />
      <div className="h-3 w-1/2 rounded bg-gray-100" />
    </div>
  )
}

//  Page 
export default function WeatherPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const { data: stationsData, isLoading: stationsLoading } = useListStationsQuery({
    search: debouncedSearch || undefined,
    sortBy: 'featured',
    page:   1,
    limit:  12,
  })

  const [bulkRefresh, { isLoading: isRefreshing }] = useBulkRefreshMutation()

  const stations = stationsData?.data ?? []

  return (
    <Layout showSidebar>
      <PageHeader
        title="Solar Intelligence"
        description="Real-time solar output, 5-day forecasts, and community charging reports"
        actions={
          <div className="flex gap-2">
            <PermissionGuard action="weather.bulk-refresh">
              <button
                onClick={() => bulkRefresh({ stationIds: [] })}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh all
              </button>
            </PermissionGuard>
            <PermissionGuard action="weather.export">
              <Link
                to="/api/weather/export?format=csv"
                target="_blank"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Link>
            </PermissionGuard>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

        {/*  Station Picker (left panel)  */}
        <div className="space-y-3">
          <div className="sticky top-4">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stations"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#8cc63f] focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Station list */}
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {stationsLoading
                ? Array.from({ length: 6 }).map((_, i) => <StationCardSkeleton key={i} />)
                : stations.length === 0
                ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    {search ? `No stations matching "${search}"` : 'No stations found'}
                  </p>
                )
                : stations.map((station) => (
                  <StationPickerCard
                    key={station._id}
                    station={station}
                    selected={selectedStation?._id === station._id}
                    onClick={() => setSelectedStation(station)}
                  />
                ))
              }
            </div>
          </div>
        </div>

        {/*  Solar Intel Panel (right)  */}
        <div>
          {!selectedStation ? (
            /* Empty state */
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0fdf4] mb-4">
                <Sun className="h-8 w-8 text-[#8cc63f]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Select a station</h3>
              <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
                Choose a station from the list to view live solar output, forecast, and community reports.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Station header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedStation.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedStation.address?.city ?? selectedStation.address?.street ?? 'Sri Lanka'}
                    {'  '}
                    <Zap className="h-3.5 w-3.5 text-[#8cc63f]" />
                    {selectedStation.solarPanelKw} kW panel
                  </p>
                </div>
                <Link
                  to={`/stations/${selectedStation._id}`}
                  className="text-xs font-medium text-[#1a6b3c] hover:underline flex items-center gap-1"
                >
                  View station <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Live weather + forecast */}
              <div className="grid gap-4 xl:grid-cols-2">
                <SolarWidget stationId={selectedStation._id} />
                <ForecastChart stationId={selectedStation._id} />
              </div>

              {/* Analytics */}
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-medium">
                <BarChart2 className="h-3.5 w-3.5" />
                Station Analytics
              </div>
              <StationAnalyticsPanel stationId={selectedStation._id} />

              {/* Community reports */}
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-medium mt-2">
                <Sun className="h-3.5 w-3.5" />
                Community Reports
              </div>
              <SolarReportList stationId={selectedStation._id} />
            </div>
          )}
        </div>
      </div>

      {/* Attribution  OWM free-tier requires this on any page displaying OWM data */}
      <p className="mt-8 text-center text-xs text-gray-400">
        Solar output estimates and weather data powered by{' '}
        <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          OpenWeatherMap
        </a>
        . Community reports crowdsourced by SolarSpot users.
      </p>
    </Layout>
  )
}
