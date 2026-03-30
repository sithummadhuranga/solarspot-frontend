// ─── Roles (seeded in backend) ────────────────────────────────────────────────
export type UserRole =
  | 'guest'
  | 'user'
  | 'station_owner'
  | 'featured_contributor'
  | 'trusted_reviewer'
  | 'review_moderator'
  | 'weather_analyst'
  | 'permission_auditor'
  | 'moderator'
  | 'admin'

export interface UserRoleObject {
  _id: string
  name: UserRole
  displayName?: string
  roleLevel?: number
}

export type UserRoleRef = UserRole | UserRoleObject

// ─── Preferences ──────────────────────────────────────────────────────────────
export interface UserPreferences {
  defaultRadius:      number
  connectorTypes:     string[]
  emailNotifications: boolean
}

// ─── Full user document (returned by API — password never included) ────────────
export interface User {
  _id:              string
  email:            string
  displayName:      string
  avatarUrl?:       string | null
  role:             UserRole
  isEmailVerified:  boolean
  bio?:             string | null
  isActive:         boolean
  isBanned?:        boolean
  preferences?:     UserPreferences
  lastLoginAt?:     string | null
  createdAt:        string
  updatedAt:        string
  deletedAt?:       string | null
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface UpdateProfileDto {
  displayName?: string
}

export interface AdminChangeRoleDto {
  role?: UserRole
  isActive?: boolean
  isBanned?: boolean
}
