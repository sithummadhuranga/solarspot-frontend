import { useCallback } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { getRoleName } from '@/lib/user'


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
  station_owner: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.feature-request', 'stations.view-stats-own',
    'reviews.read', 'reviews.create', 'reviews.edit-own', 'reviews.delete-own',
    'reviews.helpful', 'reviews.flag',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own',
    'notifications.read-own',
  ],
  featured_contributor: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.feature-request', 'stations.view-stats-own',
    'reviews.read', 'reviews.create', 'reviews.edit-own', 'reviews.delete-own',
    'reviews.helpful', 'reviews.flag',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own',
    'notifications.read-own',
  ],
  trusted_reviewer: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.feature-request', 'stations.view-stats-own',
    'reviews.read', 'reviews.create', 'reviews.edit-own', 'reviews.delete-own',
    'reviews.helpful', 'reviews.flag',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own',
    'notifications.read-own',
  ],
  review_moderator: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.read-pending', 'stations.approve', 'stations.reject', 'stations.feature',
    'reviews.read', 'reviews.read-flagged', 'reviews.create', 'reviews.edit-own',
    'reviews.delete-own', 'reviews.delete-any', 'reviews.helpful', 'reviews.flag', 'reviews.moderate',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own', 'users.read-list', 'users.manage',
    'permissions.read', 'quotas.read', 'audit.read', 'notifications.read-own',
  ],
  weather_analyst: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.read-pending', 'stations.approve', 'stations.reject', 'stations.feature',
    'reviews.read', 'reviews.read-flagged', 'reviews.create', 'reviews.edit-own',
    'reviews.delete-own', 'reviews.delete-any', 'reviews.helpful', 'reviews.flag', 'reviews.moderate',
    'weather.read', 'weather.admin', 'weather.bulk-refresh', 'weather.export',
    'users.read-public', 'users.read-own', 'users.edit-own', 'users.read-list', 'users.manage',
    'permissions.read', 'quotas.read', 'audit.read', 'notifications.read-own',
  ],
  permission_auditor: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.read-pending', 'stations.approve', 'stations.reject', 'stations.feature',
    'reviews.read', 'reviews.read-flagged', 'reviews.create', 'reviews.edit-own',
    'reviews.delete-own', 'reviews.delete-any', 'reviews.helpful', 'reviews.flag', 'reviews.moderate',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own', 'users.read-list', 'users.manage',
    'permissions.read', 'permissions.manage', 'quotas.read', 'audit.read', 'notifications.read-own',
  ],
  moderator: [
    'stations.read', 'stations.create', 'stations.edit-own', 'stations.delete-own',
    'stations.read-pending', 'stations.approve', 'stations.reject', 'stations.feature',
    'reviews.read', 'reviews.read-flagged', 'reviews.create', 'reviews.edit-own',
    'reviews.delete-own', 'reviews.delete-any', 'reviews.helpful', 'reviews.flag', 'reviews.moderate',
    'weather.read',
    'users.read-public', 'users.read-own', 'users.edit-own', 'users.read-list',
    'notifications.read-own',
  ],
  admin: [
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


export function usePermission() {
  const user = useAppSelector(selectCurrentUser)

  const hasPermission = useCallback((action: string): boolean => {
    if (!user) return ROLE_PERMISSIONS.guest?.includes(action) ?? false

    const rolePerms = ROLE_PERMISSIONS[getRoleName(user.role)] ?? []
    return rolePerms.includes(action)
  }, [user])

  return { hasPermission }
}
