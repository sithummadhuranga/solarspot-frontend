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

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {/* TODO (Member 2): replace with <FlaggedReviewCard review={r} /> list */}
      <div className="flex flex-col gap-3">
        {data?.data.map((review) => (
          <div key={review._id} className="rounded-lg border p-4">
            <p className="font-medium">{review.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{review.body}</p>
            <div className="mt-2 flex gap-2">
              {/* TODO (Member 2): wire these to useModerateReviewMutation */}
              <button className="rounded bg-green-600 px-3 py-1 text-xs text-white">Approve</button>
              <button className="rounded bg-destructive px-3 py-1 text-xs text-white">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
