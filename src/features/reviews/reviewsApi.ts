
import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Review,
  CreateReviewDto,
  UpdateReviewDto,
  ModerateReviewDto,
  ModerationStatus,
} from '@/types/review.types'

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

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    
    listReviews: builder.query<PaginatedResponse<Review>, ListReviewsParams>({
      query:        (params) => ({ url: '/reviews', params }),
      providesTags: ['Review'],
    }),

    
    getReview: builder.query<ApiResponse<Review>, string>({
      query:        (id) => `/reviews/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Review', id }],
    }),

    
    createReview: builder.mutation<ApiResponse<Review>, CreateReviewDto>({
      query:           (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Review', 'Station'], // station averageRating changes
    }),

    
    updateReview: builder.mutation<ApiResponse<Review>, { id: string } & UpdateReviewDto>({
      query:           ({ id, ...body }) => ({ url: `/reviews/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Review', id }, 'Review'],
    }),

    
    deleteReview: builder.mutation<ApiResponse<null>, string>({
      query:           (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review', 'Station'],
    }),

    
    markHelpful: builder.mutation<ApiResponse<Review>, string>({
      query:           (id) => ({ url: `/reviews/${id}/helpful`, method: 'POST' }),
      invalidatesTags: ['Review'],
    }),

    
    flagReview: builder.mutation<ApiResponse<Review>, { id: string; reason?: string }>({
      query:           ({ id, ...body }) => ({ url: `/reviews/${id}/flag`, method: 'POST', body }),
      invalidatesTags: ['Review'],
    }),

    
    listFlaggedReviews: builder.query<PaginatedResponse<Review>, ListFlaggedParams>({
      query:        (params) => ({ url: '/reviews/flagged', params }),
      providesTags: ['Review'],
    }),

    
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
