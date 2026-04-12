import { useGetQuotaStatsQuery } from '@/features/permissions/permissionsApi'
import { useAuth } from './useAuth'

const QUOTA_LIMITS: Record<string, number> = {
  brevo:       300,
  openweathermap: 1000,
  perspective: 1440,  // 1 QPS × 60 × 24
  nominatim: 1000,
  cloudinary:  Infinity,
}

const ALERT_THRESHOLD = 0.8


export function useQuota() {
  const { role } = useAuth()
  const isAdmin  = role === 'admin' || role === 'moderator' || role === 'permission_auditor'

  const { data, isLoading, error } = useGetQuotaStatsQuery(undefined, {
    skip: !isAdmin,
    pollingInterval: 5 * 60 * 1000, // re-fetch every 5 min
  })

  const quotas = data?.data ?? []

  const isNearLimit = (service: string): boolean => {
    const stat  = quotas.find((q) => q.service === service)
    if (!stat) return false
    const limit = stat.limit ?? QUOTA_LIMITS[service] ?? Infinity
    return stat.count / limit >= ALERT_THRESHOLD
  }

  const usagePct = (service: string): number => {
    const stat  = quotas.find((q) => q.service === service)
    if (!stat) return 0
    const limit = stat.limit ?? QUOTA_LIMITS[service] ?? Infinity
    return Math.min(100, Math.round((stat.count / limit) * 100))
  }

  return { quotas, isLoading, error, isNearLimit, usagePct }
}
