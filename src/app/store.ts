import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth/authSlice'

// ─── Store ─────────────────────────────────────────────────────────────────────
/**
 * Redux store — initial project setup.
 *
 * Each feature team adds their RTK Query API slice here:
 *
 *   import { stationsApi } from '@/features/stations/stationsApi'
 *   reducer:    { [stationsApi.reducerPath]: stationsApi.reducer, ... }
 *   middleware: getDefaultMiddleware().concat(stationsApi.middleware, ...)
 */
export const store = configureStore({
  reducer: {
    // ── Auth state (synchronous slice) ───────────────────────────
    auth: authReducer,

    // ── RTK Query API slices (add when implementing each module) ──
    // [stationsApi.reducerPath]: stationsApi.reducer,
    // [reviewsApi.reducerPath]:  reviewsApi.reducer,
    // [weatherApi.reducerPath]:  weatherApi.reducer,
    // [usersApi.reducerPath]:    usersApi.reducer,
    // [authApi.reducerPath]:     authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
    // .concat(stationsApi.middleware)
    // .concat(reviewsApi.middleware)
    // .concat(weatherApi.middleware)
    // .concat(usersApi.middleware)
    // .concat(authApi.middleware)
  ,
  devTools: import.meta.env.DEV,
})

// ─── Types ─────────────────────────────────────────────────────────────────────
export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
