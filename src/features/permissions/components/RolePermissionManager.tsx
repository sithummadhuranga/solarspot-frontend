import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAssignPermissionToRoleMutation, useGetRolePermissionsQuery, useRemovePermissionFromRoleMutation } from '@/features/permissions/permissionsApi'
import type { PermissionItem, RoleItem } from '@/types/permission.types'
import { getApiErrorMessage } from '@/lib/errors'

interface RolePermissionManagerProps {
  roles: RoleItem[]
  permissions: PermissionItem[]
}

export function RolePermissionManager({ roles, permissions }: RolePermissionManagerProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [permissionId, setPermissionId] = useState<string>('')

  const selectedRole = useMemo(
    () => roles.find((r) => r._id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  )

  const { data: rolePermsData, isLoading: rolePermsLoading } = useGetRolePermissionsQuery(
    selectedRoleId,
    { skip: !selectedRoleId }
  )

  const [assignPermission, { isLoading: assigning }] = useAssignPermissionToRoleMutation()
  const [removePermission, { isLoading: removing }] = useRemovePermissionFromRoleMutation()

  const assigned = rolePermsData?.data ?? []

  const handleAssign = async () => {
    if (!selectedRoleId || !permissionId) {
      toast.error('Select a role and permission to assign.')
      return
    }

    try {
      await assignPermission({ roleId: selectedRoleId, permissionId, policyIds: [] }).unwrap()
      toast.success('Permission assigned to role')
      setPermissionId('')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to assign permission.'))
    }
  }

  const handleRemove = async (permId: string) => {
    if (!selectedRoleId) return

    try {
      await removePermission({ roleId: selectedRoleId, permId }).unwrap()
      toast.success('Permission removed from role')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to remove permission.'))
    }
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold">Role Permission Management</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Assign and remove permission actions from RBAC roles.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Role</span>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.displayName} ({role.name})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Permission</span>
          <select
            value={permissionId}
            onChange={(e) => setPermissionId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            disabled={!selectedRoleId}
          >
            <option value="">Select permission</option>
            {permissions.map((perm) => (
              <option key={perm._id} value={perm._id}>
                {perm.action}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={handleAssign}
          disabled={assigning || !selectedRoleId || !permissionId}
          className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {assigning ? 'Assigning...' : 'Assign Permission'}
        </button>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold">
          Assigned Permissions {selectedRole ? `for ${selectedRole.displayName}` : ''}
        </h3>

        {!selectedRoleId && (
          <p className="mt-2 text-sm text-muted-foreground">Select a role to view assignments.</p>
        )}

        {selectedRoleId && rolePermsLoading && (
          <p className="mt-2 text-sm text-muted-foreground">Loading role permissions...</p>
        )}

        {selectedRoleId && !rolePermsLoading && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Action</th>
                  <th className="px-2 py-2 font-medium">Resource</th>
                  <th className="px-2 py-2 font-medium">Component</th>
                  <th className="px-2 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {assigned.map((row) => {
                  const perm = typeof row.permission === 'string' ? null : row.permission
                  return (
                    <tr key={row._id} className="border-b last:border-b-0">
                      <td className="px-2 py-2 font-mono text-xs">{perm?.action ?? 'Unknown'}</td>
                      <td className="px-2 py-2">{perm?.resource ?? '-'}</td>
                      <td className="px-2 py-2">{perm?.component ?? '-'}</td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            const id = typeof row.permission === 'string' ? row.permission : row.permission._id
                            void handleRemove(id)
                          }}
                          disabled={removing}
                          className="rounded border border-destructive/40 px-2 py-1 text-xs text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {assigned.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">No permissions assigned to this role.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
