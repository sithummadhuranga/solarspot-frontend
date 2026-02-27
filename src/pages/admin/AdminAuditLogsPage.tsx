import { useState } from 'react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { useListAuditLogsQuery } from '@/features/permissions/permissionsApi'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useListAuditLogsQuery({ page, limit: 25 })

  const logs       = data?.data ?? []
  const pagination = data?.pagination

  return (
    <Layout showSidebar>
      <PageHeader
        title="Audit Logs"
        description="A chronological record of all permission changes made in the system."
      />

      <div className="rounded-[20px] border border-gray-100 bg-white shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Loading audit logs…
          </div>
        )}
        {isError && (
          <div className="flex h-40 items-center justify-center text-sm text-red-500">
            Failed to load audit logs.
          </div>
        )}
        {!isLoading && logs.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No audit logs yet.
          </div>
        )}
        {!isLoading && logs.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Target</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{log.actor.displayName}</div>
                    <div className="text-xs text-muted-foreground">{log.actor.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.target}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages} · {pagination.total} entries
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Layout>
  )
}
