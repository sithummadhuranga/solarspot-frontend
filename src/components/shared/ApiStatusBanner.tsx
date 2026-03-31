import { useApiHealth } from '@/hooks/useApiHealth'

export function ApiStatusBanner() {
  const apiHealth = useApiHealth()

  if (apiHealth !== 'offline') return null

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900 md:px-6 lg:px-8">
      API server is unreachable. Start backend on http://localhost:5000 or update VITE_API_BASE_URL in .env.local.
    </div>
  )
}
