import type { ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'

interface PermissionGuardProps {
  /**
   * The permission action string to check, e.g. 'stations.approve'.
   * Must match an action defined in PROJECT_OVERVIEW.md Permissions section.
   */
  action: string
  /** Rendered when the user holds the required permission. */
  children: ReactNode
  /** Rendered when the user lacks permission. Defaults to null (invisible). */
  fallback?: ReactNode
}

/**
 * PermissionGuard — renders children only when the current user holds `action`.
 *
 * Uses the same permission action strings as checkPermission middleware on the backend.
 * Fine-grained UI hiding — does NOT replace server-side authorization.
 *
 * TODO (Member 4): connect to PermissionEngine evaluation via permissions API
 *                  once GET /api/permissions/users/:id/overrides is implemented.
 *
 * Usage:
 *   <PermissionGuard action="stations.approve">
 *     <ApproveButton />
 *   </PermissionGuard>
 */
export function PermissionGuard({ action, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = usePermission()

  if (!hasPermission(action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
