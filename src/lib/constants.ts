// ─── API base URL ─────────────────────────────────────────────────────────────
// Relative '/api' in dev → Vite proxy forwards to localhost:5000 (no CORS).
// Set VITE_API_BASE_URL to the full backend URL in production.
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  GUEST:                'guest',
  USER:                 'user',
  STATION_OWNER:        'station_owner',
  FEATURED_CONTRIBUTOR: 'featured_contributor',
  TRUSTED_REVIEWER:     'trusted_reviewer',
  REVIEW_MODERATOR:     'review_moderator',
  WEATHER_ANALYST:      'weather_analyst',
  PERMISSION_AUDITOR:   'permission_auditor',
  MODERATOR:            'moderator',
  ADMIN:                'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/**
 * Numeric privilege hierarchy (mirrors backend roleLevel).
 * 0=guest  1=user  2=station_owner/featured_contributor/trusted_reviewer
 * 3=review_moderator/weather_analyst/permission_auditor/moderator  4=admin
 */
export const ROLE_LEVEL: Record<string, number> = {
  guest:                0,
  user:                 1,
  station_owner:        2,
  featured_contributor: 2,
  trusted_reviewer:     2,
  review_moderator:     3,
  weather_analyst:      3,
  permission_auditor:   3,
  moderator:            3,
  admin:                4,
}

// ─── Station options ──────────────────────────────────────────────────────────
export const CONNECTOR_TYPES = [
  'USB-C',
  'Type-2',
  'CCS',
  'CHAdeMO',
  'Tesla-NACS',
  'AC-Socket',
] as const

export type ConnectorType = (typeof CONNECTOR_TYPES)[number]

export const AMENITIES = [
  'wifi',
  'cafe',
  'restroom',
  'parking',
  'security',
  'shade',
  'water',
  'repair_shop',
  'ev_parking',
] as const

export type Amenity = (typeof AMENITIES)[number]

export const STATION_STATUSES = [
  'pending',
  'active',
  'inactive',
  'rejected',
] as const

export type StationStatus = (typeof STATION_STATUSES)[number]

// ─── Pagination defaults ──────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE     = 50

// ─── Map defaults ─────────────────────────────────────────────────────────────
/** Colombo, Sri Lanka (default map centre) */
export const DEFAULT_MAP_CENTER: [number, number] = [6.9271, 79.8612]
export const DEFAULT_MAP_ZOOM   = 13
export const DEFAULT_SEARCH_RADIUS_KM = 10
