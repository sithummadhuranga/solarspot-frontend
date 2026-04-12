import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Zap, Shield, Star } from 'lucide-react'
import { useLoginMutation } from '../features/auth/authApi'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser, selectIsInitializing } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useAppSelector(selectCurrentUser)
  const isInitializing = useAppSelector(selectIsInitializing)
  const [showPassword, setShowPassword] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [login, { isLoading, error }] = useLoginMutation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/stations'
  const justRegistered = (location.state as { registered?: boolean })?.registered === true

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (!isInitializing && currentUser && !loginSuccess) {
      navigate(from, { replace: true })
    }
  }, [currentUser, from, isInitializing, loginSuccess, navigate])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap()
      setLoginSuccess(true)
      setTimeout(() => navigate(from, { replace: true }), 1200)
    } catch {
      return
    }
  }

  const apiMessage = error && 'data' in error
    ? (error.data as { message?: string })?.message
    : undefined
  const errorStatus = error && 'status' in error ? error.status : undefined
  const displayError = errorStatus === 429
    ? 'Too many sign-in attempts - please wait a moment and try again.'
    : apiMessage

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden mesh-gradient noise-overlay">
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cc63f]/20 transition-transform group-hover:scale-105">
              <Sun className="h-5 w-5 text-[#8cc63f]" />
            </div>
            <span className="font-sg text-lg font-extrabold text-white tracking-tight">SolarSpot</span>
          </Link>

          {}
          <div>
            <h2 className="font-sg font-extrabold text-white text-3xl xl:text-4xl leading-tight tracking-tight mb-4">
              Welcome back to the{' '}
              <span className="text-gradient-animated">Solar Network</span>
            </h2>
            <p className="text-white/50 font-medium text-[0.95rem] leading-relaxed max-w-sm mb-10">
              Access your stations, track solar reports, and manage your EV charging activity.
            </p>
            <div className="space-y-3">
              {[
                { icon: Zap, text: '150+ solar-powered charging stations' },
                { icon: Shield, text: 'Enterprise-grade security & auth' },
                { icon: Star, text: 'Community-driven ratings & reviews' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8cc63f]/15">
                    <f.icon className="h-4 w-4 text-[#8cc63f]" />
                  </div>
                  <span className="text-[0.84rem] font-medium text-white/60">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[0.72rem] text-white/20">
            © {new Date().getFullYear()} SolarSpot · Sri Lanka's #1 Solar EV Network
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-[#fafdf7] via-white to-[#f0fdf4]">

        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cc63f] shadow-sm">
            <Sun className="h-5 w-5 text-[#133c1d]" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">SolarSpot</span>
        </Link>
        {loginSuccess ? (
          <div className="w-full max-w-[420px] flex flex-col items-center gap-5 py-12 text-center animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] ring-4 ring-[#8cc63f]/20">
              <CheckCircle2 className="h-8 w-8 text-[#1a6b3c]" />
            </div>
            <div>
              <h2 className="text-xl font-sg font-extrabold text-[#133c1d]">Welcome back!</h2>
              <p className="mt-2 text-sm text-gray-500 font-medium">
                Signed in successfully. Redirecting you now...
              </p>
            </div>
            <div className="w-48 h-1 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#8cc63f] rounded-full" style={{ animation: 'progressBar 1.2s ease-out forwards' }} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[420px]">
            <div className="rounded-2xl border border-gray-100 bg-white px-7 py-8 shadow-xl shadow-gray-100/50">
              <h1 className="text-2xl font-sg font-extrabold text-[#133c1d]">Sign in</h1>
              <p className="mt-1.5 text-sm text-gray-500 font-medium">Enter your credentials to continue</p>

              {justRegistered && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50 px-3.5 py-3 text-sm text-green-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Account created — check your email to verify, then sign in.</span>
                </div>
              )}

              {displayError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
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

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-[#1a6b3c] hover:underline font-medium">
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
                  className="mt-2 h-11 w-full rounded-xl bg-[#133c1d] font-sg font-bold text-white hover:bg-[#0b2614] active:scale-[0.98] transition-all shadow-lg shadow-[#133c1d]/15"
                >
                  {isLoading
                    ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin inline" /> Signing in...</>
                    : 'Sign in'}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-bold text-[#1a6b3c] hover:underline">
                  Create one
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              Secure sign-in with JWT · No passwords stored in browser
            </p>
          </div>
        )}
      </div>

      {}
      <style>{`@keyframes progressBar { from { width: 0; } to { width: 100%; } }`}</style>
    </div>
  )
}