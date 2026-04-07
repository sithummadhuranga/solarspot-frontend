import { useState } from 'react'
import { X, Loader2, Flag } from 'lucide-react'
import { useFlagReviewMutation } from '@/features/reviews/reviewsApi'
import type { Review } from '@/types/review.types'

interface FlagReviewModalProps {
  review:  Review
  onClose: () => void
}

const FLAG_REASONS = [
  'Inappropriate or hateful language',
  'Spam or advertising',
  'Not about this station',
  'Fake or misleading review',
  'Other',
]

export function FlagReviewModal({ review, onClose }: FlagReviewModalProps) {
  const [reason, setReason]   = useState('')
  const [custom, setCustom]   = useState('')
  const [flagReview, { isLoading }] = useFlagReviewMutation()
  const [error, setError] = useState<string | null>(null)

  const effectiveReason = reason === 'Other' ? custom.trim() : reason

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!reason) { setError('Please select a reason.'); return }
    if (reason === 'Other' && !custom.trim()) { setError('Please describe the issue.'); return }

    try {
      await flagReview({ id: review._id, reason: effectiveReason }).unwrap()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
      setError(msg ?? 'Failed to flag review. You may have already flagged this.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[24px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
              <Flag className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-base font-extrabold text-[#133c1d] font-sg">Flag this review</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs font-medium text-gray-500 mb-5">
          Our moderators will review this report within 24 hours. Thank you for helping keep SolarSpot accurate and respectful.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {FLAG_REASONS.map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                  reason === r
                    ? 'border-[#8cc63f] bg-[#f5faf0]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="flagReason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-[#1a6b3c]"
                />
                <span className="text-sm font-medium text-[#133c1d]">{r}</span>
              </label>
            ))}
          </div>

          {reason === 'Other' && (
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Briefly describe the issue…"
              className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium text-[#133c1d] placeholder-gray-400 outline-none focus:border-[#8cc63f] transition-colors"
            />
          )}

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
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
