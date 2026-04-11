import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { User, UpdateProfileDto as UpdateProfileInput, AdminChangeRoleDto as AdminUpdateUserInput } from '@/types/user.types'
import { normalizeUser } from '@/lib/user'
import type { RootState } from '@/app/store'
import { clearCredentials, setCredentials } from '@/features/auth/authSlice'

interface ListUsersParams {
  page?: number
  limit?: number
  role?: string
  search?: string
  isActive?: boolean
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/users/me',
      transformResponse: (response: ApiResponse<User>) => ({
        ...response,
        data: normalizeUser(response.data),
      }),
      providesTags: ['User'],
    }),

    updateMe: builder.mutation<ApiResponse<User>, UpdateProfileInput>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      transformResponse: (response: ApiResponse<User>) => ({
        ...response,
        data: normalizeUser(response.data),
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const token = (getState() as RootState).auth.token
          if (token) {
            dispatch(
              setCredentials({
                token,
                user: data.data,
              }),
            )
          }
        } catch {
          // Component-level error handling keeps UX feedback localized.
        }
      },
      invalidatesTags: ['User'],
    }),

    deleteMe: builder.mutation<void, void>({
      query: () => ({ url: '/users/me', method: 'DELETE' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(clearCredentials())
        } catch {
          // Keep existing auth state when server-side deletion fails.
        }
      },
      invalidatesTags: ['User'],
    }),


    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: ApiResponse<User>) => ({
        ...response,
        data: normalizeUser(response.data),
      }),
      providesTags: (_res, _err, id) => [{ type: 'User', id }],
    }),

    getUserPublicProfile: builder.query<ApiResponse<User>, string>({
      query: (id) => `/api/users/${id}/public`,
      transformResponse: (response: ApiResponse<User>) => ({
        ...response,
        data: normalizeUser(response.data),
      }),
      providesTags: (_res, _err, id) => [{ type: 'User', id }],
    }),

    listUsers: builder.query<PaginatedResponse<User>, ListUsersParams>({
      query: (params) => ({ url: '/users', params }),
      transformResponse: (response: PaginatedResponse<User>) => ({
        ...response,
        data: response.data.map((u) => normalizeUser(u)),
      }),
      providesTags: ['User'],
    }),

    adminUpdateUser: builder.mutation<ApiResponse<User>, { id: string } & AdminUpdateUserInput>({
      query: ({ id, ...body }) => ({ url: `/api/admin/users/${id}`, method: 'PUT', body }),
      transformResponse: (response: ApiResponse<User>) => ({
        ...response,
        data: normalizeUser(response.data),
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'User', id }, 'User'],
    }),

    adminDeleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [{ type: 'User', id }, 'User'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useDeleteMeMutation,
  useGetUserByIdQuery,
  useGetUserPublicProfileQuery,
  useListUsersQuery,
  useAdminUpdateUserMutation,
  useAdminDeleteUserMutation,
} = usersApi
