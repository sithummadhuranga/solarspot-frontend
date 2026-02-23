import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  selectCurrentUser,
  clearCredentials,
  setCredentials,
} from '@/features/auth/authSlice'
import type { User } from '@/types/user.types'

/**
 * useAuth — convenience hook for auth state and actions.
 *
 * Returns the current user, a typed isAuthenticated flag, and action helpers.
 * Always use this hook instead of selecting auth state directly.
 *
 * TODO (Member 4): wire loginFn / logoutFn to authApi mutations once implemented.
 */
export function useAuth() {
  const dispatch = useAppDispatch()
  const user     = useAppSelector(selectCurrentUser)

  const signIn = useCallback((token: string, profile: User) => {
    dispatch(setCredentials({ token, user: profile }))
  }, [dispatch])

  const signOut = useCallback(() => {
    dispatch(clearCredentials())
    // TODO (Member 4): call authApi.logout mutation to invalidate server-side token
  }, [dispatch])

  return {
    user,
    isAuthenticated: user !== null,
    isEmailVerified: user?.isEmailVerified ?? false,
    role:            user?.role ?? null,
    signIn,
    signOut,
  }
}
