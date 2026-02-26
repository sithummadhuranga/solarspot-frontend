import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * Wrap any route that requires a logged-in user:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */
export function ProtectedRoute() {
  const user     = useAppSelector(selectCurrentUser)
  const location = useLocation()

  if (!user) {
    // Preserve intended destination so LoginPage can redirect back after auth.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
