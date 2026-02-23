import { useAppSelector } from '@/app/hooks'
import {
  selectCurrentUser,
  selectToken,
  selectIsAuthenticated,
  selectUserRole,
} from '@/features/auth/authSlice'
import { ROLE_LEVEL } from '@/lib/constants'

/**
 * Convenience hook that exposes auth state and derived role helpers.
 *
 * @example
 * const { user, isAuthenticated, isAdmin, isAtLeast } = useAuth()
 * if (isAtLeast('moderator')) { ... }
 */
export function useAuth() {
  const user            = useAppSelector(selectCurrentUser)
  const accessToken     = useAppSelector(selectToken)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const role            = useAppSelector(selectUserRole)

  const userLevel = ROLE_LEVEL[role] ?? 0

  const isAdmin     = role === 'admin'
  const isModerator = role === 'moderator' || role === 'admin'

  /** Returns true if the user's role level is >= the given role's level. */
  function isAtLeast(minRole: string): boolean {
    return userLevel >= (ROLE_LEVEL[minRole] ?? 0)
  }

  /** Returns true if the user is the owner of the given resource by _id field. */
  function isOwner(ownerId: string | undefined): boolean {
    if (!user || !ownerId) return false
    return user._id === ownerId
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    role,
    isAdmin,
    isModerator,
    isAtLeast,
    isOwner,
  }
}
