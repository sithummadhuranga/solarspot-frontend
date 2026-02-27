import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/api'

/**
 * baseApi — root RTK Query API instance.
 *
 * All feature API slices inject endpoints into this single instance so the
 * Redux middleware is registered only once (avoids duplicate cache entries).
 *
 * Usage in feature slice:
 *   export const stationsApi = baseApi.injectEndpoints({ endpoints: builder => ({ ... }) })
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Tag types used by all modules for cache invalidation.
  tagTypes: [
    'Station',
    'Review',
    'Weather',
    'SolarReport',
    'SolarAnalytics',
    'User',
    'Permission',
    'Role',
    'Policy',
    'AuditLog',
    'Quota',
    'Notification',
  ],
  // No global endpoints — each feature injects its own.
  endpoints: () => ({}),
})
