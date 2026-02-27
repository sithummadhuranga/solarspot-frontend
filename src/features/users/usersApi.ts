/**
 * usersApi — RTK Query endpoints for Users module (Member 4).
 *
 * Covers all 6 user endpoints from PROJECT_OVERVIEW.md.
 * TODO (Member 4): replace placeholder types, add file upload support for avatar.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { User, UpdateProfileDto as UpdateProfileInput, AdminUpdateUserDto } from '@/types/user.types'

// ─── API slice ─────────────────────────────────────────────────────────────────
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** GET /api/users/me — own profile */
    getMe: builder.query<ApiResponse<User>, void>({
      query:       () => '/users/me',
      providesTags: ['User'],
    }),

    /** PUT /api/users/me — update own profile */
    updateMe: builder.mutation<ApiResponse<User>, UpdateProfileInput>({
      query:          (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),

    /** DELETE /api/users/me — soft-delete own account */
    deleteMe: builder.mutation<ApiResponse<null>, void>({
      query:          () => ({ url: '/users/me', method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    /** GET /api/users/:id — public profile */
    getUserById: builder.query<ApiResponse<User>, string>({
      query:       (id) => `/users/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'User', id }],
    }),

    /** GET /api/users — admin: paginated user list */
    listUsers: builder.query<PaginatedResponse<User>, { page?: number; limit?: number; role?: string }>({
      query:       (params) => ({ url: '/users', params }),
      providesTags: ['User'],
    }),

    /** PUT /api/users/:id — admin: update user role / ban / active status */
    adminUpdateUser: builder.mutation<ApiResponse<User>, { id: string } & AdminUpdateUserDto>({
      query:          ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'User', id }],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMeMutation,
  useDeleteMeMutation,
  useGetUserByIdQuery,
  useListUsersQuery,
  useAdminUpdateUserMutation,
} = usersApi
