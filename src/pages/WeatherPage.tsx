import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sun, MapPin, Zap, BarChart2, ChevronRight, X, RefreshCw, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { SolarWidget } from '@/features/weather/SolarWidget'
import { ForecastChart } from '@/features/weather/ForecastChart'
import { SolarReportList } from '@/features/weather/SolarReportList'
import { StationAnalyticsPanel } from '@/features/weather/StationAnalyticsPanel'
import { useStationsList } from '@/hooks/useStations'
import { useBulkRefreshMutation, useExportWeatherMutation } from '@/features/weather/weatherApi'
import { BackendPermissionGuard } from '@/guards/BackendPermissionGuard'
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
          ? 'border-[#8cc63f] bg-solar-green-50 shadow-md'
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

function StationCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 animate-pulse space-y-2">
      <div className="h-4 w-3/4 rounded bg-gray-100" />
      <div className="h-3 w-1/2 rounded bg-gray-100" />
    </div>
  )
}

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

  const { data: stationsData, isLoading: stationsLoading } = useStationsList({
    search: debouncedSearch || undefined,
    sortBy: 'featured',
    page:   1,
    limit:  12,
  })

  const [bulkRefresh, { isLoading: isRefreshing }] = useBulkRefreshMutation()
  const [exportWeather, { isLoading: isExporting }] = useExportWeatherMutation()

  const stations = stationsData?.data ?? []

  const handleRefreshAll = async () => {
    try {
      const result = await bulkRefresh({ stationIds: [] }).unwrap()
      toast.success(`Weather cache refreshed for ${result.data.refreshed} station${result.data.refreshed === 1 ? '' : 's'}.`)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Could not refresh weather data.'))
    }
  }

  const handleExport = async () => {
    try {
      const result = await exportWeather({
        format: 'csv',
        stationId: selectedStation?._id,
      }).unwrap()

      downloadExport(result.blob, result.filename)
      toast.success(selectedStation ? 'Station weather export downloaded.' : 'Weather export downloaded.')
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Could not export weather data.'))
    }
  }

  return (
    <Layout showSidebar>
      <PageHeader
        title="Solar Intelligence"
        description="Real-time solar output, 5-day forecasts, and community charging reports"
        actions={
          <div className="flex gap-2">
            <BackendPermissionGuard action="weather.bulk-refresh">
              <button
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh all
              </button>
            </BackendPermissionGuard>
            <BackendPermissionGuard action="weather.export">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                {isExporting ? 'Exporting…' : selectedStation ? 'Export Station CSV' : 'Export CSV'}
              </button>
            </BackendPermissionGuard>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

        <div className="space-y-3">
          <div className="sticky top-4">
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

        <div>
          {!selectedStation ? (
            
            <div className="flex h-full min-h-100 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-solar-green-50">
                <Sun className="h-8 w-8 text-[#8cc63f]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Select a station</h3>
              <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
                Choose a station from the list to view live solar output, forecast, and community reports.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
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

              <div className="grid gap-4 xl:grid-cols-2">
                <SolarWidget stationId={selectedStation._id} />
                <ForecastChart stationId={selectedStation._id} />
              </div>

              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-medium">
                <BarChart2 className="h-3.5 w-3.5" />
                Station Analytics
              </div>
              <StationAnalyticsPanel stationId={selectedStation._id} />

              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-medium mt-2">
                <Sun className="h-3.5 w-3.5" />
                Community Reports
              </div>
              <SolarReportList stationId={selectedStation._id} />
            </div>
          )}
        </div>
      </div>

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
