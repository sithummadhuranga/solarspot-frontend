/**
 * SolarReportList — Paginated list of solar reports for a station.
 *
 * Shows the AddReportForm at the top, then a paginated list of
 * SolarReportCards, and a simple next/prev pagination control.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGetSolarReportsQuery } from './solarApi'
import { SolarReportCard } from './SolarReportCard'
import { AddReportForm }   from './AddReportForm'

interface Props {
  stationId: string
}

export function SolarReportList({ stationId }: Props) {
  const [page, setPage] = useState(1)
  const limit = 5

  const { data, isLoading, isError } = useGetSolarReportsQuery({
    stationId,
    status:   'published',
    isPublic: true,
    sort:     'newest',
    page,
    limit,
  })

  const handleAdd = () => setPage(1) // reset to first page after new submission

  return (
    <div className="space-y-4">
      <AddReportForm stationId={stationId} onSuccess={handleAdd} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Community Reports</p>
          <p className="text-sm text-slate-500">Public observations from SolarSpot drivers at this station.</p>
        </div>
        {data && (
          <p className="text-xs text-slate-500">
            {data.pagination.total} total
          </p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-3/4 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          Could not load reports.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
          No community reports yet. Be the first!
        </p>
      )}

      {!isLoading && !isError && data && data.data.map((report) => (
        <SolarReportCard key={report._id} report={report} />
      ))}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPrev}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-500">
            {page} / {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={!data.pagination.hasNext}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
