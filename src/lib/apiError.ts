import axios from 'axios'

interface BackendErrorPayload {
  message?: unknown
  statusCode?: unknown
  errors?: unknown
}

function toText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as BackendErrorPayload | undefined

    const payloadMessage = toText(payload?.message)
    if (payloadMessage) return payloadMessage

    if (Array.isArray(payload?.errors)) {
      const first = payload.errors.map(toText).find(Boolean)
      if (first) return first
    }

    const responseStatus = error.response?.status
    if (typeof responseStatus === 'number') {
      return `${fallback} (HTTP ${responseStatus})`
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
