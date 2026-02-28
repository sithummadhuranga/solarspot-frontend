// ─── API base URL ─────────────────────────────────────────────────────────────
// ARCHITECTURE: Always '/api' in production.
//   - Vercel:  vercel.json rewrites /api/* → Render server-side (no browser CORS).
//   - Docker:  vite.config.ts proxy forwards /api/* → backend container.
//   - Dev:     same Vite proxy; VITE_API_BASE_URL can override for special setups.
//
// import.meta.env.PROD is set by Vite at build time and CANNOT be overridden
// by any dashboard env var — this prevents VITE_API_BASE_URL from accidentally
// baking an absolute Render URL into the production bundle and breaking CORS.
export const API_BASE_URL: string = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  USER:      'user',
  MODERATOR: 'moderator',
  ADMIN:     'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Numeric hierarchy — higher = more permissions (0 = unauthenticated guest) */
export const ROLE_LEVEL: Record<string, number> = {
  guest:     0,
  user:      1,
  moderator: 2,
  admin:     3,
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
