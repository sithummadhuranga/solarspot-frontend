import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'

type TabId = 'overview' | 'users' | 'stations' | 'analytics' | 'permissions' | 'moderation'

const TABS: Array<{ id: TabId; label: string; description: string; href?: string }> = [
  { id: 'overview', label: 'Overview', description: 'Admin dashboard overview and quick stats' },
  { id: 'users', label: 'Users', description: 'Manage user accounts, roles, and permissions', href: '/admin/users' },
  { id: 'stations', label: 'Stations', description: 'Review and moderate pending stations', href: '/admin/stations/pending' },
  { id: 'analytics', label: 'Analytics', description: 'Solar reports and system analytics', href: '/admin/solar/reports' },
  { id: 'permissions', label: 'Permissions', description: 'Manage roles, permissions, and audit logs', href: '/admin/permissions' },
  { id: 'moderation', label: 'Moderation', description: 'Review and moderate content', href: '/admin/reviews' },
]

const ADMIN_TAB_IDS = new Set<TabId>(TABS.map((tab) => tab.id))

export default function AdminDashboardPage() {
  const [searchParams] = useSearchParams()

  const activeTab = useMemo<TabId>(() => {
    const value = searchParams.get('tab')
    if (value && ADMIN_TAB_IDS.has(value as TabId)) {
      return value as TabId
    }
    return 'overview'
  }, [searchParams])

  return (
    <Layout showSidebar>
      <PageHeader
        title="Admin Dashboard"
        description="Manage system configuration, users, and content moderation."
      />

      <div className="rounded-[20px] border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const tabClass = `px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#8cc63f] text-[#133c1d]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`

              if (tab.href) {
                return (
                  <Link
                    key={tab.id}
                    to={tab.href}
                    className={tabClass}
                    title={tab.description}
                  >
                    {tab.label}
                  </Link>
                )
              }

              return (
                <Link
                  key={tab.id}
                  to="/admin"
                  className={tabClass}
                  title={tab.description}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-600">Total Users</p>
                  <p className="mt-2 text-2xl font-bold text-blue-900">—</p>
                  <p className="mt-1 text-xs text-gray-600">Loading...</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-600">Active Stations</p>
                  <p className="mt-2 text-2xl font-bold text-green-900">—</p>
                  <p className="mt-1 text-xs text-gray-600">Loading...</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-600">Pending Reviews</p>
                  <p className="mt-2 text-2xl font-bold text-amber-900">—</p>
                  <p className="mt-1 text-xs text-gray-600">Loading...</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-600">System Health</p>
                  <p className="mt-2 text-2xl font-bold text-purple-900">✓</p>
                  <p className="mt-1 text-xs text-gray-600">All systems operational</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-xs">
                  <Link to="/admin/users" className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition text-center">View All Users</Link>
                  <Link to="/admin/stations/pending" className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition text-center">Pending Stations</Link>
                  <Link to="/admin/permissions" className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition text-center">Audit Logs</Link>
                  <Link to="/admin/permissions" className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition text-center">Permissions</Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">User management interface</p>
              <p className="mt-2 text-xs text-gray-500">Loading admin users page...</p>
              <Link to="/admin/users" className="mt-4 inline-flex rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-100">
                Open user management
              </Link>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Pending stations for moderation</p>
              <p className="mt-2 text-xs text-gray-500">Loading moderation queue...</p>
              <Link to="/admin/stations/pending" className="mt-4 inline-flex rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-100">
                Open station moderation
              </Link>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Solar reports and analytics</p>
              <p className="mt-2 text-xs text-gray-500">Loading analytics dashboard...</p>
              <Link to="/admin/solar/reports" className="mt-4 inline-flex rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-100">
                Open analytics reports
              </Link>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Manage roles, permissions, and audit logs</p>
              <p className="mt-2 text-xs text-gray-500">Loading permissions management...</p>
              <Link to="/admin/permissions" className="mt-4 inline-flex rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-100">
                Open permissions center
              </Link>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Review and moderate user-generated content</p>
              <p className="mt-2 text-xs text-gray-500">Open review moderation tools</p>
              <Link to="/admin/reviews" className="mt-4 inline-flex rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-100">
                Open moderation queue
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
