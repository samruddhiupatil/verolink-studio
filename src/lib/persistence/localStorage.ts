import type { RootState } from '../../app/appState.types'
import { createInitialRootState } from '../../app/initialState'
import type { AuthConfig } from '../../domain/auth.types'

/**
 * Versioned so a future breaking change to RootState's shape can migrate or
 * discard old data instead of crashing on load.
 */
export const STORAGE_KEY = 'verolink:v1'

/** OAuth2 access tokens are session-only per spec — never written to localStorage. */
function stripAuthSession(auth: AuthConfig): AuthConfig {
  if (auth.type === 'oauth2' && auth.session) {
    const { session: _session, ...rest } = auth
    return rest
  }
  return auth
}

export function saveState(state: RootState): void {
  try {
    const toPersist: RootState = { ...state, auth: stripAuthSession(state.auth) }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist))
  } catch (error) {
    // Quota exceeded, storage disabled by privacy settings, etc. — degrade to
    // an in-memory-only session rather than crashing the app.
    console.error('VeroLink Studio: failed to persist state to localStorage.', error)
  }
}

export function loadState(): RootState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialRootState()
    const parsed = JSON.parse(raw) as Partial<RootState>
    // Shallow-merge over defaults so a partial/older payload (missing a key
    // added in a later version) doesn't produce an undefined slice of state.
    return { ...createInitialRootState(), ...parsed }
  } catch (error) {
    console.error('VeroLink Studio: failed to read persisted state, resetting.', error)
    return createInitialRootState()
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clean up if storage isn't available.
  }
}
