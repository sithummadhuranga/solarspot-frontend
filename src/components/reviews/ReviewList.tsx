import { useState } from 'react'
import { MessageSquare, ChevronLeft, ChevronRight, Star, Loader2, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StarRating } from './StarRating'
import { ReviewCard } from './ReviewCard'
import { CreateReviewModal } from './CreateReviewModal'
import { FlagReviewModal } from './FlagReviewModal'
import { ModerationModal } from './ModerationModal'
import { useListReviewsQuery } from '@/features/reviews/reviewsApi'
import { useAuth } from '@/hooks/useAuth'
import type { Review } from '@/types/review.types'

interface ReviewListProps {
  stationId: string
  averageRating?: number
  reviewCount?:   number
}

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest',  label: 'Lowest rated' },
  { value: 'helpful', label: 'Most helpful' },
] as const

const REVIEWS_PER_PAGE = 5

export function ReviewList({ stationId, averageRating = 0, reviewCount = 0 }: ReviewListProps) {
  const { user, role } = useAuth()
  const isModerator = role === 'moderator' || role === 'admin'

  const [page, setPage]           = useState(1)
  const [sort, setSort]           = useState<string>('newest')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Review | null>(null)
  const [flagTarget, setFlagTarget] = useState<Review | null>(null)
  const [moderateTarget, setModerateTarget] = useState<Review | null>(null)

  const { data, isLoading, isFetching } = useListReviewsQuery({
    stationId,
    sort: sort as 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful',
    page,
    limit: REVIEWS_PER_PAGE,
  })

  const reviews   = data?.data ?? []
  const pagination = data?.pagination

  function handlePageChange(next: number) {
    setPage(next)
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Rating breakdown (from fetched reviews) ───────────────────────────────
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => typeof r.rating === 'number' && Math.round(r.rating) === star).length,
  }))

  return (
    <div id="reviews-section" className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      {/* ── Section header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#1a6b3c]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
            Reviews & Ratings
          </h2>
          {reviewCount > 0 && (
            <span className="rounded-full bg-[#f5faf0] px-2.5 py-0.5 text-xs font-bold text-[#1a6b3c] border border-[#8cc63f]/30">
              {reviewCount}
            </span>
          )}
        </div>

        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#1a6b3c] px-4 py-2 text-xs font-bold text-white hover:bg-[#14532e] transition-colors shadow-sm"
          >
            <PenLine className="h-3.5 w-3.5" /> Write a review
          </button>
        )}
      </div>

      {/* ── Summary ──────────────────────────────────────────────────── */}
      {averageRating > 0 && reviewCount > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-[16px] bg-[#f5faf0] p-5">
          <div className="flex flex-col items-center shrink-0">
            <span className="text-5xl font-extrabold text-[#133c1d] font-sg">
              {averageRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(averageRating)} readonly size="md" />
            <span className="mt-1 text-xs font-medium text-gray-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex-1 w-full space-y-1.5">
            {ratingCounts.map(({ star, count }) => {
              const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-4 text-right text-xs font-bold text-gray-500">{star}</span>
                  <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-7 text-xs font-medium text-gray-400">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Sort control ─────────────────────────────────────────────── */}
      {reviewCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">
            {isLoading || isFetching ? 'Loading…' : `${pagination?.total ?? 0} reviews`}
          </p>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="rounded-xl border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#133c1d] outline-none focus:border-[#8cc63f] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Review list ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-[#1a6b3c]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5faf0] mb-4">
            <MessageSquare className="h-6 w-6 text-[#8cc63f]" />
          </div>
          <p className="text-sm font-bold text-[#133c1d]">No reviews yet</p>
          <p className="text-xs font-medium text-gray-400 mt-1">Be the first to share your experience</p>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#1a6b3c] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#14532e] transition-colors"
            >
              <PenLine className="h-3.5 w-3.5" /> Write a review
            </button>
          )}
        </div>
      ) : (
        <div className={cn('space-y-4', isFetching && 'opacity-60 pointer-events-none')}>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?._id}
              isModerator={isModerator}
              onFlag={user ? setFlagTarget : undefined}
              onEdit={setEditTarget}
              onModerate={isModerator ? setModerateTarget : undefined}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
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
                    onClick={() => handlePageChange(p as number)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                      p === page
                        ? 'bg-[#1a6b3c] text-white shadow-sm'
                        : 'border-2 border-gray-200 text-gray-500 hover:border-[#8cc63f] hover:text-[#1a6b3c]',
                    )}
                  >
                    {p}
                  </button>
                )
            )}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!pagination.hasNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-gray-200 text-gray-500 hover:border-[#8cc63f] hover:text-[#1a6b3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {(showCreate || editTarget) && (
        <CreateReviewModal
          stationId={stationId}
          editTarget={editTarget ?? undefined}
          onClose={() => { setShowCreate(false); setEditTarget(null) }}
        />
      )}
      {flagTarget && (
        <FlagReviewModal
          review={flagTarget}
          onClose={() => setFlagTarget(null)}
        />
      )}
      {moderateTarget && (
        <ModerationModal
          review={moderateTarget}
          onClose={() => setModerateTarget(null)}
        />
      )}
    </div>
  )
}
