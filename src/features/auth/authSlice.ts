import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { normalizeUser } from '@/lib/user-normalize'
import type { User } from '@/types/user.types'

import { getRoleSlug } from '@/lib/auth'

interface AuthState {
  
  user: User | null
  
  token: string | null
  
  isRefreshing: boolean
  
  isInitializing: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isRefreshing: false,
  isInitializing: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = normalizeUser(action.payload.user)
      state.token = action.payload.token
    },

    
    clearCredentials(state) {
      state.user = null
      state.token = null
    },

    setRefreshing(state, action: PayloadAction<boolean>) {
      state.isRefreshing = action.payload
    },

    
    setInitialized(state) {
      state.isInitializing = false
    },
  },
})

export const { setCredentials, clearCredentials, setRefreshing, setInitialized } = authSlice.actions

export const authReducer = authSlice.reducer

export const selectCurrentUser      = (state: RootState) => state.auth.user
export const selectToken            = (state: RootState) => state.auth.token
export const selectIsAuthenticated  = (state: RootState) => state.auth.token !== null
export const selectUserRole         = (state: RootState) => getRoleSlug(state.auth.user?.role)
export const selectIsRefreshing     = (state: RootState) => state.auth.isRefreshing
export const selectIsInitializing   = (state: RootState) => state.auth.isInitializing
