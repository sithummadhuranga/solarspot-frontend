import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Sun, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Info, Zap, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegisterMutation } from '../features/auth/authApi'

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters').regex(/\S/, 'Cannot be blank'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
      {checks.map(({ label, ok }) => (
        <span key={label} className={`flex items-center gap-1 text-[11px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>
          {ok ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}
          {label}
        </span>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [registerUser, { isLoading, isSuccess, error }] = useRegisterMutation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({ displayName: data.displayName, email: data.email, password: data.password }).unwrap()
      setTimeout(() => navigate('/login', { state: { registered: true } }), 2500)
    } catch {
      // Error is rendered from RTK Query state.
    }
  }

  const apiError = error && 'data' in error ? (error.data as { message?: string })?.message : undefined
  const fieldErrors = error && 'data' in error ? (error.data as { errors?: Record<string, string> })?.errors : undefined

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden mesh-gradient noise-overlay">
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cc63f]/20 transition-transform group-hover:scale-105">
              <Sun className="h-5 w-5 text-[#8cc63f]" />
            </div>
            <span className="font-sg text-lg font-extrabold text-white tracking-tight">SolarSpot</span>
          </Link>

          {/* Middle content */}
          <div>
            <h2 className="font-sg font-extrabold text-white text-3xl xl:text-4xl leading-tight tracking-tight mb-4">
              Join the{' '}
              <span className="text-gradient-animated">Green Revolution</span>
            </h2>
            <p className="text-white/50 font-medium text-[0.95rem] leading-relaxed max-w-sm mb-10">
              Create your free account to discover solar-powered EV charging stations across Sri Lanka.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: Zap, text: 'Find & manage charging stations' },
                { icon: Shield, text: 'Real solar intelligence reports' },
                { icon: Star, text: 'Rate, review & help the community' },
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

          {/* Bottom */}
          <p className="text-[0.72rem] text-white/20">
            © {new Date().getFullYear()} SolarSpot · Sri Lanka&apos;s #1 Solar EV Network
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-[#fafdf7] via-white to-[#f0fdf4]">

        {/* Mobile brand */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cc63f] shadow-sm">
            <Sun className="h-5 w-5 text-[#133c1d]" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">SolarSpot</span>
        </Link>

        <div className="w-full max-w-[440px]">
          <div className="rounded-2xl border border-gray-100 bg-white px-7 py-8 shadow-xl shadow-gray-100/50">
            {isSuccess ? (
              <div className="flex flex-col items-center gap-5 py-8 text-center animate-fade-in-up">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] ring-4 ring-[#8cc63f]/20">
                  <CheckCircle2 className="h-8 w-8 text-[#1a6b3c]" />
                </div>
                <div>
                  <h2 className="text-xl font-sg font-extrabold text-[#133c1d]">Check your inbox</h2>
                  <p className="mt-2 text-sm text-gray-500 font-medium">
                    We sent a verification link to your email.
                    <br />
                    Click it to activate your account, then sign in.
                  </p>
                </div>
                <div className="w-48 h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#8cc63f] rounded-full" style={{ animation: 'progressBar 2.5s ease-out forwards' }} />
                </div>
                <p className="text-xs text-gray-400 font-medium">Redirecting to sign in...</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-sg font-extrabold text-[#133c1d]">Create account</h1>
                <p className="mt-1.5 text-sm text-gray-500 font-medium">Join SolarSpot and discover solar EV stations</p>

                {apiError && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input id="displayName" placeholder="e.g. Alex Smith" autoComplete="name" aria-invalid={!!errors.displayName} {...register('displayName')} />
                    {(errors.displayName || fieldErrors?.displayName) && (
                      <p className="text-xs text-red-500" role="alert">{errors.displayName?.message ?? fieldErrors?.displayName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
                    {(errors.email || fieldErrors?.email) && (
                      <p className="text-xs text-red-500" role="alert">{errors.email?.message ?? fieldErrors?.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 chars, uppercase, number" autoComplete="new-password" aria-invalid={!!errors.password} className="pr-10" {...register('password')} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide' : 'Show'}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={passwordValue} />
                    {errors.password && <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} className="pr-10" {...register('confirmPassword')} />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showConfirm ? 'Hide' : 'Show'}>
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500" role="alert">{errors.confirmPassword.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 h-11 w-full rounded-xl bg-[#133c1d] font-sg font-bold text-white hover:bg-[#0b2614] active:scale-[0.98] transition-all shadow-lg shadow-[#133c1d]/15"
                  >
                    {isLoading ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin inline" /> Creating account...</> : 'Create account'}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#1a6b3c] hover:underline">Sign in</Link>
                </p>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-gray-600">terms</a> and{' '}
            <a href="#" className="underline hover:text-gray-600">privacy policy</a>.
          </p>
        </div>
      </div>

      {/* Progress bar keyframe */}
      <style>{`@keyframes progressBar { from { width: 0; } to { width: 100%; } }`}</style>
    </div>
  )
}