export interface WeatherSnapshot {
  cloudCoverPct: number
  uvIndex: number
  temperatureC: number
  windSpeedKph: number
  weatherMain: string
  weatherIcon: string
  capturedAt: string
  isFallback?: boolean
}

export interface SolarStationSummary {
  _id: string
  name: string
  solarPanelKw: number
  address?: {
    city?: string | null
  }
}

export interface SolarUserSummary {
  _id: string
  displayName: string
  avatarUrl?: string | null
}

export interface SolarReport {
  _id: string
  station: string | SolarStationSummary
  submittedBy: string | SolarUserSummary
  visitedAt: string
  weatherSnapshot: WeatherSnapshot
  estimatedOutputKw: number
  actualOutputKw: number | null
  accuracyPct: number | null
  accuracyLabel?: string
  solarScore: number
  notes: string | null
  status: 'draft' | 'published' | 'archived'
  isPublic: boolean
  isActive: boolean
  deletedAt?: string | null
  deletedBy?: string | null
  schemaVersion?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReportDto {
  stationId: string
  visitedAt?: string
  actualOutputKw?: number | null
  notes?: string | null
  isPublic?: boolean
}

export interface UpdateReportDto {
  actualOutputKw?: number | null
  notes?: string | null
  isPublic?: boolean
}

export interface ReportQuery {
  stationId?: string
  userId?: string
  submittedBy?: string
  status?: 'draft' | 'published' | 'archived'
  isPublic?: boolean
  dateFrom?: string
  dateTo?: string
  from?: string
  to?: string
  minScore?: number
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'highest-score' | 'most-accurate' | 'score'
}

export interface LiveWeatherResponse {
  station: {
    _id: string
    name: string
    solarPanelKw: number
    address: {
      city: string | null
    }
  }
  weather: WeatherSnapshot
  solar: {
    estimatedOutputKw: number
    solarScore: number
    cloudFactor: number
    uvFactor: number
  }
  generatedAt: string
}

export interface ForecastSlot {
  dt: string
  cloudCoverPct: number
  temperatureC: number
  windSpeedKph: number
  weatherMain: string
  weatherIcon: string
  uvIndex: number
  estimatedOutputKw?: number
  solarScore?: number
}

export interface BestWindow {
  dt: string
  estimatedOutputKw: number
  solarScore: number
  cloudCoverPct: number
  weatherMain: string
  weatherIcon: string
  label: string
}

export interface ForecastWithSolarResponse {
  station: {
    _id: string
    name: string
    solarPanelKw: number
  }
  forecast: ForecastSlot[]
  bestWindows: BestWindow[]
  generatedAt: string
}

export interface StationAnalyticsOverview {
  totalReports: number
  avgSolarScore: number
  avgEstimatedOutputKw: number
  avgActualOutputKw: number
  avgAccuracyPct: number
  maxSolarScore: number
  minSolarScore: number
}

export interface ScoreDistributionPoint {
  _id: number | string
  count: number
  avgScore: number
}

export interface ScoreAggregate {
  _id: number
  avgScore: number
  count: number
}

export interface DayAggregate {
  _id: string
  avgScore: number
  reportCount: number
}

export interface StationAnalytics {
  hasData: boolean
  overview: StationAnalyticsOverview
  byDayOfWeek: ScoreAggregate[]
  byHourOfDay: ScoreAggregate[]
  accuracyDistribution: ScoreDistributionPoint[]
  last30Days: DayAggregate[]
}
