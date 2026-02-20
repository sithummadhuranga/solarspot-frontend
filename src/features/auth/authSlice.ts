import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { User } from '@/types/user.types'

// ─── State shape ───────────────────────────────────────────────────────────────
interface AuthState {
  /** Authenticated user profile — null when logged out */
  user: User | null
  /** JWT access token — null when logged out */
  token: string | null
  /** True while a silent refresh is in-flight */
  isRefreshing: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isRefreshing: false,
}

// ─── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Persist credentials after a successful login / token refresh.
     * Called by authApi onQueryStarted or after decoding the refresh response.
     */
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user
      state.token = action.payload.token
    },

    /**
     * Wipe credentials on logout or 401 after refresh failure.
     */
    clearCredentials(state) {
      state.user = null
      state.token = null
    },

    setRefreshing(state, action: PayloadAction<boolean>) {
      state.isRefreshing = action.payload
    },
  },
})

// ─── Actions ───────────────────────────────────────────────────────────────────
export const { setCredentials, clearCredentials, setRefreshing } = authSlice.actions

// ─── Reducer ───────────────────────────────────────────────────────────────────
export const authReducer = authSlice.reducer

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentUser      = (state: RootState) => state.auth.user
export const selectToken            = (state: RootState) => state.auth.token
export const selectIsAuthenticated  = (state: RootState) => state.auth.token !== null
export const selectUserRole         = (state: RootState) => state.auth.user?.role ?? 'guest'
export const selectIsRefreshing     = (state: RootState) => state.auth.isRefreshing
