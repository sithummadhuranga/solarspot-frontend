import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Sun, MapPin, Zap, LayoutGrid, User2, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, isAuthenticated, signOut, roleLevel, roleName } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // roleLevel >= 3 = review_moderator / weather_analyst / permission_auditor / moderator / admin
  const isMod   = roleLevel >= 3
  const isAdmin = roleName === 'admin'

  const navLink = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn('text-sm font-medium transition-colors', isActive ? 'text-solar-green-700' : 'text-gray-600 hover:text-gray-900')
      }
    >
      {label}
    </NavLink>
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8cc63f]">
            <Sun className="h-4 w-4 text-[#133c1d]" />
          </div>
          <span className="font-sg font-bold text-gray-900 tracking-tight">SolarSpot</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 items-center gap-5 mx-6">
          {navLink('/stations', 'Stations')}
          {navLink('/map', 'Map')}
          {isAuthenticated && navLink('/my-stations', 'My Stations')}
          {isMod && navLink('/moderator/dashboard', 'Moderation')}
          {navLink('/weather', 'Weather')}
          {isAdmin && navLink('/admin/dashboard', 'Admin')}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              <Link to="/stations/new"
                className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#8cc63f] px-3 py-1.5 text-xs font-sg font-semibold text-[#133c1d] hover:bg-[#7ab334] transition-colors">
                <Zap className="h-3.5 w-3.5" /> Add Station
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                    : <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8cc63f]/20 text-[11px] font-bold text-[#133c1d]">
                        {user?.displayName?.charAt(0).toUpperCase()}
                      </div>
                  }
                  <span className="max-w-[100px] truncate">{user?.displayName}</span>
                </Link>
                <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
              <Link to="/register" className="rounded-[12px] bg-[#8cc63f] px-3.5 py-1.5 text-sm font-sg font-semibold text-[#133c1d] hover:bg-[#7ab334] transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen((o) => !o)} className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden space-y-1">
          {[
            { to: '/stations',  label: 'Stations', icon: <LayoutGrid className="h-4 w-4" /> },
            { to: '/map',       label: 'Map',      icon: <MapPin className="h-4 w-4" /> },
            ...(isAuthenticated ? [{ to: '/my-stations', label: 'My Stations', icon: <Zap className="h-4 w-4" /> }] : []),
            ...(isMod ? [{ to: '/moderator/dashboard', label: 'Moderation', icon: <ShieldCheck className="h-4 w-4" /> }] : []),
          ].map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="text-gray-400">{item.icon}</span> {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
              <Link to="/stations/new" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-[16px] bg-[#8cc63f] px-3 py-2.5 text-sm font-sg font-semibold text-[#133c1d]">
                <Zap className="h-4 w-4" /> Add Station
              </Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <User2 className="h-4 w-4 text-gray-400" /> {user?.displayName}
              </Link>
              <button onClick={() => { void signOut(); setMobileOpen(false) }}
                className="flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="mt-3 border-t border-gray-100 pt-3 flex gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-[16px] border border-gray-200 py-2 text-center text-sm font-medium text-gray-700">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-[16px] bg-[#8cc63f] py-2 text-center text-sm font-sg font-semibold text-[#133c1d]">Sign up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
