import type { Pagination } from './api.types'

export interface PermissionItem {
  _id: string
  action: string
  resource: string
  component: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface RoleItem {
  _id: string
  name: string
  displayName: string
  roleLevel: number
  isSystem: boolean
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PolicyItem {
  _id: string
  name?: string
  slug?: string
  condition?: string
  effect?: 'allow' | 'deny'
}

export interface RolePermissionItem {
  _id: string
  role: string | RoleItem
  permission: string | PermissionItem
  policies: PolicyItem[]
  createdAt?: string
  updatedAt?: string
}

export interface UserPermissionOverrideItem {
  _id: string
  user: string
  permission: string
  effect: 'grant' | 'deny'
  reason?: string
  grantedBy: string
  expiresAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AuditLogItem {
  _id: string
  actor: string
  action: string
  resource: string
  resourceId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ip?: string
  createdAt: string
  updatedAt?: string
}

export interface QuotaStatItem {
  service: string
  count: number
  limit: number
  percentage: number
}

export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  matchedPolicies?: string[]
}

export interface AuditLogQuery {
  page?: number
  limit?: number
  actor?: string
  action?: string
  resource?: string
  from?: string
  to?: string
}

export interface PaginatedAuditLogs {
  data: AuditLogItem[]
  pagination: Pagination
}
