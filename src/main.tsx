import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import App from './App'
import './index.css'

import '@/features/auth/authApi'
import '@/features/reviews/reviewsApi'
import '@/features/weather/weatherApi'
import '@/features/weather/solarApi'
import '@/features/users/usersApi'
import '@/features/permissions/permissionsApi'

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()

    const hasReloaded = sessionStorage.getItem('vite-preload-reloaded') === '1'
    if (!hasReloaded) {
      sessionStorage.setItem('vite-preload-reloaded', '1')
      window.location.reload()
    }
  })

  window.addEventListener('pageshow', () => {
    sessionStorage.removeItem('vite-preload-reloaded')
  })
}

const queryClient = new QueryClient()

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found in document')

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster richColors position="top-right" closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)

