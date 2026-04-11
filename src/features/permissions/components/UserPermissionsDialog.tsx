import { useMemo, useState } from 'react'
import { KeyRound, RotateCcw, Search, ShieldCheck, ShieldOff, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetUserPermissionMatrixQuery,
  useOverrideUserPermissionMutation,
  useRemoveUserPermissionOverrideMutation,
} from '@/features/permissions/permissionsApi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/lib/errors'
import type { User } from '@/types/user.types'
import type { UserPermissionMatrixItem } from '@/types/permission.types'

interface UserPermissionsDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canManagePermissions: boolean
}

type AccessFilter = 'all' | 'allowed' | 'blocked' | 'overridden'

const SOURCE_LABELS: Record<UserPermissionMatrixItem['source'], string> = {
  role: 'Role granted',
  'override-grant': 'User grant override',
  'override-deny': 'User deny override',
  none: 'Not granted',
}

function formatOverrideDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString()
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-black tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}

export function UserPermissionsDialog({ user, open, onOpenChange, canManagePermissions }: UserPermissionsDialogProps) {
  const [search, setSearch] = useState('')
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all')
  const [componentFilter, setComponentFilter] = useState('all')
  const [reason, setReason] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const { data, isFetching } = useGetUserPermissionMatrixQuery(user?._id ?? '', {
    skip: !user?._id || !open,
  })

  const [overridePermission, { isLoading: isSavingOverride }] = useOverrideUserPermissionMutation()
  const [removeOverride, { isLoading: isRemovingOverride }] = useRemoveUserPermissionOverrideMutation()

  const matrix = useMemo(() => data?.data ?? [], [data?.data])
  const availableComponents = useMemo(
    () => Array.from(new Set(matrix.map((item) => item.permission.component))).sort((left, right) => left.localeCompare(right)),
    [matrix]
  )

  const filteredPermissions = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return matrix.filter((item) => {
      const matchesSearch =
        searchTerm.length === 0 ||
        item.permission.action.toLowerCase().includes(searchTerm) ||
        item.permission.resource.toLowerCase().includes(searchTerm) ||
        item.permission.component.toLowerCase().includes(searchTerm) ||
        (item.permission.description ?? '').toLowerCase().includes(searchTerm)

      const matchesAccess =
        accessFilter === 'all' ||
        (accessFilter === 'allowed' && item.allowed) ||
        (accessFilter === 'blocked' && !item.allowed) ||
        (accessFilter === 'overridden' && item.overrideEffect !== null)

      const matchesComponent = componentFilter === 'all' || item.permission.component === componentFilter

      return matchesSearch && matchesAccess && matchesComponent
    })
  }, [accessFilter, componentFilter, matrix, search])

  const summary = useMemo(() => ({
    allowed: matrix.filter((item) => item.allowed).length,
    inherited: matrix.filter((item) => item.source === 'role').length,
    granted: matrix.filter((item) => item.source === 'override-grant').length,
    denied: matrix.filter((item) => item.source === 'override-deny').length,
  }), [matrix])

  const handleOverride = async (permissionId: string, effect: 'grant' | 'deny') => {
    if (!user) return

    try {
      await overridePermission({
        userId: user._id,
        permissionId,
        effect,
        reason: reason.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }).unwrap()

      toast.success(`${effect === 'grant' ? 'Grant' : 'Deny'} override saved for ${user.displayName}.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save the permission override.'))
    }
  }

  const handleClearOverride = async (permissionId: string) => {
    if (!user) return

    try {
      await removeOverride({ userId: user._id, permId: permissionId }).unwrap()
      toast.success(`Override removed for ${user.displayName}.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not remove the permission override.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-6xl overflow-hidden rounded-[28px] border border-gray-200 bg-white p-0">
        <div className="flex max-h-[88vh] flex-col">
          <DialogHeader className="border-b border-gray-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-[#133c1d]">
              <KeyRound className="h-5 w-5 text-[#8cc63f]" />
              {user ? `${user.displayName} Permissions` : 'User Permissions'}
            </DialogTitle>
            <DialogDescription>
              Review effective access, inherited role grants, and explicit user overrides for this account.
            </DialogDescription>
            {user && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">{user.email}</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">Role: {user.role}</span>
                {!canManagePermissions && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                    Read-only access
                  </span>
                )}
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid gap-3 md:grid-cols-4">
              <SummaryCard label="Allowed" value={summary.allowed} tone="text-emerald-700" />
              <SummaryCard label="Inherited" value={summary.inherited} tone="text-slate-900" />
              <SummaryCard label="Grant overrides" value={summary.granted} tone="text-sky-700" />
              <SummaryCard label="Deny overrides" value={summary.denied} tone="text-rose-700" />
            </div>

            <div className="mt-5 grid gap-3 rounded-[24px] border border-gray-200 bg-gray-50/70 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
              <label className="flex min-w-0 flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Search permissions</span>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Action, resource, component"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Access filter</span>
                <select
                  value={accessFilter}
                  onChange={(event) => setAccessFilter(event.target.value as AccessFilter)}
                  className="rounded-2xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20"
                >
                  <option value="all">All permissions</option>
                  <option value="allowed">Allowed only</option>
                  <option value="blocked">Blocked only</option>
                  <option value="overridden">Overrides only</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Component</span>
                <select
                  value={componentFilter}
                  onChange={(event) => setComponentFilter(event.target.value)}
                  className="rounded-2xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20"
                >
                  <option value="all">All components</option>
                  {availableComponents.map((component) => (
                    <option key={component} value={component}>
                      {component}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {canManagePermissions && (
              <div className="mt-4 rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <SlidersHorizontal className="h-4 w-4 text-[#133c1d]" />
                  Override options for the next grant or deny action
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-gray-700">Reason</span>
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Optional audit context for this override"
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-gray-700">Expires at</span>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(event) => setExpiresAt(event.target.value)}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-[24px] border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
                {isFetching ? 'Loading permission matrix...' : `${filteredPermissions.length} permission rows`}
              </div>

              <div className="divide-y divide-gray-100">
                {!isFetching && filteredPermissions.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No permissions matched the current filters.
                  </div>
                )}

                {filteredPermissions.map((item) => {
                  const permissionId = item.permission._id
                  const overrideExpiresLabel = formatOverrideDate(item.overrideExpiresAt)

                  return (
                    <div key={permissionId} className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-mono text-xs font-semibold text-[#133c1d]">{item.permission.action}</p>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.allowed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {item.allowed ? 'Allowed' : 'Blocked'}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.source === 'role' ? 'bg-slate-100 text-slate-700' : item.source === 'override-grant' ? 'bg-sky-50 text-sky-700' : item.source === 'override-deny' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {SOURCE_LABELS[item.source]}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">{item.permission.component}</span>
                          <span>{item.permission.resource}</span>
                        </div>

                        {item.permission.description && (
                          <p className="mt-2 text-sm text-gray-600">{item.permission.description}</p>
                        )}

                        {(item.overrideReason || overrideExpiresLabel) && (
                          <p className="mt-2 text-xs text-gray-500">
                            {item.overrideReason ? `Reason: ${item.overrideReason}` : 'Override active'}
                            {item.overrideReason && overrideExpiresLabel ? ' · ' : ''}
                            {overrideExpiresLabel ? `Expires: ${overrideExpiresLabel}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button
                          type="button"
                          disabled={!canManagePermissions || isSavingOverride || (item.overrideEffect === 'grant' && item.allowed)}
                          onClick={() => void handleOverride(permissionId, 'grant')}
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Grant
                        </button>

                        <button
                          type="button"
                          disabled={!canManagePermissions || isSavingOverride || item.overrideEffect === 'deny'}
                          onClick={() => void handleOverride(permissionId, 'deny')}
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          Deny
                        </button>

                        <button
                          type="button"
                          disabled={!canManagePermissions || isRemovingOverride || item.overrideEffect === null}
                          onClick={() => void handleClearOverride(permissionId)}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Clear override
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}