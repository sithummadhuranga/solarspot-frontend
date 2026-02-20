import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { clearCredentials, setCredentials, setRefreshing } from '@/features/auth/authSlice'
import type { User } from '@/types/user.types'
import { API_BASE_URL } from './constants'

// ─── Raw base query ────────────────────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// ─── Refresh response shape ────────────────────────────────────────────────────
interface RefreshResponse {
  data: { user: User; token: string }
}

// ─── Base query with automatic token refresh ──────────────────────────────────
/**
 * Wraps every RTK Query request with a single-retry refresh flow:
 *  1. Execute original request.
 *  2. On 401 → call POST /auth/refresh.
 *  3. On success → store new token, retry original request.
 *  4. On refresh failure → clear credentials (redirect to /login handled by router).
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const state = api.getState() as RootState

    // Guard against concurrent refresh calls
    if (!state.auth.isRefreshing) {
      api.dispatch(setRefreshing(true))

      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      )

      api.dispatch(setRefreshing(false))

      if (refreshResult.data) {
        const { user, token } = (refreshResult as RefreshResponse).data
        api.dispatch(setCredentials({ user, token }))
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        api.dispatch(clearCredentials())
      }
    }
  }

  return result
}
