import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { Users, ShieldCheck, ClipboardList, BarChart3, KeyRound } from 'lucide-react'

const adminCards = [
  {
    to:          '/admin/users',
    icon:        <Users className="h-6 w-6" />,
    title:       'User Management',
    description: 'View, ban, and update roles for all registered users.',
    color:       'bg-blue-50 text-blue-700',
  },
  {
    to:          '/admin/permissions',
    icon:        <ShieldCheck className="h-6 w-6" />,
    title:       'Permissions',
    description: 'Assign or revoke permission actions on a per-role basis.',
    color:       'bg-purple-50 text-purple-700',
  },
  {
    to:          '/admin/roles',
    icon:        <KeyRound className="h-6 w-6" />,
    title:       'Roles',
    description: 'Browse all 10 roles and their current permission assignments.',
    color:       'bg-amber-50 text-amber-700',
  },
  {
    to:          '/admin/audit-logs',
    icon:        <ClipboardList className="h-6 w-6" />,
    title:       'Audit Logs',
    description: 'Track all permission changes with actor, target, and timestamps.',
    color:       'bg-green-50 text-green-700',
  },
  {
    to:          '/admin/quota',
    icon:        <BarChart3 className="h-6 w-6" />,
    title:       'Quota Usage',
    description: 'Monitor API quota consumption across all services.',
    color:       'bg-red-50 text-red-700',
  },
]

export default function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <Layout showSidebar>
      <PageHeader
        title="Admin Dashboard"
        description={`Signed in as ${user?.displayName ?? 'admin'} · ${user?.email}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex rounded-xl p-3 ${card.color}`}>
              {card.icon}
            </div>
            <h2 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-solar-green-700 transition-colors">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
