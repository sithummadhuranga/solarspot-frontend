/**
 * AdminSolarReportsPage — moderator/admin solar report management hub.
 *
 * Allows admins and moderators to:
 *   - Browse all solar reports across all stations and users
 *   - Filter by status and station
 *   - Archive reports that violate community guidelines
 *   - Restore archived reports (publish them)
 *
 * This page is accessible ONLY to roles: moderator, admin.
 * Route: /admin/solar/reports (inside ProtectedRoute + RoleGuard)
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
    published: { icon: <CheckCircle2 className="h-3 w-3" />, text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Published' },
    draft:     { icon: <Clock        className="h-3 w-3" />, text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     label: 'Draft'     },
    archived:  { icon: <Archive      className="h-3 w-3" />, text: 'text-slate-400',   bg: 'bg-slate-700/60 border-slate-600/40',     label: 'Archived'  },
  }[status] ?? { icon: null, text: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/40', label: status }

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
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 hover:border-slate-600/80 transition-all group">
      <div className="flex items-start gap-3">
        <ScoreBadge score={report.solarScore} />

        <div className="flex-1 min-w-0">
          {/* Station + submitter */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Link
              to={`/stations/${stationId}`}
              className="text-sm font-bold text-white hover:text-emerald-300 transition-colors truncate"
            >
              {stationName}
            </Link>
            <StatusBadge status={report.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
            <span>by <span className="text-slate-300 font-medium">{submitter}</span></span>
            <span>·</span>
            <time>{formatDate(report.visitedAt)}</time>
          </div>

          {/* Output metrics */}
          <div className="flex flex-wrap gap-4 mb-3">
            <Stat label="Est." value={`${report.estimatedOutputKw} kW`} colour="text-sky-300" />
            {report.actualOutputKw !== null && (
              <Stat label="Actual" value={`${report.actualOutputKw} kW`} colour="text-emerald-300" />
            )}
            {report.accuracyPct !== null && (
              <Stat label="Accuracy" value={`${report.accuracyPct}%`} colour="text-violet-300" />
            )}
          </div>

          {/* Weather conditions */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-3">
            <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{w.temperatureC}°C</span>
            <span className="flex items-center gap-1"><Cloud className="h-3 w-3" />{w.cloudCoverPct}%</span>
            <span className="flex items-center gap-1"><Sun className="h-3 w-3" />UV {w.uvIndex.toFixed(1)}</span>
            <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{w.windSpeedKph} km/h</span>
          </div>

          {/* Notes */}
          {report.notes && (
            <p className="text-xs text-slate-400 italic mb-3 line-clamp-2 border-l-2 border-slate-700 pl-2">
              {report.notes}
            </p>
          )}

          {/* Error */}
          {rowError && (
            <p className="text-xs text-red-400 flex items-center gap-1 mb-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {rowError}
            </p>
          )}

          {/* Admin actions */}
          <div className="flex gap-2">
            {report.status !== 'archived' ? (
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="flex items-center gap-1.5 rounded-lg border border-orange-600/40 bg-orange-900/10 px-2.5 py-1 text-xs font-semibold text-orange-400 hover:bg-orange-900/20 disabled:opacity-40 transition-colors"
              >
                <Archive className="h-3 w-3" />
                {archiving ? 'Archiving…' : 'Archive'}
              </button>
            ) : (
              <button
                onClick={handleRestore}
                disabled={publishing}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-900/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/20 disabled:opacity-40 transition-colors"
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
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xs font-bold tabular-nums ${colour}`}>{value}</p>
    </div>
  )
}

// ── Filter tab ────────────────────────────────────────────────────────────────

function FilterTab({ active, label, onClick }: {
  value: StatusFilter; active: boolean; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-emerald-600/20 border border-emerald-600/40 text-emerald-300'
          : 'text-slate-400 hover:text-slate-200 border border-transparent'
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
          <div className="flex items-center gap-2 rounded-xl bg-red-900/20 border border-red-800/40 px-3 py-2">
            <Shield className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-xs font-bold text-red-300">Admin Only</span>
          </div>
        }
      />

      {/* ── Summary stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <AdminStatCard icon={<FileText  className="h-4 w-4 text-slate-400" />}    label="Total"     value={statsAll?.pagination.total ?? 0}       color="text-white" />
        <AdminStatCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Published" value={statsPublished?.pagination.total ?? 0}  color="text-emerald-400" />
        <AdminStatCard icon={<Clock     className="h-4 w-4 text-amber-400" />}    label="Drafts"    value={statsDraft?.pagination.total ?? 0}      color="text-amber-400" />
        <AdminStatCard icon={<Archive   className="h-4 w-4 text-slate-500" />}    label="Archived"  value={statsArchived?.pagination.total ?? 0}   color="text-slate-400" />
      </div>

      {/* ── Filters bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl border border-slate-700/60 bg-slate-800/40">
        {/* Status filter */}
        <div className="flex items-center gap-1 bg-slate-900/50 rounded-xl p-1 border border-slate-800">
          <Filter className="h-3.5 w-3.5 text-slate-500 ml-2 mr-1 shrink-0" />
          <FilterTab value="all"       active={statusFilter === 'all'}       label="All"       onClick={() => handleStatusChange('all')} />
          <FilterTab value="published" active={statusFilter === 'published'} label="Published" onClick={() => handleStatusChange('published')} />
          <FilterTab value="draft"     active={statusFilter === 'draft'}     label="Drafts"    onClick={() => handleStatusChange('draft')} />
          <FilterTab value="archived"  active={statusFilter === 'archived'}  label="Archived"  onClick={() => handleStatusChange('archived')} />
        </div>

        {/* Station name filter */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            value={stationSearch}
            onChange={(e) => setStationSearch(e.target.value)}
            placeholder="Filter by station name…"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2 pl-9 pr-8 text-sm text-white placeholder:text-slate-500 focus:border-emerald-600/50 focus:outline-none focus:ring-1 focus:ring-emerald-600/30 transition-all"
          />
          {stationSearch && (
            <button onClick={() => setStationSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {query.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-800/60 animate-pulse border border-slate-700/40" />
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!query.isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-700 text-center">
          <Zap className="h-12 w-12 text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-400">No reports found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* ── Report list ───────────────────────────────────────────────────── */}
      {!query.isLoading && filtered.length > 0 && (
        <>
          <div className="space-y-3 mb-6">
            {filtered.map((r) => <ReportTableRow key={r._id} report={r} />)}
          </div>

          {/* Count */}
          <p className="text-center text-xs text-slate-500 mb-4">
            Page {page} · {pagination?.total ?? 0} total report{(pagination?.total ?? 0) !== 1 ? 's' : ''}
          </p>

          {/* Pagination */}
          {(pagination?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination?.hasPrev}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-sm text-slate-400 tabular-nums">
                {page} / {pagination?.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination?.totalPages ?? 1, p + 1))}
                disabled={!pagination?.hasNext}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Attribution */}
      <p className="mt-10 text-center text-xs text-slate-600">
        Solar data powered by{' '}
        <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">
          OpenWeatherMap
        </a>
        {' · '}
        <Link to="/weather" className="underline hover:text-slate-400">Solar Intelligence Dashboard</Link>
        {' · '}
        <Link to="/admin/solar/analytics" className="underline hover:text-slate-400">
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
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span></div>
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}
