import { useState } from 'react'
import { X, Loader2, Clock, AlertTriangle } from 'lucide-react'
import { StarRating } from './StarRating'
import { useCreateReviewMutation, useUpdateReviewMutation } from '@/features/reviews/reviewsApi'
import type { Review, CreateReviewDto } from '@/types/review.types'

interface CreateReviewModalProps {
  stationId: string
  editTarget?: Review        // if set, the modal is in "edit" mode
  onClose: () => void
}

type SubmitResult = 'approved' | 'pending' | 'rejected' | null

export function CreateReviewModal({ stationId, editTarget, onClose }: CreateReviewModalProps) {
  const isEditing = Boolean(editTarget)

  const [rating, setRating]         = useState(editTarget?.rating ?? 0)
  const [title, setTitle]           = useState(editTarget?.title ?? '')
  const [content, setContent]       = useState(editTarget?.content ?? '')
  const [error, setError]           = useState<string | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResult>(null)

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation()
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation()
  const isLoading = isCreating || isUpdating

  const contentLength = content.trim().length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (rating === 0) { setError('Please choose a star rating.'); return }
    if (contentLength < 10) { setError('Review must be at least 10 characters.'); return }
    if (contentLength > 2000) { setError('Review cannot exceed 2000 characters.'); return }

    try {
      if (isEditing && editTarget) {
        const updateResult = await updateReview({ id: editTarget._id, rating, title: title.trim() || undefined, content }).unwrap()
        const updateStatus = updateResult?.data?.moderationStatus ?? 'approved'
        if (updateStatus === 'approved') {
          onClose()
        } else {
          setSubmitResult(updateStatus as SubmitResult)
        }
      } else {
        const dto: CreateReviewDto = {
          station: stationId,
          rating,
          content,
          ...(title.trim() && { title: title.trim() }),
        }
        const result = await createReview(dto).unwrap()
        const status = result?.data?.moderationStatus ?? 'approved'
        if (status === 'approved') {
          onClose()
        } else {
          setSubmitResult(status as SubmitResult)
        }
      }
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
      setError(msg ?? 'Failed to submit review. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {}
      <div className="relative w-full max-w-lg rounded-[24px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] p-6">

        {}
        {submitResult === 'rejected' && (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#133c1d] font-sg">Review not published</h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Your review was flagged by our content moderation system and could not be published.
                This happens when a review contains threats, hate speech, or severe harassment.
              </p>
              <p className="mt-3 text-sm font-medium text-gray-600">
                Please edit your review to remove any harmful language and resubmit.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-[#1a6b3c] py-3 text-sm font-bold text-white hover:bg-[#14532e] transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {submitResult === 'pending' && (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-amber-100">
              <Clock className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#133c1d] font-sg">Review under review</h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Your review has been submitted and is currently being reviewed by our moderation team.
                It will appear publicly once approved — this usually takes less than 24 hours.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-[#1a6b3c] py-3 text-sm font-bold text-white hover:bg-[#14532e] transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {}
        {!submitResult && (<>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#133c1d] font-sg">
              {isEditing ? 'Edit your review' : 'Write a review'}
            </h2>
            <p className="text-xs font-medium text-gray-400 mt-0.5">
              Share your experience at this station
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1a6b3c] mb-2">
              Overall rating <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} size="lg" />
              <span className="text-sm font-bold text-gray-600">
                {rating > 0 ? `${rating} / 5` : 'Tap to rate'}
              </span>
            </div>
          </div>

          {}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1a6b3c] mb-2">
              Title <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Summarise your experience…"
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#133c1d] placeholder-gray-400 outline-none focus:border-[#8cc63f] transition-colors"
            />
          </div>

          {}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1a6b3c] mb-2">
              Review <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Tell others about the charging experience, solar reliability, cleanliness…"
              className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#133c1d] placeholder-gray-400 outline-none focus:border-[#8cc63f] transition-colors"
            />
            <p className={`mt-1 text-right text-xs font-medium ${contentLength > 1800 ? 'text-amber-500' : 'text-gray-400'}`}>
              {contentLength} / 2000
            </p>
          </div>

          {}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          {}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1a6b3c] py-3 text-sm font-bold text-white hover:bg-[#14532e] disabled:opacity-60 transition-colors"
            >
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                : isEditing ? 'Save changes' : 'Submit review'
              }
            </button>
          </div>
        </form>
        </>)}
      </div>
    </div>
  )
}
