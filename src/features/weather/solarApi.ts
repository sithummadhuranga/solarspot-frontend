/**
 * solarApi — RTK Query endpoints for Solar Intelligence module (Member 3).
 *
 * Injects into the shared baseApi instance (required — do NOT use createApi).
 * Tag types 'SolarReport' and 'SolarAnalytics' are already registered in baseApi.ts.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A5
 */
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

// ─── Solar API slice (injected into baseApi) ──────────────────────────────────

export const solarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Station-scoped read-only endpoints (no auth required) ─────────────────

    /** GET /api/solar/stations/:stationId/live-weather */
    getLiveWeather: builder.query<ApiResponse<LiveWeatherResponse>, string>({
      query:        (stationId) => `/solar/stations/${stationId}/live-weather`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `solar:${stationId}` }],
      keepUnusedDataFor: 1800,   // matches OWM cache TTL
    }),

    /** GET /api/solar/stations/:stationId/forecast */
    getSolarForecast: builder.query<ApiResponse<ForecastWithSolarResponse>, string>({
      query:        (stationId) => `/solar/stations/${stationId}/forecast`,
      providesTags: (_res, _err, stationId) => [{ type: 'Weather', id: `solar:forecast:${stationId}` }],
      keepUnusedDataFor: 1800,
    }),

    /** GET /api/solar/stations/:stationId/analytics */
    getStationAnalytics: builder.query<ApiResponse<StationAnalytics>, string>({
      query:        (stationId) => `/solar/stations/${stationId}/analytics`,
      providesTags: (_res, _err, stationId) => [{ type: 'SolarAnalytics', id: stationId }],
    }),

    // ── Report collection endpoints ───────────────────────────────────────────

    /** GET /api/solar/reports — paginated with filters */
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

    /** GET /api/solar/reports/:id */
    getSolarReportById: builder.query<ApiResponse<SolarReport>, string>({
      query:        (id) => `/solar/reports/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SolarReport', id }],
    }),

    // ── Mutation endpoints (auth required) ────────────────────────────────────

    /** POST /api/solar/reports */
    createSolarReport: builder.mutation<ApiResponse<SolarReport>, CreateReportDto>({
      query:           (body) => ({ url: '/solar/reports', method: 'POST', body }),
      invalidatesTags: [
        { type: 'SolarReport', id: 'LIST' },
        // Analytics cache is now stale
        'SolarAnalytics',
      ],
    }),

    /** PUT /api/solar/reports/:id */
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

    /** DELETE /api/solar/reports/:id */
    deleteSolarReport: builder.mutation<void, string>({
      query:           (id) => ({ url: `/solar/reports/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'SolarReport', id },
        { type: 'SolarReport', id: 'LIST' },
        'SolarAnalytics',
      ],
    }),

    /** PATCH /api/solar/reports/:id/publish */
    publishSolarReport: builder.mutation<ApiResponse<SolarReport>, string>({
      query:           (id) => ({ url: `/solar/reports/${id}/publish`, method: 'PATCH' }),
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
} = solarApi
