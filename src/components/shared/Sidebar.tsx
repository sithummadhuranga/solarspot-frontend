import { NavLink } from 'react-router-dom'
import { usePermission } from '@/hooks/usePermission'

/**
 * Sidebar — contextual navigation for authenticated/admin sections.
 *
 * Rendered by Layout only when showSidebar={true}.
 * Items are conditionally shown based on the current user's permissions.
 *
 * TODO (All teams): expand nav items as pages are implemented.
 */
export function Sidebar() {
  const { hasPermission } = usePermission()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#8cc63f]/10 text-[#133c1d] font-semibold'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white md:block">
      <nav className="flex flex-col gap-1 p-4 text-sm">

        <p className="px-3 py-2 text-xs font-sg font-bold text-gray-400 uppercase tracking-wider">
          Stations
        </p>
        <NavLink to="/stations"       className={navLinkClass}>All Stations</NavLink>
        <NavLink to="/stations/new"   className={navLinkClass}>Submit Station</NavLink>

        {hasPermission('stations.read-pending') && (
          <NavLink to="/admin/stations/pending" className={navLinkClass}>Pending Review</NavLink>
        )}

        <p className="mt-4 px-3 py-2 text-xs font-sg font-bold text-gray-400 uppercase tracking-wider">
          Account
        </p>
        <NavLink to="/profile"         className={navLinkClass}>My Profile</NavLink>
        <NavLink to="/profile/reviews" className={navLinkClass}>My Reviews</NavLink>

        {hasPermission('permissions.read') && (
          <>
            <p className="mt-4 px-3 py-2 text-xs font-sg font-bold text-gray-400 uppercase tracking-wider">
              Administration
            </p>
            <NavLink to="/admin/users"       className={navLinkClass}>Users</NavLink>
            <NavLink to="/admin/permissions" className={navLinkClass}>Permissions</NavLink>
            <NavLink to="/admin/quotas"      className={navLinkClass}>API Quotas</NavLink>
            <NavLink to="/admin/audit"       className={navLinkClass}>Audit Log</NavLink>
          </>
        )}

      </nav>
    </aside>
  )
}
