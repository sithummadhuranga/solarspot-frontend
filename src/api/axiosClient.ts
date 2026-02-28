import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/app/store'
import { clearCredentials, setCredentials, setRefreshing } from '@/features/auth/authSlice'
import type { User } from '@/types/user.types'

// Empty-string base so all axios requests are relative (/api/…).
// Vite dev-server proxy (vite.config.ts) forwards /api/* → backend container.
// For local runs outside Docker, VITE_API_URL can be set; it is intentionally
// left unset in docker-compose so the empty fallback takes effect.
const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? ''

// ─── Axios instance ────────────────────────────────────────────────────────────
export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor — attach JWT ─────────────────────────────────────────
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor — auto-refresh on 401 ───────────────────────────────
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshDone(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Do NOT attempt a token refresh while the startup silent-refresh is
      // still in-flight. The App.tsx initialization gate should prevent any
      // requests reaching here, but this is a belt-and-suspenders guard.
      if (store.getState().auth.isInitializing) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          subscribeToRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosClient(originalRequest))
          })
          void reject // keep TS happy — reject is intentionally unused here
        })
      }

      isRefreshing = true
      store.dispatch(setRefreshing(true))

      try {
        const res = await axios.post<{ data: { accessToken: string; user: User } }>(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        )
        const { accessToken, user } = res.data.data
        store.dispatch(setCredentials({ user, token: accessToken }))
        onRefreshDone(accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosClient(originalRequest)
      } catch {
        store.dispatch(clearCredentials())
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
        store.dispatch(setRefreshing(false))
      }
    }

    return Promise.reject(error)
  }
)
