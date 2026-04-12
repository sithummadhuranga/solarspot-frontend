
import { baseApi }       from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  LiveWeatherResponse,
  ForecastWithSolarResponse,
  StationAnalytics,
  SolarReport,
  CreateReportDto,
  UpdateReportDto,
  ReportQuery,
} from '@/types/solar.types'


export const solarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({


    
    getLiveWeather: builder.query<ApiResponse<LiveWeatherResponse>, string>({
      query:        (stationId) => `/solar/stations/${stationId}/live-weather`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `solar:${stationId}` }],
      keepUnusedDataFor: 900,
    }),

    
    getSolarForecast: builder.query<ApiResponse<ForecastWithSolarResponse>, string>({
      query:        (stationId) => `/solar/stations/${stationId}/forecast`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `solar:forecast:${stationId}` }],
      keepUnusedDataFor: 3600,
    }),

    
    getStationAnalytics: builder.query<ApiResponse<StationAnalytics>, string>({
      query:        (stationId) => `/solar/stations/${stationId}/analytics`,
      providesTags: (_res, _err, stationId) => [{ type: 'SolarAnalytics', id: stationId }],
    }),


    
    getSolarReports: builder.query<PaginatedResponse<SolarReport>, ReportQuery>({
      query:        (params) => ({ url: '/solar/reports', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'SolarReport' as const, id: _id })),
              { type: 'SolarReport', id: 'LIST' },
            ]
          : [{ type: 'SolarReport', id: 'LIST' }],
    }),

    
    getSolarReportById: builder.query<ApiResponse<SolarReport>, string>({
      query:        (id) => `/solar/reports/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SolarReport', id }],
    }),


    
    createSolarReport: builder.mutation<ApiResponse<SolarReport>, CreateReportDto>({
      query:           (body) => ({ url: '/solar/reports', method: 'POST', body }),
      invalidatesTags: (_res, _err, body) => [
        { type: 'SolarReport', id: 'LIST' },
        { type: 'SolarAnalytics', id: body.stationId },
        'SolarAnalytics',
      ],
    }),

    
    updateSolarReport: builder.mutation<
      ApiResponse<SolarReport>,
      { id: string; body: UpdateReportDto }
    >({
      query:           ({ id, body }) => ({ url: `/solar/reports/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'SolarReport', id },
        { type: 'SolarReport', id: 'LIST' },
        'SolarAnalytics',
      ],
    }),

    
    deleteSolarReport: builder.mutation<void, string>({
      query:           (id) => ({ url: `/solar/reports/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'SolarReport', id },
        { type: 'SolarReport', id: 'LIST' },
        'SolarAnalytics',
      ],
    }),

    
    publishSolarReport: builder.mutation<ApiResponse<SolarReport>, string>({
      query:           (id) => ({ url: `/solar/reports/${id}/publish`, method: 'PATCH' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'SolarReport', id },
        { type: 'SolarReport', id: 'LIST' },
        'SolarAnalytics',
      ],
    }),

    
    archiveSolarReport: builder.mutation<ApiResponse<SolarReport>, string>({
      query:           (id) => ({ url: `/solar/reports/${id}/archive`, method: 'PATCH' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'SolarReport', id },
        { type: 'SolarReport', id: 'LIST' },
        'SolarAnalytics',
      ],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetLiveWeatherQuery,
  useGetSolarForecastQuery,
  useGetStationAnalyticsQuery,
  useGetSolarReportsQuery,
  useGetSolarReportByIdQuery,
  useCreateSolarReportMutation,
  useUpdateSolarReportMutation,
  useDeleteSolarReportMutation,
  usePublishSolarReportMutation,
  useArchiveSolarReportMutation,
} = solarApi
