import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDeleteMeMutation, useGetMeQuery, useUpdateMeMutation } from '@/features/users/usersApi'
import { getApiErrorMessage } from '@/lib/errors'
import { clearCredentials } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/hooks'

/**
 * ProfilePage — view and edit the current user's profile.
 *
 */
export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { data, isLoading } = useGetMeQuery()
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation()
  const [displayName, setDisplayName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const user = data?.data

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName)
  }, [user])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmed = displayName.trim()
    if (trimmed.length < 2) {
      setErrorMessage('Display name must be at least 2 characters.')
      return
    }

    try {
      await updateMe({ displayName: trimmed }).unwrap()
      toast.success('Profile updated')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not update profile.'))
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete your account? This action will sign you out immediately.')
    if (!confirmed) return

    try {
      await deleteMe().unwrap()
      dispatch(clearCredentials())
      toast.success('Your account has been deleted')
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not delete account.'))
    }
  }

  return (
    <Layout showSidebar>
      <PageHeader
        title="My Profile"
        description="Manage your account details and preferences"
      />

      {isLoading && <p className="text-sm font-medium text-gray-500">Loading…</p>}

      {user && (
        <div className="max-w-xl space-y-6">
          <form onSubmit={handleSave} className="rounded-lg border bg-card p-5">
            <h2 className="text-base font-semibold">Profile Details</h2>

            {errorMessage && (
              <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            )}

            <div className="mt-4 grid gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Display Name</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-md border border-border px-3 py-2 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Email</span>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="rounded-md border border-border bg-muted px-3 py-2 text-muted-foreground"
                />
              </label>

              <div className="grid gap-3 rounded-md bg-muted/60 p-3 text-sm md:grid-cols-3">
                <p>
                  <span className="font-medium">Role:</span> {user.role}
                </p>
                <p>
                  <span className="font-medium">Verified:</span> {user.isEmailVerified ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
            <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deleting your account will deactivate it and revoke active sessions.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="mt-4 rounded bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? 'Deleting...' : 'Delete account'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
