import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useListUsersQuery } from '@/features/users/usersApi'
import type { User } from '@/types/user.types'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

function RoleBadge({ roleName, roleLevel }: { roleName: string; roleLevel: number }) {
  const colour =
    roleLevel === 4 ? 'bg-red-100 text-red-700' :
    roleLevel === 3 ? 'bg-purple-100 text-purple-700' :
    roleLevel === 2 ? 'bg-blue-100 text-blue-700' :
    'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colour}`}>
      {roleName}
    </span>
  )
}

function StatusBadge({ user }: { user: User }) {
  if (user.isBanned)         return <Badge variant="destructive">Banned</Badge>
  if (!user.isActive)        return <Badge variant="secondary">Inactive</Badge>
  if (!user.isEmailVerified) return <Badge variant="outline">Unverified</Badge>
  return <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
}

export default function AdminUsersPage() {
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useListUsersQuery({ page, limit: 20 })

  const users      = data?.data ?? []
  const pagination = (data as { pagination?: { total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } })?.pagination

  const filtered = search.trim()
    ? users.filter((u) =>
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <Layout showSidebar>
      <PageHeader
        title="User Management"
        description={`${pagination?.total ?? 0} total users`}
      />

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9 rounded-xl h-11"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-[20px] border border-gray-100 bg-white shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Loading users…
          </div>
        )}
        {isError && (
          <div className="flex h-40 items-center justify-center text-sm text-red-500">
            Failed to load users. Please try again.
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No users found.
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8cc63f]/20 text-[11px] font-bold text-[#133c1d] shrink-0">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge roleName={user.role.displayName} roleLevel={user.role.roleLevel} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge user={user} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/users/${user._id}`}
                      className="text-xs font-medium text-[#8cc63f] hover:text-[#7ab32e] hover:underline"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Layout>
  )
}
