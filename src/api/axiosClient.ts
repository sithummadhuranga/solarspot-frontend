import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/app/store'
import { API_BASE_URL } from '@/lib/constants'
import { refreshTokenOnce } from '@/lib/refreshSingleton'

// axiosClient base URL is derived from the same VITE_API_BASE_URL that RTK Query
// uses — defaults to '/api' so all requests are relative to the current origin.
// On Vercel: keep VITE_API_BASE_URL unset (or '/api'); the vercel.json rewrite
// forwards /api/* → Render server-side — no browser CORS needed.
// On Docker / local: Vite proxy handles /api/* → backend:5000.
const BASE_URL = API_BASE_URL

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
//
// Uses the shared `refreshTokenOnce` singleton so that Axios and RTK Query
// never race to call POST /auth/refresh simultaneously. Because the backend
// rotates the refresh cookie on every call, a second parallel refresh would
// receive "token already rotated" → 401 → clearCredentials → logout.
//
// The subscriber queue below handles the case where MULTIPLE Axios requests
// all fail with 401 at the same time: only the first spawns the refresh; the
// rest queue up and are retried once the refresh settles.

let pendingSubscribers: Array<(token: string) => void> = []
let isWaitingForRefresh = false

function enqueueRetry(cb: (token: string) => void) {
  pendingSubscribers.push(cb)
}

function flushRetryQueue(token: string) {
  pendingSubscribers.forEach((cb) => cb(token))
  pendingSubscribers = []
}

axiosClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Only intercept 401s that haven't already been retried.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Skip refresh attempts that fire before App.tsx has finished its startup
    // silent-refresh — the initialisation flow already handles this case.
    if (store.getState().auth.isInitializing) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // If a refresh is already in-flight (started by a concurrent Axios or
    // RTK Query request), queue this request and wait.
    if (isWaitingForRefresh) {
      return new Promise((resolve, reject) => {
        enqueueRetry((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(axiosClient(originalRequest))
        })
        // Provide reject so the promise is GC-able; it is only called if the
        // refresh itself never resolves (shouldn't happen in practice).
        void reject
      })
    }

    isWaitingForRefresh = true

    try {
      // refreshTokenOnce() is shared with api.ts — at most one HTTP call is
      // ever made regardless of how many parallel 401s arrive from both layers.
      const newToken = await refreshTokenOnce()

      if (newToken) {
        flushRetryQueue(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(originalRequest)
      }

      // Refresh failed — clearCredentials already dispatched inside the
      // singleton. ProtectedRoute will redirect to /login automatically;
      // no hard window.location redirect needed.
      pendingSubscribers = []
      return Promise.reject(error)
    } finally {
      isWaitingForRefresh = false
    }
  },
)

