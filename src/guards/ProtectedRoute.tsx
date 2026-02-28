import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser, selectIsInitializing } from '@/features/auth/authSlice'

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * IMPORTANT: We first wait for the startup silent-refresh attempt to complete
 * (isInitializing === true). This prevents a race condition where Redux has
 * not yet been hydrated from the httpOnly refresh cookie and the route guard
 * incorrectly boots the user to /login on every page refresh.
 *
 * Wrap any route that requires a logged-in user:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */
export function ProtectedRoute() {
  const user           = useAppSelector(selectCurrentUser)
  const isInitializing = useAppSelector(selectIsInitializing)
  const location       = useLocation()

  // Still attempting silent refresh from cookie — render nothing (no flash).
  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d2210]">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-10 w-10 animate-spin text-[#8cc63f]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-sm text-[#8cc63f]/70 tracking-wide">
            Restoring session…
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    // Preserve intended destination so LoginPage can redirect back after auth.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

