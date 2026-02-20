import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

/**
 * App — top-level route shell.
 *
 * Each team member registers their page routes here under the appropriate path.
 * Wrap protected pages with <ProtectedRoute> and role-restricted pages with <RoleGuard>.
 *
 * TODO (module owners):
 *  - Auth team     : /login, /register, /forgot-password, /reset-password/:token
 *  - Stations team : /, /map, /stations/:id, /stations/add, /search
 *  - Reviews team  : (embedded in StationDetailPage)
 *  - Weather team  : (embedded in StationDetailPage)
 *  - Users/Admin   : /profile, /admin, /moderator
 */
function App() {
  useEffect(() => {
    // TODO: silent re-auth on mount — dispatch refresh token thunk
    // dispatch(refreshTokenThunk())
  }, [])

  return (
    <Routes>
      {/* ── Public placeholder ─────────────────────────────── */}
      <Route
        path="*"
        element={
          <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
            <h1>🌞 SolarSpot</h1>
            <p>Initial project setup — routes will be registered here by each module team.</p>
          </div>
        }
      />
    </Routes>
  )
}

export default App
