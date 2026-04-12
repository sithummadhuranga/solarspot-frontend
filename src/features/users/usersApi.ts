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

const normalizeUserResponse = (response: ApiResponse<User>): ApiResponse<User> => ({
  ...response,
  data: normalizeUser(response.data),
})

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/users/me',
      transformResponse: normalizeUserResponse,
      providesTags: ['User'],
    }),

    updateMe: builder.mutation<ApiResponse<User>, UpdateProfileInput>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      transformResponse: normalizeUserResponse,
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
        }
      },
      invalidatesTags: ['User'],
    }),


    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      transformResponse: normalizeUserResponse,
      providesTags: (_res, _err, id) => [{ type: 'User', id }],
    }),

    getUserPublicProfile: builder.query<ApiResponse<User>, string>({
      async queryFn(id, _api, _extraOptions, baseQuery) {
        const primary = await baseQuery(`/users/${id}/public`)
        if (!primary.error) {
          return { data: normalizeUserResponse(primary.data as ApiResponse<User>) }
        }

        if (primary.error.status === 404) {
          const fallback = await baseQuery(`/users/${id}`)
          if (!fallback.error) {
            return { data: normalizeUserResponse(fallback.data as ApiResponse<User>) }
          }
          return { error: fallback.error }
        }

        return { error: primary.error }
      },
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
      async queryFn({ id, ...body }, _api, _extraOptions, baseQuery) {
        const primary = await baseQuery({ url: `/admin/users/${id}`, method: 'PUT', body })
        if (!primary.error) {
          return { data: normalizeUserResponse(primary.data as ApiResponse<User>) }
        }

        if (primary.error.status === 404) {
          const fallback = await baseQuery({ url: `/users/${id}`, method: 'PUT', body })
          if (!fallback.error) {
            return { data: normalizeUserResponse(fallback.data as ApiResponse<User>) }
          }
          return { error: fallback.error }
        }

        return { error: primary.error }
      },
      invalidatesTags: (_res, _err, { id }) => [{ type: 'User', id }, 'User'],
    }),

    adminDeleteUser: builder.mutation<void, string>({
      async queryFn(id, _api, _extraOptions, baseQuery) {
        const primary = await baseQuery({ url: `/admin/users/${id}`, method: 'DELETE' })
        if (!primary.error) {
          return { data: undefined }
        }

        if (primary.error.status === 404) {
          const fallback = await baseQuery({ url: `/users/${id}`, method: 'DELETE' })
          if (!fallback.error) {
            return { data: undefined }
          }
          return { error: fallback.error }
        }

        return { error: primary.error }
      },
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
