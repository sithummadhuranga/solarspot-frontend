import { useGetQuotaStatsQuery } from '@/features/permissions/permissionsApi'

export function QuotaStatsPanel() {
  const { data, isLoading } = useGetQuotaStatsQuery()

  const stats = data?.data ?? []

  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold">Third-party Quotas</h2>
      <p className="mt-1 text-sm text-muted-foreground">Usage against daily service limits.</p>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading quota stats...</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.service} className="rounded-md border p-3">
              <p className="text-sm font-semibold capitalize">{stat.service}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.count} / {stat.limit} ({stat.percentage}%)
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-solar-green-600"
                  style={{ width: `${Math.min(100, stat.percentage)}%` }}
                />
              </div>
            </article>
          ))}

          {stats.length === 0 && (
            <p className="text-sm text-muted-foreground">No quota data available.</p>
          )}
        </div>
      )}
    </section>
  )
}
