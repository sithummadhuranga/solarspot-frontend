import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAdminUpdateUserMutation, useListUsersQuery } from '@/features/users/usersApi'
import { getApiErrorMessage } from '@/lib/errors'
import { EDITABLE_ROLES, ROLE_LABELS } from '@/lib/user'
import type { AdminChangeRoleDto, User, UserRole } from '@/types/user.types'

interface UserRowEdits {
  role: UserRole
  isActive: boolean
  isBanned: boolean
}

function buildInitialEdits(user: User): UserRowEdits {
  return {
    role: user.role,
    isActive: user.isActive,
    isBanned: Boolean(user.isBanned),
  }
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const { data, isLoading, isFetching, refetch } = useListUsersQuery({
    page,
    limit: 15,
    search: search.trim() || undefined,
    role: roleFilter || undefined,
    isActive:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active',
  })

  const [adminUpdateUser, { isLoading: isSaving }] = useAdminUpdateUserMutation()
  const [drafts, setDrafts] = useState<Record<string, UserRowEdits>>({})

  const users = data?.data ?? []
  const pagination = data?.pagination

  const rowDrafts = useMemo(() => {
    const next: Record<string, UserRowEdits> = {}
    for (const user of users) {
      next[user._id] = drafts[user._id] ?? buildInitialEdits(user)
    }
    return next
  }, [drafts, users])

  const setRowDraft = (userId: string, patch: Partial<UserRowEdits>) => {
    setDrafts((current) => {
      const base = current[userId] ?? rowDrafts[userId]
      return {
        ...current,
        [userId]: {
          ...base,
          ...patch,
        },
      }
    })
  }

  const hasChanges = (user: User): boolean => {
    const draft = rowDrafts[user._id]
    if (!draft) return false

    return (
      draft.role !== user.role ||
      draft.isActive !== user.isActive ||
      draft.isBanned !== Boolean(user.isBanned)
    )
  }

  const saveRow = async (user: User) => {
    const draft = rowDrafts[user._id]
    if (!draft) return

    const payload: AdminChangeRoleDto = {}

    if (draft.role !== user.role) payload.role = draft.role
    if (draft.isActive !== user.isActive) payload.isActive = draft.isActive
    if (draft.isBanned !== Boolean(user.isBanned)) payload.isBanned = draft.isBanned

    if (Object.keys(payload).length === 0) return

    try {
      await adminUpdateUser({ id: user._id, ...payload }).unwrap()
      toast.success(`Updated ${user.displayName}`)
      setDrafts((current) => {
        const next = { ...current }
        delete next[user._id]
        return next
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update user.'))
    }
  }

  return (
    <Layout showSidebar>
      <PageHeader
        title="User Management"
        description="Manage user roles and account status using RBAC-backed controls."
      />

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Search</span>
            <input
              type="text"
              placeholder="Name or email"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Role Filter</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setPage(1)
                setRoleFilter(e.target.value)
              }}
              className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="">All roles</option>
              {EDITABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Status Filter</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1)
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }}
              className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Refresh list
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-2 py-3 font-medium">User</th>
                  <th className="px-2 py-3 font-medium">Role</th>
                  <th className="px-2 py-3 font-medium">Active</th>
                  <th className="px-2 py-3 font-medium">Banned</th>
                  <th className="px-2 py-3 font-medium">Verified</th>
                  <th className="px-2 py-3 font-medium">Created</th>
                  <th className="px-2 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const draft = rowDrafts[user._id]
                  const dirty = hasChanges(user)

                  return (
                    <tr key={user._id} className="border-b last:border-b-0">
                      <td className="px-2 py-3 align-top">
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>

                      <td className="px-2 py-3 align-top">
                        <select
                          value={draft?.role ?? user.role}
                          onChange={(e) => setRowDraft(user._id, { role: e.target.value as UserRole })}
                          className="rounded-md border border-border px-2 py-1 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                        >
                          {EDITABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-2 py-3 align-top">
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={draft?.isActive ?? user.isActive}
                            onChange={(e) => setRowDraft(user._id, { isActive: e.target.checked })}
                          />
                          Enabled
                        </label>
                      </td>

                      <td className="px-2 py-3 align-top">
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={draft?.isBanned ?? Boolean(user.isBanned)}
                            onChange={(e) => setRowDraft(user._id, { isBanned: e.target.checked })}
                          />
                          Banned
                        </label>
                      </td>

                      <td className="px-2 py-3 align-top">
                        {user.isEmailVerified ? 'Yes' : 'No'}
                      </td>

                      <td className="px-2 py-3 align-top text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-2 py-3 align-top">
                        <button
                          type="button"
                          disabled={!dirty || isSaving}
                          onClick={() => saveRow(user)}
                          className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No users found for current filters.
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
          <span className="text-muted-foreground">
            {pagination
              ? `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} users)`
              : 'No pagination data'}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination?.hasPrev || isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded border border-border px-3 py-1.5 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination?.hasNext || isFetching}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded border border-border px-3 py-1.5 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
