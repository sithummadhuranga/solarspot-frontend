import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useGetMeQuery, useUpdateMeMutation } from '@/features/users/usersApi'

/**
 * ProfilePage — view and edit the current user's profile.
 *
 * TODO (Member 4):
 *  - Build edit form wired to useUpdateMeMutation
 *  - Add avatar upload to Cloudinary
 *  - Add account deletion with confirmation modal (useDeleteMeMutation)
 *  - Show preferences section (default radius, connector type, notifications)
 */
export default function ProfilePage() {
  const { data, isLoading }  = useGetMeQuery()
  // updateMe and isSaving will be used once Member 4 wires the edit form
  const [_updateMe, { isLoading: _isSaving }] = useUpdateMeMutation()
  void _updateMe
  void _isSaving

  const user = data?.data

  return (
    <Layout showSidebar>
      <PageHeader
        title="My Profile"
        description="Manage your account details and preferences"
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {user && (
        <div className="max-w-lg">
          {/* TODO (Member 4): <ProfileForm user={user} onSave={…} /> */}
          <div className="rounded-lg border p-4 flex flex-col gap-2 text-sm">
            <p><span className="font-medium">Name:</span> {user.displayName}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span>  {user.role}</p>
            <p><span className="font-medium">Verified:</span> {user.isEmailVerified ? 'Yes' : 'No'}</p>
            <p className="text-muted-foreground mt-2">Edit form — Member 4</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
