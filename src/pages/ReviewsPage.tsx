import { useState } from 'react'
import { Flag, Loader2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ModerationModal } from '@/components/reviews/ModerationModal'
import { useListFlaggedReviewsQuery } from '@/features/reviews/reviewsApi'
import { useAuth } from '@/hooks/useAuth'
import type { Review } from '@/types/review.types'

const PAGE_SIZE = 10

export default function ReviewsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [moderateTarget, setModerateTarget] = useState<Review | null>(null)

  const { data, isLoading, isFetching } = useListFlaggedReviewsQuery({
    page,
    limit: PAGE_SIZE,
  })

  const reviews    = data?.data ?? []
  const pagination = data?.pagination

  function handlePage(next: number) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout showSidebar>
      <PageHeader
        title="Flagged Reviews"
        description="Reviews that have been reported by users and are awaiting moderation"
      />

      {/* ── Loading ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a6b3c]" />
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!isLoading && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[20px] bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5faf0] mb-5">
            <ShieldCheck className="h-8 w-8 text-[#8cc63f]" />
          </div>
          <p className="text-base font-bold text-[#133c1d] font-sg">Queue is clear</p>
          <p className="text-sm font-medium text-gray-400 mt-1">No flagged reviews at this time.</p>
        </div>
      )}

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      {!isLoading && reviews.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-400" />
            <p className="text-sm font-bold text-[#133c1d]">
              {pagination?.total ?? reviews.length} flagged review{(pagination?.total ?? reviews.length) !== 1 ? 's' : ''}
            </p>
          </div>
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-[#1a6b3c]" />}
        </div>
      )}

      {/* ── Review list ────────────────────────────────────────────── */}
      {!isLoading && reviews.length > 0 && (
        <div
          className="flex flex-col gap-4"
          style={{ opacity: isFetching ? 0.6 : 1, pointerEvents: isFetching ? 'none' : 'auto' }}
        >
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?._id}
              isModerator
              onModerate={setModerateTarget}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePage(page - 1)}
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
            .map((p, i) =>
              p === '...'
                ? <span key={`dot-${i}`} className="text-xs font-bold text-gray-300">…</span>
                : (
                  <button
                    key={p}
                    onClick={() => handlePage(p as number)}
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
            onClick={() => handlePage(page + 1)}
            disabled={!pagination.hasNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-gray-200 text-gray-500 hover:border-[#8cc63f] hover:text-[#1a6b3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
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
