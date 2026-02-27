import { useState } from 'react'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  useListAllPermissionsQuery,
  useListAdminRolesQuery,
  useGetRolePermissionsQuery,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
  type RoleObject,
  type PermissionObject,
} from '@/features/permissions/permissionsApi'
import { Plus, X } from 'lucide-react'

function RolePermissions({ role }: { role: RoleObject }) {
  const { data: allPermsData }  = useListAllPermissionsQuery()
  const { data: rolePermsData, isLoading } = useGetRolePermissionsQuery(role._id)
  const [assign] = useAssignPermissionToRoleMutation()
  const [remove] = useRemovePermissionFromRoleMutation()

  const allPerms  = allPermsData?.data ?? []
  const rolePerms = rolePermsData?.data ?? []
  const rolePermIds = new Set(rolePerms.map((p) => p._id))

  const unassigned = allPerms.filter((p) => !rolePermIds.has(p._id))

  async function handleAssign(perm: PermissionObject) {
    try {
      await assign({ roleId: role._id, permissionId: perm._id }).unwrap()
      toast.success(`Assigned "${perm.action}" to ${role.displayName}`)
    } catch {
      toast.error('Failed to assign permission.')
    }
  }

  async function handleRemove(perm: PermissionObject) {
    try {
      await remove({ roleId: role._id, permId: perm._id }).unwrap()
      toast.success(`Removed "${perm.action}" from ${role.displayName}`)
    } catch {
      toast.error('Failed to remove permission.')
    }
  }

  return (
    <div className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900">{role.displayName}</h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          level {role.roleLevel}
        </span>
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}

      {/* Assigned permissions */}
      {rolePerms.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned ({rolePerms.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {rolePerms.map((perm) => (
              <span
                key={perm._id}
                className="inline-flex items-center gap-1 rounded-full bg-green-100/70 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                {perm.action}
                <button
                  onClick={() => handleRemove(perm)}
                  className="ml-0.5 text-green-600 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${perm.action}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Unassigned permissions */}
      {unassigned.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Add permission</p>
          <div className="flex flex-wrap gap-1.5">
            {unassigned.map((perm) => (
              <button
                key={perm._id}
                onClick={() => handleAssign(perm)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs text-gray-600 hover:border-[#8cc63f] hover:text-[#7ab32e] transition-colors"
              >
                <Plus className="h-3 w-3" /> {perm.action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPermissionsPage() {
  const { data: rolesData, isLoading } = useListAdminRolesQuery()
  const roles = rolesData?.data ?? []

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const selectedRole = roles.find((r) => r._id === selectedRoleId) ?? roles[0]

  return (
    <Layout showSidebar>
      <PageHeader
        title="Permission Management"
        description="Assign or revoke permission actions on a per-role basis. Changes take effect immediately."
      />

      {isLoading && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading roles…
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Role selector */}
          <div className="space-y-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Select role</p>
            {roles.map((role) => (
              <button
                key={role._id}
                onClick={() => setSelectedRoleId(role._id)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                  (selectedRole?._id === role._id)
                    ? 'bg-solar-green-50 text-solar-green-800'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="block truncate">{role.displayName}</span>
                <span className="text-xs text-muted-foreground">level {role.roleLevel}</span>
              </button>
            ))}
          </div>

          {/* Permission editor for selected role */}
          <div>
            {selectedRole
              ? <RolePermissions role={selectedRole} />
              : <p className="text-sm text-muted-foreground">Select a role to manage its permissions.</p>
            }
          </div>
        </div>
      )}
    </Layout>
  )
}
