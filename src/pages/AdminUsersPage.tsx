import { useMemo, useState } from 'react'
import { RefreshCcw, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { useAdminUpdateUserMutation, useListUsersQuery } from '@/features/users/usersApi'
import { getRoleSlug, getSafeText } from '@/lib/auth'
import type { UserRole } from '@/types/user.types'

const PAGE_SIZE = 12
const ROLES: UserRole[] = ['user', 'moderator', 'admin']

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const params = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    role: roleFilter === 'all' ? undefined : roleFilter,
  }), [page, roleFilter])

  const { data, isLoading, isFetching, refetch } = useListUsersQuery(params)
  const [updateRole, updateRoleState] = useAdminUpdateUserMutation()

  const users = data?.data ?? []
  const pagination = data?.pagination

  async function handleRoleChange(userId: string, role: UserRole) {
    try {
      setUpdatingUserId(userId)
      await updateRole({ id: userId, role }).unwrap()
      toast.success('User role updated successfully.')
    } catch {
      toast.error('Failed to update user role.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <Layout showSidebar>
      <PageHeader
        title="Users"
        description="Manage user roles and review account status."
        actions={(
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        )}
      />

      <section className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {pagination ? `Showing ${users.length} of ${pagination.total} users` : 'Loading users...'}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Role
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | 'all')
                setPage(1)
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#8cc63f]"
            >
              <option value="all">All</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="border-b border-gray-100 px-3 py-3">User</th>
                <th className="border-b border-gray-100 px-3 py-3">Email</th>
                <th className="border-b border-gray-100 px-3 py-3">Role</th>
                <th className="border-b border-gray-100 px-3 py-3">Status</th>
                <th className="border-b border-gray-100 px-3 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3"><div className="h-4 w-32 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-44 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-3 py-3"><div className="h-8 w-28 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-100" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-gray-500" colSpan={5}>
                    No users found for this role filter.
                  </td>
                </tr>
              ) : users.map((user) => {
                const isRowUpdating = updatingUserId === user._id && updateRoleState.isLoading
                const currentRole = getRoleSlug((user as { role?: unknown }).role)
                return (
                  <tr key={user._id} className="text-sm">
                    <td className="border-b border-gray-50 px-3 py-3 font-semibold text-[#133c1d]">
                      {getSafeText(user.displayName)}
                    </td>
                    <td className="border-b border-gray-50 px-3 py-3 text-gray-600">{getSafeText(user.email)}</td>
                    <td className="border-b border-gray-50 px-3 py-3">
                      <select
                        value={currentRole}
                        onChange={(e) => void handleRoleChange(user._id, e.target.value as UserRole)}
                        disabled={isRowUpdating}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm capitalize outline-none focus:border-[#8cc63f] disabled:opacity-60"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-gray-50 px-3 py-3">
                      <span className={user.isActive ? 'rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700' : 'rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700'}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="border-b border-gray-50 px-3 py-3 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <div className="mt-5 rounded-[16px] border border-[#8cc63f]/25 bg-[#f5faf0] p-4 text-sm text-[#133c1d]">
        <p className="font-semibold">Access note</p>
        <p className="mt-1 text-[#133c1d]/85">Only admins can access this page and assign roles. Moderators should use moderation pages only.</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-[#1a6b3c]"><Shield className="h-3.5 w-3.5" /> Changes should be captured in backend audit logs.</p>
      </div>
    </Layout>
  )
}
