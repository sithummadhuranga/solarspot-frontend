import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, SlidersHorizontal, X, Plus, Star, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StationCard } from '@/components/stations/StationCard'
import { ConnectorBadge } from '@/components/stations/ConnectorBadge'
import { StationFormModal } from '@/components/stations/StationFormModal'
import { useStationsList, useNearbyStations } from '@/hooks/useStations'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, DEFAULT_SEARCH_RADIUS_KM, CONNECTOR_TYPES } from '@/lib/constants'
import type { ConnectorType, NearbyStation } from '@/types/station.types'
import type { StationQueryParams } from '@/types/station.types'

// ─── Custom station marker icons ─────────────────────────────────────────────

function makeStationIcon(verified: boolean) {
  const color = verified ? '#16a34a' : '#d97706'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24S32 27 32 16C32 7.163 24.837 0 16 0z"
            fill="${color}" opacity="0.9"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <path d="M16 11l1.5 4h4l-3.2 2.4 1.2 4L16 19l-3.5 2.4 1.2-4L10.5 15h4z"
            fill="${color}"/>
    </svg>`
  return L.divIcon({
    html: svg,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: '',
  })
}

// ─── Map event listener — updates parent when map moves ──────────────────────

interface MapEventsProps {
  onMove: (lat: number, lng: number, radiusKm: number) => void
}

function MapEvents({ onMove }: MapEventsProps) {
  const map = useMapEvents({
    moveend() {
      const centre = map.getCenter()
      const bounds = map.getBounds()
      const ne     = bounds.getNorthEast()
      // Approximate radius = half the diagonal distance
      const diagonalKm = centre.distanceTo(ne) / 1000
      onMove(centre.lat, centre.lng, Math.min(diagonalKm, 50))
    },
  })
  return null
}

// ─── Star rating display ──────────────────────────────────────────────────────

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600">{value.toFixed(1)}</span>
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StationMapPage() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formOpen,    setFormOpen]    = useState(false)

  // Map state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_MAP_CENTER[0],
    lng: DEFAULT_MAP_CENTER[1],
  })
  const [mapRadius, setMapRadius] = useState(DEFAULT_SEARCH_RADIUS_KM)

  // Filter / search state
  const [searchInput,     setSearchInput]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [connectorTypes,  setConnectorTypes]  = useState<ConnectorType[]>([])
  const [minRating,       setMinRating]       = useState(0)
  const [isVerified,      setIsVerified]      = useState<boolean | undefined>(undefined)
  const [sortBy,          setSortBy]          = useState<StationQueryParams['sortBy']>('distance')
  const [page,            setPage]            = useState(1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setMapCenter({ lat: coords.latitude, lng: coords.longitude }),
      () => { /* silently fall back to Colombo */ }
    )
  }, [])

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  const handleMapMove = useCallback((lat: number, lng: number, radius: number) => {
    setMapCenter({ lat, lng })
    setMapRadius(radius)
    setPage(1)
  }, [])

  // Build query params
  const listParams: StationQueryParams = {
    search:        debouncedSearch || undefined,
    connectorType: connectorTypes.length === 1 ? connectorTypes[0] : undefined,
    minRating:     minRating > 0 ? minRating : undefined,
    isVerified,
    sortBy,
    page,
    limit:         10,
    lat:           mapCenter.lat,
    lng:           mapCenter.lng,
    radius:        mapRadius,
  }

  const { data: listData, isLoading: listLoading } = useStationsList(listParams)
  const { data: nearbyData } = useNearbyStations({
    lat:    mapCenter.lat,
    lng:    mapCenter.lng,
    radius: mapRadius,
    limit:  50,
  })

  const stations      = listData?.data ?? []
  const pagination    = listData?.pagination
  const nearbyStations: NearbyStation[] = nearbyData?.data ?? []

  function toggleConnector(type: ConnectorType) {
    setConnectorTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setPage(1)
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gray-50">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside
        className={`relative z-10 flex flex-col bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-80 min-w-[20rem]' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-base font-bold text-gray-900">⚡ SolarSpot</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search stations…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Connector type filter chips */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Connector types
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CONNECTOR_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleConnector(type as ConnectorType)}
                  className="focus:outline-none"
                >
                  <ConnectorBadge
                    type={type as ConnectorType}
                    size="sm"
                    className={
                      connectorTypes.includes(type as ConnectorType)
                        ? 'ring-2 ring-green-500'
                        : 'opacity-60'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Min rating */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Min rating: <span className="text-green-600 font-bold">{minRating > 0 ? `${minRating}★` : 'Any'}</span>
            </p>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1) }}
              className="w-full accent-green-600"
            />
          </div>

          {/* Verified toggle */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="flex items-center gap-1.5 text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Verified only
            </span>
            <input
              type="checkbox"
              checked={isVerified === true}
              onChange={(e) => {
                setIsVerified(e.target.checked ? true : undefined)
                setPage(1)
              }}
              className="h-4 w-4 accent-green-600"
            />
          </label>

          {/* Sort */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Sort by</p>
            <div className="flex flex-wrap gap-1.5">
              {(['nearest', 'rating', 'newest', 'featured'] as const).map((opt) => {
                // map display label
                const labels: Record<string, string> = { nearest: 'Nearest', rating: 'Rating', newest: 'Newest', featured: 'Featured' }
                const apiVal = opt === 'nearest' ? 'distance' : opt
                const active = sortBy === apiVal
                return (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(apiVal as StationQueryParams['sortBy']); setPage(1) }}
                    className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {labels[opt]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Station list */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Stations{pagination ? ` (${pagination.total})` : ''}
            </p>
            {listLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : stations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No stations found</p>
            ) : (
              <div className="space-y-3">
                {stations.map((s) => (
                  <StationCard key={s._id} station={s} className="shadow-none border-gray-100" />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-gray-500">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Map ────────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        {/* Toggle sidebar button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-[1000] rounded-lg bg-white px-3 py-2 shadow-md text-sm font-medium flex items-center gap-1.5 text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        )}

        {/* Submit station FAB */}
        {isAuthenticated && (
          <Button
            onClick={() => setFormOpen(true)}
            className="absolute bottom-8 right-8 z-[1000] shadow-lg rounded-full"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Station
          </Button>
        )}

        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={DEFAULT_MAP_ZOOM}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents onMove={handleMapMove} />

          {nearbyStations.map((station) => {
            const [lng, lat] = station.location.coordinates
            return (
              <Marker
                key={station._id}
                position={[lat, lng]}
                icon={makeStationIcon(station.isVerified)}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-2">
                    <div className="font-semibold text-gray-900">{station.name}</div>
                    <div className="text-xs text-gray-500">
                      {station.address?.city ?? ''}
                    </div>
                    <StarRating value={station.averageRating} />
                    <div className="text-xs text-green-600 font-medium">
                      {station.distanceKm.toFixed(1)} km away
                    </div>
                    <Link
                      to={`/stations/${station._id}`}
                      className="mt-1 block rounded-md bg-green-600 px-3 py-1.5 text-center text-xs text-white font-medium hover:bg-green-700"
                    >
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Station form modal */}
      <StationFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
