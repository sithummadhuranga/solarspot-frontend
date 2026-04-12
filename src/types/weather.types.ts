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

export interface ForecastSlot {
  timestamp:     string
  temperature:   number
  cloudCoverage: number
  description:   string
  icon:          string
}

export interface BestTimeSlot {
  date:          string
  startHour:     number
  endHour:       number
  score:         number      // 0–100
  cloudCoverage: number
  reason:        string
}

export interface SolarIndex {
  lat:        number
  lng:        number
  index:      number        // 0–100
  category:   'poor' | 'fair' | 'good' | 'excellent'
  uvIndex:    number
  cloudPct:   number
  calculatedAt: string
}



export interface WeatherForecast {
  stationId: string
  slots:     ForecastSlot[]
  generatedAt: string
}


export type HeatmapPoint = SolarIndex


export interface BestTimeResult {
  stationId: string
  slots:     BestTimeSlot[]
  generatedAt: string
}


export interface BulkRefreshInput {
  stationIds?: string[]  // empty = refresh all
  force?:      boolean
}

export interface BulkRefreshResult {
  refreshed: number
  failed: number
}

export interface WeatherExportQuery {
  format: 'csv' | 'json'
  stationId?: string
  from?: string
  to?: string
}

export interface WeatherExportResult {
  blob: Blob
  filename: string
  contentType: string
}
