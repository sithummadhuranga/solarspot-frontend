/**
 * permissionsApi — RTK Query endpoints for Permissions module (Member 4).
 *
 * Covers all 17 permission + 2 system endpoints from PROJECT_OVERVIEW.md.
 * TODO (Member 4): replace placeholder types with real shapes.
 */
import { baseApi } from '@/app/baseApi'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'

// ─── Stub types (Member 4 will define these properly) ─────────────────────────
interface Role         { _id: string; name: string; slug: string; roleLevel: number; isActive: boolean }
interface Permission   { _id: string; action: string; resource: string; component: string }
interface Policy       { _id: string; name: string; slug: string; condition: string; effect: 'allow' | 'deny' }
interface Override     { _id: string; user: string; permission: string; effect: 'grant' | 'deny'; expiresAt?: string }
interface AuditLog     { _id: string; actor: string; action: string; resource: string; createdAt: string }
interface QuotaStats   { service: string; date: string; count: number; limit: number }

// ─── API slice ─────────────────────────────────────────────────────────────────
export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Roles ──────────────────────────────────────────────────────────────────
    /** GET /api/permissions/roles */
    listRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => '/permissions/roles', providesTags: ['Role'],
    }),
    /** POST /api/permissions/roles */
    createRole: builder.mutation<ApiResponse<Role>, Partial<Role>>({
      query: (body) => ({ url: '/permissions/roles', method: 'POST', body }), invalidatesTags: ['Role'],
    }),
    /** PUT /api/permissions/roles/:id */
    updateRole: builder.mutation<ApiResponse<Role>, { id: string } & Partial<Role>>({
      query: ({ id, ...body }) => ({ url: `/permissions/roles/${id}`, method: 'PUT', body }), invalidatesTags: ['Role'],
    }),
    /** DELETE /api/permissions/roles/:id */
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/permissions/roles/${id}`, method: 'DELETE' }), invalidatesTags: ['Role'],
    }),

    // ── Permissions ────────────────────────────────────────────────────────────
    /** GET /api/permissions/list */
    listPermissions: builder.query<ApiResponse<Permission[]>, void>({
      query: () => '/permissions/list', providesTags: ['Permission'],
    }),
    /** POST /api/permissions/roles/:roleId/assign */
    assignPermission: builder.mutation<ApiResponse<null>, { roleId: string; permissionId: string }>({
      query: ({ roleId, ...body }) => ({ url: `/permissions/roles/${roleId}/assign`, method: 'POST', body }), invalidatesTags: ['Role', 'Permission'],
    }),
    /** DELETE /api/permissions/roles/:roleId/revoke/:permId */
    revokePermission: builder.mutation<ApiResponse<null>, { roleId: string; permId: string }>({
      query: ({ roleId, permId }) => ({ url: `/permissions/roles/${roleId}/revoke/${permId}`, method: 'DELETE' }), invalidatesTags: ['Role', 'Permission'],
    }),

    // ── Policies ───────────────────────────────────────────────────────────────
    /** GET /api/permissions/policies */
    listPolicies: builder.query<ApiResponse<Policy[]>, void>({
      query: () => '/permissions/policies', providesTags: ['Policy'],
    }),
    /** POST /api/permissions/policies */
    createPolicy: builder.mutation<ApiResponse<Policy>, Partial<Policy>>({
      query: (body) => ({ url: '/permissions/policies', method: 'POST', body }), invalidatesTags: ['Policy'],
    }),
    /** PUT /api/permissions/policies/:id */
    updatePolicy: builder.mutation<ApiResponse<Policy>, { id: string } & Partial<Policy>>({
      query: ({ id, ...body }) => ({ url: `/permissions/policies/${id}`, method: 'PUT', body }), invalidatesTags: ['Policy'],
    }),
    /** POST /api/permissions/roles/:roleId/policies/:permId/attach */
    attachPolicy: builder.mutation<ApiResponse<null>, { roleId: string; permId: string; policyId: string }>({
      query: ({ roleId, permId, ...body }) => ({ url: `/permissions/roles/${roleId}/policies/${permId}/attach`, method: 'POST', body }), invalidatesTags: ['Role', 'Policy'],
    }),
    /** DELETE /api/permissions/roles/:roleId/policies/:permId/detach/:policyId */
    detachPolicy: builder.mutation<ApiResponse<null>, { roleId: string; permId: string; policyId: string }>({
      query: ({ roleId, permId, policyId }) => ({ url: `/permissions/roles/${roleId}/policies/${permId}/detach/${policyId}`, method: 'DELETE' }), invalidatesTags: ['Role', 'Policy'],
    }),

    // ── Per-user overrides ─────────────────────────────────────────────────────
    /** GET /api/permissions/users/:userId/overrides */
    listOverrides: builder.query<ApiResponse<Override[]>, string>({
      query: (userId) => `/permissions/users/${userId}/overrides`, providesTags: ['Permission'],
    }),
    /** POST /api/permissions/users/:userId/overrides */
    createOverride: builder.mutation<ApiResponse<Override>, { userId: string } & Partial<Override>>({
      query: ({ userId, ...body }) => ({ url: `/permissions/users/${userId}/overrides`, method: 'POST', body }), invalidatesTags: ['Permission'],
    }),
    /** DELETE /api/permissions/users/:userId/overrides/:overrideId */
    deleteOverride: builder.mutation<ApiResponse<null>, { userId: string; overrideId: string }>({
      query: ({ userId, overrideId }) => ({ url: `/permissions/users/${userId}/overrides/${overrideId}`, method: 'DELETE' }), invalidatesTags: ['Permission'],
    }),

    // ── Audit & system ─────────────────────────────────────────────────────────
    /** GET /api/permissions/audit */
    listAuditLogs: builder.query<PaginatedResponse<AuditLog>, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/permissions/audit', params }), providesTags: ['AuditLog'],
    }),
    /** POST /api/permissions/reload */
    reloadPermissions: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/permissions/reload', method: 'POST' }), invalidatesTags: ['Role', 'Permission', 'Policy'],
    }),

    // ── Admin system ───────────────────────────────────────────────────────────
    /** GET /api/admin/quotas */
    getQuotaStats: builder.query<ApiResponse<QuotaStats[]>, void>({
      query: () => '/admin/quotas', providesTags: ['Quota'],
    }),

  }),
  overrideExisting: false,
})

export const {
  useListRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useListPermissionsQuery,
  useAssignPermissionMutation,
  useRevokePermissionMutation,
  useListPoliciesQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useAttachPolicyMutation,
  useDetachPolicyMutation,
  useListOverridesQuery,
  useCreateOverrideMutation,
  useDeleteOverrideMutation,
  useListAuditLogsQuery,
  useReloadPermissionsMutation,
  useGetQuotaStatsQuery,
} = permissionsApi
