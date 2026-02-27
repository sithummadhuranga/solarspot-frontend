/**
 * permissionsApi — RTK Query endpoints for Permissions / RBAC module.
 *
 * All endpoints are under /api/permissions/admin/* and require admin role.
 * The /api/permissions/check endpoint is available to all authenticated users.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface RoleObject {
  _id:        string
  name:       string
  displayName: string
  roleLevel:  number
  isActive:   boolean
}

export interface PermissionObject {
  _id:       string
  action:    string
  resource:  string
  component: string
  description?: string
}

export interface UserPermissionOverride {
  _id:        string
  userId:     string
  permission: PermissionObject
  effect:     'grant' | 'deny'
  reason?:    string
  expiresAt?: string
  createdAt:  string
}

export interface AuditLogEntry {
  _id:       string
  actor:     { _id: string; displayName: string; email: string }
  action:    string
  target:    string
  details:   Record<string, unknown>
  createdAt: string
}

export interface QuotaStats {
  service:    string
  date:       string
  count:      number
  limit:      number
  percentage: number
}

export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
}

// ─── API slice ─────────────────────────────────────────────────────────────────
export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Permission list (35 total) ──────────────────────────────────────────────
    /** GET /api/permissions/admin/permissions */
    listAllPermissions: builder.query<ApiResponse<PermissionObject[]>, void>({
      query: () => '/permissions/admin/permissions',
      providesTags: ['Permission'],
    }),

    // ── Role management ────────────────────────────────────────────────────────
    /** GET /api/permissions/admin/roles */
    listAdminRoles: builder.query<ApiResponse<RoleObject[]>, void>({
      query: () => '/permissions/admin/roles',
      providesTags: ['Role'],
    }),

    /** GET /api/permissions/admin/roles/:id/permissions */
    getRolePermissions: builder.query<ApiResponse<PermissionObject[]>, string>({
      query: (roleId) => `/permissions/admin/roles/${roleId}/permissions`,
      providesTags: (_r, _e, id) => [{ type: 'Role', id }],
    }),

    /** POST /api/permissions/admin/roles/:id/permissions */
    assignPermissionToRole: builder.mutation<
      ApiResponse<{ message: string }>,
      { roleId: string; permissionId: string }
    >({
      query: ({ roleId, permissionId }) => ({
        url:    `/permissions/admin/roles/${roleId}/permissions`,
        method: 'POST',
        body:   { permissionId },
      }),
      invalidatesTags: (_r, _e, { roleId }) => [{ type: 'Role', id: roleId }, 'Permission'],
    }),

    /** DELETE /api/permissions/admin/roles/:id/permissions/:permId */
    removePermissionFromRole: builder.mutation<
      ApiResponse<{ message: string }>,
      { roleId: string; permId: string }
    >({
      query: ({ roleId, permId }) => ({
        url:    `/permissions/admin/roles/${roleId}/permissions/${permId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { roleId }) => [{ type: 'Role', id: roleId }, 'Permission'],
    }),

    // ── Per-user permission overrides ──────────────────────────────────────────
    /** GET /api/permissions/admin/users/:id/permissions */
    getUserEffectivePermissions: builder.query<ApiResponse<UserPermissionOverride[]>, string>({
      query: (userId) => `/permissions/admin/users/${userId}/permissions`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    /** POST /api/permissions/admin/users/:id/permissions */
    addUserPermissionOverride: builder.mutation<
      ApiResponse<UserPermissionOverride>,
      { userId: string; permissionId: string; effect: 'grant' | 'deny'; reason?: string; expiresAt?: string }
    >({
      query: ({ userId, ...body }) => ({
        url:    `/permissions/admin/users/${userId}/permissions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: 'User', id: userId }],
    }),

    /** DELETE /api/permissions/admin/users/:id/permissions/:permId */
    removeUserPermissionOverride: builder.mutation<
      ApiResponse<{ message: string }>,
      { userId: string; permId: string }
    >({
      query: ({ userId, permId }) => ({
        url:    `/permissions/admin/users/${userId}/permissions/${permId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: 'User', id: userId }],
    }),

    // ── Audit & quota ──────────────────────────────────────────────────────────
    /** GET /api/permissions/admin/audit-logs */
    listAuditLogs: builder.query<PaginatedResponse<AuditLogEntry>, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/permissions/admin/audit-logs', params }),
      providesTags: ['AuditLog'],
    }),

    /** GET /api/permissions/admin/quota */
    getQuotaStats: builder.query<ApiResponse<QuotaStats[]>, void>({
      query: () => '/permissions/admin/quota',
      providesTags: ['Quota'],
    }),

    // ── Permission check (current user) ───────────────────────────────────────
    /**
     * POST /api/permissions/check
     * Body: { action: string }
     * Returns: { allowed: boolean, reason?: string }
     * Use to dynamically show/hide UI elements based on fine-grained permissions.
     */
    checkPermission: builder.mutation<ApiResponse<PermissionCheckResult>, { action: string }>({
      query: (body) => ({ url: '/permissions/check', method: 'POST', body }),
    }),

  }),
  overrideExisting: false,
})

export const {
  useListAllPermissionsQuery,
  useListAdminRolesQuery,
  useGetRolePermissionsQuery,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useGetUserEffectivePermissionsQuery,
  useAddUserPermissionOverrideMutation,
  useRemoveUserPermissionOverrideMutation,
  useListAuditLogsQuery,
  useGetQuotaStatsQuery,
  useCheckPermissionMutation,
} = permissionsApi
