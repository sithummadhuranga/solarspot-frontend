/**
 * reviewsApi — RTK Query endpoints for Reviews module (Member 2).
 *
 * Covers all 9 review endpoints from PROJECT_OVERVIEW.md.
 * TODO (Member 2): replace placeholder types and implement cache invalidation.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { Review, CreateReviewDto as CreateReviewInput, UpdateReviewDto as UpdateReviewInput } from '@/types/review.types'

// ─── Request shapes (stubs) ────────────────────────────────────────────────────
interface ModerateRequest { action: 'approve' | 'reject'; reason?: string }

// ─── API slice ─────────────────────────────────────────────────────────────────
export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** GET /api/reviews — public listing */
    listReviews: builder.query<PaginatedResponse<Review>, { stationId?: string; page?: number; limit?: number }>({
      query:       (params) => ({ url: '/reviews', params }),
      providesTags: ['Review'],
    }),

    /** GET /api/reviews/:id */
    getReview: builder.query<ApiResponse<Review>, string>({
      query:       (id) => `/reviews/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Review', id }],
    }),

    /** POST /api/reviews */
    createReview: builder.mutation<ApiResponse<Review>, CreateReviewInput>({
      query:          (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Review', 'Station'], // station averageRating changes
    }),

    /** PUT /api/reviews/:id */
    updateReview: builder.mutation<ApiResponse<Review>, { id: string } & UpdateReviewInput>({
      query:          ({ id, ...body }) => ({ url: `/reviews/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Review', id }],
    }),

    /** DELETE /api/reviews/:id */
    deleteReview: builder.mutation<ApiResponse<null>, string>({
      query:          (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review', 'Station'],
    }),

    /** POST /api/reviews/:id/helpful */
    markHelpful: builder.mutation<ApiResponse<Review>, string>({
      query:          (id) => ({ url: `/reviews/${id}/helpful`, method: 'POST' }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Review', id }],
    }),

    /** POST /api/reviews/:id/flag */
    flagReview: builder.mutation<ApiResponse<Review>, { id: string; reason: string }>({
      query:          ({ id, ...body }) => ({ url: `/reviews/${id}/flag`, method: 'POST', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Review', id }],
    }),

    /** GET /api/reviews/flagged — moderator only */
    listFlaggedReviews: builder.query<PaginatedResponse<Review>, { page?: number; limit?: number }>({
      query:       (params) => ({ url: '/reviews/flagged', params }),
      providesTags: ['Review'],
    }),

    /** PATCH /api/reviews/:id/moderate — moderator only */
    moderateReview: builder.mutation<ApiResponse<Review>, { id: string } & ModerateRequest>({
      query:          ({ id, ...body }) => ({ url: `/reviews/${id}/moderate`, method: 'PATCH', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Review', id }],
    }),

  }),
  overrideExisting: false,
})

export const {
  useListReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkHelpfulMutation,
  useFlagReviewMutation,
  useListFlaggedReviewsQuery,
  useModerateReviewMutation,
} = reviewsApi
