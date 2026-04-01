import { RefreshCcw, TriangleAlert } from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { useGetQuotaStatsQuery } from '@/features/permissions/permissionsApi'

const ENABLE_ADMIN_APIS = import.meta.env.VITE_ENABLE_ADMIN_APIS === 'true'

function pct(count: number, limit: number) {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((count / limit) * 100))
}

export default function AdminQuotasPage() {
  const { data, isLoading, isFetching, refetch } = useGetQuotaStatsQuery(undefined, {
    skip: !ENABLE_ADMIN_APIS,
  })
  const quotas = data?.data ?? []

  return (
    <Layout showSidebar>
      <PageHeader
        title="API Quotas"
        description="Monitor service usage and threshold health across platform integrations."
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
          Quota APIs are disabled. Set <span className="font-semibold">VITE_ENABLE_ADMIN_APIS=true</span> after backend routes are available.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-4 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}

        {!isLoading && quotas.length === 0 && (
          <div className="rounded-[20px] border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm md:col-span-2 xl:col-span-3">
            No quota data available.
          </div>
        )}

        {!isLoading && quotas.map((quota, index) => {
          const usage = pct(quota.count, quota.limit)
          const atRisk = usage >= 80
          return (
            <article key={`${quota.service}-${index}`} className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Service</p>
                  <h2 className="mt-1 text-lg font-sg font-bold text-[#133c1d]">{quota.service}</h2>
                </div>
                {atRisk && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    <TriangleAlert className="h-3.5 w-3.5" /> High usage
                  </span>
                )}
              </div>

              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={atRisk ? 'h-full bg-amber-500' : 'h-full bg-[#8cc63f]'}
                  style={{ width: `${usage}%` }}
                />
              </div>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-sm text-gray-600">{quota.count} / {quota.limit}</p>
                <p className="text-sm font-semibold text-[#133c1d]">{usage}%</p>
              </div>
            </article>
          )
        })}
      </div>
    </Layout>
  )
}
