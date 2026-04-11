/**
 * AdminSolarReportsPage — moderator/admin solar report management hub.
 *
 * Allows admins and moderators to:
 *   - Browse all solar reports across all stations and users
 *   - Filter by status and station
 *   - Archive reports that violate community guidelines
 *   - Restore archived reports (publish them)
 *
 * This page is protected by backend-authoritative permission checks.
 * Route: /admin/solar/reports (inside ProtectedRoute + BackendPermissionGuard)
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
import { useState, useRef, useEffect } from 'react'
import {
  Shield, Sun, Search, X, Archive, CheckCircle2, Clock,
  ChevronLeft, ChevronRight, BarChart2, AlertCircle, FileText,
  Thermometer, Wind, Cloud, Zap, Filter,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  useGetSolarReportsQuery,
  useArchiveSolarReportMutation,
  usePublishSolarReportMutation,
} from '@/features/weather/solarApi'
import type { SolarReport } from '@/types/solar.types'
import { formatDate } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SolarReport['status'] }) {
  const cfg = {
    published: { icon: <CheckCircle2 className="h-3 w-3" />, text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Published' },
    draft:     { icon: <Clock className="h-3 w-3" />, text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Draft' },
    archived:  { icon: <Archive className="h-3 w-3" />, text: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', label: 'Archived' },
  }[status] ?? { icon: null, text: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', label: status }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const colour =
    score >= 80 ? 'bg-emerald-500'
    : score >= 60 ? 'bg-lime-500'
    : score >= 40 ? 'bg-amber-500'
    : 'bg-red-600'

  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colour} shadow-md`}>
      <span className="text-xs font-extrabold text-white">{score}</span>
    </div>
  )
}

// ── Report table row ──────────────────────────────────────────────────────────

function ReportTableRow({ report }: { report: SolarReport }) {
  const [archive, { isLoading: archiving }] = useArchiveSolarReportMutation()
  const [publish, { isLoading: publishing }] = usePublishSolarReportMutation()
  const [rowError, setRowError] = useState<string | null>(null)

  const stationId   = typeof report.station === 'object' ? report.station._id : report.station
  const stationName = typeof report.station === 'object' ? report.station.name : `Station ${stationId.slice(-6)}`
  const submitter   = typeof report.submittedBy === 'object' ? report.submittedBy.displayName : `User ${String(report.submittedBy).slice(-6)}`
  const w           = report.weatherSnapshot

  const handleArchive = async () => {
    if (!window.confirm(`Archive report from "${submitter}"? It will be removed from public analytics.`)) return
    try { await archive(report._id).unwrap(); setRowError(null) }
    catch (e: unknown) { setRowError((e as { data?: { message?: string } })?.data?.message ?? 'Archive failed') }
  }

  const handleRestore = async () => {
    try { await publish(report._id).unwrap(); setRowError(null) }
    catch (e: unknown) { setRowError((e as { data?: { message?: string } })?.data?.message ?? 'Restore failed') }
  }

  return (
    <div className="rounded-[16px] border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#8cc63f]/40">
      <div className="flex items-start gap-3">
        <ScoreBadge score={report.solarScore} />

        <div className="flex-1 min-w-0">
          {/* Station + submitter */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Link
              to={`/stations/${stationId}`}
              className="truncate text-sm font-bold text-[#133c1d] transition-colors hover:text-[#276537]"
            >
              {stationName}
            </Link>
            <StatusBadge status={report.status} />
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>by <span className="font-medium text-gray-700">{submitter}</span></span>
            <span>·</span>
            <time>{formatDate(report.visitedAt)}</time>
          </div>

          {/* Output metrics */}
          <div className="mb-3 flex flex-wrap gap-4">
            <Stat label="Est." value={`${report.estimatedOutputKw} kW`} colour="text-sky-700" />
            {report.actualOutputKw !== null && (
              <Stat label="Actual" value={`${report.actualOutputKw} kW`} colour="text-emerald-700" />
            )}
            {report.accuracyPct !== null && (
              <Stat label="Accuracy" value={`${report.accuracyPct}%`} colour="text-amber-700" />
            )}
          </div>

          {/* Weather conditions */}
          <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{w.temperatureC}°C</span>
            <span className="flex items-center gap-1"><Cloud className="h-3 w-3" />{w.cloudCoverPct}%</span>
            <span className="flex items-center gap-1"><Sun className="h-3 w-3" />UV {w.uvIndex.toFixed(1)}</span>
            <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{w.windSpeedKph} km/h</span>
          </div>

          {/* Notes */}
          {report.notes && (
            <p className="mb-3 line-clamp-2 border-l-2 border-gray-200 pl-2 text-xs italic text-gray-500">
              {report.notes}
            </p>
          )}

          {/* Error */}
          {rowError && (
            <p className="mb-2 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {rowError}
            </p>
          )}

          {/* Admin actions */}
          <div className="flex gap-2">
            {report.status !== 'archived' ? (
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-40"
              >
                <Archive className="h-3 w-3" />
                {archiving ? 'Archiving…' : 'Archive'}
              </button>
            ) : (
              <button
                onClick={handleRestore}
                disabled={publishing}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
              >
                <CheckCircle2 className="h-3 w-3" />
                {publishing ? 'Restoring…' : 'Restore to Published'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, colour }: { label: string; value: string; colour: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`text-xs font-bold tabular-nums ${colour}`}>{value}</p>
    </div>
  )
}

// ── Filter tab ────────────────────────────────────────────────────────────────

function FilterTab({ active, label, onClick }: {
  active: boolean; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'border border-[#8cc63f]/40 bg-[#8cc63f]/15 text-[#133c1d]'
          : 'border border-transparent text-gray-500 hover:text-[#133c1d]'
      }`}
    >
      {label}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const LIMIT = 12

export default function AdminSolarReportsPage() {
  const [page, setPage]           = useState(1)
  const [statusFilter, setStatus] = useState<StatusFilter>('all')
  const [stationSearch, setStationSearch] = useState('')
  const [debouncedStation, setDebStation] = useState('')
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(() => setDebStation(stationSearch), 400)
    return () => { if (debRef.current) clearTimeout(debRef.current) }
  }, [stationSearch])

  const query = useGetSolarReportsQuery({
    status:   statusFilter === 'all' ? undefined : statusFilter,
    sort:     'newest',
    page,
    limit:    LIMIT,
  })

  const { data: statsAll }       = useGetSolarReportsQuery({ limit: 1 })
  const { data: statsPublished } = useGetSolarReportsQuery({ status: 'published', limit: 1 })
  const { data: statsArchived }  = useGetSolarReportsQuery({ status: 'archived',  limit: 1 })
  const { data: statsDraft }     = useGetSolarReportsQuery({ status: 'draft',     limit: 1 })

  const reports    = query.data?.data ?? []
  const pagination = query.data?.pagination

  // Client-side station name filter (for the visible page since stationId filter requires ObjectId)
  const filtered = debouncedStation.trim()
    ? reports.filter((r) => {
        const name = typeof r.station === 'object' ? r.station.name : ''
        return name.toLowerCase().includes(debouncedStation.toLowerCase())
      })
    : reports

  const handleStatusChange = (s: StatusFilter) => { setStatus(s); setPage(1) }

  return (
    <Layout showSidebar>
      <PageHeader
        title="Solar Reports — Admin"
        description="Monitor, moderate, and manage all crowdsourced solar intelligence reports"
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <Shield className="h-4 w-4 shrink-0 text-red-500" />
            <span className="text-xs font-bold text-red-700">Admin Only</span>
          </div>
        }
      />

      {/* ── Summary stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <AdminStatCard icon={<FileText className="h-4 w-4 text-gray-500" />} label="Total" value={statsAll?.pagination.total ?? 0} color="text-[#133c1d]" />
        <AdminStatCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} label="Published" value={statsPublished?.pagination.total ?? 0} color="text-emerald-700" />
        <AdminStatCard icon={<Clock className="h-4 w-4 text-amber-600" />} label="Drafts" value={statsDraft?.pagination.total ?? 0} color="text-amber-700" />
        <AdminStatCard icon={<Archive className="h-4 w-4 text-gray-500" />} label="Archived" value={statsArchived?.pagination.total ?? 0} color="text-gray-700" />
      </div>

      {/* ── Filters bar ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          <Filter className="ml-2 mr-1 h-3.5 w-3.5 shrink-0 text-gray-500" />
          <FilterTab active={statusFilter === 'all'} label="All" onClick={() => handleStatusChange('all')} />
          <FilterTab active={statusFilter === 'published'} label="Published" onClick={() => handleStatusChange('published')} />
          <FilterTab active={statusFilter === 'draft'} label="Drafts" onClick={() => handleStatusChange('draft')} />
          <FilterTab active={statusFilter === 'archived'} label="Archived" onClick={() => handleStatusChange('archived')} />
        </div>

        {/* Station name filter */}
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            value={stationSearch}
            onChange={(e) => setStationSearch(e.target.value)}
            placeholder="Filter by station name…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#8cc63f] focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/20"
          />
          {stationSearch && (
            <button onClick={() => setStationSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {query.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-gray-100 bg-gray-100/70" />
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!query.isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <Zap className="mb-3 h-12 w-12 text-gray-400" />
          <p className="text-sm font-bold text-gray-700">No reports found</p>
          <p className="mt-1 text-xs text-gray-500">Try adjusting your filters.</p>
        </div>
      )}

      {/* ── Report list ───────────────────────────────────────────────────── */}
      {!query.isLoading && filtered.length > 0 && (
        <>
          <div className="space-y-3 mb-6">
            {filtered.map((r) => <ReportTableRow key={r._id} report={r} />)}
          </div>

          {/* Count */}
          <p className="mb-4 text-center text-xs text-gray-500">
            Page {page} · {pagination?.total ?? 0} total report{(pagination?.total ?? 0) !== 1 ? 's' : ''}
          </p>

          {/* Pagination */}
          {(pagination?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination?.hasPrev}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-sm tabular-nums text-gray-500">
                {page} / {pagination?.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination?.totalPages ?? 1, p + 1))}
                disabled={!pagination?.hasNext}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Attribution */}
      <p className="mt-10 text-center text-xs text-gray-500">
        Solar data powered by{' '}
        <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#133c1d]">
          OpenWeatherMap
        </a>
        {' · '}
        <Link to="/weather" className="underline hover:text-[#133c1d]">Solar Intelligence Dashboard</Link>
        {' · '}
        <Link to="/admin/solar/analytics" className="underline hover:text-[#133c1d]">
          <BarChart2 className="h-3 w-3 inline mr-0.5" />Station Analytics
        </Link>
      </p>
    </Layout>
  )
}

function AdminStatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string
}) {
  return (
    <div className="rounded-[16px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">{icon}<span className="text-[10px] uppercase tracking-wider text-gray-400">{label}</span></div>
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}
