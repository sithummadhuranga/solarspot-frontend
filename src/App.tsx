import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ProtectedRoute } from '@/guards/ProtectedRoute'
import { RoleGuard } from '@/guards/RoleGuard'

// Lazy-load page bundles for code splitting
const StationMapPage      = lazy(() => import('@/pages/StationMapPage'))
const StationDetailPage   = lazy(() => import('@/pages/StationDetailPage'))
const ModerationQueuePage = lazy(() => import('@/pages/ModerationQueuePage'))
const MyStationsPage      = lazy(() => import('@/pages/MyStationsPage'))

function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/"            element={<Navigate to="/stations" replace />} />
        <Route path="/stations"    element={<StationMapPage />} />
        <Route path="/stations/:id" element={<StationDetailPage />} />

        {/* ── Authenticated ─────────────────────────────────────── */}
        <Route
          path="/profile/stations"
          element={
            <ProtectedRoute>
              <MyStationsPage />
            </ProtectedRoute>
          }
        />

        {/* ── Moderator / Admin only ─────────────────────────────── */}
        <Route
          path="/admin/stations/pending"
          element={
            <ProtectedRoute>
              <RoleGuard minRole="moderator">
                <ModerationQueuePage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all ──────────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <div className="flex h-screen flex-col items-center justify-center gap-4">
              <h1 className="text-4xl font-bold text-gray-300">404</h1>
              <p className="text-gray-500">Page not found</p>
              <a href="/stations" className="text-green-600 hover:underline text-sm">
                ← Back to map
              </a>
            </div>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App
