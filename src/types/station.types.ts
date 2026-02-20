// ─── Sub-types ────────────────────────────────────────────────────────────────
export type StationStatus = 'pending' | 'active' | 'inactive' | 'rejected'
export type ConnectorType = 'USB-C' | 'Type-2' | 'CCS' | 'CHAdeMO' | 'Tesla-NACS' | 'AC-Socket'
export type Amenity =
  | 'wifi' | 'cafe' | 'restroom' | 'parking' | 'security'
  | 'shade' | 'water' | 'repair_shop' | 'ev_parking'

export interface Connector {
  type:    ConnectorType
  powerKw: number
  count:   number
}

export interface Address {
  street?:          string
  city?:            string
  district?:        string
  country?:         string
  postalCode?:      string
  formattedAddress?: string
}

export interface GeoLocation {
  type:        'Point'
  coordinates: [number, number]  // [longitude, latitude]
}

export interface DaySchedule {
  day:       'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  openTime:  string
  closeTime: string
}

export interface OperatingHours {
  alwaysOpen: boolean
  schedule:   DaySchedule[]
}

// ─── Full station document ────────────────────────────────────────────────────
export interface Station {
  _id:             string
  name:            string
  description:     string | null
  location:        GeoLocation
  address:         Address
  submittedBy:     string
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
export interface CreateStationDto {
  name:           string
  description?:   string
  address:        string
  solarPanelKw:   number
  connectors:     Omit<Connector, 'count'>[]
  amenities?:     Amenity[]
  operatingHours?: Pick<OperatingHours, 'alwaysOpen'>
}

export type UpdateStationDto = Partial<CreateStationDto>

export interface RejectStationDto {
  reason: string
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
  amenities?:     string
  sortBy?:        'rating' | 'newest' | 'distance'
}
