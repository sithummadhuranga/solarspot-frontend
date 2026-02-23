/**
 * authApi — RTK Query endpoints for Auth module (Member 4).
 *
 * Covers all 7 auth endpoints from PROJECT_OVERVIEW.md.
 * TODO (Member 4): replace placeholder types with real request/response shapes.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse } from '@/types/api.types'
import type { User } from '@/types/user.types'

// ─── Request / response shapes (stubs) ────────────────────────────────────────
interface LoginRequest      { email: string; password: string }
interface RegisterRequest   { email: string; password: string; displayName: string }
interface ForgotPwdRequest  { email: string }
interface ResetPwdRequest   { token: string; password: string }
interface LoginResponse     { token: string; user: User }
interface RefreshResponse   { token: string }

// ─── API slice ─────────────────────────────────────────────────────────────────
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** POST /api/auth/register */
    register: builder.mutation<ApiResponse<User>, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      // TODO (Member 4): on success dispatch setCredentials
    }),

    /** POST /api/auth/login */
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      // TODO (Member 4): on success dispatch setCredentials + store accessToken
    }),

    /** POST /api/auth/logout */
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      // TODO (Member 4): on success dispatch clearCredentials
    }),

    /** POST /api/auth/refresh — called by baseQueryWithReauth automatically */
    refresh: builder.mutation<ApiResponse<RefreshResponse>, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),

    /** GET /api/auth/verify-email/:token */
    verifyEmail: builder.query<ApiResponse<null>, string>({
      query: (token) => `/auth/verify-email/${token}`,
    }),

    /** POST /api/auth/forgot-password */
    forgotPassword: builder.mutation<ApiResponse<null>, ForgotPwdRequest>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    /** PATCH /api/auth/reset-password/:token */
    resetPassword: builder.mutation<ApiResponse<null>, ResetPwdRequest>({
      query: ({ token, ...body }) => ({
        url:    `/auth/reset-password/${token}`,
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
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
