import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetUserByIdQuery, useAdminUpdateUserMutation } from '@/features/users/usersApi'
import { ChevronLeft } from 'lucide-react'

const ROLE_SLUGS = [
  'user',
  'station_owner',
  'featured_contributor',
  'trusted_reviewer',
  'review_moderator',
  'weather_analyst',
  'permission_auditor',
  'moderator',
  'admin',
] as const

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError } = useGetUserByIdQuery(id ?? '', { skip: !id })
  const [adminUpdate, { isLoading: isSaving }] = useAdminUpdateUserMutation()

  const user = data?.data

  const [role,     setRole]     = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isBanned, setIsBanned] = useState(false)

  // Sync form state when user data loads
  useEffect(() => {
    if (user) {
      setRole(user.role.name)
      setIsActive(user.isActive)
      setIsBanned(user.isBanned)
    }
  }, [user])

  async function handleSave() {
    if (!id) return
    try {
      await adminUpdate({ id, role, isActive, isBanned }).unwrap()
      toast.success('User updated successfully.')
    } catch {
      toast.error('Failed to update user. Please try again.')
    }
  }

  return (
    <Layout showSidebar>
      <div className="mb-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Users
        </Link>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading user…
        </div>
      )}

      {isError && (
        <div className="flex h-40 items-center justify-center text-sm text-red-500">
          User not found or you don't have permission.
        </div>
      )}

      {user && (
        <>
          <PageHeader
            title={user.displayName}
            description={`${user.email} · ID: ${user._id}`}
          />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Read-only info */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-900">Account Info</h2>
              <Row label="Email"          value={user.email} />
              <Row label="Display name"   value={user.displayName} />
              <Row label="Email verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
              <Row label="Joined"         value={new Date(user.createdAt).toLocaleString()} />
              <Row label="Last updated"   value={new Date(user.updatedAt).toLocaleString()} />
            </div>

            {/* Editable controls */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-gray-900">Admin Controls</h2>

              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_SLUGS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Account active</p>
                  <p className="text-xs text-muted-foreground">Inactive accounts cannot log in.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-solar-green-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-red-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-red-700">Banned</p>
                  <p className="text-xs text-muted-foreground">Banned accounts see an error on login.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isBanned}
                  onClick={() => setIsBanned((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isBanned ? 'bg-red-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isBanned ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
