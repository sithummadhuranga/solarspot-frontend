import type { ReactNode } from 'react'
import { useCheckPermissionAccessQuery } from '@/features/permissions/permissionsApi'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'

interface BackendPermissionGuardProps {
  action: string
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function BackendPermissionGuard({
  action,
  children,
  fallback = null,
  loadingFallback = (
    <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
      Checking permissions...
    </div>
  ),
}: BackendPermissionGuardProps) {
  const user = useAppSelector(selectCurrentUser)

  const { data, isFetching } = useCheckPermissionAccessQuery(
    { action, context: {} },
    { skip: !user }
  )

  if (!user) return <>{fallback}</>
  if (isFetching) return <>{loadingFallback}</>

  const allowed = data?.data?.allowed ?? false
  if (!allowed) return <>{fallback}</>

  return <>{children}</>
}
