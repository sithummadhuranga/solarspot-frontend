import { useState } from 'react'
import { PlusCircle, Loader2, Zap, Trash2, Edit } from 'lucide-react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'
import { StationCard } from '@/components/stations/StationCard'
import { StationFormModal } from '@/components/stations/StationFormModal'
import { useStationsList, useDeleteStation } from '@/hooks/useStations'
import { useAuth } from '@/hooks/useAuth'
import type { Station } from '@/types/station.types'

// ─── Delete confirmation dialog ──────────────────────────────────────────────

interface DeleteConfirmProps {
  station:   Station
  onConfirm: () => void
  isPending: boolean
}

function DeleteConfirm({ station, onConfirm, isPending }: DeleteConfirmProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-base font-semibold text-gray-900">
            Delete station?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            This will soft-delete <strong>{station.name}</strong>. The station will no longer be
            visible to users. This action cannot be undone from the UI.
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyStationsPage() {
  const { user, isAdmin } = useAuth()
  const [editTarget, setEditTarget] = useState<Station | null>(null)
  const [formOpen,   setFormOpen]   = useState(false)
  const [page,       setPage]       = useState(1)

  const deleteMutation = useDeleteStation()

  const { data, isLoading } = useStationsList({
    submittedBy: user?._id,
    page,
    limit: 12,
    sortBy: 'newest',
  })

  const stations   = data?.data ?? []
  const pagination = data?.pagination

  function openEdit(station: Station) {
    setEditTarget(station)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditTarget(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Stations</h1>
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.total} station${pagination.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Submit Station
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-green-600" />
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Zap className="h-8 w-8 text-green-300" />
            </div>
            <p className="text-base font-medium">You haven't submitted any stations yet</p>
            <Button onClick={() => setFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Submit your first station
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stations.map((station) => (
                <StationCard
                  key={station._id}
                  station={station}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(station)}
                        className="flex-1"
                      >
                        <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                      {isAdmin && (
                        <DeleteConfirm
                          station={station}
                          onConfirm={() => deleteMutation.mutate(station._id)}
                          isPending={deleteMutation.isPending}
                        />
                      )}
                    </div>
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form modal — create or edit */}
      <StationFormModal
        open={formOpen}
        onClose={closeForm}
        station={editTarget ?? undefined}
      />
    </div>
  )
}
