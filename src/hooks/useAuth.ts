import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  selectCurrentUser,
  selectToken,
  selectIsAuthenticated,
  selectUserRoleName,
  selectUserRoleLevel,
  clearCredentials,
  setCredentials,
} from '@/features/auth/authSlice'
import { authApi } from '@/features/auth/authApi'
import type { User } from '@/types/user.types'

/**
 * useAuth — convenience hook for auth state and actions.
 *
 * Provides the current user, token, auth status, role info,
 * and signIn / signOut helpers.
 */
export function useAuth() {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const user      = useAppSelector(selectCurrentUser)
  const token     = useAppSelector(selectToken)
  const roleName  = useAppSelector(selectUserRoleName)
  const roleLevel = useAppSelector(selectUserRoleLevel)
  const [logoutMutation] = authApi.endpoints.logout.useMutation()

  const signIn = useCallback((newToken: string, profile: User) => {
    dispatch(setCredentials({ token: newToken, user: profile }))
  }, [dispatch])

  const signOut = useCallback(async () => {
    try {
      await logoutMutation().unwrap()
    } catch {
      // Proceed with local logout even if the server call fails
    } finally {
      dispatch(clearCredentials())
      navigate('/login', { replace: true })
    }
  }, [dispatch, logoutMutation, navigate])

  return {
    user,
    token,
    isAuthenticated: useAppSelector(selectIsAuthenticated),
    isEmailVerified: user?.isEmailVerified ?? false,
    roleName,
    roleLevel,
    /** @deprecated use roleName */
    role: roleName,
    signIn,
    signOut,
  }
}
