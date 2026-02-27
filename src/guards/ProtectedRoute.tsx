import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectToken, selectIsInitialized } from '@/features/auth/authSlice'

function PageSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-solar-green-200 border-t-solar-green-600 animate-spin" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  )
}

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * Waits for the app's initial silent refresh attempt to complete
 * (isInitialized = true) before making a redirect decision, so users
 * with a valid refreshToken cookie aren't bounced to /login on hard reload.
 *
 * Wrap any route that requires a logged-in user:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */
export function ProtectedRoute() {
  const token         = useAppSelector(selectToken)
  const isInitialized = useAppSelector(selectIsInitialized)
  const location      = useLocation()

  // Show spinner while the boot refresh is in-flight
  if (!isInitialized) {
    return <PageSkeleton />
  }

  if (!token) {
    // Preserve intended destination so LoginPage can redirect back after auth.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
