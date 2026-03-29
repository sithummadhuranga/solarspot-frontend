import { useEffect, useState } from 'react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useGetMeQuery, useUpdateMeMutation, useDeleteMeMutation } from '@/features/users/usersApi'
import { useAuth } from '@/hooks/useAuth'
import { getRoleSlug, getSafeText } from '@/lib/auth'
import { extractApiErrorMessage } from '@/lib/apiError'
import { formatDate, cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

import { 
  Camera,
  CheckCircle2, 
  XCircle,
  Calendar,
  Save,
  Trash2,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/hooks'
import { clearCredentials } from '@/features/auth/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Users, SlidersHorizontal, ClipboardList, ChartNoAxesColumn } from 'lucide-react'

function Switch({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
        checked ? "bg-[#133c1d]" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

export default function ProfilePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMeQuery()
  const { user: authUser } = useAuth()
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const user = data?.data ?? authUser
  const role = getRoleSlug(user?.role)
  const isAdmin = role === 'admin'
  const isModeratorOrAdmin = role === 'moderator' || role === 'admin'

  // Form State
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [defaultRadius, setDefaultRadius] = useState<number>(50)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [initialForm, setInitialForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    defaultRadius: 50,
    emailNotifications: false,
  })

  // Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  function safeFormatDate(value: string | Date | null | undefined) {
    if (!value) return 'Unavailable'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'Unavailable'
    return formatDate(parsed)
  }

  useEffect(() => {
    if (user) {
      const nextRadius = Number(user.preferences?.defaultRadius)
      const nextForm = {
        displayName: getSafeText(user.displayName) || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        defaultRadius: Number.isFinite(nextRadius) && nextRadius > 0 ? nextRadius : 50,
        emailNotifications: user.preferences?.emailNotifications || false,
      }

      setDisplayName(nextForm.displayName)
      setBio(nextForm.bio)
      setAvatarUrl(nextForm.avatarUrl)
      setDefaultRadius(nextForm.defaultRadius)
      setEmailNotifications(nextForm.emailNotifications)
      setInitialForm(nextForm)
    }
  }, [user])

  const hasProfileChanges =
    displayName.trim() !== initialForm.displayName.trim()
    || bio !== initialForm.bio
    || avatarUrl !== initialForm.avatarUrl

  const hasPreferenceChanges =
    Number(defaultRadius) !== Number(initialForm.defaultRadius)
    || emailNotifications !== initialForm.emailNotifications

  const hasAnyUnsavedChanges = hasProfileChanges || hasPreferenceChanges
  const previewName = displayName.trim() || getSafeText(user?.displayName) || 'User'
  const previewEmail = getSafeText(user?.email) || 'No email'

  const handleSaveProfile = async () => {
    const trimmedDisplayName = displayName.trim()
    if (!trimmedDisplayName) {
      toast.error('Display Name is required')
      return
    }

    const trimmedBio = bio.trim()
    const trimmedAvatarUrl = avatarUrl.trim()

    try {
      const res = await updateMe({
        displayName: trimmedDisplayName,
        bio: trimmedBio,
        avatarUrl: trimmedAvatarUrl,
      }).unwrap()
      const updated = res.data
      const nextForm = {
        ...initialForm,
        displayName: getSafeText(updated.displayName) || trimmedDisplayName,
        bio: updated.bio || trimmedBio,
        avatarUrl: updated.avatarUrl || trimmedAvatarUrl,
      }
      setDisplayName(nextForm.displayName)
      setBio(nextForm.bio)
      setAvatarUrl(nextForm.avatarUrl)
      setInitialForm(nextForm)
      setLastSavedAt(new Date().toISOString())
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Failed to update profile'))
    }
  }

  const handleSavePreferences = async () => {
    const normalizedRadius = Number(defaultRadius)
    if (!Number.isFinite(normalizedRadius) || normalizedRadius < 1 || normalizedRadius > 500) {
      toast.error('Default search radius must be between 1 and 500 km')
      return
    }

    try {
      const res = await updateMe({
        preferences: {
          ...user?.preferences,
          defaultRadius: normalizedRadius,
          emailNotifications,
        },
      }).unwrap()
      const updated = res.data
      const nextForm = {
        ...initialForm,
        defaultRadius: updated.preferences?.defaultRadius ?? normalizedRadius,
        emailNotifications: updated.preferences?.emailNotifications ?? emailNotifications,
      }
      setDefaultRadius(nextForm.defaultRadius)
      setEmailNotifications(nextForm.emailNotifications)
      setInitialForm(nextForm)
      setLastSavedAt(new Date().toISOString())
      toast.success('Preferences updated successfully')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Failed to update preferences'))
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteMe().unwrap()
      toast.success('Account deleted successfully')
      dispatch(clearCredentials())
      navigate('/login')
    } catch (err) {
      toast.error('Failed to delete account')
    }
  }

  function getInitials(name: string) {
    if (!name) return 'U'
    return name.substring(0, 2).toUpperCase()
  }

  const profileScore = [
    displayName.trim().length > 1,
    (bio ?? '').trim().length > 0,
    (avatarUrl ?? '').trim().length > 0,
    Boolean(user?.isEmailVerified),
    Number(defaultRadius) > 0,
  ].filter(Boolean).length
  const profileCompletion = Math.round((profileScore / 5) * 100)
  const profileTone =
    profileCompletion >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
      profileCompletion >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
        'text-red-700 bg-red-50 border-red-200'

  return (
    <Layout showSidebar>
      <div className="max-w-5xl mx-auto py-6">
        <PageHeader
          title="My Profile"
          description="Manage your account details and preferences"
          actions={(
            <>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {user ? 'Connected' : 'Not connected'}
              </span>
              {hasAnyUnsavedChanges && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Unsaved changes
                </span>
              )}
            </>
          )}
        />

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 font-medium py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading profile...
          </div>
        )}

        {!isLoading && !user && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#133c1d]">Unable to load profile</h3>
            <p className="mt-2 text-sm text-gray-600">
              {isError
                ? extractApiErrorMessage(error, 'We could not fetch your profile details right now.')
                : 'No authenticated profile was found. Please log in again.'}
            </p>
            <div className="mt-4 flex gap-2">
              {isError && (
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              )}
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          </div>
        )}

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
            {/* Left Column: Summary */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl font-bold mb-4 shadow-sm ring-4 ring-white relative overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                <h2 className="text-xl font-bold text-[#133c1d]">{previewName}</h2>
                <p className="text-sm text-gray-500 mb-5">{previewEmail}</p>
                
                <div className="flex gap-2 mb-6">
                  <Badge variant="outline" className="capitalize border-green-200 text-green-800 bg-green-50">{role}</Badge>
                  {user.isEmailVerified ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="w-3 h-3" /> Unverified
                    </Badge>
                  )}
                </div>

                <div className="w-full border-t border-gray-100 pt-5 flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> Joined</span>
                    <span className="font-medium text-gray-900">{safeFormatDate(user.createdAt)}</span>
                  </div>
                  {lastSavedAt && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Last saved</span>
                      <span className="font-medium text-gray-900">{safeFormatDate(lastSavedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">Account Health</h3>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${profileTone}`}>
                    {profileCompletion}% Complete
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#8cc63f] transition-all" style={{ width: `${profileCompletion}%` }} />
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>Display Name: <span className="font-medium text-gray-900">{displayName ? 'Set' : 'Missing'}</span></p>
                  <p>Bio: <span className="font-medium text-gray-900">{bio ? 'Added' : 'Not added'}</span></p>
                  <p>Avatar: <span className="font-medium text-gray-900">{avatarUrl ? 'Added' : 'Not added'}</span></p>
                  <p>Email Verification: <span className="font-medium text-gray-900">{user.isEmailVerified ? 'Verified' : 'Pending'}</span></p>
                </div>
              </div>
            </div>

            {/* Right Column: Forms */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {isModeratorOrAdmin && (
                <div className="rounded-[24px] border border-[#8cc63f]/30 bg-[#f5faf0] p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1a6b3c]">Control Center</p>
                      <h3 className="mt-1 text-lg font-bold text-[#133c1d]">
                        {isAdmin ? 'Administrator Workspace' : 'Moderator Workspace'}
                      </h3>
                      <p className="mt-1 text-sm text-[#1a6b3c]/80">
                        Quick access to governance, moderation, and system pages.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#8cc63f]/40 bg-white px-3 py-1 text-xs font-semibold text-[#133c1d]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {isAdmin ? 'Admin' : 'Moderator'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Link to="/admin/stations/pending" className="rounded-xl border border-[#8cc63f]/30 bg-white px-4 py-3 text-sm font-medium text-[#133c1d] transition-colors hover:bg-[#eef8e1]">
                      <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6b3c]">
                        <ClipboardList className="h-3.5 w-3.5" /> Moderation
                      </span>
                      Review pending station submissions
                    </Link>

                    {isAdmin && (
                      <Link to="/admin/users" className="rounded-xl border border-[#8cc63f]/30 bg-white px-4 py-3 text-sm font-medium text-[#133c1d] transition-colors hover:bg-[#eef8e1]">
                        <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6b3c]">
                          <Users className="h-3.5 w-3.5" /> Users
                        </span>
                        Manage roles and account access
                      </Link>
                    )}

                    {isAdmin && (
                      <Link to="/admin/permissions" className="rounded-xl border border-[#8cc63f]/30 bg-white px-4 py-3 text-sm font-medium text-[#133c1d] transition-colors hover:bg-[#eef8e1]">
                        <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6b3c]">
                          <SlidersHorizontal className="h-3.5 w-3.5" /> Permissions
                        </span>
                        Configure RBAC and policy controls
                      </Link>
                    )}

                    {isAdmin && (
                      <Link to="/admin/quotas" className="rounded-xl border border-[#8cc63f]/30 bg-white px-4 py-3 text-sm font-medium text-[#133c1d] transition-colors hover:bg-[#eef8e1]">
                        <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6b3c]">
                          <ChartNoAxesColumn className="h-3.5 w-3.5" /> API Quotas
                        </span>
                        Monitor service limits and usage
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="rounded-[24px] border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-[#133c1d]">Personal Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your basic profile details and avatar.</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-gray-700">Display Name</Label>
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      placeholder="e.g. SolarEnthusiast99" 
                    />
                    <p className="text-xs text-gray-500">Live preview: <span className="font-medium text-gray-800">{previewName}</span></p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-gray-700">Avatar URL</Label>
                    <div className="relative">
                      <Input 
                        value={avatarUrl} 
                        onChange={(e) => setAvatarUrl(e.target.value)} 
                        placeholder="https://example.com/avatar.jpg" 
                        className="pl-10"
                      />
                      <Camera className="w-4 h-4 text-gray-400 absolute left-3.5 top-[10px]" />
                    </div>
                    <p className="text-xs text-gray-400">Provide an external image URL to use as your avatar.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-gray-700">Bio</Label>
                    <Textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      placeholder="Tell the community a little about yourself..." 
                      className="h-24"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDisplayName(initialForm.displayName)
                        setBio(initialForm.bio)
                        setAvatarUrl(initialForm.avatarUrl)
                      }}
                      disabled={isSaving || !hasProfileChanges}
                    >
                      Reset
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving || !hasProfileChanges}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Profile
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="rounded-[24px] border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-[#133c1d]">System Preferences</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your application settings and notifications.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base text-gray-900 block mb-1">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive alerts about reviews on your stations and system updates.</p>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onChange={setEmailNotifications} 
                    />
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <Label className="text-base text-gray-900 block mb-1">Default Search Radius (km)</Label>
                    <p className="text-sm text-gray-500 mb-3">The initial radius area to search when you open the map.</p>
                    <div className="flex items-center gap-3 max-w-[200px]">
                      <Input 
                        type="number" 
                        min={1} 
                        max={500} 
                        value={defaultRadius} 
                        onChange={(e) => setDefaultRadius(Number(e.target.value))} 
                        className="text-center"
                      />
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                        km
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDefaultRadius(initialForm.defaultRadius)
                        setEmailNotifications(initialForm.emailNotifications)
                      }}
                      disabled={isSaving || !hasPreferenceChanges}
                    >
                      Reset
                    </Button>
                    <Button onClick={handleSavePreferences} disabled={isSaving || !hasPreferenceChanges}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="rounded-[24px] border border-red-200 bg-red-50 py-6 px-6 lg:mb-10 shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-1">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-700/80">
                    Permanently remove your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="shrink-0 bg-red-600 hover:bg-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle className="text-red-700">Are you absolutely sure?</DialogTitle>
                    <DialogDescription className="pt-2 pb-4 text-gray-600">
                      This action cannot be undone. This will permanently delete your account, remove your profile data, and disconnect you from any stations you've added or reviewed.
                    </DialogDescription>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Yes, Delete My Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
