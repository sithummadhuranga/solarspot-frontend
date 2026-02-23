import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import App from './App'
import './index.css'

// ── Register RTK Query endpoint injections before any component mounts ─────────
// Each import is a side-effect that calls baseApi.injectEndpoints().
import '@/features/auth/authApi'
import '@/features/stations/stationsApi'
import '@/features/reviews/reviewsApi'
import '@/features/weather/weatherApi'
import '@/features/users/usersApi'
import '@/features/permissions/permissionsApi'
// ──────────────────────────────────────────────────────────────────────────────

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found in document')

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster richColors position="top-right" closeButton />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
