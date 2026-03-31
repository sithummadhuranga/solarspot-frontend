import type { ReactNode } from 'react'
import { BackendPermissionGuard } from '@/guards/BackendPermissionGuard'

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
  /** Rendered while permission check is loading. Defaults to null. */
  loadingFallback?: ReactNode
}

/**
 * PermissionGuard — renders children only when the current user holds `action`.
 *
 * Uses the same permission action strings as checkPermission middleware on the backend.
 * Fine-grained UI hiding — does NOT replace server-side authorization.
 *
 * Usage:
 *   <PermissionGuard action="stations.approve">
 *     <ApproveButton />
 *   </PermissionGuard>
 */
export function PermissionGuard({ action, children, fallback = null, loadingFallback = null }: PermissionGuardProps) {
  return (
    <BackendPermissionGuard
      action={action}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </BackendPermissionGuard>
  )
}
