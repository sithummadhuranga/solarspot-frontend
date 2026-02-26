import { AppRouter } from '@/router'

/**
 * App — root component. Renders the full route tree.
 *
 * All routes are declared in src/router/index.tsx.
 * Add global providers (toast, modals, theme) here as needed.
 *
 * TODO (Member 4): add silent re-auth on mount:
 *   const dispatch = useAppDispatch()
 *   useEffect(() => { dispatch(refreshTokenThunk()) }, [dispatch])
 */
function App() {
  return <AppRouter />
}

export default App
