import { useMemo } from 'react'
import { ArrowRight, KeyRound, MessageSquareWarning, ShieldCheck, SunMedium, Users, Waypoints } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAdminAccess } from '@/hooks/useAdminAccess'

interface AdminSectionCard {
  key: string
  title: string
  description: string
  href: string
  accent: string
  icon: typeof Users
}

function DashboardCard({ section }: { section: AdminSectionCard }) {
  const Icon = section.icon

  return (
    <Link
      to={section.href}
      className={`group rounded-[24px] border border-gray-100 bg-gradient-to-br p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${section.accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white/85 p-3 shadow-sm ring-1 ring-black/5">
          <Icon className="h-5 w-5 text-[#133c1d]" />
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#133c1d]" />
      </div>
      <h2 className="mt-4 text-lg font-black text-[#133c1d]">{section.title}</h2>
      <p className="mt-2 text-sm text-gray-600">{section.description}</p>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const {
    canModerateStations,
    canModerateReviews,
    canManageSolar,
    canReadUserDirectory,
    canReadPermissions,
    isCheckingAdminAccess,
  } = useAdminAccess()

  const sections = useMemo<AdminSectionCard[]>(() => {
    const next: AdminSectionCard[] = []

    if (canReadUserDirectory) {
      next.push({
        key: 'users',
        title: 'Users',
        description: 'Review accounts, adjust roles, and manage per-user permission overrides.',
        href: '/admin/users',
        accent: 'from-slate-50 to-slate-100',
        icon: Users,
      })
    }

    if (canModerateStations) {
      next.push({
        key: 'stations',
        title: 'Station Queue',
        description: 'Approve, reject, and review pending station submissions from one moderation queue.',
        href: '/admin/stations/pending',
        accent: 'from-amber-50 to-orange-100',
        icon: Waypoints,
      })
    }

    if (canModerateReviews) {
      next.push({
        key: 'reviews',
        title: 'Review Queue',
        description: 'Moderate flagged content and keep the public review feed healthy.',
        href: '/admin/reviews',
        accent: 'from-rose-50 to-pink-100',
        icon: MessageSquareWarning,
      })
    }

    if (canManageSolar) {
      next.push({
        key: 'solar',
        title: 'Solar Ops',
        description: 'Access solar analytics, live weather operations, exports, and report moderation.',
        href: '/admin/solar/analytics',
        accent: 'from-emerald-50 to-lime-100',
        icon: SunMedium,
      })
    }

    if (canReadPermissions) {
      next.push({
        key: 'permissions',
        title: 'Permissions',
        description: 'Inspect RBAC configuration, audit trails, quotas, and role-to-permission mappings.',
        href: '/admin/permissions',
        accent: 'from-sky-50 to-cyan-100',
        icon: KeyRound,
      })
    }

    return next
  }, [canManageSolar, canModerateReviews, canModerateStations, canReadPermissions, canReadUserDirectory])

  return (
    <Layout showSidebar>
      <PageHeader
        title="Admin Dashboard"
        description="Use the admin workspace to access moderation, solar operations, user management, and RBAC tools."
      />

      <div className="space-y-5">
        <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Admin Workspace</p>
              <h2 className="mt-2 text-2xl font-black text-[#133c1d]">Available tools</h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                The sidebar remains the primary navigation. Use the cards below for the areas your current permissions allow.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4faea] px-3 py-1.5 text-sm font-semibold text-[#133c1d]">
              <ShieldCheck className="h-4 w-4" />
              {sections.length} section{sections.length === 1 ? '' : 's'} available
            </div>
          </div>
        </div>

        {isCheckingAdminAccess ? (
          <div className="rounded-[24px] border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
            Loading the admin workspace...
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
            No admin sections are available for the current account.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <DashboardCard key={section.key} section={section} />
            ))}
          </div>
        )}

        <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Why this flow</p>
          <p className="mt-2 text-sm text-gray-600">
            Admin tools stay out of the public header. Access now comes through one Admin entry point, then the sidebar and workspace cards decide what each elevated user can actually open based on live backend permissions.
          </p>
        </div>
      </div>
    </Layout>
  )
}
