import { useEffect } from 'react'
import axios from 'axios'
import { AppRouter } from '@/router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setCredentials, setInitialized, selectIsInitializing } from '@/features/auth/authSlice'
import type { User } from '@/types/user.types'
import { API_BASE_URL } from '@/lib/constants'
import { normalizeUser } from '@/lib/user'

let silentRefreshAttempted = false

function App() {
  const dispatch = useAppDispatch()
  const isInitializing = useAppSelector(selectIsInitializing)

  useEffect(() => {
    if (silentRefreshAttempted) return
    silentRefreshAttempted = true

    axios
      .post<{ data: { accessToken: string; user: User } }>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then((response) => {
        dispatch(
          setCredentials({
            token: response.data.data.accessToken,
            user: normalizeUser(response.data.data.user),
          }),
        )
      })
      .catch(() => {
        // No valid refresh cookie.
      })
      .finally(() => {
        dispatch(setInitialized())
      })
  }, [dispatch])

  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#0d2210',
          gap: '16px',
        }}
      >
        <svg
          style={{ height: 40, width: 40, color: '#8cc63f', animation: 'spin 1s linear infinite' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" style={{ opacity: 0.75 }} />
        </svg>
        <span style={{ color: 'rgba(140,198,63,0.7)', fontSize: 13, letterSpacing: '0.05em' }}>
          Restoring session...
        </span>
      </div>
    )
  }

  return <AppRouter />
}

export default App