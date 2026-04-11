import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAccess } from '@/hooks/useAdminAccess'

interface AdminAreaGuardProps {
  children: ReactNode
  fallback?: string
}

export function AdminAreaGuard({ children, fallback = '/unauthorized' }: AdminAreaGuardProps) {
  const { hasAdminEntryAccess, isCheckingAdminAccess } = useAdminAccess()

  if (isCheckingAdminAccess) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          Checking admin access...
        </div>
      </div>
    )
  }

  if (!hasAdminEntryAccess) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}