
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

export const weatherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    
    getStationWeather: builder.query<ApiResponse<WeatherData>, string>({
      query:       (stationId) => `/weather/${stationId}`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: stationId }],
      keepUnusedDataFor: 900,
    }),

    
    getStationForecast: builder.query<ApiResponse<WeatherForecast>, string>({
      query:       (stationId) => `/weather/${stationId}/forecast`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `${stationId}-forecast` }],
      keepUnusedDataFor: 3600,
    }),

    
    getHeatmap: builder.query<ApiResponse<HeatmapPoint[]>, void>({
      query:       () => '/weather/heatmap',
      providesTags: ['Weather'],
    }),

    
    getBestTime: builder.query<ApiResponse<BestTimeResult>, string>({
      query:       (stationId) => `/weather/best-time/${stationId}`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `${stationId}-best` }],
    }),

    
    bulkRefresh: builder.mutation<ApiResponse<BulkRefreshResult>, BulkRefreshInput>({
      query:          (body) => ({ url: '/weather/bulk-refresh', method: 'POST', body }),
      invalidatesTags: ['Weather'],
    }),

    
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
