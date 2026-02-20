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
