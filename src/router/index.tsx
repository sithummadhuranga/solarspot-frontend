import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/guards/ProtectedRoute'
import { RoleGuard }      from '@/guards/RoleGuard'

// ─── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Code-split each page so the initial bundle stays small.
const HomePage            = lazy(() => import('@/pages/HomePage'))
const LoginPage           = lazy(() => import('@/pages/LoginPage'))
const RegisterPage        = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage       = lazy(() => import('@/pages/DashboardPage'))
const StationsPage        = lazy(() => import('@/pages/StationsPage'))
const StationDetailPage   = lazy(() => import('@/pages/StationDetailPage'))
const WeatherPage         = lazy(() => import('@/pages/WeatherPage'))
const ReviewsPage         = lazy(() => import('@/pages/ReviewsPage'))
const PermissionsPage     = lazy(() => import('@/pages/PermissionsPage'))
const ProfilePage         = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage        = lazy(() => import('@/pages/NotFoundPage'))

/** Fallback shown while a lazy chunk is loading. */
function PageSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  )
}

/**
 * AppRouter — declarative route tree for all 47+ API-backed pages.
 *
 * Route ownership:
 *  - /                   Public landing     (Member 1/visual)
 *  - /login /register    Auth pages         (Member 4)
 *  - /stations*          Station pages      (Member 1)
 *  - /weather            Weather dashboard  (Member 3 — you)
 *  - /admin/permissions  RBAC admin         (Member 4)
 *  - /admin/reviews      Mod queue          (Member 2)
 *  - /profile            User profile       (Member 4)
 *
 * TODO: add /map, /search, /stations/new, /forgot-password, /reset-password/:token
 */
export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>

        {/* ── Public routes ───────────────────────────────────────────────── */}
        <Route path="/"           element={<HomePage />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />
        <Route path="/stations"   element={<StationsPage />} />
        <Route path="/stations/:id" element={<StationDetailPage />} />

        {/* ── Authenticated routes ────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile"   element={<ProfilePage />} />

          {/* Weather — accessible to all logged-in users */}
          <Route path="/weather"   element={<WeatherPage />} />

          {/* Moderation — review_moderator + moderator + admin */}
          <Route
            path="/admin/reviews"
            element={
              <RoleGuard allowedRoles={['moderator', 'admin']}>
                <ReviewsPage />
              </RoleGuard>
            }
          />

          {/* RBAC admin — admin only */}
          <Route
            path="/admin/permissions"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <PermissionsPage />
              </RoleGuard>
            }
          />
        </Route>

        {/* ── 404 fallback ────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  )
}
