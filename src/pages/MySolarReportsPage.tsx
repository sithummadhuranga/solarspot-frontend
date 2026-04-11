import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Archive,
  BarChart2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudSun,
  FileText,
  Globe,
  Lock,
  Plus,
  SunMedium,
  Thermometer,
  Trash2,
  Wind,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  useDeleteSolarReportMutation,
  useGetSolarReportsQuery,
  usePublishSolarReportMutation,
} from '@/features/weather/solarApi'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/errors'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { SolarReport } from '@/types/solar.types'

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

const LIMIT = 8

const STATUS_META: Record<Exclude<StatusFilter, 'all'>, {
  label: string
  icon: typeof CheckCircle2
  badgeClassName: string
}> = {
  published: {
    label: 'Published',
    icon: CheckCircle2,
    badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  draft: {
    label: 'Draft',
    icon: Clock3,
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    badgeClassName: 'border-slate-200 bg-slate-100 text-slate-700',
  },
}

function formatKw(value: number | null): string {
  if (value === null) return 'N/A'

  const rounded = value >= 10 ? value.toFixed(1) : value.toFixed(2)
  return `${rounded.replace(/\.0$/, '')} kW`
}

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A'
  return `${Math.round(value)}%`
}

function getScoreTone(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-teal-500'
  if (score >= 60) return 'from-lime-500 to-emerald-500'
  if (score >= 40) return 'from-amber-500 to-orange-500'
  return 'from-rose-500 to-red-600'
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number
  description: string
  tone: string
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-[#f4faea] p-3 text-[#133c1d]">
          {icon}
        </div>
        <p className={`text-3xl font-black tabular-nums ${tone}`}>{value}</p>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: SolarReport['status'] }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.badgeClassName}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  )
}

function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  if (isPublic) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
        <Globe className="h-3.5 w-3.5" />
        Community visible
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      <Lock className="h-3.5 w-3.5" />
      Private
    </span>
  )
}

function ReportMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className={`mt-2 text-lg font-black tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}

function WeatherChip({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
      {icon}
      {text}
    </span>
  )
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active
        ? 'inline-flex items-center gap-2 rounded-xl border border-[#8cc63f]/40 bg-[#f4faea] px-3.5 py-2 text-sm font-semibold text-[#133c1d]'
        : 'inline-flex items-center gap-2 rounded-xl border border-transparent bg-transparent px-3.5 py-2 text-sm font-semibold text-gray-500 hover:border-gray-200 hover:bg-white hover:text-[#133c1d]'}
    >
      {label}
      {count !== undefined && (
        <span className={active
          ? 'rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#133c1d]'
          : 'rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500'}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4faea] text-[#133c1d]">
        <SunMedium className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-black text-[#133c1d]">
        {statusFilter === 'all' ? 'No solar reports yet' : `No ${statusFilter} reports found`}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
        Capture observations from the Solar Intelligence workspace to build your report history, compare estimated and actual output, and share useful field data with the SolarSpot community.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/weather"
          className="inline-flex items-center gap-2 rounded-xl bg-[#133c1d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3117]"
        >
          <Plus className="h-4 w-4" />
          Create report
        </Link>
        <Link
          to="/stations"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Zap className="h-4 w-4" />
          Browse stations
        </Link>
      </div>
    </div>
  )
}

function ReportCard({ report }: { report: SolarReport }) {
  const [deleteReport, { isLoading: isDeleting }] = useDeleteSolarReportMutation()
  const [publishReport, { isLoading: isPublishing }] = usePublishSolarReportMutation()
  const [rowError, setRowError] = useState<string | null>(null)

  const stationId = typeof report.station === 'object' ? report.station._id : report.station
  const stationName = typeof report.station === 'object' ? report.station.name : `Station ${stationId.slice(-6)}`
  const weather = report.weatherSnapshot

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this report?')) return

    try {
      await deleteReport(report._id).unwrap()
      setRowError(null)
      toast.success('Solar report deleted.')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Delete failed.')
      setRowError(message)
      toast.error(message)
    }
  }

  const handlePublish = async () => {
    try {
      await publishReport(report._id).unwrap()
      setRowError(null)
      toast.success('Draft report published.')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Publish failed.')
      setRowError(message)
      toast.error(message)
    }
  }

  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/stations/${stationId}`}
              className="min-w-0 text-lg font-black text-[#133c1d] transition-colors hover:text-[#276537]"
            >
              {stationName}
            </Link>
            <StatusBadge status={report.status} />
            <VisibilityBadge isPublic={report.isPublic} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>Visited {formatDate(report.visitedAt)}</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span>Updated {formatRelativeTime(report.updatedAt)}</span>
          </div>
        </div>

        <div className={`inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${getScoreTone(report.solarScore)} text-white shadow-lg`}>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Score</p>
            <p className="text-xl font-black leading-none">{report.solarScore}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetric label="Estimated output" value={formatKw(report.estimatedOutputKw)} accent="text-sky-700" />
        <ReportMetric label="Actual output" value={formatKw(report.actualOutputKw)} accent="text-emerald-700" />
        <ReportMetric label="Accuracy" value={formatPercent(report.accuracyPct)} accent="text-amber-700" />
        <ReportMetric label="Report status" value={STATUS_META[report.status]?.label ?? report.status} accent="text-[#133c1d]" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <WeatherChip icon={<Thermometer className="h-3.5 w-3.5 text-rose-500" />} text={`${weather.temperatureC}°C`} />
        <WeatherChip icon={<CloudSun className="h-3.5 w-3.5 text-sky-500" />} text={`${weather.cloudCoverPct}% cloud cover`} />
        <WeatherChip icon={<SunMedium className="h-3.5 w-3.5 text-amber-500" />} text={`UV ${weather.uvIndex.toFixed(1)}`} />
        <WeatherChip icon={<Wind className="h-3.5 w-3.5 text-teal-500" />} text={`${weather.windSpeedKph} km/h wind`} />
        <WeatherChip icon={<Zap className="h-3.5 w-3.5 text-violet-500" />} text={weather.weatherMain} />
      </div>

      {report.notes && (
        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Notes</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">{report.notes}</p>
        </div>
      )}

      {rowError && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {rowError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <Link
          to={`/stations/${stationId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <BarChart2 className="h-4 w-4" />
          View station
        </Link>

        {report.status === 'draft' && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isPublishing ? 'Publishing…' : 'Publish report'}
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting…' : 'Delete report'}
        </button>
      </div>
    </article>
  )
}

export default function MySolarReportsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const query = useGetSolarReportsQuery({
    userId: user?._id,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort: 'newest',
    page,
    limit: LIMIT,
  }, { skip: !user?._id })

  const reports = query.data?.data ?? []
  const pagination = query.data?.pagination
  const total = pagination?.total ?? 0
  const errorMessage = query.isError ? getApiErrorMessage(query.error, 'Could not load your solar reports.') : null

  const { data: totalCount } = useGetSolarReportsQuery({ userId: user?._id, limit: 1 }, { skip: !user?._id })
  const { data: publishedCount } = useGetSolarReportsQuery({ userId: user?._id, status: 'published', limit: 1 }, { skip: !user?._id })
  const { data: draftCount } = useGetSolarReportsQuery({ userId: user?._id, status: 'draft', limit: 1 }, { skip: !user?._id })
  const { data: archivedCount } = useGetSolarReportsQuery({ userId: user?._id, status: 'archived', limit: 1 }, { skip: !user?._id })

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus)
    setPage(1)
  }

  return (
    <Layout showSidebar>
      <PageHeader
        title="My Solar Reports"
        description="Review your personal solar observations, compare outcomes, and publish the reports you want the community to see."
        actions={
          <Link
            to="/weather"
            className="inline-flex items-center gap-2 rounded-xl bg-[#133c1d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3117]"
          >
            <Plus className="h-4 w-4" />
            New report
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Personal report hub</p>
              <h2 className="mt-2 text-2xl font-black text-[#133c1d]">Track your field observations</h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Draft reports stay private until you publish them. Published reports feed SolarSpot analytics, while archived reports preserve your record without affecting public insights.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f4faea] px-4 py-3 text-sm font-semibold text-[#133c1d]">
              {query.isFetching && !query.isLoading ? 'Refreshing reports…' : `${total} report${total === 1 ? '' : 's'} in current view`}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            label="Total reports"
            value={totalCount?.pagination.total ?? 0}
            description="Everything you have captured across all stations."
            tone="text-[#133c1d]"
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Published"
            value={publishedCount?.pagination.total ?? 0}
            description="Reports currently contributing to public solar intelligence."
            tone="text-emerald-700"
          />
          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Drafts"
            value={draftCount?.pagination.total ?? 0}
            description="Private observations waiting for review or publication."
            tone="text-amber-700"
          />
          <SummaryCard
            icon={<Archive className="h-5 w-5" />}
            label="Archived"
            value={archivedCount?.pagination.total ?? 0}
            description="Reports retained in history but excluded from live reporting."
            tone="text-slate-700"
          />
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={statusFilter === 'all'} label="All reports" count={totalCount?.pagination.total} onClick={() => handleStatusChange('all')} />
            <FilterButton active={statusFilter === 'published'} label="Published" count={publishedCount?.pagination.total} onClick={() => handleStatusChange('published')} />
            <FilterButton active={statusFilter === 'draft'} label="Drafts" count={draftCount?.pagination.total} onClick={() => handleStatusChange('draft')} />
            <FilterButton active={statusFilter === 'archived'} label="Archived" count={archivedCount?.pagination.total} onClick={() => handleStatusChange('archived')} />
          </div>
        </div>

        {query.isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-3xl border border-gray-100 bg-white shadow-sm" />
            ))}
          </div>
        )}

        {!query.isLoading && errorMessage && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </p>
          </div>
        )}

        {!query.isLoading && !errorMessage && reports.length === 0 && (
          <EmptyState statusFilter={statusFilter} />
        )}

        {!query.isLoading && !errorMessage && reports.length > 0 && (
          <>
            <div className="space-y-4">
              {reports.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#133c1d]">
                    Showing {reports.length} of {total} report{total === 1 ? '' : 's'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Page {page} of {pagination?.totalPages ?? 1}
                  </p>
                </div>

                {(pagination?.totalPages ?? 1) > 1 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                      disabled={!pagination?.hasPrev}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => Math.min(pagination?.totalPages ?? 1, currentPage + 1))}
                      disabled={!pagination?.hasNext}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Next steps</p>
              <p className="mt-2 text-sm text-gray-600">
                Publish your strongest reports to enrich public analytics, or continue exploring the Solar Intelligence workspace to compare live weather and forecast trends before your next station visit.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/weather"
                className="inline-flex items-center gap-2 rounded-xl border border-[#8cc63f]/30 bg-[#f4faea] px-4 py-2.5 text-sm font-semibold text-[#133c1d] transition-colors hover:bg-[#ebf6d9]"
              >
                <BarChart2 className="h-4 w-4" />
                Open solar intelligence
              </Link>
              <Link
                to="/stations"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Zap className="h-4 w-4" />
                Explore stations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
