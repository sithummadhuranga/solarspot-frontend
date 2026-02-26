import type { ReactNode } from 'react'

interface PageHeaderProps {
  title:       string
  description?: string
  /** Optional action buttons / breadcrumbs rendered top-right. */
  actions?:    ReactNode
}

/**
 * PageHeader — consistent page title block used by every page component.
 *
 * Usage:
 *   <PageHeader
 *     title="Charging Stations"
 *     description="Discover solar-powered stations near you"
 *     actions={<Link to="/stations/new">Add Station</Link>}
 *   />
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
