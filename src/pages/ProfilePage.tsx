import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ShieldCheck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDeleteMeMutation, useGetMeQuery, useUpdateMeMutation } from '@/features/users/usersApi'
import { getApiErrorMessage } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type TabId = 'info' | 'stations' | 'reviews'


export default function ProfilePage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetMeQuery()
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation()
  const [editedDisplayName, setEditedDisplayName] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('info')

  const user = data?.data
  const displayName = editedDisplayName ?? user?.displayName ?? ''
  const isUnchanged = user ? displayName.trim() === user.displayName : false

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'
  const userInitial = (displayName || user?.email || 'U').charAt(0).toUpperCase()

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
      setEditedDisplayName(trimmed)
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
      toast.success('Your account has been deleted')
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not delete account.'))
    }
  }

  const TABS: Array<{ id: TabId; label: string }> = [
    { id: 'info', label: 'My Info' },
    { id: 'stations', label: 'My Stations' },
    { id: 'reviews', label: 'My Reviews' },
  ]

  return (
    <Layout showSidebar>
      <PageHeader
        title="My Profile"
        description="Manage your account details and content"
      />

      {isLoading && (
        <div className="max-w-4xl space-y-4">
          <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      )}

      {isError && !user && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Could not load your profile right now. Please refresh and try again.
        </p>
      )}

      {user && (
        <div className="max-w-4xl space-y-6">
          {}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-800">
                  {userInitial}
                </div>
                <div>
                  <p className="text-lg font-bold text-[#133c1d]">{displayName || 'Unnamed user'}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="rounded-full px-3 py-1">
                  {roleLabel}
                </Badge>
                <Badge variant={user.isEmailVerified ? 'blue' : 'amber'} className="rounded-full px-3 py-1">
                  {user.isEmailVerified ? 'Verified email' : 'Email not verified'}
                </Badge>
              </div>
            </div>
          </section>

          {}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50">
              <div className="flex">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="p-6">
              {}
              {activeTab === 'info' && (
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#133c1d]">Profile Details</h2>
                    <p className="mt-1 text-sm text-slate-500">Update your display name. Email address is read-only.</p>
                  </div>

                  {errorMessage && (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {errorMessage}
                    </p>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="displayName" className="text-sm text-slate-700">Display Name</Label>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setEditedDisplayName(e.target.value)}
                          className="h-10 pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email" className="text-sm text-slate-700">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="h-10 bg-slate-50 pl-9 text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Role</p>
                        <p className="mt-1 font-semibold text-slate-800">{roleLabel}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email Status</p>
                        <p className="mt-1 font-semibold text-slate-800">{user.isEmailVerified ? 'Verified' : 'Unverified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Account</p>
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-800">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                    <Button
                      type="submit"
                      disabled={isSaving || isUnchanged}
                      className="rounded-xl px-5"
                    >
                      {isSaving ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>

                  {}
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                    <h3 className="text-base font-semibold text-destructive">Danger Zone</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Deleting your account will deactivate it and revoke active sessions.
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="mt-4 rounded-xl"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete account'}
                    </Button>
                  </div>
                </form>
              )}

              {}
              {activeTab === 'stations' && (
                <div className="text-center py-12">
                  <p className="text-slate-600">My Stations interface</p>
                  <p className="mt-2 text-xs text-slate-500">View your submitted and approved solar stations</p>
                </div>
              )}

              {}
              {activeTab === 'reviews' && (
                <div className="text-center py-12">
                  <p className="text-slate-600">My Reviews interface</p>
                  <p className="mt-2 text-xs text-slate-500">View your submitted reviews and ratings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
