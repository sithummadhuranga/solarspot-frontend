/**
 * weatherApi — RTK Query endpoints for Weather module (Member 3).
 *
 * Covers all 6 weather endpoints from PROJECT_OVERVIEW.md.
 * TODO (Member 3 — you): replace placeholder types with real shapes,
 *                        add providesTags / invalidatesTags for cache correctness.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse } from '@/types/api.types'
import type { WeatherData, WeatherForecast, HeatmapPoint, BestTimeResult, BulkRefreshInput } from '@/types/weather.types'

// ─── API slice ─────────────────────────────────────────────────────────────────
export const weatherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** GET /api/weather/:stationId — current conditions for one station */
    getStationWeather: builder.query<ApiResponse<WeatherData>, string>({
      query:       (stationId) => `/weather/${stationId}`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: stationId }],
      // TODO (Member 3): set keepUnusedDataFor based on TTL cache strategy
    }),

    /** GET /api/weather/:stationId/forecast — multi-day solar forecast */
    getStationForecast: builder.query<ApiResponse<WeatherForecast>, string>({
      query:       (stationId) => `/weather/${stationId}/forecast`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `${stationId}-forecast` }],
    }),

    /** GET /api/weather/heatmap — nationwide solar radiation heatmap data */
    getHeatmap: builder.query<ApiResponse<HeatmapPoint[]>, void>({
      query:       () => '/weather/heatmap',
      providesTags: ['Weather'],
    }),

    /** GET /api/weather/best-time/:stationId — optimal charging time windows */
    getBestTime: builder.query<ApiResponse<BestTimeResult>, string>({
      query:       (stationId) => `/weather/best-time/${stationId}`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `${stationId}-best` }],
    }),

    /** POST /api/weather/bulk-refresh — admin: force refresh all station caches */
    bulkRefresh: builder.mutation<ApiResponse<{ refreshed: number }>, BulkRefreshInput>({
      query:          (body) => ({ url: '/weather/bulk-refresh', method: 'POST', body }),
      invalidatesTags: ['Weather'],
    }),

    /** GET /api/weather/export — weather_analyst: export CSV/JSON */
    exportWeather: builder.query<Blob, { format: 'csv' | 'json'; from?: string; to?: string }>({
      query: (params) => ({ url: '/weather/export', params, responseHandler: 'content-type' }),
      // TODO (Member 3): handle file download via RTK Query or manual fetch
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetStationWeatherQuery,
  useGetStationForecastQuery,
  useGetHeatmapQuery,
  useGetBestTimeQuery,
  useBulkRefreshMutation,
  useExportWeatherQuery,
} = weatherApi
