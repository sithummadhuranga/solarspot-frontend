/**
 * stationsApi — RTK Query endpoints for Stations module (Member 1).
 *
 * Covers all 11 station endpoints from PROJECT_OVERVIEW.md.
 * TODO (Member 1): replace placeholder types with real request/response shapes
 *                  and implement cache invalidation providesTags / invalidatesTags.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { Station, CreateStationDto as CreateStationInput, UpdateStationDto as UpdateStationInput, StationQueryParams as ListStationsQuery } from '@/types/station.types'

// NearbyQuery — inline until Member 1 defines it in station.types.ts
interface NearbyQuery { lat: number; lng: number; radius?: number; limit?: number }

// ─── API slice ─────────────────────────────────────────────────────────────────
export const stationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** GET /api/stations — paginated list with filters */
    listStations: builder.query<PaginatedResponse<Station>, ListStationsQuery>({
      query: (params) => ({ url: '/stations', params }),
      providesTags: ['Station'],
      // TODO (Member 1): implement providesTags with id-based granularity
    }),

    /** GET /api/stations/nearby — geospatial $nearSphere */
    getNearbyStations: builder.query<ApiResponse<Station[]>, NearbyQuery>({
      query: (params) => ({ url: '/stations/nearby', params }),
      providesTags: ['Station'],
    }),

    /** GET /api/stations/search — text index + filters */
    searchStations: builder.query<PaginatedResponse<Station>, { q: string }>({
      query: (params) => ({ url: '/stations/search', params }),
      providesTags: ['Station'],
    }),

    /** GET /api/stations/:id */
    getStation: builder.query<ApiResponse<Station>, string>({
      query: (id) => `/stations/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Station', id }],
    }),

    /** POST /api/stations */
    createStation: builder.mutation<ApiResponse<Station>, CreateStationInput>({
      query: (body) => ({ url: '/stations', method: 'POST', body }),
      invalidatesTags: ['Station'],
    }),

    /** PUT /api/stations/:id */
    updateStation: builder.mutation<ApiResponse<Station>, { id: string } & UpdateStationInput>({
      query: ({ id, ...body }) => ({ url: `/stations/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Station', id }],
    }),

    /** DELETE /api/stations/:id */
    deleteStation: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/stations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Station'],
    }),

    /** PATCH /api/stations/:id/approve */
    approveStation: builder.mutation<ApiResponse<Station>, string>({
      query: (id) => ({ url: `/stations/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Station', id }],
    }),

    /** PATCH /api/stations/:id/reject */
    rejectStation: builder.mutation<ApiResponse<Station>, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/stations/${id}/reject`, method: 'PATCH', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Station', id }],
    }),

    /** PATCH /api/stations/:id/feature */
    featureStation: builder.mutation<ApiResponse<Station>, string>({
      query: (id) => ({ url: `/stations/${id}/feature`, method: 'PATCH' }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Station', id }],
    }),

    /** GET /api/stations/:id/stats */
    getStationStats: builder.query<ApiResponse<unknown>, string>({
      query: (id) => `/stations/${id}/stats`,
      providesTags: (_res, _err, id) => [{ type: 'Station', id }],
    }),

  }),
  overrideExisting: false,
})

export const {
  useListStationsQuery,
  useGetNearbyStationsQuery,
  useSearchStationsQuery,
  useGetStationQuery,
  useCreateStationMutation,
  useUpdateStationMutation,
  useDeleteStationMutation,
  useApproveStationMutation,
  useRejectStationMutation,
  useFeatureStationMutation,
  useGetStationStatsQuery,
} = stationsApi
