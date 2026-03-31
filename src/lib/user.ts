import type { User, UserRole, UserRoleObject, UserRoleRef } from '@/types/user.types'

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Guest',
  user: 'User',
  station_owner: 'Station Owner',
  featured_contributor: 'Featured Contributor',
  trusted_reviewer: 'Trusted Reviewer',
  review_moderator: 'Review Moderator',
  weather_analyst: 'Weather Analyst',
  permission_auditor: 'Permission Auditor',
  moderator: 'Moderator',
  admin: 'Admin',
}

export const EDITABLE_ROLES: UserRole[] = [
  'guest',
  'user',
  'station_owner',
  'featured_contributor',
  'trusted_reviewer',
  'review_moderator',
  'weather_analyst',
  'permission_auditor',
  'moderator',
  'admin',
]

function isRoleObject(value: UserRoleRef | undefined): value is UserRoleObject {
  return typeof value === 'object' && value !== null && '_id' in value && 'name' in value
}

export function getRoleName(role: UserRoleRef | undefined): UserRole {
  if (!role) return 'user'
  if (isRoleObject(role)) return role.name
  return role
}

export function normalizeUser(raw: Partial<User> & { role?: UserRoleRef }): User {
  return {
    _id: String(raw._id ?? ''),
    email: String(raw.email ?? ''),
    displayName: String(raw.displayName ?? ''),
    avatarUrl: raw.avatarUrl ?? null,
    role: getRoleName(raw.role),
    isEmailVerified: Boolean(raw.isEmailVerified),
    bio: raw.bio ?? null,
    isActive: raw.isActive ?? true,
    isBanned: Boolean(raw.isBanned),
    preferences: raw.preferences,
    lastLoginAt: raw.lastLoginAt ?? null,
    createdAt: String(raw.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date(0).toISOString()),
    deletedAt: raw.deletedAt ?? null,
  }
}
