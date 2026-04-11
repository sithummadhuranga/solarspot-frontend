import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { API_BASE_URL } from './constants'
import { refreshTokenOnce } from './refreshSingleton'

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

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

// Skip the refresh-retry cycle for ALL /auth/* routes:
//   - /auth/login, /auth/register, /auth/forgot-password, etc.
//     → a 401 here means bad credentials, not an expired token; no retry needed.
//   - /auth/refresh itself
//     → the singleton already handles rotation; retrying would start an
//       unintended second refresh call.
function shouldSkipRefresh(url: string): boolean {
  return url.startsWith('/auth/')
}

// ─── Base query with automatic token refresh ──────────────────────────────────
/**
 * Wraps every RTK Query request with a single-retry refresh flow.
 *
 * Critical: uses the shared `refreshTokenOnce` singleton from refreshSingleton.ts
 * so that Axios (axiosClient) and RTK Query NEVER simultaneously call
 * POST /auth/refresh. The backend rotates the refresh cookie on every call;
 * two parallel refreshes would cause the second one to fail, dispatch
 * clearCredentials, and log the user out.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)
  const url = getRequestUrl(args)

  if (result.error?.status === 401 && !shouldSkipRefresh(url)) {
    // refreshTokenOnce is shared with axiosClient — only one HTTP call ever
    // fires no matter how many parallel 401s arrive from both layers.
    const newToken = await refreshTokenOnce()

    if (newToken) {
      // Retry the original request; rawBaseQuery will pick up the new token
      // from the Redux store (prepareHeaders reads state.auth.token).
      result = await rawBaseQuery(args, api, extraOptions)
    }
    // If newToken is null, clearCredentials was already dispatched inside
    // refreshTokenOnce — ProtectedRoute handles the redirect to /login.
  }

  return result
}

