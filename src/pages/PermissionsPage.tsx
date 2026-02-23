import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useListRolesQuery, useListPermissionsQuery, useListAuditLogsQuery, useGetQuotaStatsQuery } from '@/features/permissions/permissionsApi'

/**
 * PermissionsPage — admin RBAC management dashboard (Member 4's page).
 *
 * TODO (Member 4):
 *  - Build role editor (create, update, toggle active)
 *  - Build permission assignment matrix (roles × permissions)
 *  - Build per-user override editor
 *  - Build audit log viewer with filtering
 *  - Build API quota monitoring panel
 *  - Add policy attachment UI
 */
export default function PermissionsPage() {
  const { data: rolesData,   isLoading: rolesLoading   } = useListRolesQuery()
  const { data: permsData,   isLoading: permsLoading   } = useListPermissionsQuery()
  const { data: auditData,   isLoading: auditLoading   } = useListAuditLogsQuery({})
  const { data: quotasData,  isLoading: quotasLoading  } = useGetQuotaStatsQuery()

  return (
    <Layout showSidebar>
      <PageHeader
        title="Permissions & RBAC"
        description="Manage roles, permissions, policies, and per-user overrides"
      />

      <div className="grid gap-4 md:grid-cols-2">

        {/* Roles panel */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold">Roles ({rolesLoading ? '…' : rolesData?.data.length})</h2>
          {/* TODO (Member 4): <RolesTable roles={rolesData?.data} /> */}
          <p className="text-sm text-muted-foreground">Roles manager — Member 4</p>
        </div>

        {/* Permissions panel */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold">Permissions ({permsLoading ? '…' : permsData?.data.length})</h2>
          {/* TODO (Member 4): <PermissionsMatrix permissions={permsData?.data} /> */}
          <p className="text-sm text-muted-foreground">Permission matrix — Member 4</p>
        </div>

        {/* Quota monitoring */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold">API Quotas</h2>
          {quotasLoading
            ? <p className="text-sm text-muted-foreground">Loading…</p>
            : quotasData?.data.map((q) => (
                <div key={q.service} className="flex justify-between text-sm">
                  <span>{q.service}</span>
                  <span>{q.count} / {q.limit}</span>
                </div>
              ))
          }
        </div>

        {/* Audit log */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold">Audit Log</h2>
          {auditLoading
            ? <p className="text-sm text-muted-foreground">Loading…</p>
            : auditData?.data.slice(0, 5).map((log) => (
                <div key={log._id} className="text-xs text-muted-foreground py-0.5">
                  [{log.action}] {log.resource} by {log.actor}
                </div>
              ))
          }
          {/* TODO (Member 4): <AuditLogTable /> with pagination */}
        </div>

      </div>
    </Layout>
  )
}
