import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { User } from '@/types/user.types'

// ─── State shape ───────────────────────────────────────────────────────────────
interface AuthState {
  /** Authenticated user profile — null when logged out */
  user: User | null
  /** JWT access token — null when logged out. Stored in memory only, never persisted. */
  token: string | null
  /** True while a silent refresh is in-flight */
  isRefreshing: boolean
  /**
   * True once the app has attempted the initial silent refresh on boot.
   * Guards prevent redirecting to /login before the refresh attempt completes.
   */
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isRefreshing: false,
  isInitialized: false,
}

// ─── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Store full credentials after a successful login or after boot refresh + /users/me.
     */
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user  = action.payload.user
      state.token = action.payload.token
      state.isInitialized = true
    },

    /**
     * Update only the access token (e.g. after a silent /auth/refresh).
     * The user object stays intact.
     */
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },

    /**
     * Wipe credentials on logout or after a refresh failure.
     */
    clearCredentials(state) {
      state.user  = null
      state.token = null
    },

    setRefreshing(state, action: PayloadAction<boolean>) {
      state.isRefreshing = action.payload
    },

    /**
     * Mark the app as fully initialized (called after the boot refresh attempt,
     * regardless of whether refresh succeeded or failed).
     */
    setInitialized(state) {
      state.isInitialized = true
    },
  },
})

// ─── Actions ───────────────────────────────────────────────────────────────────
export const {
  setCredentials,
  setToken,
  clearCredentials,
  setRefreshing,
  setInitialized,
} = authSlice.actions

// ─── Reducer ───────────────────────────────────────────────────────────────────
export const authReducer = authSlice.reducer

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentUser     = (state: RootState) => state.auth.user
export const selectToken           = (state: RootState) => state.auth.token
export const selectIsAuthenticated = (state: RootState) => state.auth.token !== null
export const selectIsRefreshing    = (state: RootState) => state.auth.isRefreshing
export const selectIsInitialized   = (state: RootState) => state.auth.isInitialized

/** Returns the role name slug, e.g. 'admin', 'moderator', 'user'. Falls back to 'guest'. */
export const selectUserRoleName  = (state: RootState) => state.auth.user?.role.name    ?? 'guest'
/** Returns the numeric role level (0–4). Falls back to 0 (guest). */
export const selectUserRoleLevel = (state: RootState) => state.auth.user?.role.roleLevel ?? 0
