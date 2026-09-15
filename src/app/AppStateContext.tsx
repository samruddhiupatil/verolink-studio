import { createContext, type Dispatch, type ReactNode, useContext, useEffect, useReducer, useRef } from 'react'
import { loadState, saveState } from '../lib/persistence/localStorage'
import type { AppAction } from './appActions'
import { appReducer } from './appReducer'
import type { RootState } from './appState.types'

interface AppStateContextValue {
  state: RootState
  dispatch: Dispatch<AppAction>
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

/** Debounce writes so rapid keystrokes don't hit localStorage on every character. */
const SAVE_DEBOUNCE_MS = 300

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveState(state), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [state])

  return <AppStateContext.Provider value={{ state, dispatch }}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used within an AppStateProvider')
  return context
}
