/**
 * refreshSingleton — single source of truth for token refresh.
 *
 * WHY THIS EXISTS:
 * The app has two independent HTTP layers: Axios (React Query / stations.api)
 * and RTK Query (baseQueryWithReauth). Both attach 401 interceptors that
 * trigger a refresh call. Because the backend uses refresh-token rotation
 * (each token is one-shot), if both layers fire POST /auth/refresh at the
 * same time with the same cookie, the second request always gets
 * "Refresh token has already been rotated" → 401 → clearCredentials → logout.
 *
 * This module holds ONE shared Promise for any in-flight refresh. Both
 * axiosClient.ts and api.ts import `refreshTokenOnce()`. No matter how many
 * 401s arrive simultaneously (from Axios or RTK Query), only a single
 * POST /auth/refresh is ever made — all callers await the same result.
 */

import axios from 'axios'
import { store } from '@/app/store'
import { clearCredentials, setCredentials, setRefreshing } from '@/features/auth/authSlice'
import { normalizeUser } from '@/lib/user'
import { API_BASE_URL } from '@/lib/constants'
import type { User } from '@/types/user.types'

// The single in-flight refresh promise — null when no refresh is active.
let activeRefreshPromise: Promise<string | null> | null = null

/**
 * Attempt a token refresh. If a refresh is already in-flight, the caller
 * awaits the existing promise (no duplicate request is made).
 *
 * @returns the new access token on success, or null on failure.
 *          On failure, `clearCredentials` is dispatched into the Redux store
 *          so ProtectedRoute redirects to /login automatically — callers do
 *          NOT need to handle navigation themselves.
 */
export function refreshTokenOnce(): Promise<string | null> {
  // Reuse an in-flight refresh rather than issuing a second one.
  if (activeRefreshPromise) {
    return activeRefreshPromise
  }

  store.dispatch(setRefreshing(true))

  // Use a plain axios instance (not axiosClient) to avoid triggering our own
  // 401 interceptor in a loop if the refresh endpoint itself returns 401.
  activeRefreshPromise = axios
    .post<{ data: { accessToken: string; user: User } }>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    .then((res) => {
      const { accessToken, user } = res.data.data
      store.dispatch(
        setCredentials({ user: normalizeUser(user), token: accessToken }),
      )
      return accessToken
    })
    .catch(() => {
      // Refresh failed (expired / rotated / network error).
      // Clear Redux state so ProtectedRoute redirects to /login — no
      // hard window.location redirect needed.
      store.dispatch(clearCredentials())
      return null
    })
    .finally(() => {
      // Reset the singleton so future 401s (after the user re-logs in) work.
      activeRefreshPromise = null
      store.dispatch(setRefreshing(false))
    })

  return activeRefreshPromise
}
