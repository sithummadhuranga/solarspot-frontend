import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/guards/ProtectedRoute'
import { RoleGuard } from '@/guards/RoleGuard'

// ── Public pages ────────────────────────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/HomePage'))
const LoginPage          = lazy(() => import('@/pages/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/ResetPasswordPage'))
const VerifyEmailPage    = lazy(() => import('@/pages/VerifyEmailPage'))
const StationsPage       = lazy(() => import('@/pages/StationsPage'))
const StationDetailPage  = lazy(() => import('@/pages/StationDetailPage'))
const StationMapPage     = lazy(() => import('@/pages/StationMapPage'))
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage'))
const UnauthorizedPage   = lazy(() => import('@/pages/UnauthorizedPage'))

// ── Authenticated pages ─────────────────────────────────────────────────────────
const DashboardPage  = lazy(() => import('@/pages/DashboardPage'))
const ProfilePage    = lazy(() => import('@/pages/ProfilePage'))
const AddStationPage = lazy(() => import('@/pages/AddStationPage'))
const MyStationsPage = lazy(() => import('@/pages/MyStationsPage'))
const WeatherPage    = lazy(() => import('@/pages/WeatherPage'))

// ── Moderator pages ─────────────────────────────────────────────────────────────
const ModeratorDashboardPage = lazy(() => import('@/pages/ModeratorDashboardPage'))
const ModerationQueuePage    = lazy(() => import('@/pages/ModerationQueuePage'))
const ReviewsPage            = lazy(() => import('@/pages/ReviewsPage'))

// ── Admin pages ─────────────────────────────────────────────────────────────────
const AdminDashboardPage   = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsersPage       = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminUserDetailPage  = lazy(() => import('@/pages/admin/AdminUserDetailPage'))
const AdminPermissionsPage = lazy(() => import('@/pages/admin/AdminPermissionsPage'))
const AdminRolesPage       = lazy(() => import('@/pages/admin/AdminRolesPage'))
const AdminAuditLogsPage   = lazy(() => import('@/pages/admin/AdminAuditLogsPage'))
const AdminQuotaPage       = lazy(() => import('@/pages/admin/AdminQuotaPage'))

function PageSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-solar-green-200 border-t-solar-green-600 animate-spin" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>

        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/"                      element={<HomePage />} />
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/register"              element={<RegisterPage />} />
        <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token"   element={<VerifyEmailPage />} />
        <Route path="/stations"              element={<StationsPage />} />
        <Route path="/stations/:id"          element={<StationDetailPage />} />
        <Route path="/map"                   element={<StationMapPage />} />
        <Route path="/unauthorized"          element={<UnauthorizedPage />} />

        {/* ── Authenticated ───────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/stations/new" element={<AddStationPage />} />
          <Route path="/my-stations"  element={<MyStationsPage />} />
          <Route path="/weather"      element={<WeatherPage />} />

          {/* ── Moderator (roleLevel >= 3) ─────────────────────────────────── */}
          <Route
            path="/moderator/dashboard"
            element={
              <RoleGuard minRoleLevel={3}>
                <ModeratorDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/stations/pending"
            element={
              <RoleGuard minRoleLevel={3}>
                <ModerationQueuePage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <RoleGuard minRoleLevel={3}>
                <ReviewsPage />
              </RoleGuard>
            }
          />

          {/* ── Admin only (role.name === 'admin') ─────────────────────────── */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminUsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminUserDetailPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminPermissionsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminRolesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminAuditLogsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/quota"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminQuotaPage />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  )
}
