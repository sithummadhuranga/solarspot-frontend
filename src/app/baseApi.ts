import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/api'


export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
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
  endpoints: () => ({}),
})
