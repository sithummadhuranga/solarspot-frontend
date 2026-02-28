import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/guards/ProtectedRoute'
import { RoleGuard } from '@/guards/RoleGuard'

const HomePage             = lazy(() => import('@/pages/HomePage'))
const LoginPage            = lazy(() => import('@/pages/LoginPage'))
const RegisterPage         = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage        = lazy(() => import('@/pages/DashboardPage'))
const StationsPage         = lazy(() => import('@/pages/StationsPage'))
const StationDetailPage    = lazy(() => import('@/pages/StationDetailPage'))
const StationMapPage       = lazy(() => import('@/pages/StationMapPage'))
const AddStationPage       = lazy(() => import('@/pages/AddStationPage'))
const MyStationsPage       = lazy(() => import('@/pages/MyStationsPage'))
const ModerationQueuePage  = lazy(() => import('@/pages/ModerationQueuePage'))
const WeatherPage          = lazy(() => import('@/pages/WeatherPage'))
const ReviewsPage          = lazy(() => import('@/pages/ReviewsPage'))
const PermissionsPage      = lazy(() => import('@/pages/PermissionsPage'))
const ProfilePage          = lazy(() => import('@/pages/ProfilePage'))
const VerifyEmailPage      = lazy(() => import('@/pages/VerifyEmailPage'))
const NotFoundPage         = lazy(() => import('@/pages/NotFoundPage'))

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

        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/"             element={<HomePage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/stations"     element={<StationsPage />} />
        <Route path="/stations/:id" element={<StationDetailPage />} />
        <Route path="/map"          element={<StationMapPage />} />

        {/* ── Authenticated ───────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/profile"        element={<ProfilePage />} />
          <Route path="/stations/new"   element={<AddStationPage />} />
          <Route path="/my-stations"    element={<MyStationsPage />} />
          <Route path="/weather"        element={<WeatherPage />} />

          {/* Moderation queue */}
          <Route
            path="/admin/stations/pending"
            element={
              <RoleGuard allowedRoles={['moderator', 'admin']}>
                <ModerationQueuePage />
              </RoleGuard>
            }
          />

          {/* Reviews moderation */}
          <Route
            path="/admin/reviews"
            element={
              <RoleGuard allowedRoles={['moderator', 'admin']}>
                <ReviewsPage />
              </RoleGuard>
            }
          />

          {/* RBAC admin */}
          <Route
            path="/admin/permissions"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <PermissionsPage />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  )
}
