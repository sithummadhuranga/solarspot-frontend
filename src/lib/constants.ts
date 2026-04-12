export const ROLE_LEVEL: Record<string, number> = {
  guest:     0,
  user:      1,
  station_owner: 2,
  featured_contributor: 2,
  trusted_reviewer: 2,
  review_moderator: 3,
  weather_analyst: 3,
  permission_auditor: 3,
  moderator: 3,
  admin:     4,
}

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

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE     = 50

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const DEFAULT_MAP_CENTER: [number, number] = [6.9271, 79.8612]
export const DEFAULT_MAP_ZOOM   = 13
export const DEFAULT_SEARCH_RADIUS_KM = 10
