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
      {/* Submit new report */}
      <AddReportForm stationId={stationId} onSuccess={handleAdd} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-slate-400">Community Reports</p>
        {data && (
          <p className="text-xs text-slate-500">
            {data.pagination.total} total
          </p>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 animate-pulse space-y-2"
            >
              <div className="h-4 w-32 rounded bg-slate-700" />
              <div className="h-4 w-full rounded bg-slate-700" />
              <div className="h-4 w-3/4 rounded bg-slate-700" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-800/60 bg-red-900/20 p-4 text-sm text-red-400">
          ⚠ Could not load reports.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.data.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">
          No community reports yet. Be the first!
        </p>
      )}

      {/* Reports */}
      {!isLoading && !isError && data && data.data.map((report) => (
        <SolarReportCard key={report._id} report={report} />
      ))}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPrev}
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-400">
            {page} / {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={!data.pagination.hasNext}
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
