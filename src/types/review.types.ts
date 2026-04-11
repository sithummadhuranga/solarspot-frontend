// ─── Sub-types ────────────────────────────────────────────────────────────────

/** Populated author shape from .populate('author', 'displayName avatarUrl') */
export interface ReviewAuthor {
  _id:         string
  displayName: string
  avatarUrl:   string | null
}

/** Populated station shape from .populate('station', 'name') */
export interface ReviewStation {
  _id:  string
  name: string
}

export type ModerationStatus = 'approved' | 'pending' | 'rejected' | 'flagged'

// ─── Full review document ─────────────────────────────────────────────────────
export interface Review {
  _id:             string
  station:         ReviewStation | string
  author:          ReviewAuthor | string
  rating:          number               // 1–5
  title:           string | null
  content:         string
  moderationStatus: ModerationStatus
  toxicityScore?:  number               // 0–1, only present for moderators
  isFlagged:       boolean
  flagCount:       number
  flaggedBy:       string[]
  helpfulVotes:    string[]
  helpfulCount:    number
  moderatedBy:     string | null
  moderatedAt:     string | null
  moderationNote:  string | null
  isActive:        boolean
  createdAt:       string
  updatedAt:       string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateReviewDto {
  station:  string
  rating:   number        // 1–5
  title?:   string        // max 120 chars
  content:  string        // 10–2000 chars
}

export type UpdateReviewDto = Partial<Pick<CreateReviewDto, 'rating' | 'title' | 'content'>>

export interface ModerateReviewDto {
  moderationStatus: 'approved' | 'rejected'
  moderationNote?:  string                  // max 500 chars
}
