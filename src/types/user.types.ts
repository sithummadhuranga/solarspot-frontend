// ─── Role ─────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'moderator' | 'admin'

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
  avatarUrl:        string | null
  role:             UserRole
  isEmailVerified:  boolean
  bio:              string | null
  isActive:         boolean
  preferences:      UserPreferences
  lastLoginAt:      string | null
  createdAt:        string
  updatedAt:        string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface UpdateProfileDto {
  displayName?: string
  avatarUrl?:   string
  bio?:         string
  preferences?: Partial<UserPreferences>
}

export interface AdminChangeRoleDto {
  role: UserRole
}
