import { useEffect } from 'react'
import axios from 'axios'
import { AppRouter } from '@/router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setCredentials, setInitialized, selectIsInitializing } from '@/features/auth/authSlice'
import type { User } from '@/types/user.types'
import { API_BASE_URL } from '@/lib/constants'

/**
 * Module-level guard — survives React StrictMode's double-mount.
 *
 * StrictMode mounts → unmounts → remounts every component in development.
 * Without this flag the refresh endpoint fires twice: the first call rotates
 * the httpOnly cookie, the second arrives with the now-invalid old cookie →
 * 401 "Refresh token has already been rotated".
 */
let silentRefreshAttempted = false

/**
 * App — root component.
 *
 * KEY ARCHITECTURE NOTE:
 * We render a full-screen loading blocker while `isInitializing` is true.
 * This ensures <AppRouter /> — and therefore every child component — cannot
 * mount and fire API requests until the startup silent-refresh attempt has
 * resolved. Without this gate, child components render before the useEffect
 * runs, their API calls race with the refresh call, and the backend rejects
 * the second (duplicate) refresh with "already rotated".
 *
 * Flow on every page load / F5:
 *  1. Render loading screen (isInitializing = true → AppRouter blocked)
 *  2. useEffect fires POST /api/auth/refresh (browser sends httpOnly cookie)
 *  3a. Success → dispatch setCredentials → dispatch setInitialized
 *  3b. 401 / no cookie → dispatch setInitialized (stay logged-out silently)
 *  4. Re-render: isInitializing = false → AppRouter renders normally
 */
function App() {
  const dispatch       = useAppDispatch()
  const isInitializing = useAppSelector(selectIsInitializing)

  useEffect(() => {
    // Guard against StrictMode double-invocation.
    if (silentRefreshAttempted) return
    silentRefreshAttempted = true

    axios
      .post<{ data: { accessToken: string; user: User } }>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        dispatch(setCredentials({ token: data.data.accessToken, user: data.data.user }))
      })
      .catch(() => {
        // No valid refresh cookie — stay logged-out silently.
      })
      .finally(() => {
        dispatch(setInitialized())
      })
  }, [dispatch])

  // ── Initialization gate ────────────────────────────────────────────────────
  // Block the entire route tree until the silent refresh attempt is done.
  // This prevents any child component from firing API calls during the
  // narrow window between first render and the useEffect callback.
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
          Restoring session…
        </span>
      </div>
    )
  }

  return <AppRouter />
}

export default App
