import { useState } from 'react'
import {
  Flag, Loader2, ChevronLeft, ChevronRight, ShieldCheck,
  Clock, AlertTriangle,
} from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ModerationModal } from '@/components/reviews/ModerationModal'
import {
  useListFlaggedReviewsQuery,
  useListReviewsQuery,
} from '@/features/reviews/reviewsApi'
import { useAuth } from '@/hooks/useAuth'
import type { Review } from '@/types/review.types'

const PAGE_SIZE = 10

type TabKey = 'pending' | 'flagged'

// ─── Reusable paginated review list ──────────────────────────────────────────

interface ReviewSectionProps {
  reviews:        Review[]
  isLoading:      boolean
  isFetching:     boolean
  pagination:     { page: number; totalPages: number; hasPrev: boolean; hasNext: boolean; total: number } | undefined
  currentUserId:  string | undefined
  onModerate:     (review: Review) => void
  onPageChange:   (next: number) => void
  emptyIcon:      React.ReactNode
  emptyTitle:     string
  emptySubtitle:  string
}

function ReviewSection({
  reviews, isLoading, isFetching, pagination, currentUserId,
  onModerate, onPageChange, emptyIcon, emptyTitle, emptySubtitle,
}: ReviewSectionProps) {
  const page = pagination?.page ?? 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a6b3c]" />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[20px] bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5faf0] mb-5">
          {emptyIcon}
        </div>
        <p className="text-base font-bold text-[#133c1d] font-sg">{emptyTitle}</p>
        <p className="text-sm font-medium text-gray-400 mt-1">{emptySubtitle}</p>
      </div>
    )
  }

  return (
    <>
      <div
        className="flex flex-col gap-4"
        style={{ opacity: isFetching ? 0.6 : 1, pointerEvents: isFetching ? 'none' : 'auto' }}
      >
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            currentUserId={currentUserId}
            isModerator
            onModerate={onModerate}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!pagination.hasPrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-gray-200 text-gray-500 hover:border-[#8cc63f] hover:text-[#1a6b3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pagination.totalPages)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, idx) =>
              p === '...'
                ? <span key={`dot-${idx}`} className="text-xs font-bold text-gray-300">…</span>
                : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p as number)}
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                      p === page
                        ? 'bg-[#1a6b3c] text-white shadow-sm'
                        : 'border-2 border-gray-200 text-gray-500 hover:border-[#8cc63f] hover:text-[#1a6b3c]',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                )
            )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!pagination.hasNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-gray-200 text-gray-500 hover:border-[#8cc63f] hover:text-[#1a6b3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const { user } = useAuth()
  const [activeTab,    setActiveTab]    = useState<TabKey>('pending')
  const [pendingPage,  setPendingPage]  = useState(1)
  const [flaggedPage,  setFlaggedPage]  = useState(1)
  const [moderateTarget, setModerateTarget] = useState<Review | null>(null)

  // Pending reviews — those held by toxicity AI scoring (moderationStatus: 'pending')
  const {
    data:      pendingData,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
  } = useListReviewsQuery({
    moderationStatus: 'pending',
    page:             pendingPage,
    limit:            PAGE_SIZE,
    sort:             'newest',
  })

  // Community-flagged reviews — those flagged 3+ times by users
  const {
    data:      flaggedData,
    isLoading: flaggedLoading,
    isFetching: flaggedFetching,
  } = useListFlaggedReviewsQuery({
    page:  flaggedPage,
    limit: PAGE_SIZE,
  })

  const pendingReviews  = pendingData?.data       ?? []
  const pendingPagination = pendingData?.pagination
  const pendingTotal    = pendingPagination?.total ?? 0

  const flaggedReviews  = flaggedData?.data        ?? []
  const flaggedPagination = flaggedData?.pagination
  const flaggedTotal    = flaggedPagination?.total  ?? 0

  const totalQueued = pendingTotal + flaggedTotal

  const tabs: { key: TabKey; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key:   'pending',
      label: 'Pending Approval',
      count: pendingTotal,
      icon:  <Clock className="h-4 w-4" />,
    },
    {
      key:   'flagged',
      label: 'Community Flagged',
      count: flaggedTotal,
      icon:  <Flag className="h-4 w-4" />,
    },
  ]

  return (
    <Layout showSidebar>
      <PageHeader
        title="Review Moderation Queue"
        description="Approve or reject reviews held by AI toxicity screening or community flags"
      />

      {/* ── Total badge ────────────────────────────────────────────── */}
      {totalQueued > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-bold text-[#133c1d]">
            {totalQueued} review{totalQueued !== 1 ? 's' : ''} awaiting moderation
          </p>
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 rounded-[14px] bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-bold transition-all',
              activeTab === tab.key
                ? 'bg-white text-[#133c1d] shadow-sm'
                : 'text-gray-500 hover:text-[#133c1d]',
            ].join(' ')}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={[
                'ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-extrabold',
                activeTab === tab.key
                  ? (tab.key === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600')
                  : 'bg-gray-200 text-gray-500',
              ].join(' ')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Pending tab ────────────────────────────────────────────── */}
      {activeTab === 'pending' && (
        <>
          <div className="mb-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              These reviews were flagged by the AI toxicity screener and need a human decision.
              Approve clean reviews so they appear publicly; reject reviews that violate guidelines.
            </p>
          </div>

          <ReviewSection
            reviews={pendingReviews}
            isLoading={pendingLoading}
            isFetching={pendingFetching}
            pagination={pendingPagination}
            currentUserId={user?._id}
            onModerate={setModerateTarget}
            onPageChange={(next) => { setPendingPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            emptyIcon={<ShieldCheck className="h-8 w-8 text-[#8cc63f]" />}
            emptyTitle="No pending reviews"
            emptySubtitle="All AI-flagged reviews have been resolved."
          />
        </>
      )}

      {/* ── Flagged tab ────────────────────────────────────────────── */}
      {activeTab === 'flagged' && (
        <>
          <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs font-bold text-red-700 flex items-center gap-2">
              <Flag className="h-3.5 w-3.5 shrink-0" />
              These reviews have been reported by {3}+ community members and auto-escalated for review.
            </p>
          </div>

          <ReviewSection
            reviews={flaggedReviews}
            isLoading={flaggedLoading}
            isFetching={flaggedFetching}
            pagination={flaggedPagination}
            currentUserId={user?._id}
            onModerate={setModerateTarget}
            onPageChange={(next) => { setFlaggedPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            emptyIcon={<ShieldCheck className="h-8 w-8 text-[#8cc63f]" />}
            emptyTitle="Queue is clear"
            emptySubtitle="No community-flagged reviews at this time."
          />
        </>
      )}

      {/* ── Moderation modal ───────────────────────────────────────── */}
      {moderateTarget && (
        <ModerationModal
          review={moderateTarget}
          onClose={() => setModerateTarget(null)}
        />
      )}
    </Layout>
  )
}
