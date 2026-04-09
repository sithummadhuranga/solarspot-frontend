/**
 * reviewsApi — RTK Query endpoints for Reviews module (Member 2).
 *
 * Covers all 9 review endpoints from PROJECT_OVERVIEW.md.
 * Types are aligned with the backend review schema and populated shapes.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Review,
  CreateReviewDto,
  UpdateReviewDto,
  ModerateReviewDto,
  ModerationStatus,
} from '@/types/review.types'

// ─── Query param shapes ────────────────────────────────────────────────────────
interface ListReviewsParams {
  stationId?:        string
  authorId?:         string
  moderationStatus?: ModerationStatus
  sort?:             'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
  page?:             number
  limit?:            number
}

interface ListFlaggedParams {
  page?:  number
  limit?: number
}

// ─── API slice ─────────────────────────────────────────────────────────────────
export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** GET /api/reviews — public listing, filterable by station/author/status/sort */
    listReviews: builder.query<PaginatedResponse<Review>, ListReviewsParams>({
      query:        (params) => ({ url: '/reviews', params }),
      providesTags: ['Review'],
    }),

    /** GET /api/reviews/:id */
    getReview: builder.query<ApiResponse<Review>, string>({
      query:        (id) => `/reviews/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Review', id }],
    }),

    /** POST /api/reviews */
    createReview: builder.mutation<ApiResponse<Review>, CreateReviewDto>({
      query:           (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Review', 'Station'], // station averageRating changes
    }),

    /** PUT /api/reviews/:id */
    updateReview: builder.mutation<ApiResponse<Review>, { id: string } & UpdateReviewDto>({
      query:           ({ id, ...body }) => ({ url: `/reviews/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Review', id }, 'Review'],
    }),

    /** DELETE /api/reviews/:id */
    deleteReview: builder.mutation<ApiResponse<null>, string>({
      query:           (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review', 'Station'],
    }),

    /** POST /api/reviews/:id/helpful */
    markHelpful: builder.mutation<ApiResponse<Review>, string>({
      query:           (id) => ({ url: `/reviews/${id}/helpful`, method: 'POST' }),
      invalidatesTags: ['Review'],
    }),

    /** POST /api/reviews/:id/flag */
    flagReview: builder.mutation<ApiResponse<Review>, { id: string; reason?: string }>({
      query:           ({ id, ...body }) => ({ url: `/reviews/${id}/flag`, method: 'POST', body }),
      invalidatesTags: ['Review'],
    }),

    /** GET /api/reviews/flagged — moderator only */
    listFlaggedReviews: builder.query<PaginatedResponse<Review>, ListFlaggedParams>({
      query:        (params) => ({ url: '/reviews/flagged', params }),
      providesTags: ['Review'],
    }),

    /** PATCH /api/reviews/:id/moderate — moderator only */
    moderateReview: builder.mutation<ApiResponse<Review>, { id: string } & ModerateReviewDto>({
      query:           ({ id, ...body }) => ({ url: `/reviews/${id}/moderate`, method: 'PATCH', body }),
      invalidatesTags: ['Review', 'Station'],
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
