import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useGetQuotaStatsQuery } from '@/features/permissions/permissionsApi'

function QuotaBar({ percentage }: { percentage: number }) {
  const pct   = Math.min(100, Math.max(0, percentage))
  const color =
    pct >= 90 ? 'bg-red-500'    :
    pct >= 70 ? 'bg-amber-500'  :
    'bg-[#8cc63f]'

  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div
        className={`h-2 rounded-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function AdminQuotaPage() {
  const { data, isLoading, isError } = useGetQuotaStatsQuery()
  const stats = data?.data ?? []

  return (
    <Layout showSidebar>
      <PageHeader
        title="Quota Usage"
        description="Current API quota consumption across all tracked services."
      />

      {isLoading && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading quota data…
        </div>
      )}

      {isError && (
        <div className="flex h-40 items-center justify-center text-sm text-red-500">
          Failed to load quota stats.
        </div>
      )}

      {!isLoading && stats.length === 0 && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No quota data available.
        </div>
      )}

      {!isLoading && stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const pct     = Math.min(100, Math.round(stat.percentage ?? (stat.count / stat.limit) * 100))
            const danger  = pct >= 90
            const warning = pct >= 70 && pct < 90

            return (
              <div
                key={`${stat.service}-${stat.date}`}
                className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{stat.service}</h3>
                    <p className="text-xs text-muted-foreground">{stat.date}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    danger  ? 'bg-red-100 text-red-700'    :
                    warning ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                  }`}>
                    {pct}%
                  </span>
                </div>

                <QuotaBar percentage={pct} />

                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-gray-900">{stat.count.toLocaleString()}</span>
                  {' / '}
                  {stat.limit.toLocaleString()} requests
                  {danger && <span className="ml-2 text-red-600 font-medium">· Near limit!</span>}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
