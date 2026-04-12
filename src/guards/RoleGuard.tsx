import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { getRoleSlug } from '@/lib/auth'
import type { UserRole } from '@/types/user.types'

interface RoleGuardProps {
  
  allowedRoles?: UserRole[]
  
  minRole?: UserRole
  
  children: ReactNode
  
  fallback?: string
}


const ROLE_HIERARCHY: UserRole[] = [
  'guest',
  'user',
  'station_owner',
  'featured_contributor',
  'trusted_reviewer',
  'review_moderator',
  'weather_analyst',
  'permission_auditor',
  'moderator',
  'admin',
]

export function RoleGuard({ allowedRoles, minRole, children, fallback = '/unauthorized' }: RoleGuardProps) {
  const user = useAppSelector(selectCurrentUser)
  const role = getRoleSlug(user?.role) as UserRole

  let allowed = false
  if (!user) allowed = false
  else if (allowedRoles && allowedRoles.length > 0) {
    allowed = allowedRoles.includes(role)
  } else if (minRole) {
    const userIdx = ROLE_HIERARCHY.indexOf(role)
    const minIdx = ROLE_HIERARCHY.indexOf(minRole)
    allowed = userIdx >= minIdx
  } else {
    allowed = true // No restriction
  }

  if (!allowed) {
    return <Navigate to={fallback} replace />
  }
  return <>{children}</>
}
