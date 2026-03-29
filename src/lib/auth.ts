export function getRoleSlug(role: unknown): string {
  if (typeof role === 'string') return role

  if (role && typeof role === 'object') {
    const candidate = role as { slug?: unknown; name?: unknown; displayName?: unknown }
    if (typeof candidate.slug === 'string' && candidate.slug.length > 0) return candidate.slug
    if (typeof candidate.name === 'string' && candidate.name.length > 0) return candidate.name
    if (typeof candidate.displayName === 'string' && candidate.displayName.length > 0) {
      return candidate.displayName.toLowerCase().replace(/\s+/g, '-')
    }
  }

  return 'guest'
}

export function getSafeText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.displayName === 'string') return obj.displayName
    if (typeof obj.name === 'string') return obj.name
    if (typeof obj.action === 'string') return obj.action
    if (typeof obj.resource === 'string') return obj.resource
    if (typeof obj._id === 'string') return obj._id
  }

  return 'N/A'
}