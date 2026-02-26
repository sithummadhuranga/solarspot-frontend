import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import type { UserRole } from '@/types/user.types'

interface RoleGuardProps {
  /** Roles that are allowed to access the wrapped content. */
  allowedRoles: UserRole[]
  /** Rendered when the user has the required role. */
  children: ReactNode
  /** Where to redirect on role mismatch. Defaults to /unauthorized. */
  fallback?: string
}

/**
 * RoleGuard — renders children only when the current user's role is in allowedRoles.
 *
 * TODO (Member 4): integrate with the full role hierarchy (roleLevel comparison)
 *                  once the RBAC engine is implemented.
 *
 * Usage:
 *   <RoleGuard allowedRoles={['admin', 'moderator']}>
 *     <AdminPanel />
 *   </RoleGuard>
 */
export function RoleGuard({ allowedRoles, children, fallback = '/unauthorized' }: RoleGuardProps) {
  const user = useAppSelector(selectCurrentUser)

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
