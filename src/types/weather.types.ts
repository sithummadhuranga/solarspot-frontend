// ─── Current weather ──────────────────────────────────────────────────────────
export interface WeatherData {
  temperature:   number      // °C
  feelsLike:     number      // °C
  humidity:      number      // %
  windSpeed:     number      // m/s
  description:   string
  icon:          string
  cloudCoverage: number      // %
  uvIndex:       number
  visibility:    number      // km
  timestamp:     string
}

// ─── Forecast ─────────────────────────────────────────────────────────────────
export interface ForecastSlot {
  timestamp:     string
  temperature:   number
  cloudCoverage: number
  description:   string
  icon:          string
}

// ─── Best charging time ───────────────────────────────────────────────────────
export interface BestTimeSlot {
  date:          string
  startHour:     number
  endHour:       number
  score:         number      // 0–100
  cloudCoverage: number
  reason:        string
}

// ─── Solar irradiance index ───────────────────────────────────────────────────
export interface SolarIndex {
  lat:        number
  lng:        number
  index:      number        // 0–100
  category:   'poor' | 'fair' | 'good' | 'excellent'
  uvIndex:    number
  cloudPct:   number
  calculatedAt: string
}

// ─── Composite types used by weatherApi ───────────────────────────────────────

/** Full forecast response (array of slots keyed by stationId) */
export interface WeatherForecast {
  stationId: string
  slots:     ForecastSlot[]
  generatedAt: string
}

/** Heatmap data point — alias for SolarIndex, used by GET /weather/heatmap */
export type HeatmapPoint = SolarIndex

/** Best time response returned by GET /weather/best-time/:stationId */
export interface BestTimeResult {
  stationId: string
  slots:     BestTimeSlot[]
  generatedAt: string
}

/** Body for POST /weather/bulk-refresh (Member 3) */
export interface BulkRefreshInput {
  stationIds?: string[]  // empty = refresh all
  force?:      boolean
}
