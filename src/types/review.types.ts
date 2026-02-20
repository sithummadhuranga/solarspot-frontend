// ─── Sub-types ────────────────────────────────────────────────────────────────
export type ModerationStatus = 'approved' | 'pending' | 'flagged' | 'removed'

export interface ReviewRatings {
  overall:          number
  solarReliability: number
  chargingSpeed:    number
  cleanliness:      number | null
  accessibility:    number | null
}

// ─── Full review document ─────────────────────────────────────────────────────
export interface Review {
  _id:              string
  station:          string
  user:             string
  ratings:          ReviewRatings
  title:            string
  body:             string
  visitDate:        string | null
  helpfulVotes:     number
  moderationStatus: ModerationStatus
  flaggedBy:        string[]
  moderatedBy:      string | null
  moderatedAt:      string | null
  createdAt:        string
  updatedAt:        string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateReviewDto {
  title:     string
  body:      string
  visitDate?: string
  ratings:   Omit<ReviewRatings, 'cleanliness' | 'accessibility'> &
    Partial<Pick<ReviewRatings, 'cleanliness' | 'accessibility'>>
}

export type UpdateReviewDto = Partial<CreateReviewDto>

export interface ModerateReviewDto {
  action: 'approve' | 'remove'
  note?:  string
}
