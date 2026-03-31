import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { User, UpdateProfileDto as UpdateProfileInput, AdminChangeRoleDto as AdminUpdateUserInput } from '@/types/user.types'
import { normalizeUser } from '@/lib/user'

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
      invalidatesTags: ['User'],
    }),

    deleteMe: builder.mutation<void, void>({
      query: () => ({ url: '/users/me', method: 'DELETE' }),
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

    listUsers: builder.query<PaginatedResponse<User>, ListUsersParams>({
      query: (params) => ({ url: '/users', params }),
      transformResponse: (response: PaginatedResponse<User>) => ({
        ...response,
        data: response.data.map((u) => normalizeUser(u)),
      }),
      providesTags: ['User'],
    }),

    adminUpdateUser: builder.mutation<ApiResponse<User>, { id: string } & AdminUpdateUserInput>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      transformResponse: (response: ApiResponse<User>) => ({
        ...response,
        data: normalizeUser(response.data),
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'User', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useDeleteMeMutation,
  useGetUserByIdQuery,
  useListUsersQuery,
  useAdminUpdateUserMutation,
} = usersApi
