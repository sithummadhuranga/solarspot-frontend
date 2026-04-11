import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  AuditLogItem,
  AuditLogQuery,
  PermissionCheckResult,
  PermissionItem,
  QuotaStatItem,
  RoleItem,
  RolePermissionItem,
  UserPermissionOverrideItem,
  UserPermissionMatrixItem,
} from '@/types/permission.types'

interface AssignPermissionInput {
  roleId: string
  permissionId: string
  policyIds?: string[]
}

interface RemoveRolePermissionInput {
  roleId: string
  permId: string
}

interface OverrideUserPermissionInput {
  userId: string
  permissionId: string
  effect: 'grant' | 'deny'
  reason?: string
  expiresAt?: string
}

interface RemoveUserOverrideInput {
  userId: string
  permId: string
}

interface CheckPermissionInput {
  action: string
  context?: Record<string, unknown>
}

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPermissions: builder.query<ApiResponse<PermissionItem[]>, void>({
      query: () => '/permissions/admin/permissions',
      providesTags: ['Permission'],
    }),

    listRoles: builder.query<ApiResponse<RoleItem[]>, void>({
      query: () => '/permissions/admin/roles',
      providesTags: ['Role'],
    }),

    getRolePermissions: builder.query<ApiResponse<RolePermissionItem[]>, string>({
      query: (roleId) => `/permissions/admin/roles/${roleId}/permissions`,
      providesTags: (_res, _err, roleId) => [{ type: 'Role', id: roleId }, 'Permission'],
    }),

    assignPermissionToRole: builder.mutation<ApiResponse<RolePermissionItem>, AssignPermissionInput>({
      query: ({ roleId, ...body }) => ({
        url: `/permissions/admin/roles/${roleId}/permissions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { roleId }) => [
        { type: 'Role', id: roleId },
        'Permission',
        'AuditLog',
      ],
    }),

    removePermissionFromRole: builder.mutation<void, RemoveRolePermissionInput>({
      query: ({ roleId, permId }) => ({
        url: `/permissions/admin/roles/${roleId}/permissions/${permId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, { roleId }) => [
        { type: 'Role', id: roleId },
        'Permission',
        'AuditLog',
      ],
    }),

    getUserEffectivePermissions: builder.query<ApiResponse<PermissionItem[]>, string>({
      query: (userId) => `/permissions/admin/users/${userId}/permissions`,
      providesTags: (_res, _err, userId) => [{ type: 'User', id: userId }, 'Permission'],
    }),

    getUserPermissionMatrix: builder.query<ApiResponse<UserPermissionMatrixItem[]>, string>({
      query: (userId) => `/permissions/admin/users/${userId}/permissions/matrix`,
      providesTags: (_res, _err, userId) => [{ type: 'User', id: userId }, 'Permission'],
    }),

    overrideUserPermission: builder.mutation<ApiResponse<UserPermissionOverrideItem>, OverrideUserPermissionInput>({
      query: ({ userId, ...body }) => ({
        url: `/permissions/admin/users/${userId}/permissions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { userId }) => [
        { type: 'User', id: userId },
        'Permission',
        'AuditLog',
      ],
    }),

    removeUserPermissionOverride: builder.mutation<void, RemoveUserOverrideInput>({
      query: ({ userId, permId }) => ({
        url: `/permissions/admin/users/${userId}/permissions/${permId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, { userId }) => [
        { type: 'User', id: userId },
        'Permission',
        'AuditLog',
      ],
    }),

    checkPermission: builder.mutation<ApiResponse<PermissionCheckResult>, CheckPermissionInput>({
      query: (body) => ({
        url: '/permissions/check',
        method: 'POST',
        body,
      }),
    }),

    checkPermissionAccess: builder.query<ApiResponse<PermissionCheckResult>, CheckPermissionInput>({
      query: (body) => ({
        url: '/permissions/check',
        method: 'POST',
        body,
      }),
    }),

    listAuditLogs: builder.query<PaginatedResponse<AuditLogItem>, AuditLogQuery>({
      query: (params) => ({
        url: '/permissions/admin/audit-logs',
        params,
      }),
      providesTags: ['AuditLog'],
    }),

    getQuotaStats: builder.query<ApiResponse<QuotaStatItem[]>, void>({
      query: () => '/permissions/admin/quota',
      providesTags: ['Quota'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListPermissionsQuery,
  useListRolesQuery,
  useGetRolePermissionsQuery,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useGetUserEffectivePermissionsQuery,
  useGetUserPermissionMatrixQuery,
  useOverrideUserPermissionMutation,
  useRemoveUserPermissionOverrideMutation,
  useCheckPermissionMutation,
  useCheckPermissionAccessQuery,
  useListAuditLogsQuery,
  useGetQuotaStatsQuery,
} = permissionsApi
