// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Pagination {
  page:       number
  limit:      number
  total:      number
  totalPages: number
  hasNext:    boolean
  hasPrev:    boolean
}

// ─── Standard API envelope ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success:   boolean
  message:   string
  data:      T
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination
}

// ─── Error shape returned by the backend ─────────────────────────────────────
export interface ApiError {
  success:    false
  message:    string
  errors:     string[]
  statusCode: number
}

// ─── RTK Query error helpers ──────────────────────────────────────────────────
export interface SerializedApiError {
  status:  number
  data:    ApiError
}
