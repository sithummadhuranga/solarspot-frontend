import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  selectCurrentUser,
  clearCredentials,
  setCredentials,
} from '@/features/auth/authSlice'
import { useLogoutMutation } from '@/features/auth/authApi'
import type { User } from '@/types/user.types'


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
