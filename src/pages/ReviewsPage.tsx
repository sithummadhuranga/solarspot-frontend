import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useListFlaggedReviewsQuery } from '@/features/reviews/reviewsApi'

/**
 * ReviewsPage — moderator-only flagged reviews queue.
 *
 * TODO (Member 2):
 *  - Render flagged reviews list with moderation actions (approve / remove)
 *  - Add toxicity score display
 *  - Wire useModerateReviewMutation to approve/remove buttons
 *  - Add pagination
 */
export default function ReviewsPage() {
  const { data, isLoading } = useListFlaggedReviewsQuery({})

  return (
    <Layout showSidebar>
      <PageHeader
        title="Flagged Reviews"
        description="Reviews pending moderation review"
      />

      {isLoading && <p className="text-sm font-medium text-gray-500">Loading…</p>}

      {/* TODO (Member 2): replace with <FlaggedReviewCard review={r} /> list */}
      <div className="flex flex-col gap-4">
        {data?.data.map((review) => (
          <div key={review._id} className="rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-bold text-[#133c1d]">{review.title}</p>
            <p className="mt-1 text-sm font-medium text-gray-600 line-clamp-2">{review.body}</p>
            <div className="mt-4 flex gap-2">
              {/* TODO (Member 2): wire these to useModerateReviewMutation */}
              <button className="rounded-xl bg-[#8cc63f] px-4 py-2 text-xs font-bold text-[#133c1d] hover:bg-[#7ab32e] transition-colors">Approve</button>
              <button className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
