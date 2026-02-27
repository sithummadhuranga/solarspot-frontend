import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'

interface RoleGuardProps {
  /**
   * Minimum roleLevel required. User must have role.roleLevel >= minRoleLevel.
   * Provide either minRoleLevel OR allowedRoles, not both.
   */
  minRoleLevel?: number
  /** Explicit list of allowed role name slugs (exact match). */
  allowedRoles?: string[]
  /** Rendered when the user passes the role check. */
  children: ReactNode
  /** Where to redirect on role mismatch. Defaults to /unauthorized. */
  fallback?: string
}

/**
 * RoleGuard — renders children only when the current user satisfies the role check.
 *
 * Usage examples:
 *   // Admin-only
 *   <RoleGuard allowedRoles={['admin']}>…</RoleGuard>
 *
 *   // Moderator or higher (roleLevel >= 3)
 *   <RoleGuard minRoleLevel={3}>…</RoleGuard>
 */
export function RoleGuard({
  minRoleLevel,
  allowedRoles,
  children,
  fallback = '/unauthorized',
}: RoleGuardProps) {
  const user = useAppSelector(selectCurrentUser)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userLevel    = user.role.roleLevel
  const userRoleName = user.role.name

  // Check by numeric level
  if (minRoleLevel !== undefined && userLevel < minRoleLevel) {
    return <Navigate to={fallback} replace />
  }

  // Check by explicit role name list
  if (allowedRoles && !allowedRoles.includes(userRoleName)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
