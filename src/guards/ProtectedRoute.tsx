import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Redirects unauthenticated users to /login, preserving the attempted URL
 * so they can be sent back after logging in.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
