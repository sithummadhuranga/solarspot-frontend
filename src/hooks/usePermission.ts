import { useCallback } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'

/**
 * Role-to-permissions lookup table derived from PROJECT_OVERVIEW.md.
 *
 * This is a client-side approximation for UI rendering — the server always
 * performs the authoritative check. Never rely on this for security decisions.
 *
 * TODO (Member 4): replace with a live lookup against GET /api/permissions/users/:id/overrides
 *                  to account for per-user overrides and policy conditions.
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  guest: [
    'stations.read',
    'reviews.read',
    'weather.read',
    'users.read-public',
  ],
  user: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.feature-request', 'stations.view-stats-own',
    'reviews.read', 'reviews.create', 'reviews.edit-own', 'reviews.delete-own',
    'reviews.helpful', 'reviews.flag',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own',
    'notifications.read-own',
  ],
  moderator: [
    // Inherits all user permissions + moderation
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.read-pending', 'stations.approve', 'stations.reject', 'stations.feature',
    'reviews.read', 'reviews.read-flagged', 'reviews.create', 'reviews.edit-own',
    'reviews.delete-own', 'reviews.delete-any', 'reviews.helpful', 'reviews.flag', 'reviews.moderate',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own', 'users.read-list',
    'notifications.read-own',
  ],
  admin: [
    // All permissions
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.read-pending', 'stations.approve', 'stations.reject', 'stations.feature',
    'stations.edit-any', 'stations.delete-any', 'stations.feature-request', 'stations.view-stats-own',
    'reviews.read', 'reviews.read-flagged', 'reviews.create', 'reviews.edit-own',
    'reviews.delete-own', 'reviews.delete-any', 'reviews.helpful', 'reviews.flag', 'reviews.moderate',
    'weather.read', 'weather.admin', 'weather.bulk-refresh', 'weather.export',
    'users.read-public', 'users.read-own', 'users.edit-own', 'users.read-list', 'users.manage',
    'permissions.read', 'permissions.manage', 'quotas.read', 'audit.read', 'notifications.read-own',
  ],
}

/**
 * usePermission — check if the current user holds a named permission.
 *
 * Returns a stable `hasPermission` callback that can be called with any
 * permission action string from PROJECT_OVERVIEW.md.
 *
 * Usage:
 *   const { hasPermission } = usePermission()
 *   if (hasPermission('stations.approve')) { ... }
 */
export function usePermission() {
  const user = useAppSelector(selectCurrentUser)

  const hasPermission = useCallback((action: string): boolean => {
    if (!user) return ROLE_PERMISSIONS.guest?.includes(action) ?? false

    const rolePerms = ROLE_PERMISSIONS[user.role.name] ?? []
    return rolePerms.includes(action)
  }, [user])

  return { hasPermission }
}
