import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PermissionGuard } from '@/guards/PermissionGuard'

/**
 * Navbar — top navigation bar.
 *
 * TODO (Member 4): connect logout button to authApi.logout mutation.
 * TODO (All teams): add notification bell badge using useGetNotificationsQuery.
 */
export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          🌞 <span>SolarSpot</span>
        </Link>

        {/* Primary nav */}
        <div className="flex flex-1 items-center gap-2 text-sm">
          <NavLink to="/stations" className="text-muted-foreground hover:text-foreground">
            Stations
          </NavLink>
          <NavLink to="/map" className="text-muted-foreground hover:text-foreground">
            Map
          </NavLink>

          <PermissionGuard action="weather.export">
            <NavLink to="/weather" className="text-muted-foreground hover:text-foreground">
              Weather
            </NavLink>
          </PermissionGuard>

          <PermissionGuard action="permissions.read">
            <NavLink to="/admin/permissions" className="text-muted-foreground hover:text-foreground">
              Admin
            </NavLink>
          </PermissionGuard>
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="text-muted-foreground mr-2 font-medium">{user?.displayName}</span>
              <Link to="/profile" className="hover:text-solar-green-700 font-medium transition-colors">Profile</Link>
              <button onClick={signOut} className="hover:text-red-600 font-medium transition-colors">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn-login">
                Log In
              </Link>
              <Link to="/register" className="nav-btn-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}
