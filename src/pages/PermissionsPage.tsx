import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useListPermissionsQuery, useListRolesQuery } from '@/features/permissions/permissionsApi'
import { RolePermissionManager } from '@/features/permissions/components/RolePermissionManager'
import { UserOverrideManager } from '@/features/permissions/components/UserOverrideManager'
import { AuditLogsPanel } from '@/features/permissions/components/AuditLogsPanel'
import { QuotaStatsPanel } from '@/features/permissions/components/QuotaStatsPanel'

export default function PermissionsPage() {
  const { data: rolesData, isLoading: rolesLoading } = useListRolesQuery()
  const { data: permsData, isLoading: permsLoading } = useListPermissionsQuery()

  const roles = rolesData?.data ?? []
  const permissions = permsData?.data ?? []

  return (
    <Layout showSidebar>
      <PageHeader
        title="Permissions & RBAC"
        description="Manage role assignments, user overrides, audits, and quota telemetry"
      />

      {(rolesLoading || permsLoading) && (
        <p className="mb-4 text-sm text-muted-foreground">Loading RBAC metadata...</p>
      )}

      {!rolesLoading && !permsLoading && (
        <div className="grid gap-4">
          <RolePermissionManager roles={roles} permissions={permissions} />
          <UserOverrideManager permissions={permissions} />
          <QuotaStatsPanel />
          <AuditLogsPanel />
        </div>
      )}

      {!rolesLoading && !permsLoading && roles.length === 0 && permissions.length === 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Permissions metadata is empty. Ensure backend seed data has been applied.
        </div>
      )}
    </Layout>
  )
}