export interface Pagination {
  page:       number
  limit:      number
  total:      number
  totalPages: number
  hasNext:    boolean
  hasPrev:    boolean
}

export interface ApiResponse<T> {
  success:   boolean
  message:   string
  data:      T
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination
}

export interface ApiError {
  success:    false
  message:    string
  errors:     string[]
  statusCode: number
}

export interface SerializedApiError {
  status:  number
  data:    ApiError
}
