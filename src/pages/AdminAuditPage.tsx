import { useMemo, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { useListAuditLogsQuery } from '@/features/permissions/permissionsApi'
import { getSafeText } from '@/lib/auth'

const PAGE_SIZE = 20
const ENABLE_ADMIN_APIS = import.meta.env.VITE_ENABLE_ADMIN_APIS === 'true'

export default function AdminAuditPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isFetching, refetch } = useListAuditLogsQuery(
    { page, limit: PAGE_SIZE },
    { skip: !ENABLE_ADMIN_APIS }
  )

  const logs = data?.data ?? []
  const pagination = data?.pagination

  const visibleLogs = useMemo(() => {
    if (!search.trim()) return logs
    const q = search.trim().toLowerCase()
    return logs.filter((log) => (
      getSafeText(log.action).toLowerCase().includes(q)
      || getSafeText(log.resource).toLowerCase().includes(q)
      || getSafeText(log.actor).toLowerCase().includes(q)
    ))
  }, [logs, search])

  return (
    <Layout showSidebar>
      <PageHeader
        title="Audit Log"
        description="Inspect permission and admin actions captured by backend audit events."
        actions={(
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => void refetch()}
            disabled={isFetching || !ENABLE_ADMIN_APIS}
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        )}
      />

      {!ENABLE_ADMIN_APIS && (
        <div className="mb-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Audit APIs are disabled. Set <span className="font-semibold">VITE_ENABLE_ADMIN_APIS=true</span> after backend routes are available.
        </div>
      )}

      <section className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {pagination ? `${pagination.total} total events` : 'Loading events...'}
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by action, resource, actor"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8cc63f] sm:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="border-b border-gray-100 px-3 py-3">Action</th>
                <th className="border-b border-gray-100 px-3 py-3">Resource</th>
                <th className="border-b border-gray-100 px-3 py-3">Actor</th>
                <th className="border-b border-gray-100 px-3 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-36 animate-pulse rounded bg-gray-100" /></td>
                  </tr>
                ))
              ) : visibleLogs.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-gray-500" colSpan={4}>
                    No audit events match this filter.
                  </td>
                </tr>
              ) : visibleLogs.map((log) => (
                <tr key={log._id} className="text-sm">
                  <td className="border-b border-gray-50 px-3 py-3">
                    <span className="rounded-full bg-[#8cc63f]/15 px-2 py-1 text-xs font-semibold uppercase text-[#133c1d]">{getSafeText(log.action)}</span>
                  </td>
                  <td className="border-b border-gray-50 px-3 py-3 text-gray-700">{getSafeText(log.resource)}</td>
                  <td className="border-b border-gray-50 px-3 py-3 text-gray-700">{getSafeText(log.actor)}</td>
                  <td className="border-b border-gray-50 px-3 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}
