import { useState, useEffect } from 'react'
import { Flag, ThumbsUp, Trash2, Edit2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StarRating } from './StarRating'
import { useMarkHelpfulMutation, useDeleteReviewMutation, useFlagReviewMutation } from '@/features/reviews/reviewsApi'
import type { Review, ReviewAuthor } from '@/types/review.types'

interface ReviewCardProps {
  review:     Review
  currentUserId?: string
  isModerator?: boolean
  onFlag?:    (review: Review, onSuccess: () => void) => void
  onModerate?:(review: Review) => void
  onEdit?:    (review: Review) => void
  className?: string
}

const MODERATION_BADGE: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pending Review', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  flagged:  { label: 'Flagged',        className: 'bg-red-50 text-red-700 border-red-200' },
  rejected: { label: 'Rejected',       className: 'bg-gray-50 text-gray-500 border-gray-200' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ReviewCard({
  review,
  currentUserId,
  isModerator = false,
  onFlag,
  onModerate,
  onEdit,
  className,
}: ReviewCardProps) {
  const [markHelpful, { isLoading: isVoting }] = useMarkHelpfulMutation()
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation()
  const [flagReviewMutation, { isLoading: isUnflagging }] = useFlagReviewMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const author = typeof review.author === 'string'
    ? { _id: review.author, displayName: 'Unknown', avatarUrl: null }
    : review.author as ReviewAuthor

  const isOwn = currentUserId === author._id
  const hasVoted = currentUserId ? review.helpfulVotes.includes(currentUserId) : false
  const hasFlaggedFromServer = currentUserId ? (review.flaggedBy ?? []).includes(currentUserId) : false
  const moderationBadge = MODERATION_BADGE[review.moderationStatus]
  const isVisible = review.moderationStatus === 'approved' || isModerator

  const [optimisticHasVoted, setOptimisticHasVoted] = useState(hasVoted)
  const [optimisticCount, setOptimisticCount]       = useState(review.helpfulCount)
  const [optimisticHasFlagged, setOptimisticHasFlagged] = useState(hasFlaggedFromServer)

  useEffect(() => { setOptimisticHasVoted(hasVoted) }, [hasVoted])
  useEffect(() => { setOptimisticCount(review.helpfulCount) }, [review.helpfulCount])
  useEffect(() => { setOptimisticHasFlagged(hasFlaggedFromServer) }, [hasFlaggedFromServer])

  if (!isVisible) return null

  function handleHelpful() {
    if (!currentUserId || isOwn) return
    const wasVoted = optimisticHasVoted
    setOptimisticHasVoted(!wasVoted)
    setOptimisticCount((prev) => wasVoted ? prev - 1 : prev + 1)
    markHelpful(review._id).unwrap().catch(() => {
      setOptimisticHasVoted(wasVoted)
      setOptimisticCount((prev) => wasVoted ? prev + 1 : prev - 1)
    })
  }

  function handleUnflag() {
    setOptimisticHasFlagged(false)
    flagReviewMutation({ id: review._id }).unwrap().catch(() => {
      setOptimisticHasFlagged(true)
    })
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteReview(review._id)
  }

  return (
    <div className={cn(
      'rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]',
      review.moderationStatus === 'rejected' && 'opacity-60',
      className,
    )}>
      {}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5faf0] text-base font-extrabold text-[#1a6b3c]">
            {author.avatarUrl
              ? <img src={author.avatarUrl} alt={author.displayName} className="h-10 w-10 rounded-full object-cover" />
              : author.displayName.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <p className="text-sm font-bold text-[#133c1d]">{author.displayName}</p>
            <p className="text-xs font-medium text-gray-400">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StarRating value={review.rating} readonly size="sm" />
          <span className="text-xs font-bold text-gray-600">{review.rating}/5</span>
        </div>
      </div>

      {}
      {moderationBadge && review.moderationStatus !== 'approved' && (
        <div className={cn(
          'mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold',
          moderationBadge.className,
        )}>
          <AlertTriangle className="h-3 w-3" />
          {moderationBadge.label}
          {review.moderationStatus === 'flagged' && (
            <span className="ml-0.5">· {review.flagCount} flag{review.flagCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {}
      {review.title && (
        <p className="mt-4 text-sm font-bold text-[#133c1d]">{review.title}</p>
      )}
      <p className="mt-2 text-sm font-medium leading-relaxed text-gray-700">{review.content}</p>

      {}
      {isModerator && review.moderationNote && (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs font-bold text-amber-700">Moderation note:</p>
          <p className="text-xs font-medium text-amber-600 mt-0.5">{review.moderationNote}</p>
        </div>
      )}

      {}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          {}
          {currentUserId && !isOwn && review.moderationStatus === 'approved' && (
            <button
              onClick={handleHelpful}
              disabled={isVoting}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors',
                optimisticHasVoted
                  ? 'bg-[#1a6b3c] text-white'
                  : 'bg-[#f5faf0] text-[#1a6b3c] hover:bg-[#dcfce7]',
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Helpful {optimisticCount > 0 && `(${optimisticCount})`}
            </button>
          )}

          {}
          {(!currentUserId || isOwn) && optimisticCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <ThumbsUp className="h-3.5 w-3.5" />
              {optimisticCount} found helpful
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {}
          {isModerator && onModerate && review.moderationStatus !== 'approved' && (
            <button
              onClick={() => onModerate(review)}
              className="rounded-xl border-2 border-[#8cc63f] bg-white px-3 py-1.5 text-xs font-bold text-[#1a6b3c] hover:bg-[#f5faf0] transition-colors"
            >
              Moderate
            </button>
          )}

          {}
          {isOwn && onEdit && review.moderationStatus !== 'rejected' && (
            <button
              onClick={() => onEdit(review)}
              className="flex items-center gap-1 rounded-xl bg-[#f5faf0] px-3 py-1.5 text-xs font-bold text-[#1a6b3c] hover:bg-[#dcfce7] transition-colors"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          )}

          {}
          {currentUserId && !isOwn && (
            optimisticHasFlagged ? (
              <button
                onClick={handleUnflag}
                disabled={isUnflagging}
                title="Remove your flag"
                className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 transition-colors"
              >
                <Flag className="h-3 w-3 fill-red-500" /> Flagged
              </button>
            ) : (
              onFlag && (
                <button
                  onClick={() => onFlag(review, () => setOptimisticHasFlagged(true))}
                  className="flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Flag className="h-3 w-3" /> Flag
                </button>
              )
            )
          )}

          {}
          {(isOwn || isModerator) && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                'flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors',
                confirmDelete
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500',
              )}
              onBlur={() => setConfirmDelete(false)}
            >
              <Trash2 className="h-3 w-3" />
              {confirmDelete ? 'Confirm delete' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
