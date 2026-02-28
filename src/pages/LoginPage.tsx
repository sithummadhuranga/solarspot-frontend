import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials } from '@/features/auth/authSlice'
import { useLoginMutation } from '@/features/auth/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Validation schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [login, { isLoading, error }] = useLoginMutation()

  // Redirect destination set by ProtectedRoute when it bounces an unauthenticated user
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/stations'

  // Banner shown after successful registration
  const justRegistered = (location.state as { registered?: boolean })?.registered === true

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data).unwrap()
      // res.data is typed ApiResponse<{ accessToken, user }> — no cast needed
      const { accessToken, user } = res.data
      dispatch(setCredentials({ token: accessToken, user }))
      navigate(from, { replace: true })
    } catch {
      // Error surfaced via RTK Query `error` state below — no action needed here
    }
  }

  // Derive user-facing error message from RTK Query error shape
  const apiMessage = error && 'data' in error
    ? (error.data as { message?: string })?.message
    : undefined
  const errorStatus = error && 'status' in error ? error.status : undefined
  const displayError = errorStatus === 429
    ? 'Too many sign-in attempts — please wait a moment and try again.'
    : apiMessage

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cc63f] shadow-sm">
          <Sun className="h-5 w-5 text-[#133c1d]" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">SolarSpot</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[420px] rounded-2xl border border-gray-100 bg-white px-8 py-8 shadow-xl shadow-gray-100/60">

        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your SolarSpot account</p>

        {/* Post-registration success banner */}
        {justRegistered && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50 px-3.5 py-3 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Account created — check your email to verify, then sign in.</span>
          </div>
        )}

        {/* API / rate-limit error banner */}
        {displayError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-[#1a6b3c] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-10 w-full rounded-[12px] bg-[#8cc63f] font-semibold text-[#133c1d] hover:bg-[#7ab334] active:scale-[0.98] transition-all"
          >
            {isLoading
              ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin inline" /> Signing in…</>
              : 'Sign in'
            }
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[#1a6b3c] hover:underline">
            Create one
          </Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Secure sign-in with JWT · No passwords stored in browser
      </p>
    </div>
  )
}
