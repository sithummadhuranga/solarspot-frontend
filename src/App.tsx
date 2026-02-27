import { useEffect } from 'react'
import { AppRouter } from '@/router'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials, setInitialized } from '@/features/auth/authSlice'
import { useRefreshMutation } from '@/features/auth/authApi'
import { useLazyGetMeQuery } from '@/features/users/usersApi'

/**
 * App — root component.
 *
 * On every mount (including hard refreshes) it attempts a silent token refresh
 * using the httpOnly refreshToken cookie. If refresh succeeds it fetches the
 * user profile and hydrates Redux state so protected routes stay accessible.
 *
 * setInitialized() is dispatched regardless of success / failure so that
 * ProtectedRoute can make its redirect decision without a flicker.
 */
function App() {
  const dispatch = useAppDispatch()
  const [refresh]  = useRefreshMutation()
  const [getMe]    = useLazyGetMeQuery()

  useEffect(() => {
    async function bootAuth() {
      try {
        // 1. Exchange the httpOnly refreshToken cookie for a new accessToken.
        //    authApi.refresh.onQueryStarted dispatches setToken(accessToken).
        const refreshResult = await refresh().unwrap()
        const accessToken   = refreshResult.data.accessToken

        // 2. Use the new accessToken to fetch the current user profile.
        const meResult = await getMe().unwrap()
        dispatch(setCredentials({ user: meResult.data, token: accessToken }))
      } catch {
        // Not logged in — that's fine. ProtectedRoute will handle the redirect.
      } finally {
        // Always mark the app as initialized so guards can proceed.
        dispatch(setInitialized())
      }
    }

    void bootAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AppRouter />
}

export default App
