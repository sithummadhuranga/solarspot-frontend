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
      <div className="relative overflow-hidden bg-[#8cc63f]">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #97cf42 0%, transparent 60%), radial-gradient(circle at 80% 20%, #a2d94d 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#133c1d] sm:text-4xl font-sg">
                Charging Stations
              </h1>
              <p className="mt-2 text-[#133c1d]/80 text-sm sm:text-base font-medium">
                {pagination
                  ? `${pagination.total} solar-powered stations across Sri Lanka`
                  : 'Discover solar-powered EV charging near you'}
              </p>
            </div>
            {isAuthenticated && (
              <Link
                to="/stations/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-black transition-colors shrink-0 font-sg"
              >
                <Plus className="h-4 w-4" /> Add Station
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, or connector…"
                className="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-[#133c1d]/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as StationQueryParams['sortBy']); setPage(1) }}
                className="rounded-xl border-0 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-[#133c1d]/20 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Filter toggle */}
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium shadow-md transition-colors',
                  filtersOpen || activeFiltersCount > 0
                    ? 'bg-[#133c1d] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8cc63f] text-[10px] font-bold text-[#133c1d]">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="flex rounded-xl bg-white shadow-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('px-3.5 py-3.5 text-gray-500 hover:text-gray-700 transition-colors',
                    viewMode === 'grid' && 'bg-[#133c1d] text-white hover:text-white'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('px-3.5 py-3.5 text-gray-500 hover:text-gray-700 transition-colors',
                    viewMode === 'list' && 'bg-[#133c1d] text-white hover:text-white'
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
        <div className="border-b border-gray-200 bg-[#f5faf0] shadow-inner">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <div className="flex flex-wrap items-start gap-8">

              {/* Connector type */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
                  Connector Type
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setConnectorType(undefined); setPage(1) }}
                    className={cn(
                      'rounded-xl px-4 py-1.5 text-sm font-semibold transition-all border-2',
                      !connectorType
                        ? 'bg-[#133c1d] border-[#133c1d] text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#8cc63f] hover:text-[#133c1d]'
                    )}
                  >
                    All
                  </button>
                  {CONNECTOR_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setConnectorType(t as ConnectorType); setPage(1) }}
                      className={cn(
                        'rounded-xl px-4 py-1.5 text-sm font-semibold transition-all border-2',
                        connectorType === t
                          ? 'bg-[#133c1d] border-[#133c1d] text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-[#8cc63f] hover:text-[#133c1d]'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
                  Min Rating
                </p>
                <div className="flex gap-2">
                  {[undefined, 3, 4, 5].map((r) => (
                    <button
                      key={r ?? 'any'}
                      onClick={() => { setMinRating(r); setPage(1) }}
                      className={cn(
                        'flex items-center gap-1 rounded-xl px-4 py-1.5 text-sm font-semibold transition-all border-2',
                        minRating === r
                          ? 'bg-[#133c1d] border-[#133c1d] text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-[#8cc63f] hover:text-[#133c1d]'
                      )}
                    >
                      {r === undefined ? 'Any' : <><Star className="h-3.5 w-3.5 fill-current text-amber-400" /> {r}+</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
                  Verified Only
                </p>
                <button
                  onClick={() => { setIsVerified(isVerified ? undefined : true); setPage(1) }}
                  className={cn(
                    'rounded-xl px-4 py-1.5 text-sm font-semibold transition-all border-2',
                    isVerified
                      ? 'bg-[#133c1d] border-[#133c1d] text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#8cc63f] hover:text-[#133c1d]'
                  )}
                >
                  ✓ Verified
                </button>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-end pb-1.5">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" /> Clear filters
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
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sg">Active:</span>
            {connectorType && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f5faf0] border border-[#8cc63f] px-3 py-1 text-xs font-bold text-[#133c1d]">
                <Zap className="h-3.5 w-3.5 text-[#1a6b3c]" /> {connectorType}
                <button onClick={() => { setConnectorType(undefined); setPage(1) }} className="ml-1 hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {minRating && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                <Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {minRating}+
                <button onClick={() => { setMinRating(undefined); setPage(1) }} className="ml-1 hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                ✓ Verified
                <button onClick={() => { setIsVerified(undefined); setPage(1) }} className="ml-1 hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
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
              <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8">
                <p className="text-sm font-medium text-gray-500">
                  Showing <span className="font-bold text-[#133c1d]">{(page - 1) * 12 + 1}</span> to <span className="font-bold text-[#133c1d]">{Math.min(page * 12, pagination.total)}</span> of <span className="font-bold text-[#133c1d]">{pagination.total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-[#8cc63f] hover:text-[#133c1d] disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
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
                        <span key={`e${i}`} className="px-2 text-gray-400 font-bold">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all border-2 shadow-sm',
                            page === p
                              ? 'bg-[#133c1d] border-[#133c1d] text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-[#8cc63f] hover:text-[#133c1d]'
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-[#8cc63f] hover:text-[#133c1d] disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
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
