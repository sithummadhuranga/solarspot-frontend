import { useMemo, useState } from 'react'
import { useListAuditLogsQuery } from '@/features/permissions/permissionsApi'

export function AuditLogsPanel() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')

  const query = useMemo(
    () => ({
      page,
      limit: 15,
      action: action.trim() || undefined,
      resource: resource.trim() || undefined,
    }),
    [page, action, resource]
  )

  const { data, isLoading, isFetching } = useListAuditLogsQuery(query)

  const logs = data?.data ?? []
  const pagination = data?.pagination

  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold">Audit Logs</h2>
      <p className="mt-1 text-sm text-muted-foreground">Track permission and user management changes.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Filter by Action</span>
          <input
            type="text"
            value={action}
            onChange={(e) => {
              setPage(1)
              setAction(e.target.value)
            }}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="permission.override"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Filter by Resource</span>
          <input
            type="text"
            value={resource}
            onChange={(e) => {
              setPage(1)
              setResource(e.target.value)
            }}
            className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="user_permission_override"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading audit logs...</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="px-2 py-2 font-medium">Timestamp</th>
                <th className="px-2 py-2 font-medium">Action</th>
                <th className="px-2 py-2 font-medium">Resource</th>
                <th className="px-2 py-2 font-medium">Actor</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b last:border-b-0">
                  <td className="px-2 py-2 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 font-mono text-xs">{log.action}</td>
                  <td className="px-2 py-2">{log.resource}</td>
                  <td className="px-2 py-2 font-mono text-xs">{log.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No audit logs found for current filters.</p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4 text-sm">
        <span className="text-muted-foreground">
          {pagination
            ? `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} records)`
            : 'No pagination data'}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!pagination?.hasPrev || isFetching}
            className="rounded border border-border px-3 py-1.5 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!pagination?.hasNext || isFetching}
            className="rounded border border-border px-3 py-1.5 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
