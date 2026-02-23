import { useGetQuotaStatsQuery } from '@/features/permissions/permissionsApi'
import { useAuth } from './useAuth'

// Daily limits match PROJECT_OVERVIEW.md Third-Party APIs table.
const QUOTA_LIMITS: Record<string, number> = {
  brevo:       300,
  openweather: 1000,
  perspective: 1440,  // 1 QPS × 60 × 24
  cloudinary:  Infinity,
}

// Alert threshold: 80% of limit.
const ALERT_THRESHOLD = 0.8

/**
 * useQuota — read-only view of third-party API quota usage.
 *
 * Only admins can fetch quota data (requires `quotas.read` permission).
 * For other roles this hook returns null data without making an API call.
 *
 * TODO (Member 4): add real-time quota alert notifications once
 *                  the notification system is implemented.
 *
 * Usage:
 *   const { quotas, isNearLimit } = useQuota()
 *   if (isNearLimit('openweather')) { showWarning() }
 */
export function useQuota() {
  const { role } = useAuth()
  const isAdmin  = role === 'admin'

  // Skip the network call for non-admins.
  const { data, isLoading, error } = useGetQuotaStatsQuery(undefined, {
    skip: !isAdmin,
    pollingInterval: 5 * 60 * 1000, // re-fetch every 5 min
  })

  const quotas = data?.data ?? []

  const isNearLimit = (service: string): boolean => {
    const stat  = quotas.find((q) => q.service === service)
    if (!stat) return false
    const limit = QUOTA_LIMITS[service] ?? Infinity
    return stat.count / limit >= ALERT_THRESHOLD
  }

  const usagePct = (service: string): number => {
    const stat  = quotas.find((q) => q.service === service)
    if (!stat) return 0
    const limit = QUOTA_LIMITS[service] ?? Infinity
    return Math.min(100, Math.round((stat.count / limit) * 100))
  }

  return { quotas, isLoading, error, isNearLimit, usagePct }
}
