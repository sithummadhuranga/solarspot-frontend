import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle, XCircle, Eye, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RejectionReasonModal } from '@/components/stations/RejectionReasonModal'
import { usePendingStations, useApproveStation, useRejectStation } from '@/hooks/useStations'
import { formatDate } from '@/lib/utils'
import type { Station } from '@/types/station.types'

// ─── Inline approval confirmation popover ────────────────────────────────────

interface ApproveButtonProps {
  station:   Station
  onApprove: (id: string) => void
  isPending: boolean
}

function ApproveButton({ station, onApprove, isPending }: ApproveButtonProps) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-600">Approve?</span>
        <Button
          size="sm"
          variant="default"
          disabled={isPending}
          onClick={() => {
            onApprove(station._id)
            setConfirming(false)
          }}
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>No</Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="default" onClick={() => setConfirming(true)}>
      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
    </Button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ModerationQueuePage() {
  const [page,        setPage]        = useState(1)
  const [rejectTarget, setRejectTarget] = useState<Station | null>(null)
  // Track which rows are fading (just-actioned)
  const [fadingIds,   setFadingIds]   = useState<Set<string>>(new Set())

  const { data, isLoading } = usePendingStations(page)
  const approveMutation     = useApproveStation()
  const rejectMutation      = useRejectStation()

  const stations   = data?.data ?? []
  const pagination = data?.pagination

  function handleApprove(id: string) {
    setFadingIds((s) => new Set(s).add(id))
    approveMutation.mutate(id, {
      onSettled: () => setFadingIds((s) => { const n = new Set(s); n.delete(id); return n }),
    })
  }

  function handleRejectSubmit(reason: string) {
    if (!rejectTarget) return
    setFadingIds((s) => new Set(s).add(rejectTarget._id))
    rejectMutation.mutate(
      { id: rejectTarget._id, dto: { rejectionReason: reason } },
      {
        onSuccess: () => setRejectTarget(null),
        onSettled: () =>
          setFadingIds((s) => {
            const n = new Set(s)
            if (rejectTarget) n.delete(rejectTarget._id)
            return n
          }),
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <ClipboardList className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Moderation Queue</h1>
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.total} station${pagination.total !== 1 ? 's' : ''} awaiting review` : 'Loading…'}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-green-600" />
            </div>
          ) : stations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
              <CheckCircle className="h-12 w-12 text-green-300" />
              <p className="text-base font-medium">Queue is empty — all caught up!</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-left font-semibold">Station</th>
                  <th className="px-4 py-3 text-left font-semibold">Submitted by</th>
                  <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">City</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Connectors</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Solar kWp</th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Submitted</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((station) => {
                  const fading = fadingIds.has(station._id)
                  return (
                    <tr
                      key={station._id}
                      className={`border-b last:border-0 transition-all duration-500 ${
                        fading ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-[160px]">{station.name}</div>
                        <Badge variant="amber" className="mt-0.5">Pending</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">
                        {station.submittedBy?.displayName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                        {station.address?.city ?? '—'}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-600">{station.connectors.length}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {station.solarPanelKw}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {formatDate(station.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/stations/${station._id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <ApproveButton
                            station={station}
                            onApprove={handleApprove}
                            isPending={approveMutation.isPending && fadingIds.has(station._id)}
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectTarget(station)}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Rejection modal */}
      <RejectionReasonModal
        open={Boolean(rejectTarget)}
        stationName={rejectTarget?.name ?? ''}
        isPending={rejectMutation.isPending}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  )
}
