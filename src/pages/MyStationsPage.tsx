import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Loader2, Zap, Trash2, Edit2, Sun, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/shared/Navbar'
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
    <div className="min-h-screen bg-[#f5faf0]">
      <Navbar />

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-[#8cc63f]">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #97cf42 0%, transparent 60%)' }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-12 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#133c1d] sm:text-4xl font-sg">My Stations</h1>
              <p className="mt-2 text-[#133c1d]/80 text-sm font-medium">
                {pagination?.total ?? 0} station{(pagination?.total ?? 0) !== 1 ? 's' : ''} submitted by you
              </p>
            </div>
            <Link to="/stations/new">
              <Button className="gap-2 bg-[#1a1a1a] text-white hover:bg-black font-bold shrink-0 shadow-lg px-5 py-5 rounded-xl font-sg">
                <PlusCircle className="h-4 w-4" /> Submit Station
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total',    count: counts.all,      bg: 'bg-white',           icon: <Sun className="h-5 w-5 text-[#1a6b3c]" />, text: 'text-[#133c1d]' },
            { label: 'Active',   count: counts.active,   bg: 'bg-emerald-50',       icon: <CheckCircle className="h-5 w-5 text-emerald-600" />, text: 'text-emerald-800' },
            { label: 'Pending',  count: counts.pending,  bg: 'bg-amber-50',         icon: <Clock className="h-5 w-5 text-amber-600" />, text: 'text-amber-800' },
            { label: 'Rejected', count: counts.rejected, bg: 'bg-red-50',           icon: <Zap className="h-5 w-5 text-red-500" />, text: 'text-red-800' },
          ].map((item) => (
            <div key={item.label} className={cn('rounded-[20px] border border-gray-100 p-5 flex items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)]', item.bg)}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">{item.icon}</div>
              <div>
                <p className={cn('text-2xl font-extrabold font-sg', item.text)}>{item.count}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-xl bg-white border border-gray-100 p-1.5 shadow-sm w-fit">
          {TABS.map((tab) => (
            <button key={String(tab.key)} onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={cn(
                'rounded-lg px-5 py-2 text-sm font-bold transition-all',
                (activeTab ?? undefined) === tab.key
                  ? 'bg-[#133c1d] text-white shadow-md'
                  : 'text-gray-600 hover:bg-[#f5faf0] hover:text-[#1a6b3c]'
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-[20px] bg-white border border-gray-100 shadow-sm animate-pulse" />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && stations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-gray-200 bg-white py-24 text-center shadow-sm">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5faf0]">
              <Zap className="h-10 w-10 text-[#1a6b3c]" />
            </div>
            <h3 className="text-lg font-extrabold text-[#133c1d] font-sg">
              {activeTab ? `No ${activeTab} stations` : 'No stations yet'}
            </h3>
            <p className="mt-2 text-sm font-medium text-gray-500 max-w-xs">
              {activeTab ? 'Try another tab to see other stations.' : 'Submit your first solar charging station to get started!'}
            </p>
            {!activeTab && (
              <Link to="/stations/new" className="mt-6">
                <Button className="bg-[#1a1a1a] hover:bg-black text-white font-bold px-6 py-5 rounded-xl font-sg">
                  <PlusCircle className="mr-2 h-4 w-4" /> Submit Station
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && stations.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((station) => (
              <StationCard
                key={station._id}
                station={station}
                actions={
                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 border-2 border-gray-200 hover:border-[#8cc63f] hover:text-[#133c1d] font-bold rounded-xl" onClick={(e) => { e.preventDefault(); openEdit(station) }}>
                      <Edit2 className="h-4 w-4" /> Edit
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
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1.5 border-2 border-gray-200 hover:border-[#8cc63f] hover:text-[#133c1d] font-bold rounded-xl">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm font-bold text-gray-500">Page <span className="text-[#133c1d]">{page}</span> of <span className="text-[#133c1d]">{pagination.totalPages}</span></span>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1.5 border-2 border-gray-200 hover:border-[#8cc63f] hover:text-[#133c1d] font-bold rounded-xl">
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
