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

      {isLoading && <p className="text-sm font-medium text-gray-500">Loading…</p>}

      {user && (
        <div className="max-w-lg">
          {/* TODO (Member 4): <ProfileForm user={user} onSave={…} /> */}
          <div className="rounded-[20px] border border-gray-100 bg-white p-6 flex flex-col gap-3 text-sm shadow-sm">
            <p><span className="font-bold text-[#133c1d]">Name:</span> <span className="text-gray-600">{user.displayName}</span></p>
            <p><span className="font-bold text-[#133c1d]">Email:</span> <span className="text-gray-600">{user.email}</span></p>
            <p><span className="font-bold text-[#133c1d]">Role:</span>  <span className="text-gray-600">{user.role.displayName}</span></p>
            <p><span className="font-bold text-[#133c1d]">Verified:</span> <span className="text-gray-600">{user.isEmailVerified ? 'Yes' : 'No'}</span></p>
            <p className="text-gray-400 font-medium mt-2">Edit form — Member 4</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
