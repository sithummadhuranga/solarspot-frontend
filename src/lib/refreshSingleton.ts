

import axios from 'axios'
import { store } from '@/app/store'
import { clearCredentials, setCredentials, setRefreshing } from '@/features/auth/authSlice'
import { normalizeUser } from '@/lib/user'
import { API_BASE_URL } from '@/lib/constants'
import type { User } from '@/types/user.types'

let activeRefreshPromise: Promise<string | null> | null = null

function getRefreshErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return ''

  const data = error.response?.data
  if (!data || typeof data !== 'object' || !('message' in data)) return ''

  const message = (data as { message?: unknown }).message
  return typeof message === 'string' ? message.toLowerCase() : ''
}

function shouldRetryRefresh(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (!error.response) return true
  if (error.response.status >= 500) return true

  return error.response.status === 401 && getRefreshErrorMessage(error).includes('rotated')
}

async function requestRefresh(): Promise<{ accessToken: string; user: User }> {
  const res = await axios.post<{ data: { accessToken: string; user: User } }>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  )

  return res.data.data
}


export function refreshTokenOnce(): Promise<string | null> {
  if (activeRefreshPromise) {
    return activeRefreshPromise
  }

  store.dispatch(setRefreshing(true))

  activeRefreshPromise = (async () => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const { accessToken, user } = await requestRefresh()
        store.dispatch(
          setCredentials({ user: normalizeUser(user), token: accessToken }),
        )
        return accessToken
      } catch (error) {
        if (attempt === 0 && shouldRetryRefresh(error)) {
          continue
        }

        store.dispatch(clearCredentials())
        return null
      }
    }

    store.dispatch(clearCredentials())
    return null
  })()
    .finally(() => {
      activeRefreshPromise = null
      store.dispatch(setRefreshing(false))
    })

  return activeRefreshPromise
}
