import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth/authSlice'
import { baseApi }     from './baseApi'

/**
 * Redux store.
 *
 * All RTK Query endpoints are injected into the single `baseApi` instance,
 * so only ONE reducer path and ONE middleware entry are needed regardless of
 * how many feature modules exist.
 *
 * Each feature module calls baseApi.injectEndpoints() in its own *Api.ts file.
 * Those files are imported (side-effect) in main.tsx so endpoints are registered
 * before any component mounts.
 */
export const store = configureStore({
  reducer: {
    // ── Synchronous state slices ──────────────────────────────────
    auth: authReducer,

    // ── Single RTK Query cache (all features share one instance) ──
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
})

// ─── Types ─────────────────────────────────────────────────────────────────────
export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
