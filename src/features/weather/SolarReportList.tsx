/**
 * SolarReportList — Paginated list of solar reports for a station.
 *
 * Shows the AddReportForm at the top, then a paginated list of
 * SolarReportCards, and a simple next/prev pagination control.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useGetSolarReportsQuery } from './solarApi'
import { SolarReportCard } from './SolarReportCard'
import { AddReportForm }   from './AddReportForm'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  stationId: string
}

export function SolarReportList({ stationId }: Props) {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<'newest' | 'highest-score' | 'most-accurate'>('newest')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const limit = 10

  const { data, isLoading, isError } = useGetSolarReportsQuery({
    stationId,
    status:   'published',
    isPublic: true,
    sort,
    page,
    limit,
  })

  const handleAdd = () => {
    setPage(1)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Community Reports</p>
          <p className="text-sm text-slate-500">Public observations from SolarSpot drivers at this station.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as 'newest' | 'highest-score' | 'most-accurate')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[170px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Sort reports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="highest-score">Highest score</SelectItem>
              <SelectItem value="most-accurate">Most accurate</SelectItem>
            </SelectContent>
          </Select>

          {isAuthenticated ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#133c1d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f3117]">
                  <Plus className="h-4 w-4" />
                  Add report
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Solar Report</DialogTitle>
                  <DialogDescription>
                    Add a measured solar observation for this station. Weather context is attached automatically.
                  </DialogDescription>
                </DialogHeader>
                <AddReportForm stationId={stationId} onSuccess={handleAdd} />
              </DialogContent>
            </Dialog>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#133c1d] hover:text-[#133c1d]"
            >
              <Plus className="h-4 w-4" />
              Sign in to add
            </Link>
          )}
        </div>
      </div>

      {!isAuthenticated && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Sign in to add your own solar observation report.
          {' '}
          <Link to="/login" className="font-semibold text-[#133c1d] underline">
            Go to login
          </Link>
        </div>
      )}

      {data && (
        <p className="text-xs text-slate-500">
          {data.pagination.total} total public report{data.pagination.total === 1 ? '' : 's'}
        </p>
      )}

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
          No community reports yet for this station. Be the first to capture solar conditions here.
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
