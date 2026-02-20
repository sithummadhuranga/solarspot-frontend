import { z } from 'zod'
import { CONNECTOR_TYPES, AMENITIES } from './constants'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z
  .object({
    displayName:     z.string().min(2).max(50),
    email:           z.string().email('Invalid email address'),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    password:        z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ─── User profile ─────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio:         z.string().max(300).optional(),
  avatarUrl:   z.string().url().optional(),
})

// ─── Station ──────────────────────────────────────────────────────────────────
export const createStationSchema = z.object({
  name:          z.string().min(3).max(100),
  description:   z.string().max(1000).optional(),
  address:       z.string().min(5, 'Address is required'),
  solarPanelKw:  z.number().min(0.1),
  connectors: z
    .array(
      z.object({
        type:    z.enum(CONNECTOR_TYPES),
        powerKw: z.number().min(0.5).max(350),
        count:   z.number().min(1).default(1),
      })
    )
    .min(1, 'At least one connector is required'),
  amenities:       z.array(z.enum(AMENITIES)).optional(),
  operatingHours:  z.object({ alwaysOpen: z.boolean() }).optional(),
})

// ─── Review ───────────────────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  title:     z.string().min(5).max(100),
  body:      z.string().min(20).max(2000),
  visitDate: z.string().optional(),
  ratings: z.object({
    overall:          z.number().int().min(1).max(5),
    solarReliability: z.number().int().min(1).max(5),
    chargingSpeed:    z.number().int().min(1).max(5),
    cleanliness:      z.number().int().min(1).max(5).optional(),
    accessibility:    z.number().int().min(1).max(5).optional(),
  }),
})

// ─── Derived TypeScript types ─────────────────────────────────────────────────
export type LoginFormData           = z.infer<typeof loginSchema>
export type RegisterFormData        = z.infer<typeof registerSchema>
export type ForgotPasswordFormData  = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData   = z.infer<typeof resetPasswordSchema>
export type UpdateProfileFormData   = z.infer<typeof updateProfileSchema>
export type CreateStationFormData   = z.infer<typeof createStationSchema>
export type CreateReviewFormData    = z.infer<typeof createReviewSchema>
