import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'

type ApiHealthState = 'checking' | 'online' | 'offline'

export function useApiHealth(pollMs = 30000) {
  const [state, setState] = useState<ApiHealthState>('checking')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (cancelled) return
        setState(response.ok ? 'online' : 'offline')
      } catch {
        if (cancelled) return
        setState('offline')
      }
    }

    void check()
    const timer = window.setInterval(() => {
      void check()
    }, pollMs)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [pollMs])

  return state
}
