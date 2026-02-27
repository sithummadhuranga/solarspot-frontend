/**
 * authApi — RTK Query endpoints for all 7 Auth endpoints.
 *
 * Token architecture:
 *   - accessToken is stored in Redux state (memory only, never localStorage).
 *   - refreshToken is an httpOnly cookie managed by the browser automatically.
 *   - onQueryStarted handlers keep Redux auth state in sync with API responses.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse } from '@/types/api.types'
import type { User } from '@/types/user.types'
import { setCredentials, setToken, clearCredentials } from '@/features/auth/authSlice'

// ─── Request / response shapes ─────────────────────────────────────────────────
interface LoginRequest    { email: string; password: string }
interface RegisterRequest { displayName: string; email: string; password: string }
interface ForgotPwdRequest { email: string }
interface ResetPwdRequest  { token: string; password: string; confirmPassword: string }
interface ResendVerificationRequest { email: string }

/** POST /api/auth/login success data */
interface LoginData    { accessToken: string; user: User }
/** POST /api/auth/refresh success data */
interface RefreshData  { accessToken: string }
/** POST /api/auth/register success data */
interface RegisterData { message: string }

// ─── API slice ─────────────────────────────────────────────────────────────────
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** POST /api/auth/register */
    register: builder.mutation<ApiResponse<RegisterData>, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    /** POST /api/auth/login */
    login: builder.mutation<ApiResponse<LoginData>, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({
            user:  data.data.user,
            token: data.data.accessToken,
          }))
        } catch {
          // login failed — no state change needed
        }
      },
    }),

    /** POST /api/auth/logout  (requires Authorization header — protect middleware) */
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          // Clear credentials whether request succeeded or failed
          dispatch(clearCredentials())
        }
      },
    }),

    /**
     * POST /api/auth/refresh
     * Called on app boot and automatically retried on 401 by baseQueryWithReauth.
     * The refreshToken httpOnly cookie is sent automatically (credentials: 'include').
     */
    refresh: builder.mutation<ApiResponse<RefreshData>, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setToken(data.data.accessToken))
        } catch {
          // refresh failed — caller (App.tsx) handles setInitialized
        }
      },
    }),

    /** GET /api/auth/verify-email/:token */
    verifyEmail: builder.query<ApiResponse<{ message: string }>, string>({
      query: (token) => `/auth/verify-email/${token}`,
    }),

    /** POST /api/auth/forgot-password */
    forgotPassword: builder.mutation<ApiResponse<{ message: string }>, ForgotPwdRequest>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    /**
     * PATCH /api/auth/reset-password/:token
     * Body must include both password and confirmPassword.
     */
    resetPassword: builder.mutation<ApiResponse<{ message: string }>, ResetPwdRequest>({
      query: ({ token, ...body }) => ({
        url:    `/auth/reset-password/${token}`,
        method: 'PATCH',
        body,
      }),
    }),
    /** POST /api/auth/resend-verification */
    resendVerification: builder.mutation<ApiResponse<{ message: string }>, ResendVerificationRequest>({
      query: (body) => ({ url: '/auth/resend-verification', method: 'POST', body }),
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
  useResendVerificationMutation,
} = authApi
