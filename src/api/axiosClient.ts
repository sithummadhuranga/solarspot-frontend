import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/app/store'
import { API_BASE_URL } from '@/lib/constants'
import { refreshTokenOnce } from '@/lib/refreshSingleton'

const BASE_URL = API_BASE_URL

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


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

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (store.getState().auth.isInitializing) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isWaitingForRefresh) {
      return new Promise((resolve, reject) => {
        enqueueRetry((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(axiosClient(originalRequest))
        })
        void reject
      })
    }

    isWaitingForRefresh = true

    try {
      const newToken = await refreshTokenOnce()

      if (newToken) {
        flushRetryQueue(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(originalRequest)
      }

      pendingSubscribers = []
      return Promise.reject(error)
    } finally {
      isWaitingForRefresh = false
    }
  },
)

