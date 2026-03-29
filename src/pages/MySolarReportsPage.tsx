/**
 * MySolarReportsPage — authenticated user's personal solar report management hub.
 *
 * Shows all reports the user has ever submitted (draft, published, archived)
 * with inline publish / delete actions. Includes pagination and status filters.
 *
 * Owner: Member 3 · Route: /solar/reports/mine (ProtectedRoute)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, Zap, Trash2, Globe, Lock, CheckCircle2, Clock, Archive,
  BarChart2, ChevronLeft, ChevronRight, FileText, Plus, AlertCircle,
} from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  useGetSolarReportsQuery,
  useDeleteSolarReportMutation,
  usePublishSolarReportMutation,
} from '@/features/weather/solarApi'
import { useAuth } from '@/hooks/useAuth'
import type { SolarReport } from '@/types/solar.types'
import { formatDate } from '@/lib/utils'

// ── Status pill config ────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

const STATUS_PILL: Record<
  Exclude<StatusFilter, 'all'>,
  { label: string; icon: React.ReactNode; bg: string; text: string; dot: string }
> = {
  published: {
    label: 'Published',
    icon:  <CheckCircle2 className="h-3.5 w-3.5" />,
    bg:    'bg-emerald-500/10 border-emerald-500/30',
    text:  'text-emerald-400',
    dot:   'bg-emerald-500',
  },
  draft: {
    label: 'Draft',
    icon:  <Clock className="h-3.5 w-3.5" />,
    bg:    'bg-amber-500/10 border-amber-500/30',
    text:  'text-amber-400',
    dot:   'bg-amber-500',
  },
  archived: {
    label: 'Archived',
    icon:  <Archive className="h-3.5 w-3.5" />,
    bg:    'bg-slate-500/10 border-slate-500/30',
    text:  'text-slate-400',
    dot:   'bg-slate-500',
  },
}

const scoreGradient = (score: number) =>
  score >= 80 ? 'from-emerald-500 to-teal-400'
  : score >= 60 ? 'from-lime-500 to-emerald-400'
  : score >= 40 ? 'from-amber-500 to-orange-400'
  : 'from-red-600 to-red-500'

// ── Report row component ──────────────────────────────────────────────────────

function ReportRow({ report }: { report: SolarReport }) {
  const [deleteReport,  { isLoading: del }]  = useDeleteSolarReportMutation()
  const [publishReport, { isLoading: pub }]  = usePublishSolarReportMutation()
  const [rowError, setRowError]               = useState<string | null>(null)

  const stationId   = typeof report.station === 'object' ? report.station._id : report.station
  const stationName = typeof report.station === 'object' ? report.station.name : `Station ${stationId.slice(-6)}`
  const statusCfg   = STATUS_PILL[report.status] ?? STATUS_PILL.draft

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this report?')) return
    try { await deleteReport(report._id).unwrap() }
    catch (e: unknown) { setRowError((e as { data?: { message?: string } })?.data?.message ?? 'Delete failed') }
  }

  const handlePublish = async () => {
    try { await publishReport(report._id).unwrap() }
    catch (e: unknown) { setRowError((e as { data?: { message?: string } })?.data?.message ?? 'Publish failed') }
  }

  return (
    <div className="group relative rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/60 p-5 hover:border-slate-600 hover:shadow-lg hover:shadow-black/20 transition-all duration-200">

      {/* Solar score ring — top right accent */}
      <div className={`absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${scoreGradient(report.solarScore)} shadow-lg`}>
        <span className="text-sm font-extrabold text-white">{report.solarScore}</span>
      </div>

      {/* Header row */}
      <div className="pr-16 space-y-1 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/stations/${stationId}`}
            className="text-base font-bold text-white hover:text-emerald-300 transition-colors leading-tight"
          >
            {stationName}
          </Link>
          {/* Status pill */}
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.icon}
            {statusCfg.label}
          </span>
          {/* Visibility */}
          {report.isPublic
            ? <Globe className="h-3.5 w-3.5 text-slate-500" />
            : <Lock  className="h-3.5 w-3.5 text-slate-600" />}
        </div>
        <time className="text-xs text-slate-500">Visited {formatDate(report.visitedAt)}</time>
      </div>

      {/* Metrics row */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
        <Metric label="Est. Output" value={`${report.estimatedOutputKw} kW`} color="text-sky-300" />
        {report.actualOutputKw !== null && (
          <Metric label="Actual" value={`${report.actualOutputKw} kW`} color="text-emerald-300" />
        )}
        {report.accuracyPct !== null && (
          <Metric label="Accuracy" value={`${report.accuracyPct}%`} color="text-violet-300" />
        )}
        <Metric label="Score" value={`${report.solarScore} / 100`} color="text-amber-300" />
      </div>

      {/* Weather snapshot */}
      <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 mb-4 border-t border-slate-700/40 pt-3">
        <span>{report.weatherSnapshot.temperatureC}°C</span>
        <span>{report.weatherSnapshot.cloudCoverPct}% cloud</span>
        <span>UV {report.weatherSnapshot.uvIndex.toFixed(1)}</span>
        <span>{report.weatherSnapshot.windSpeedKph} km/h</span>
        <span className="italic">{report.weatherSnapshot.weatherMain}</span>
      </div>

      {/* Notes */}
      {report.notes && (
        <p className="text-xs text-slate-400 italic mb-4 line-clamp-2 border-l-2 border-slate-600 pl-3">
          {report.notes}
        </p>
      )}

      {/* Error */}
      {rowError && (
        <p className="text-xs text-red-400 flex items-center gap-1 mb-3">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {rowError}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {report.status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={pub}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-600/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {pub ? 'Publishing…' : 'Publish'}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={del}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-800/40 bg-red-900/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/20 disabled:opacity-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {del ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}

// ── Status tab ────────────────────────────────────────────────────────────────

function StatusTab({ active, label, count, onClick }: {
  value: StatusFilter; active: boolean; label: string; count?: number; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
        active
          ? 'bg-emerald-600/20 border border-emerald-600/40 text-emerald-300'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
          active ? 'bg-emerald-600/30 text-emerald-200' : 'bg-slate-700 text-slate-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const LIMIT = 8

export default function MySolarReportsPage() {
  const { user }   = useAuth()
  const [page, setPage]           = useState(1)
  const [statusFilter, setStatus] = useState<StatusFilter>('all')

  const query = useGetSolarReportsQuery({
    userId: user?._id,
    status:      statusFilter === 'all' ? undefined : statusFilter,
    sort:        'newest',
    page,
    limit:       LIMIT,
  }, { skip: !user?._id })

  const reports    = query.data?.data ?? []
  const pagination = query.data?.pagination
  const total      = pagination?.total ?? 0

  // Counts (approximate — from all-status query)
  const { data: countAll }       = useGetSolarReportsQuery({ userId: user?._id, limit: 1 }, { skip: !user?._id })
  const { data: countPublished } = useGetSolarReportsQuery({ userId: user?._id, status: 'published', limit: 1 }, { skip: !user?._id })
  const { data: countDraft }     = useGetSolarReportsQuery({ userId: user?._id, status: 'draft',     limit: 1 }, { skip: !user?._id })

  const handleStatusChange = (s: StatusFilter) => { setStatus(s); setPage(1) }

  return (
    <Layout showSidebar>
      <PageHeader
        title="My Solar Reports"
        description="Manage your crowdsourced solar observations — track, publish, and delete your reports"
        actions={
          <Link
            to="/weather"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            <Plus className="h-4 w-4" /> New Report
          </Link>
        }
      />

      {/* ── Summary stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SummaryCard icon={<FileText className="h-5 w-5 text-slate-400" />}    label="Total Reports"     value={countAll?.pagination.total ?? 0}       color="text-white" />
        <SummaryCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} label="Published"     value={countPublished?.pagination.total ?? 0}  color="text-emerald-400" />
        <SummaryCard icon={<Clock className="h-5 w-5 text-amber-400" />}       label="Drafts"            value={countDraft?.pagination.total ?? 0}      color="text-amber-400" />
      </div>

      {/* ── Status tabs ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 bg-slate-900/40 border border-slate-800 rounded-xl p-1.5 w-fit">
        <StatusTab value="all"       active={statusFilter === 'all'}       label="All"       count={countAll?.pagination.total}       onClick={() => handleStatusChange('all')} />
        <StatusTab value="published" active={statusFilter === 'published'} label="Published" count={countPublished?.pagination.total} onClick={() => handleStatusChange('published')} />
        <StatusTab value="draft"     active={statusFilter === 'draft'}     label="Drafts"    count={countDraft?.pagination.total}     onClick={() => handleStatusChange('draft')} />
        <StatusTab value="archived"  active={statusFilter === 'archived'}  label="Archived"                                          onClick={() => handleStatusChange('archived')} />
      </div>

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {query.isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-800/60 animate-pulse border border-slate-700/40" />
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!query.isLoading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-700 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 mb-4">
            <Sun className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-300 mb-1">No solar reports yet</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-5">
            Visit any station page and submit your first solar observation to get started.
          </p>
          <Link
            to="/weather"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-600/40 px-5 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-600/30 transition-colors"
          >
            <Zap className="h-4 w-4" /> Browse Stations
          </Link>
        </div>
      )}

      {/* ── Report list ───────────────────────────────────────────────────── */}
      {!query.isLoading && reports.length > 0 && (
        <>
          <div className="space-y-4 mb-6">
            {reports.map((r) => <ReportRow key={r._id} report={r} />)}
          </div>

          {/* Total count */}
          <p className="text-center text-xs text-slate-500 mb-4">
            Showing {reports.length} of {total} report{total !== 1 ? 's' : ''}
          </p>

          {/* Pagination */}
          {(pagination?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination?.hasPrev}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-sm text-slate-400 tabular-nums">
                {page} / {pagination?.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination?.totalPages ?? 1, p + 1))}
                disabled={!pagination?.hasNext}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="pb-8">
        {/* OWM Attribution */}
        <p className="mt-10 text-center text-xs text-slate-500">
          Weather snapshots powered by{' '}
          <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">
            OpenWeatherMap
          </a>
          {' '}· Your reports help the SolarSpot community make better charging decisions.
        </p>
        <p className="mt-2 text-center text-xs text-slate-600">
          Navigate to <Link to="/weather" className="underline text-slate-500 hover:text-slate-400">Solar Intelligence</Link> to submit a new report for any station.
        </p>
      </div>

      {/* Analytics quick-link */}
      {total > 0 && (
        <div className="fixed bottom-8 right-8 z-10">
          <Link
            to="/weather"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-2xl hover:from-emerald-500 hover:to-teal-500 transition-all hover:-translate-y-0.5"
          >
            <BarChart2 className="h-4 w-4" /> View Analytics
          </Link>
        </div>
      )}
    </Layout>
  )
}

function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900/50 p-5">
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span></div>
      <p className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}
