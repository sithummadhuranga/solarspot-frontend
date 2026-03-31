import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

interface BackendError {
  message?: string
  errors?: string[]
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error !== null && 'message' in error
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (isFetchBaseQueryError(error)) {
    if (typeof error.status === 'string') {
      return 'Cannot reach API server. Ensure backend is running and VITE_API_BASE_URL is correct.'
    }

    const data = error.data as BackendError | string | undefined

    if (typeof data === 'string' && data.length > 0) return data
    if (data && typeof data === 'object') {
      if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors[0]
      if (data.message) return data.message
    }

    if (typeof error.status === 'number') {
      if (error.status === 401) return 'Invalid credentials or session expired.'
      if (error.status === 403) return 'You do not have permission to perform this action.'
      if (error.status === 404) return 'Requested resource was not found.'
      if (error.status === 409) return 'This resource already exists.'
      if (error.status === 422) return 'Please check your input and try again.'
      if (error.status === 429) return 'Too many requests. Please wait and retry.'
    }
  }

  if (isSerializedError(error) && error.message) {
    return error.message
  }

  return fallback
}
