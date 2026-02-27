import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/app/store'
import { clearCredentials, setToken, setRefreshing } from '@/features/auth/authSlice'

// Empty string → relative path → requests go to same origin and Vite proxies /api/* to backend.
// Override with VITE_API_URL (e.g. https://api.example.com) in production.
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

// Full base including /api prefix
const API_URL = `${BASE_URL}/api`

// ─── Axios instance ────────────────────────────────────────────────────────────
export const axiosClient = axios.create({
  baseURL: API_URL,
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

      if (isRefreshing) {
        // Queue the request until the in-flight refresh completes
        return new Promise((resolve) => {
          subscribeToRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(axiosClient(originalRequest))
          })
        })
      }

      isRefreshing = true
      store.dispatch(setRefreshing(true))

      try {
        // POST /api/auth/refresh → { success: true, data: { accessToken: string } }
        const res = await axios.post<{ success: boolean; data: { accessToken: string } }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = res.data.data.accessToken
        store.dispatch(setToken(newToken))
        onRefreshDone(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
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
