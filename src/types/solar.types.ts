// ─── Weather Snapshot (from OWM, embedded in SolarReport) ────────────────────
export interface WeatherSnapshot {
  cloudCoverPct:  number
  uvIndex:        number
  temperatureC:   number
  windSpeedKph:   number
  weatherMain:    string
  weatherIcon:    string           // OWM icon code e.g. "01d"
  capturedAt:     string           // ISO date string
  isFallback?:    boolean
}

// ─── Solar Report (crowdsourced observation) ──────────────────────────────────
export interface SolarReport {
  _id:               string
  station:           string | { _id: string; name: string; solarPanelKw: number }
  submittedBy:       string | { _id: string; displayName: string }
  visitedAt:         string
  weatherSnapshot:   WeatherSnapshot
  estimatedOutputKw: number
  actualOutputKw:    number | null
  accuracyPct:       number | null
  solarScore:        number        // 0–10
  notes:             string | null
  status:            'draft' | 'published'
  isPublic:          boolean
  isActive:          boolean
  isDeleted:         boolean
  createdAt:         string
  updatedAt:         string
}

// ─── DTOs (request bodies) ────────────────────────────────────────────────────
export interface CreateReportDto {
  stationId:       string
  visitedAt?:      string
  actualOutputKw?: number | null
  notes?:          string | null
  isPublic?:       boolean
}

export interface UpdateReportDto {
  actualOutputKw?: number | null
  notes?:          string | null
  isPublic?:       boolean
}

export interface ReportQuery {
  stationId?:   string
  submittedBy?: string
  status?:      'draft' | 'published'
  isPublic?:    boolean
  from?:        string
  to?:          string
  page?:        number
  limit?:       number
  sort?:        'newest' | 'oldest' | 'score'
}

// ─── Paginated response ───────────────────────────────────────────────────────
export interface PaginationMeta {
  page:       number
  limit:      number
  total:      number
  totalPages: number
  hasNext:    boolean
  hasPrev:    boolean
}

export interface PaginatedReportsResponse {
  data:       SolarReport[]
  pagination: PaginationMeta
}

// ─── Live weather response ────────────────────────────────────────────────────
export interface LiveWeatherResponse {
  stationId:         string
  stationName:       string
  solarPanelKw:      number
  weather:           WeatherSnapshot
  estimatedOutputKw: number
  solarScore:        number
}

// ─── Forecast slot (annotated with solar calc) ────────────────────────────────
export interface ForecastSlot {
  dt:               string          // ISO string
  cloudCoverPct:    number
  temperatureC:     number
  windSpeedKph:     number
  weatherMain:      string
  weatherIcon:      string
  uvIndex:          number
  estimatedOutputKw?: number
  solarScore?:      number
}

// ─── Best charging window ─────────────────────────────────────────────────────
export interface BestWindow {
  dt:               string          // ISO string
  estimatedOutputKw: number
  solarScore:       number
  cloudCoverPct:    number
  weatherMain:      string
  weatherIcon:      string
  label:            string          // "Best" | "Good" | "Acceptable"
}

// ─── Forecast response ────────────────────────────────────────────────────────
export interface ForecastWithSolarResponse {
  stationId:    string
  stationName:  string
  solarPanelKw: number
  forecast:     ForecastSlot[]
  bestWindows:  BestWindow[]
}

// ─── Station analytics ────────────────────────────────────────────────────────
export interface DayAggregate {
  _id:         string   // "YYYY-MM-DD"
  avgScore:    number
  reportCount: number
}

export interface StationAnalytics {
  hasData:              boolean
  reportCount:          number
  avgSolarScore:        number
  avgAccuracyPct:       number | null
  avgEstimatedOutputKw: number
  avgActualOutputKw:    number | null
  last30Days:           DayAggregate[]
}
