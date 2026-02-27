// ─── Role object returned from backend ───────────────────────────────────────
export interface UserRoleObject {
  _id:         string
  /** Role slug, e.g. 'admin', 'moderator', 'user', 'station_owner' */
  name:        string
  /** Human-readable label, e.g. 'Admin', 'Moderator' */
  displayName: string
  /** Numeric privilege level: 0=guest, 1=user, 2=level2, 3=level3, 4=admin */
  roleLevel:   number
}

/** All valid role slugs in the system */
export type RoleName =
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

// ─── Full user document (returned by API — password never included) ────────────
export interface User {
  _id:             string
  email:           string
  displayName:     string
  avatarUrl?:      string
  role:            UserRoleObject
  bio?:            string
  isActive:        boolean
  isEmailVerified: boolean
  isBanned:        boolean
  createdAt:       string
  updatedAt:       string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface UpdateProfileDto {
  displayName?: string
  avatarUrl?:   string
  bio?:         string
}

/** Admin endpoint body: PUT /api/users/:id */
export interface AdminUpdateUserDto {
  /** Role slug to assign */
  role?:     string
  isActive?: boolean
  isBanned?: boolean
}

/** @deprecated use AdminUpdateUserDto */
export type AdminChangeRoleDto = AdminUpdateUserDto
