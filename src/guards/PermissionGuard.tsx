import type { ReactNode } from 'react'
import { BackendPermissionGuard } from '@/guards/BackendPermissionGuard'

interface PermissionGuardProps {
  
  action: string
  
  children: ReactNode
  
  fallback?: ReactNode
  
  loadingFallback?: ReactNode
}


export function PermissionGuard({ action, children, fallback = null, loadingFallback = null }: PermissionGuardProps) {
  return (
    <BackendPermissionGuard
      action={action}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </BackendPermissionGuard>
  )
}
