import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/guards/ProtectedRoute'
import { BackendPermissionGuard } from '@/guards/BackendPermissionGuard'
import { RoleGuard } from '@/guards/RoleGuard'

const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const StationsPage = lazy(() => import('@/pages/StationsPage'))
const StationDetailPage = lazy(() => import('@/pages/StationDetailPage'))
const StationMapPage = lazy(() => import('@/pages/StationMapPage'))
const AddStationPage = lazy(() => import('@/pages/AddStationPage'))
const MyStationsPage = lazy(() => import('@/pages/MyStationsPage'))
const ModerationQueuePage = lazy(() => import('@/pages/ModerationQueuePage'))
const WeatherPage = lazy(() => import('@/pages/WeatherPage'))
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'))
const PermissionsPage = lazy(() => import('@/pages/PermissionsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
const MySolarReportsPage = lazy(() => import('@/pages/MySolarReportsPage'))
const AdminSolarReportsPage = lazy(() => import('@/pages/AdminSolarReportsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-solar-green-200 border-t-solar-green-600 animate-spin" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/stations/:id" element={<StationDetailPage />} />
        <Route path="/map" element={<StationMapPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/stations/new" element={<AddStationPage />} />
          <Route path="/my-stations" element={<MyStationsPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/solar/reports/mine" element={<MySolarReportsPage />} />

          <Route
            path="/admin/stations/pending"
            element={
              <RoleGuard allowedRoles={['moderator', 'admin']}>
                <ModerationQueuePage />
              </RoleGuard>
            }
          />

          <Route
            path="/admin/reviews"
            element={
              <BackendPermissionGuard action="reviews.moderate" fallback={<Navigate to="/unauthorized" replace />}>
                <ReviewsPage />
              </BackendPermissionGuard>
            }
          />

          <Route
            path="/admin/solar/reports"
            element={
              <RoleGuard allowedRoles={['moderator', 'admin']}>
                <AdminSolarReportsPage />
              </RoleGuard>
            }
          />

          <Route
            path="/admin/users"
            element={
              <BackendPermissionGuard action="users.read-list" fallback={<Navigate to="/unauthorized" replace />}>
                <AdminUsersPage />
              </BackendPermissionGuard>
            }
          />

          <Route
            path="/admin/permissions"
            element={
              <BackendPermissionGuard action="permissions.read" fallback={<Navigate to="/unauthorized" replace />}>
                <PermissionsPage />
              </BackendPermissionGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}