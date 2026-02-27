import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useListAdminRolesQuery, useGetRolePermissionsQuery } from '@/features/permissions/permissionsApi'
import type { RoleObject } from '@/features/permissions/permissionsApi'

function RoleRow({ role }: { role: RoleObject }) {
  const { data } = useGetRolePermissionsQuery(role._id)
  const perms = data?.data ?? []

  const levelColour =
    role.roleLevel === 4 ? 'bg-red-100 text-red-700'    :
    role.roleLevel === 3 ? 'bg-purple-100 text-purple-700' :
    role.roleLevel === 2 ? 'bg-blue-100 text-blue-700'   :
    role.roleLevel === 1 ? 'bg-gray-100 text-gray-700'   :
                           'bg-gray-50 text-gray-500'

  return (
    <div className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{role.displayName}</h3>
          <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${levelColour}`}>
          level {role.roleLevel}
        </span>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Permissions ({perms.length})
        </p>
        {perms.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No permissions assigned.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {perms.map((p) => (
              <span
                key={p._id}
                className="inline-flex items-center rounded-full bg-green-100/70 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                {p.action}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminRolesPage() {
  const { data, isLoading, isError } = useListAdminRolesQuery()
  const roles = [...(data?.data ?? [])].sort((a, b) => b.roleLevel - a.roleLevel)

  return (
    <Layout showSidebar>
      <PageHeader
        title="Roles"
        description="All 10 roles in the system, ordered by privilege level."
      />

      {isLoading && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading roles…
        </div>
      )}

      {isError && (
        <div className="flex h-40 items-center justify-center text-sm text-red-500">
          Failed to load roles.
        </div>
      )}

      {!isLoading && roles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <RoleRow key={role._id} role={role} />
          ))}
        </div>
      )}
    </Layout>
  )
}
