import { useState } from 'react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'

type TabId = 'overview' | 'users' | 'stations' | 'analytics' | 'permissions' | 'moderation'

const TABS: Array<{ id: TabId; label: string; description: string }> = [
  { id: 'overview', label: 'Overview', description: 'Admin dashboard overview and quick stats' },
  { id: 'users', label: 'Users', description: 'Manage user accounts, roles, and permissions' },
  { id: 'stations', label: 'Stations', description: 'Review and moderate pending stations' },
  { id: 'analytics', label: 'Analytics', description: 'Solar reports and system analytics' },
  { id: 'permissions', label: 'Permissions', description: 'Manage roles, permissions, and audit logs' },
  { id: 'moderation', label: 'Moderation', description: 'Review and moderate content' },
]

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

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
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#8cc63f] text-[#133c1d]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                title={tab.description}
              >
                {tab.label}
              </button>
            ))}
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
                  <button onClick={() => setActiveTab('users')} className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition">View All Users</button>
                  <button onClick={() => setActiveTab('stations')} className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition">Pending Stations</button>
                  <button onClick={() => setActiveTab('permissions')} className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition">Audit Logs</button>
                  <button onClick={() => setActiveTab('permissions')} className="rounded px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 transition">Permissions</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">User management interface</p>
              <p className="mt-2 text-xs text-gray-500">Loading admin users page...</p>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Pending stations for moderation</p>
              <p className="mt-2 text-xs text-gray-500">Loading moderation queue...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Solar reports and analytics</p>
              <p className="mt-2 text-xs text-gray-500">Loading analytics dashboard...</p>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Manage roles, permissions, and audit logs</p>
              <p className="mt-2 text-xs text-gray-500">Loading permissions management...</p>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Review and moderate user-generated content</p>
              <p className="mt-2 text-xs text-gray-500">Review moderation coming soon</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
