import { getRoleSlug, getSafeText } from '@/lib/auth'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { User, UserPreferences, UserRole } from '@/types/user.types'

const VALID_ROLES: UserRole[] = ['user', 'moderator', 'admin']

function normalizeRole(role: unknown): UserRole {
  const slug = getRoleSlug(role)
  return VALID_ROLES.includes(slug as UserRole) ? (slug as UserRole) : 'user'
}

function normalizePreferences(preferences: unknown): UserPreferences {
  const pref = (preferences ?? {}) as Partial<UserPreferences>

  return {
    defaultRadius: Number(pref.defaultRadius ?? 50),
    connectorTypes: Array.isArray(pref.connectorTypes)
      ? pref.connectorTypes.filter((value): value is string => typeof value === 'string')
      : [],
    emailNotifications: Boolean(pref.emailNotifications),
  }
}

export function normalizeUser(user: User): User {
  return {
    ...user,
    email: getSafeText(user.email),
    displayName: getSafeText(user.displayName),
    role: normalizeRole(user.role),
    bio: user.bio == null ? null : getSafeText(user.bio),
    avatarUrl: user.avatarUrl == null ? null : getSafeText(user.avatarUrl),
    preferences: normalizePreferences(user.preferences),
  }
}

export function normalizeUserApiResponse(response: ApiResponse<User>): ApiResponse<User> {
  return {
    ...response,
    data: normalizeUser(response.data),
  }
}

export function normalizePaginatedUsersResponse(
  response: PaginatedResponse<User>
): PaginatedResponse<User> {
  return {
    ...response,
    data: response.data.map((user) => normalizeUser(user)),
  }
}