// ─── Sub-types ────────────────────────────────────────────────────────────────
export type StationStatus = 'pending' | 'active' | 'inactive' | 'rejected'
export type ConnectorType = 'USB-C' | 'Type-2' | 'CCS' | 'CHAdeMO' | 'Tesla-NACS' | 'AC-Socket'
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export type Amenity =
  | 'wifi' | 'cafe' | 'restroom' | 'parking' | 'security'
  | 'shade' | 'water' | 'repair_shop' | 'ev_parking'

export interface Connector {
  type:    ConnectorType
  powerKw: number
  count:   number
}

export interface Address {
  street?:           string
  city?:             string
  district?:         string
  country?:          string
  postalCode?:       string
  formattedAddress?: string
}

export interface GeoLocation {
  type:        'Point'
  coordinates: [number, number]  // [longitude, latitude]
}

export interface DaySchedule {
  day:       Day
  openTime:  string
  closeTime: string
}

export interface OperatingHours {
  alwaysOpen: boolean
  schedule:   DaySchedule[]
}

export interface StationSubmittedBy {
  _id:         string
  displayName: string
  avatar?:     string | null
}

// ─── Full station document ────────────────────────────────────────────────────
export interface Station {
  _id:             string
  name:            string
  description:     string | null
  location:        GeoLocation
  address:         Address
  submittedBy:     StationSubmittedBy
  connectors:      Connector[]
  solarPanelKw:    number
  amenities:       Amenity[]
  images:          string[]
  operatingHours:  OperatingHours
  status:          StationStatus
  isVerified:      boolean
  verifiedBy:      string | null
  verifiedAt:      string | null
  rejectionReason: string | null
  isFeatured:      boolean
  averageRating:   number
  reviewCount:     number
  isActive:        boolean
  deletedAt:       string | null
  deletedBy:       string | null
  createdAt:       string
  updatedAt:       string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface ConnectorInput {
  type:    ConnectorType
  powerKw: number
  count:   number
}

export interface CreateStationDto {
  name:            string
  description?:    string
  addressString?:  string
  lat?:            number
  lng?:            number
  solarPanelKw:    number
  connectors:      ConnectorInput[]
  amenities?:      Amenity[]
  images?:         string[]
  operatingHours?: OperatingHours
}

export type UpdateStationDto = Partial<CreateStationDto>

export interface RejectStationDto {
  rejectionReason: string
}

// ─── Nearby station (has extra distanceKm field) ──────────────────────────────
export interface NearbyStation extends Station {
  distanceKm: number
}

// ─── Query params ─────────────────────────────────────────────────────────────
export interface StationQueryParams {
  page?:          number
  limit?:         number
  search?:        string
  lat?:           number
  lng?:           number
  radius?:        number
  connectorType?: ConnectorType
  minRating?:     number
  isVerified?:    boolean
  amenities?:     string        // comma-separated
  sortBy?:        'newest' | 'rating' | 'distance' | 'featured'
  submittedBy?:   string
  status?:        StationStatus | 'all'
}

export interface NearbyQueryParams {
  lat:     number
  lng:     number
  radius?: number   // km, default 10
  limit?:  number   // default 20
}

export interface NearbyQueryParams {
  lat:     number
  lng:     number
  radius?: number
  limit?:  number
}
