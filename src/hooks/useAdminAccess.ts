import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useCheckPermissionAccessQuery } from '@/features/permissions/permissionsApi'

export function useAdminAccess() {
  const user = useAppSelector(selectCurrentUser)

  const stationsPending = useCheckPermissionAccessQuery(
    { action: 'stations.read-pending', context: {} },
    { skip: !user }
  )

  const reviewsModerate = useCheckPermissionAccessQuery(
    { action: 'reviews.moderate', context: {} },
    { skip: !user }
  )

  const weatherAdmin = useCheckPermissionAccessQuery(
    { action: 'weather.admin', context: {} },
    { skip: !user }
  )

  const usersReadList = useCheckPermissionAccessQuery(
    { action: 'users.read-list', context: {} },
    { skip: !user }
  )

  const usersManage = useCheckPermissionAccessQuery(
    { action: 'users.manage', context: {} },
    { skip: !user }
  )

  const permissionsRead = useCheckPermissionAccessQuery(
    { action: 'permissions.read', context: {} },
    { skip: !user }
  )

  const permissionsManage = useCheckPermissionAccessQuery(
    { action: 'permissions.manage', context: {} },
    { skip: !user }
  )

  const canModerateStations = stationsPending.data?.data?.allowed ?? false
  const canModerateReviews = reviewsModerate.data?.data?.allowed ?? false
  const canManageSolar = weatherAdmin.data?.data?.allowed ?? false
  const canReadUserDirectory = usersReadList.data?.data?.allowed ?? false
  const canManageUsers = usersManage.data?.data?.allowed ?? false
  const canReadPermissions = permissionsRead.data?.data?.allowed ?? false
  const canManagePermissions = permissionsManage.data?.data?.allowed ?? false

  const isCheckingAdminAccess = Boolean(user) && [
    stationsPending,
    reviewsModerate,
    weatherAdmin,
    usersReadList,
    usersManage,
    permissionsRead,
    permissionsManage,
  ].some((query) => query.isFetching && !query.data)

  const hasAdminEntryAccess =
    canModerateStations ||
    canModerateReviews ||
    canManageSolar ||
    canReadUserDirectory ||
    canReadPermissions

  return {
    hasAdminEntryAccess,
    isCheckingAdminAccess,
    canModerateStations,
    canModerateReviews,
    canManageSolar,
    canReadUserDirectory,
    canManageUsers,
    canReadPermissions,
    canManagePermissions,
  }
}