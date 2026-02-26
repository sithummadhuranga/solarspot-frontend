import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Search, SlidersHorizontal, X, Plus, Star, CheckCircle,
  MapPin, Zap, Sun, ChevronLeft, ChevronRight, Layers, Navigation2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStationsList, useNearbyStations } from '@/hooks/useStations'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, DEFAULT_SEARCH_RADIUS_KM, CONNECTOR_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ConnectorType, NearbyStation, StationQueryParams } from '@/types/station.types'

// ─── Marker icons ─────────────────────────────────────────────────────────────

function makeStationIcon(verified: boolean, featured = false) {
  const color = featured ? '#b45309' : verified ? '#1a6b3c' : '#6b7280'
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
      <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter>
      <path d="M17 0C8.163 0 1 7.163 1 16c0 11 16 26 16 26S33 27 33 16C33 7.163 25.837 0 17 0z"
            fill="${color}" filter="url(#sh)"/>
      <circle cx="17" cy="16" r="8" fill="white"/>
      <circle cx="17" cy="16" r="4.5" fill="${color}"/>
    </svg>`,
    iconSize: [34, 42], iconAnchor: [17, 42], popupAnchor: [0, -44], className: '',
  })
}

// ─── Map events ───────────────────────────────────────────────────────────────

function MapEvents({ onMove }: { onMove: (lat: number, lng: number, r: number) => void }) {
  const map = useMapEvents({
    moveend() {
      const c = map.getCenter()
      const r = Math.min(c.distanceTo(map.getBounds().getNorthEast()) / 1000, 50)
      onMove(c.lat, c.lng, r)
    },
  })
  return null
}

// ─── Sidebar mini-card ────────────────────────────────────────────────────────

function SidebarStationRow({ station }: { station: NearbyStation }) {
  const city = station.address?.city ?? station.address?.district ?? ''
  return (
    <Link
      to={`/stations/${station._id}`}
      className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:border-solar-green-200 hover:shadow-md transition-all duration-200"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-solar-green-50 to-emerald-100">
        {station.images.length > 0 ? (
          <img src={station.images[0]} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Zap className="h-6 w-6 text-solar-green-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-solar-green-700 transition-colors">
          {station.name}
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{city}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('h-2.5 w-2.5',
                i < Math.round(station.averageRating)
                  ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
              )} />
            ))}
          </div>
          <span className="rounded-full bg-solar-green-50 px-2 py-0.5 text-[10px] font-semibold text-solar-green-600">
            {station.distanceKm.toFixed(1)} km
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Map popup ────────────────────────────────────────────────────────────────

function PopupCard({ station }: { station: NearbyStation }) {
  return (
    <div className="w-52 space-y-2 py-0.5">
      {station.images.length > 0 && (
        <div className="-mx-3 -mt-1 mb-2 h-24 overflow-hidden rounded-t-lg">
          <img src={station.images[0]} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="space-y-1.5">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{station.name}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {station.address?.city ?? ''}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('h-3 w-3',
                i < Math.round(station.averageRating)
                  ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
              )} />
            ))}
            <span className="ml-1 text-xs text-gray-500">{station.averageRating.toFixed(1)}</span>
          </div>
          {station.isVerified && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <CheckCircle className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-solar-green-500" />
            {station.connectors.length} connector{station.connectors.length !== 1 ? 's' : ''}
          </span>
          {station.solarPanelKw > 0 && (
            <span className="flex items-center gap-1">
              <Sun className="h-3 w-3 text-amber-500" /> {station.solarPanelKw} kWp
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-solar-green-700">{station.distanceKm.toFixed(1)} km away</p>
        <Link
          to={`/stations/${station._id}`}
          className="flex w-full items-center justify-center rounded-lg bg-solar-green-600 py-2 text-xs font-semibold text-white hover:bg-solar-green-700 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StationMapPage() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen,   setSidebarOpen]   = useState(true)
  const [filtersOpen,   setFiltersOpen]   = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1],
  })
  const [mapRadius, setMapRadius] = useState(DEFAULT_SEARCH_RADIUS_KM)
  const [searchInput,     setSearchInput]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [connectorFilter, setConnectorFilter] = useState<ConnectorType | undefined>()
  const [minRating,       setMinRating]       = useState(0)
  const [isVerified,      setIsVerified]      = useState<boolean | undefined>()
  const [sortBy,          setSortBy]          = useState<StationQueryParams['sortBy']>('distance')
  const [page,            setPage]            = useState(1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setMapCenter({ lat: coords.latitude, lng: coords.longitude }),
      () => {},
    )
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(searchInput); setPage(1) }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput])

  const handleMapMove = useCallback((lat: number, lng: number, radius: number) => {
    setMapCenter({ lat, lng }); setMapRadius(radius); setPage(1)
  }, [])

  const listParams: StationQueryParams = {
    search: debouncedSearch || undefined,
    connectorType: connectorFilter,
    minRating: minRating > 0 ? minRating : undefined,
    isVerified, sortBy, page, limit: 10,
    lat: mapCenter.lat, lng: mapCenter.lng, radius: mapRadius,
  }

  const { data: listData, isLoading: listLoading } = useStationsList(listParams)
  const { data: nearbyData } = useNearbyStations({
    lat: mapCenter.lat, lng: mapCenter.lng, radius: mapRadius, limit: 100,
  })

  const stations: NearbyStation[]       = (listData?.data ?? []) as NearbyStation[]
  const pagination                       = listData?.pagination
  const nearbyStations: NearbyStation[] = nearbyData?.data ?? []
  const activeFilters = [connectorFilter, minRating > 0 ? minRating : undefined, isVerified].filter(Boolean).length

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="relative z-[1001] flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
        <Link to="/" className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-solar-green-600">
            <Sun className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">SolarSpot</span>
          <span className="ml-1 rounded-full bg-solar-green-50 px-2 py-0.5 text-[10px] font-semibold text-solar-green-700">Map</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/stations"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Layers className="h-3.5 w-3.5" /> List View
          </Link>
          {isAuthenticated && (
            <Link to="/stations/new"
              className="flex items-center gap-1.5 rounded-lg bg-solar-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-solar-green-700 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Station
            </Link>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <aside className={cn(
          'relative z-10 flex flex-col overflow-hidden bg-white shadow-xl transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-80 min-w-[20rem]' : 'w-0'
        )}>

          {/* Sidebar header */}
          <div className="shrink-0 bg-gradient-to-br from-solar-green-700 to-solar-green-600 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-white">Find Stations</p>
                <p className="text-xs text-solar-green-200">
                  {pagination ? `${pagination.total} near you` : 'Searching…'}
                </p>
              </div>
              <button onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-solar-green-800/40 text-white hover:bg-solar-green-800/80 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text" value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search stations…"
                className="w-full rounded-xl border-0 bg-white/95 py-2.5 pl-9 pr-8 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters toggle */}
          <div className="shrink-0 border-b border-gray-100 bg-gray-50 px-3 py-2">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filtersOpen ? 'bg-solar-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-solar-green-300'
              )}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilters > 0 && (
                <span className={cn('ml-auto flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                  filtersOpen ? 'bg-white text-solar-green-600' : 'bg-solar-green-600 text-white')}>
                  {activeFilters}
                </span>
              )}
            </button>

            {filtersOpen && (
              <div className="mt-2 space-y-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                {/* Connector */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Connector</p>
                  <div className="flex flex-wrap gap-1">
                    <button onClick={() => { setConnectorFilter(undefined); setPage(1) }}
                      className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                        !connectorFilter ? 'bg-solar-green-600 border-solar-green-600 text-white' : 'border-gray-200 text-gray-500 hover:border-solar-green-300')}>
                      All
                    </button>
                    {CONNECTOR_TYPES.map((t) => (
                      <button key={t}
                        onClick={() => { setConnectorFilter(t === connectorFilter ? undefined : t as ConnectorType); setPage(1) }}
                        className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                          connectorFilter === t ? 'bg-solar-green-600 border-solar-green-600 text-white' : 'border-gray-200 text-gray-500 hover:border-solar-green-300')}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Min Rating {minRating > 0 && <span className="text-amber-500">({minRating}★+)</span>}
                  </p>
                  <input type="range" min={0} max={5} step={0.5} value={minRating}
                    onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1) }}
                    className="w-full accent-solar-green-600" />
                </div>

                {/* Sort + Verified */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sort</p>
                    <div className="flex gap-1 flex-wrap">
                      {([['distance','Near'],['rating','Top'],['newest','New'],['featured','Hot']] as const).map(([val, label]) => (
                        <button key={val}
                          onClick={() => { setSortBy(val as StationQueryParams['sortBy']); setPage(1) }}
                          className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            sortBy === val ? 'bg-solar-green-600 border-solar-green-600 text-white' : 'border-gray-200 text-gray-500')}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Verified</p>
                    <div onClick={() => { setIsVerified(isVerified ? undefined : true); setPage(1) }}
                      className={cn('relative h-5 w-9 cursor-pointer rounded-full transition-colors',
                        isVerified ? 'bg-solar-green-600' : 'bg-gray-200')}>
                      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                        isVerified ? 'left-4' : 'left-0.5')} />
                    </div>
                  </div>
                </div>

                {activeFilters > 0 && (
                  <button
                    onClick={() => { setConnectorFilter(undefined); setMinRating(0); setIsVerified(undefined); setPage(1) }}
                    className="flex w-full items-center justify-center gap-1 rounded-lg py-1 text-xs text-red-500 hover:bg-red-50 transition-colors">
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Station list */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {listLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 animate-pulse">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-3/4 rounded bg-gray-100" />
                      <div className="h-2.5 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="mb-2 h-8 w-8 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">No stations found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting filters or moving the map</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stations.map((s) => (
                  <SidebarStationRow key={s._id} station={s} />
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <button disabled={!pagination.hasPrev} onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-40 hover:border-solar-green-300 transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <span className="text-xs text-gray-400">{page} / {pagination.totalPages}</span>
                <button disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-40 hover:border-solar-green-300 transition-colors">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Map ──────────────────────────────────────────────────── */}
        <div className="relative flex-1">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}
              className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-lg hover:border-solar-green-300 transition-all">
              <SlidersHorizontal className="h-4 w-4 text-solar-green-600" />
              Stations
              {pagination && (
                <span className="rounded-full bg-solar-green-600 px-1.5 py-0.5 text-[10px] text-white font-bold">
                  {pagination.total}
                </span>
              )}
            </button>
          )}

          {/* My location */}
          <button
            onClick={() => navigator.geolocation?.getCurrentPosition(
              ({ coords }) => setMapCenter({ lat: coords.latitude, lng: coords.longitude })
            )}
            className="absolute bottom-24 right-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-solar-green-600 shadow-lg hover:border-solar-green-300 hover:shadow-xl transition-all"
            title="My location">
            <Navigation2 className="h-4 w-4" />
          </button>

          {/* Add station FAB */}
          {isAuthenticated && (
            <Link to="/stations/new"
              className="absolute bottom-8 right-4 z-[1000] flex items-center gap-2 rounded-2xl bg-solar-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-solar-green-700 hover:shadow-xl transition-all">
              <Plus className="h-4 w-4" /> Add Station
            </Link>
          )}

          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={DEFAULT_MAP_ZOOM}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onMove={handleMapMove} />

            {nearbyStations.map((station) => {
              const [lng, lat] = station.location.coordinates
              return (
                <Marker key={station._id} position={[lat, lng]}
                  icon={makeStationIcon(station.isVerified, station.isFeatured)}>
                  <Popup className="station-popup" maxWidth={220}>
                    <PopupCard station={station} />
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </div>

      <style>{`
        .station-popup .leaflet-popup-content-wrapper {
          border-radius:14px; padding:0; overflow:hidden;
          box-shadow:0 8px 30px rgba(0,0,0,0.14); border:1px solid #e5e7eb;
        }
        .station-popup .leaflet-popup-content { margin:12px; min-width:0 }
        .station-popup .leaflet-popup-tip { background:white }
        .leaflet-control-zoom { border:none !important; box-shadow:0 2px 8px rgba(0,0,0,0.12) !important }
        .leaflet-control-zoom a { border-radius:8px !important; color:#374151 !important }
        .leaflet-control-zoom a:hover { background:#f0fdf4 !important; color:#1a6b3c !important }
      `}</style>
    </div>
  )
}
