import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { useListUsersQuery } from '@/features/users/usersApi'
import { getApiErrorMessage } from '@/lib/errors'
import {
  useGetUserEffectivePermissionsQuery,
  useOverrideUserPermissionMutation,
  useRemoveUserPermissionOverrideMutation,
} from '@/features/permissions/permissionsApi'
import type { PermissionItem } from '@/types/permission.types'

interface UserOverrideManagerProps {
  permissions: PermissionItem[]
}

export function UserOverrideManager({ permissions }: UserOverrideManagerProps) {
  const [userId, setUserId] = useState('')
  const [permissionId, setPermissionId] = useState('')
  const [effect, setEffect] = useState<'grant' | 'deny'>('grant')
  const [reason, setReason] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [removePermissionId, setRemovePermissionId] = useState('')

  const { data: usersData } = useListUsersQuery({ page: 1, limit: 50 })
  const users = usersData?.data ?? []

  const selectedUser = useMemo(() => users.find((u) => u._id === userId) ?? null, [users, userId])

  const { data: effectiveData, isLoading: effectiveLoading } = useGetUserEffectivePermissionsQuery(userId, {
    skip: !userId,
  })

  const [overridePermission, { isLoading: overriding }] = useOverrideUserPermissionMutation()
  const [removeOverride, { isLoading: removing }] = useRemoveUserPermissionOverrideMutation()

  const handleOverrideSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!userId || !permissionId) {
      toast.error('Select user and permission first.')
      return
    }

    try {
      await overridePermission({
        userId,
        permissionId,
        effect,
        reason: reason.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }).unwrap()

      toast.success('User permission override saved')
      setReason('')
      setExpiresAt('')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save override.'))
    }
  }

  const handleRemoveOverride = async () => {
    if (!userId || !removePermissionId) {
      toast.error('Select user and permission override to remove.')
      return
    }

    try {
      await removeOverride({ userId, permId: removePermissionId }).unwrap()
      toast.success('User permission override removed')
      setRemovePermissionId('')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not remove override.'))
    }
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold">Per-user Permission Overrides</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Grant or deny specific permissions for individual users.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Target User</span>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.displayName} ({u.email})
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
          <p className="font-medium">Selected</p>
          <p className="text-muted-foreground">{selectedUser ? `${selectedUser.displayName} (${selectedUser.role})` : 'No user selected'}</p>
        </div>
      </div>

      <form onSubmit={handleOverrideSubmit} className="mt-4 grid gap-3 rounded-md border p-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="font-medium">Permission</span>
          <select
            value={permissionId}
            onChange={(e) => setPermissionId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            disabled={!userId}
          >
            <option value="">Select permission</option>
            {permissions.map((perm) => (
              <option key={perm._id} value={perm._id}>
                {perm.action}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Effect</span>
          <select
            value={effect}
            onChange={(e) => setEffect(e.target.value as 'grant' | 'deny')}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="grant">Grant</option>
            <option value="deny">Deny</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Expires At (optional)</span>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="font-medium">Reason (optional)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Add context for this override"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={overriding || !userId || !permissionId}
            className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {overriding ? 'Saving override...' : 'Save Override'}
          </button>
        </div>
      </form>

      <div className="mt-4 rounded-md border p-3">
        <h3 className="text-sm font-semibold">Remove Override</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Remove an explicit override by permission ID.
        </p>
        <div className="mt-2 flex flex-col gap-2 md:flex-row">
          <select
            value={removePermissionId}
            onChange={(e) => setRemovePermissionId(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            disabled={!userId}
          >
            <option value="">Select permission</option>
            {permissions.map((perm) => (
              <option key={perm._id} value={perm._id}>
                {perm.action}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRemoveOverride}
            disabled={removing || !userId || !removePermissionId}
            className="rounded border border-destructive/40 px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removing ? 'Removing...' : 'Remove Override'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold">Effective Permissions</h3>

        {!userId && <p className="mt-2 text-sm text-muted-foreground">Select a user to view effective permissions.</p>}
        {userId && effectiveLoading && <p className="mt-2 text-sm text-muted-foreground">Loading effective permissions...</p>}

        {userId && !effectiveLoading && (
          <div className="mt-2 flex flex-wrap gap-2">
            {(effectiveData?.data ?? []).map((perm) => (
              <span key={perm._id} className="rounded-full bg-solar-green-100 px-3 py-1 text-xs font-medium text-solar-green-900">
                {perm.action}
              </span>
            ))}
            {(effectiveData?.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No effective permissions returned.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
