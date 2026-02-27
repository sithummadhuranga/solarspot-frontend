import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useListAdminRolesQuery, useListAllPermissionsQuery, useListAuditLogsQuery, useGetQuotaStatsQuery } from '@/features/permissions/permissionsApi'

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
  const { data: rolesData,   isLoading: rolesLoading   } = useListAdminRolesQuery()
  const { data: permsData,   isLoading: permsLoading   } = useListAllPermissionsQuery()
  const { data: auditData,   isLoading: auditLoading   } = useListAuditLogsQuery({})
  const { data: quotasData,  isLoading: quotasLoading  } = useGetQuotaStatsQuery()

  return (
    <Layout showSidebar>
      <PageHeader
        title="Permissions & RBAC"
        description="Manage roles, permissions, policies, and per-user overrides"
      />

      <div className="grid gap-6 md:grid-cols-2">

        {/* Roles panel */}
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-[#133c1d] font-sg">Roles ({rolesLoading ? '…' : rolesData?.data.length})</h2>
          {/* TODO (Member 4): <RolesTable roles={rolesData?.data} /> */}
          <p className="text-sm font-medium text-gray-500">Roles manager — Member 4</p>
        </div>

        {/* Permissions panel */}
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-[#133c1d] font-sg">Permissions ({permsLoading ? '…' : permsData?.data.length})</h2>
          {/* TODO (Member 4): <PermissionsMatrix permissions={permsData?.data} /> */}
          <p className="text-sm font-medium text-gray-500">Permission matrix — Member 4</p>
        </div>

        {/* Quota monitoring */}
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-[#133c1d] font-sg">API Quotas</h2>
          {quotasLoading
            ? <p className="text-sm font-medium text-gray-500">Loading…</p>
            : quotasData?.data.map((q) => (
                <div key={q.service} className="flex justify-between text-sm font-medium text-gray-600 py-1">
                  <span>{q.service}</span>
                  <span className="font-bold text-[#133c1d]">{q.count} / {q.limit}</span>
                </div>
              ))
          }
        </div>

        {/* Audit log */}
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-[#133c1d] font-sg">Audit Log</h2>
          {auditLoading
            ? <p className="text-sm font-medium text-gray-500">Loading…</p>
            : auditData?.data.slice(0, 5).map((log) => (
                <div key={log._id} className="text-xs font-medium text-gray-500 py-1 border-b border-gray-50 last:border-0">
                  <span className="font-bold text-[#1a6b3c]">[{log.action}]</span> {log.target} by {log.actor.displayName}
                </div>
              ))
          }
          {/* TODO (Member 4): <AuditLogTable /> with pagination */}
        </div>

      </div>
    </Layout>
  )
}
