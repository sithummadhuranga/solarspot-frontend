import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { ClipboardCheck, Star } from 'lucide-react'

const modCards = [
  {
    to:          '/admin/stations/pending',
    icon:        <ClipboardCheck className="h-6 w-6" />,
    title:       'Station Moderation Queue',
    description: 'Review and approve or reject pending station submissions.',
    color:       'bg-amber-50 text-amber-700',
  },
  {
    to:          '/admin/reviews',
    icon:        <Star className="h-6 w-6" />,
    title:       'Review Moderation',
    description: 'Moderate user-submitted station reviews.',
    color:       'bg-blue-50 text-blue-700',
  },
]

export default function ModeratorDashboardPage() {
  const { user, roleName } = useAuth()

  return (
    <Layout showSidebar>
      <PageHeader
        title="Moderator Dashboard"
        description={`Signed in as ${user?.displayName ?? 'moderator'} · Role: ${user?.role.displayName ?? roleName}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {modCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex rounded-xl p-3 ${card.color}`}>
              {card.icon}
            </div>
            <h2 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-[#8cc63f] transition-colors">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
