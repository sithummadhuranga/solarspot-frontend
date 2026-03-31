import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  selectCurrentUser,
  clearCredentials,
  setCredentials,
} from '@/features/auth/authSlice'
import { useLogoutMutation } from '@/features/auth/authApi'
import type { User } from '@/types/user.types'

/**
 * useAuth — convenience hook for auth state and actions.
 *
 * Returns the current user, a typed isAuthenticated flag, and action helpers.
 * Always use this hook instead of selecting auth state directly.
 *
 */
export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const [logout] = useLogoutMutation()

  const signIn = useCallback((token: string, profile: User) => {
    dispatch(setCredentials({ token, user: profile }))
  }, [dispatch])

  const signOut = useCallback(async () => {
    try {
      await logout().unwrap()
    } finally {
      dispatch(clearCredentials())
    }
  }, [dispatch, logout])

  return {
    user,
    isAuthenticated: user !== null,
    isEmailVerified: user?.isEmailVerified ?? false,
    role: user?.role ?? null,
    signIn,
    signOut,
  }
}
