import { baseApi } from '@/app/baseApi'
import type { ApiResponse } from '@/types/api.types'
import type { User } from '@/types/user.types'
import { clearCredentials, setCredentials } from './authSlice'
import { normalizeUser } from '@/lib/user'

interface LoginRequest { email: string; password: string }
interface RegisterRequest { email: string; password: string; displayName: string }
interface ForgotPwdRequest { email: string }
interface ResetPwdRequest {
  token: string
  password: string
  confirmPassword: string
}
interface AuthSessionPayload {
  accessToken: string
  user: User
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<{ message: string }>, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    login: builder.mutation<ApiResponse<AuthSessionPayload>, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: ApiResponse<AuthSessionPayload>) => ({
        ...response,
        data: {
          accessToken: response.data.accessToken,
          user: normalizeUser(response.data.user),
        },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            setCredentials({
              token: data.data.accessToken,
              user: data.data.user,
            }),
          )
        } catch {
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          dispatch(clearCredentials())
        }
      },
    }),

    refresh: builder.mutation<ApiResponse<AuthSessionPayload>, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      transformResponse: (response: ApiResponse<AuthSessionPayload>) => ({
        ...response,
        data: {
          accessToken: response.data.accessToken,
          user: normalizeUser(response.data.user),
        },
      }),
    }),

    verifyEmail: builder.query<ApiResponse<null>, string>({
      query: (token) => `/auth/verify-email/${token}`,
    }),

    forgotPassword: builder.mutation<ApiResponse<null>, ForgotPwdRequest>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: builder.mutation<ApiResponse<null>, ResetPwdRequest>({
      query: ({ token, ...body }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'PATCH',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useVerifyEmailQuery,
  useLazyVerifyEmailQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi