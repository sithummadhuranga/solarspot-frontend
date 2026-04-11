/**
 * weatherApi — RTK Query endpoints for Weather module (Member 3).
 *
 * Covers all 6 weather endpoints from PROJECT_OVERVIEW.md plus the authenticated
 * export flow used by solar admin/operator pages.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse } from '@/types/api.types'
import type {
  WeatherData,
  WeatherForecast,
  HeatmapPoint,
  BestTimeResult,
  BulkRefreshInput,
  BulkRefreshResult,
  WeatherExportQuery,
  WeatherExportResult,
} from '@/types/weather.types'

// ─── API slice ─────────────────────────────────────────────────────────────────
export const weatherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** GET /api/weather/:stationId — current conditions for one station */
    getStationWeather: builder.query<ApiResponse<WeatherData>, string>({
      query:       (stationId) => `/weather/${stationId}`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: stationId }],
      keepUnusedDataFor: 900,
    }),

    /** GET /api/weather/:stationId/forecast — multi-day solar forecast */
    getStationForecast: builder.query<ApiResponse<WeatherForecast>, string>({
      query:       (stationId) => `/weather/${stationId}/forecast`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `${stationId}-forecast` }],
      keepUnusedDataFor: 3600,
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
    bulkRefresh: builder.mutation<ApiResponse<BulkRefreshResult>, BulkRefreshInput>({
      query:          (body) => ({ url: '/weather/bulk-refresh', method: 'POST', body }),
      invalidatesTags: ['Weather'],
    }),

    /** GET /api/weather/export — privileged download with bearer auth */
    exportWeather: builder.mutation<WeatherExportResult, WeatherExportQuery>({
      query: (params) => ({
        url: '/weather/export',
        params,
        responseHandler: async (response) => {
          const blob = await response.blob()
          const disposition = response.headers.get('content-disposition') ?? ''
          const filenameMatch = /filename="?([^";]+)"?/i.exec(disposition)

          return {
            blob,
            filename: filenameMatch?.[1] ?? `weather-export.${params.format}`,
            contentType: response.headers.get('content-type') ?? 'application/octet-stream',
          }
        },
      }),
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
  useExportWeatherMutation,
} = weatherApi
