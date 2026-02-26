import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  Zap, MapPin, Star, LayoutGrid, List, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StationCard } from '@/components/stations/StationCard'
import { Navbar } from '@/components/shared/Navbar'
import { useStationsList } from '@/hooks/useStations'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { CONNECTOR_TYPES } from '@/lib/constants'
import type { ConnectorType, StationQueryParams } from '@/types/station.types'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'rating',   label: 'Top Rated' },
  { value: 'newest',   label: 'Newest' },
  { value: 'distance', label: 'Nearest' },
] as const

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-100" />
          <div className="h-6 w-16 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

export default function StationsPage() {
  const { isAuthenticated } = useAuth()
  const [search,        setSearch]        = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [connectorType, setConnectorType] = useState<ConnectorType | undefined>()
  const [minRating,     setMinRating]     = useState<number | undefined>()
  const [isVerified,    setIsVerified]    = useState<boolean | undefined>()
  const [sortBy,        setSortBy]        = useState<StationQueryParams['sortBy']>('featured')
  const [page,          setPage]          = useState(1)
  const [viewMode,      setViewMode]      = useState<'grid' | 'list'>('grid')
  const [filtersOpen,   setFiltersOpen]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const params: StationQueryParams = {
    search:        debouncedSearch || undefined,
    connectorType: connectorType,
    minRating:     minRating,
    isVerified:    isVerified,
    sortBy:        sortBy,
    page,
    limit: 12,
  }

  const { data, isLoading } = useStationsList(params)
  const stations   = data?.data ?? []
  const pagination = data?.pagination

  const activeFiltersCount = [connectorType, minRating, isVerified].filter(Boolean).length

  function clearFilters() {
    setConnectorType(undefined)
    setMinRating(undefined)
    setIsVerified(undefined)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-solar-green-800 via-solar-green-700 to-solar-green-600">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #86efac 0%, transparent 60%), radial-gradient(circle at 80% 20%, #4ade80 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Charging Stations
              </h1>
              <p className="mt-1 text-solar-green-200 text-sm sm:text-base">
                {pagination
                  ? `${pagination.total} solar-powered stations across Sri Lanka`
                  : 'Discover solar-powered EV charging near you'}
              </p>
            </div>
            {isAuthenticated && (
              <Link
                to="/stations/new"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-solar-green-700 shadow-sm hover:bg-solar-green-50 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Station
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, or connector…"
                className="w-full rounded-xl border-0 bg-white/95 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as StationQueryParams['sortBy']); setPage(1) }}
                className="rounded-xl border-0 bg-white/95 px-3 py-3 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Filter toggle */}
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-medium shadow-sm transition-colors',
                  filtersOpen || activeFiltersCount > 0
                    ? 'bg-solar-green-900 text-white'
                    : 'bg-white/95 text-gray-700 hover:bg-white'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="flex rounded-xl bg-white/95 shadow-sm overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('px-3 py-3 text-gray-500 hover:text-gray-700 transition-colors',
                    viewMode === 'grid' && 'bg-solar-green-600 text-white'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('px-3 py-3 text-gray-500 hover:text-gray-700 transition-colors',
                    viewMode === 'list' && 'bg-solar-green-600 text-white'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Panel ─────────────────────────────────────────────────── */}
      {filtersOpen && (
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <div className="flex flex-wrap items-start gap-6">

              {/* Connector type */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Connector Type
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setConnectorType(undefined); setPage(1) }}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                      !connectorType
                        ? 'bg-solar-green-600 border-solar-green-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-solar-green-300 hover:text-solar-green-700'
                    )}
                  >
                    All
                  </button>
                  {CONNECTOR_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setConnectorType(t as ConnectorType); setPage(1) }}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                        connectorType === t
                          ? 'bg-solar-green-600 border-solar-green-600 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-solar-green-300 hover:text-solar-green-700'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Min Rating
                </p>
                <div className="flex gap-1.5">
                  {[undefined, 3, 4, 5].map((r) => (
                    <button
                      key={r ?? 'any'}
                      onClick={() => { setMinRating(r); setPage(1) }}
                      className={cn(
                        'flex items-center gap-0.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                        minRating === r
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700'
                      )}
                    >
                      {r === undefined ? 'Any' : <><Star className="h-3 w-3 fill-current" /> {r}+</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Verified Only
                </p>
                <button
                  onClick={() => { setIsVerified(isVerified ? undefined : true); setPage(1) }}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                    isVerified
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                  )}
                >
                  ✓ Verified
                </button>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter chips ──────────────────────────────────────────── */}
      {activeFiltersCount > 0 && !filtersOpen && (
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 lg:px-8">
            <span className="text-xs text-gray-400">Active:</span>
            {connectorType && (
              <span className="inline-flex items-center gap-1 rounded-full bg-solar-green-50 border border-solar-green-200 px-2.5 py-0.5 text-xs font-medium text-solar-green-700">
                <Zap className="h-3 w-3" /> {connectorType}
                <button onClick={() => { setConnectorType(undefined); setPage(1) }} className="ml-0.5 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {minRating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <Star className="h-3 w-3 fill-current" /> {minRating}+
                <button onClick={() => { setMinRating(undefined); setPage(1) }} className="ml-0.5 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                ✓ Verified
                <button onClick={() => { setIsVerified(undefined); setPage(1) }} className="ml-0.5 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">

        {/* Loading skeletons */}
        {isLoading && (
          <div className={cn(
            'grid gap-5',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-3xl'
          )}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && stations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-solar-green-50 mb-4">
              <MapPin className="h-9 w-9 text-solar-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No stations found</h3>
            <p className="mt-1.5 text-sm text-gray-500 max-w-sm">
              Try adjusting your search terms or removing some filters to see more results.
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} variant="outline" className="mt-4 gap-2">
                <X className="h-4 w-4" /> Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Station grid / list */}
        {!isLoading && stations.length > 0 && (
          <>
            <div className={cn(
              'grid gap-5',
              viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-3xl'
            )}>
              {stations.map((station) => (
                <StationCard key={station._id} station={station} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-solar-green-400 hover:text-solar-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === 'ellipsis' ? (
                        <span key={`e${i}`} className="px-1 text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors border',
                            page === p
                              ? 'bg-solar-green-600 border-solar-green-600 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-solar-green-400 hover:text-solar-green-600'
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-solar-green-400 hover:text-solar-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
