import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Loader2, Zap, Trash2, Edit2, Sun, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'
import { StationCard } from '@/components/stations/StationCard'
import { StationFormModal } from '@/components/stations/StationFormModal'
import { useStationsList, useDeleteStation } from '@/hooks/useStations'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { Station } from '@/types/station.types'

const TABS = [
  { key: undefined,    label: 'All' },
  { key: 'active',     label: 'Active' },
  { key: 'pending',    label: 'Pending' },
  { key: 'rejected',   label: 'Rejected' },
] as const

function DeleteConfirm({ station, onConfirm, isPending }: { station: Station; onConfirm: () => void; isPending: boolean }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button size="sm" variant="destructive" className="gap-1">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
          <AlertDialog.Title className="text-base font-semibold text-gray-900">Delete station?</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-500">
            This will remove <strong>{station.name}</strong> from public listings. This action cannot be undone.
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-3">
            <AlertDialog.Cancel asChild><Button variant="outline">Cancel</Button></AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default function MyStationsPage() {
  const { user }                      = useAuth()
  const [editTarget, setEditTarget]   = useState<Station | null>(null)
  const [formOpen,   setFormOpen]     = useState(false)
  const [page,       setPage]         = useState(1)
  const [activeTab,  setActiveTab]    = useState<string | undefined>(undefined)
  const deleteMutation                = useDeleteStation()

  const { data, isLoading } = useStationsList({
    submittedBy: user?._id,
    page,
    limit:  12,
    sortBy: 'newest',
  })

  const allStations = data?.data ?? []
  const pagination  = data?.pagination

  const stations = activeTab
    ? allStations.filter((s) => s.status === activeTab)
    : allStations

  const counts = {
    all:      allStations.length,
    active:   allStations.filter((s) => s.status === 'active').length,
    pending:  allStations.filter((s) => s.status === 'pending').length,
    rejected: allStations.filter((s) => s.status === 'rejected').length,
  }

  function openEdit(station: Station) { setEditTarget(station); setFormOpen(true) }
  function closeForm() { setFormOpen(false); setEditTarget(null) }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Stations</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {pagination?.total ?? 0} station{(pagination?.total ?? 0) !== 1 ? 's' : ''} submitted
            </p>
          </div>
          <Link to="/stations/new">
            <Button className="gap-1.5 bg-solar-green-600 hover:bg-solar-green-700 text-white shrink-0">
              <PlusCircle className="h-4 w-4" /> Submit Station
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total',    count: counts.all,      bg: 'bg-white',           icon: <Sun className="h-4 w-4 text-solar-green-500" />, text: 'text-gray-700' },
            { label: 'Active',   count: counts.active,   bg: 'bg-emerald-50',       icon: <CheckCircle className="h-4 w-4 text-emerald-600" />, text: 'text-emerald-800' },
            { label: 'Pending',  count: counts.pending,  bg: 'bg-amber-50',         icon: <Clock className="h-4 w-4 text-amber-600" />, text: 'text-amber-800' },
            { label: 'Rejected', count: counts.rejected, bg: 'bg-red-50',           icon: <Zap className="h-4 w-4 text-red-400" />, text: 'text-red-700' },
          ].map((item) => (
            <div key={item.label} className={cn('rounded-2xl border border-gray-100 p-4 flex items-center gap-3', item.bg)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">{item.icon}</div>
              <div>
                <p className={cn('text-xl font-bold', item.text)}>{item.count}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl bg-white border border-gray-100 p-1 shadow-sm w-fit">
          {TABS.map((tab) => (
            <button key={String(tab.key)} onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                (activeTab ?? undefined) === tab.key
                  ? 'bg-solar-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && stations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Zap className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-600">
              {activeTab ? `No ${activeTab} stations` : 'No stations yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-400 max-w-xs">
              {activeTab ? 'Try another tab to see other stations.' : 'Submit your first solar charging station to get started!'}
            </p>
            {!activeTab && (
              <Link to="/stations/new" className="mt-4">
                <Button className="bg-solar-green-600 hover:bg-solar-green-700 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Submit Station
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && stations.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((station) => (
              <StationCard
                key={station._id}
                station={station}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={(e) => { e.preventDefault(); openEdit(station) }}>
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <DeleteConfirm station={station} isPending={deleteMutation.isPending} onConfirm={() => deleteMutation.mutate(station._id)} />
                  </div>
                }
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page} of {pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <StationFormModal
        open={formOpen}
        station={editTarget ?? undefined}
        onClose={closeForm}
      />
    </div>
  )
}
