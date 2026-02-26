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

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-background md:block">
      <nav className="flex flex-col gap-1 p-4 text-sm">

        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Stations
        </p>
        <NavLink to="/stations"       className="sidebar-link">All Stations</NavLink>
        <NavLink to="/stations/new"   className="sidebar-link">Submit Station</NavLink>

        {hasPermission('stations.read-pending') && (
          <NavLink to="/admin/stations/pending" className="sidebar-link">Pending Review</NavLink>
        )}

        <p className="mt-3 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account
        </p>
        <NavLink to="/profile"         className="sidebar-link">My Profile</NavLink>
        <NavLink to="/profile/reviews" className="sidebar-link">My Reviews</NavLink>

        {hasPermission('permissions.read') && (
          <>
            <p className="mt-3 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </p>
            <NavLink to="/admin/users"       className="sidebar-link">Users</NavLink>
            <NavLink to="/admin/permissions" className="sidebar-link">Permissions</NavLink>
            <NavLink to="/admin/quotas"      className="sidebar-link">API Quotas</NavLink>
            <NavLink to="/admin/audit"       className="sidebar-link">Audit Log</NavLink>
          </>
        )}

      </nav>
    </aside>
  )
}
