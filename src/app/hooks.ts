import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'

/**
 * useAppDispatch — pre-typed dispatch hook.
 * Use this instead of `useDispatch()` throughout the app.
 */
export const useAppDispatch: () => AppDispatch = useDispatch

/**
 * useAppSelector — pre-typed selector hook.
 * Provides full IntelliSense on the state tree.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
