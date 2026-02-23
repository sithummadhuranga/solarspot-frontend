import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { ROLE_LEVEL } from '@/lib/constants'
import type { UserRole } from '@/types/user.types'

interface RoleGuardProps {
  /** Minimum role required to view this content */
  minRole: UserRole
  children: React.ReactNode
  /** Where to send unauthorised users. Defaults to /. */
  redirectTo?: string
}

/**
 * Blocks rendering if the authenticated user's role is below minRole.
 * Must be used inside a <ProtectedRoute> so `user` is guaranteed non-null.
 */
export function RoleGuard({ minRole, children, redirectTo = '/' }: RoleGuardProps) {
  const user = useAppSelector(selectCurrentUser)

  const userLevel  = ROLE_LEVEL[user?.role ?? 'guest'] ?? 0
  const minLevel   = ROLE_LEVEL[minRole] ?? 0

  if (userLevel < minLevel) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
