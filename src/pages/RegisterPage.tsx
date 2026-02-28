import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Sun, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegisterMutation } from '@/features/auth/authApi'

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
  const [register, { isLoading, isSuccess, error }] = useRegisterMutation()

  const { register: field, handleSubmit, watch, formState: { errors } } =
    useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const passwordValue = watch('password', '')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register({ displayName: data.displayName, email: data.email, password: data.password }).unwrap()
      setTimeout(() => navigate('/login', { state: { registered: true } }), 2500)
    } catch { /* error rendered via RTK Query error state */ }
  }

  const apiError = error && 'data' in error ? (error.data as { message?: string })?.message : undefined
  const fieldErrors = error && 'data' in error ? (error.data as { errors?: Record<string, string> })?.errors : undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cc63f] shadow-sm">
          <Sun className="h-5 w-5 text-[#133c1d]" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">SolarSpot</span>
      </Link>

      <div className="w-full max-w-[440px] rounded-2xl border border-gray-100 bg-white px-8 py-8 shadow-xl shadow-gray-100/60">
        {isSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4] ring-4 ring-[#8cc63f]/20">
              <CheckCircle2 className="h-7 w-7 text-[#1a6b3c]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Check your inbox</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                We have sent a verification link to your email.<br />Click it to activate your account, then sign in.
              </p>
            </div>
            <p className="text-xs text-gray-400 animate-pulse">Redirecting to sign in</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="mt-1 text-sm text-gray-500">Join SolarSpot and discover solar-powered EV stations</p>

            {apiError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" placeholder="e.g. Alex Smith" autoComplete="name" aria-invalid={!!errors.displayName} {...field('displayName')} />
                {(errors.displayName || fieldErrors?.displayName) && (
                  <p className="text-xs text-red-500" role="alert">{errors.displayName?.message ?? fieldErrors?.displayName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} {...field('email')} />
                {(errors.email || fieldErrors?.email) && (
                  <p className="text-xs text-red-500" role="alert">{errors.email?.message ?? fieldErrors?.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 chars, uppercase, number" autoComplete="new-password" aria-invalid={!!errors.password} className="pr-10" {...field('password')} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={passwordValue} />
                {errors.password && <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} className="pr-10" {...field('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showConfirm ? 'Hide' : 'Show'}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500" role="alert">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="mt-2 h-10 w-full rounded-[12px] bg-[#8cc63f] font-semibold text-[#133c1d] hover:bg-[#7ab334] active:scale-[0.98] transition-all">
                {isLoading ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin inline" /> Creating account</> : 'Create account'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#1a6b3c] hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        By creating an account you agree to our <a href="#" className="underline hover:text-gray-600">terms</a> and <a href="#" className="underline hover:text-gray-600">privacy policy</a>.
      </p>
    </div>
  )
}
