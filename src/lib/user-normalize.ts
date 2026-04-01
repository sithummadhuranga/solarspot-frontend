import { getRoleSlug, getSafeText } from '@/lib/auth'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { User, UserPreferences, UserRole } from '@/types/user.types'

const VALID_ROLES: UserRole[] = [
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
const VALID_ROLE_SET = new Set<UserRole>(VALID_ROLES)

function normalizeRole(role: unknown): UserRole {
  const normalized = getRoleSlug(role).trim().toLowerCase() as UserRole
  return VALID_ROLE_SET.has(normalized) ? normalized : 'user'
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