import { useState } from 'react'
import { X, Loader2, CheckCircle, XCircle, MapPin, Clock, Flag } from 'lucide-react'
import { useModerateReviewMutation } from '@/features/reviews/reviewsApi'
import { StarRating } from './StarRating'
import type { Review, ReviewAuthor, ReviewStation } from '@/types/review.types'

interface ModerationModalProps {
  review:  Review
  onClose: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ModerationModal({ review, onClose }: ModerationModalProps) {
  const [action, setAction]   = useState<'approved' | 'rejected' | null>(null)
  const [note, setNote]       = useState('')
  const [error, setError]     = useState<string | null>(null)

  const [moderateReview, { isLoading }] = useModerateReviewMutation()

  const author = typeof review.author === 'string'
    ? { _id: review.author, displayName: 'Unknown', avatarUrl: null }
    : review.author as ReviewAuthor

  const stationName = typeof review.station === 'string'
    ? null
    : (review.station as ReviewStation).name

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!action) { setError('Please choose an action.'); return }

    try {
      await moderateReview({
        id: review._id,
        moderationStatus: action,
        ...(note.trim() && { moderationNote: note.trim() }),
      }).unwrap()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
      setError(msg ?? 'Moderation action failed. Please try again.')
    }
  }

  const statusBadge = {
    pending:  'border-amber-200 bg-amber-50 text-amber-700',
    flagged:  'border-red-200 bg-red-50 text-red-700',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-gray-200 bg-gray-50 text-gray-500',
  }[review.moderationStatus] ?? 'border-gray-200 bg-gray-50 text-gray-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] p-6">
        {}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-[#133c1d] font-sg">Moderate review</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {}
        <div className="mb-5 rounded-[16px] bg-[#f5faf0] p-4">
          {}
          {stationName && (
            <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-[#c9e6a0]/60">
              <MapPin className="h-3.5 w-3.5 text-[#1a6b3c] shrink-0" />
              <p className="text-xs font-bold text-[#1a6b3c] truncate">{stationName}</p>
            </div>
          )}

          {}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#1a6b3c]">
              {author.avatarUrl
                ? <img src={author.avatarUrl} alt={author.displayName} className="h-8 w-8 rounded-full object-cover" />
                : author.displayName.charAt(0).toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#133c1d]">{author.displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-gray-400" />
                <p className="text-xs font-medium text-gray-400">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <StarRating value={review.rating} readonly size="sm" />
          </div>

          {}
          {review.title && (
            <p className="text-sm font-bold text-[#133c1d] mb-2">{review.title}</p>
          )}

          {}
          <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>

          {}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge}`}>
              {review.moderationStatus}
            </span>
            {review.flagCount > 0 && (
              <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 flex items-center gap-1">
                <Flag className="h-3 w-3" />
                {review.flagCount} flag{review.flagCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-500">
              Rating: {review.rating}/5
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {}
          {review.moderationStatus === 'flagged' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-bold text-amber-700">
                This review was escalated by community flags.{' '}
                <span className="font-normal">
                  Approving will clear all flags and restore public visibility.
                  Rejecting will permanently remove the review.
                </span>
              </p>
            </div>
          )}

          {}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c] mb-3">Action</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('approved')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-colors ${
                  action === 'approved'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {review.moderationStatus === 'flagged' ? 'Clear Flag & Approve' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => setAction('rejected')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-colors ${
                  action === 'rejected'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                <XCircle className="h-4 w-4" /> Reject Review
              </button>
            </div>
          </div>

          {}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1a6b3c] mb-2">
              Note <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Optional note visible to the review author…"
              className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium text-[#133c1d] placeholder-gray-400 outline-none focus:border-[#8cc63f] transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600 hover:border-gray-300 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !action}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1a6b3c] py-3 text-sm font-bold text-white hover:bg-[#14532e] disabled:opacity-60 transition-colors"
            >
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : 'Confirm action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
