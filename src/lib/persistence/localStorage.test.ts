import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialRootState } from '../../app/initialState'
import type { RootState } from '../../app/appState.types'
import { STORAGE_KEY, clearState, loadState, saveState } from './localStorage'

function stateWithConnectorName(name: string): RootState {
  const state = createInitialRootState()
  state.connector.name = name
  return state
}

describe('localStorage persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadState returns the default state when nothing is stored', () => {
    expect(loadState()).toEqual(createInitialRootState())
  })

  it('round-trips a full RootState through save then load', () => {
    const state = stateWithConnectorName('Vendor Sync')
    state.endpoints.push({
      id: 'ep1',
      label: 'Get Users',
      method: 'GET',
      path: '/users',
      headers: [],
      queryParams: [],
      responseSchema: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    saveState(state)
    const loaded = loadState()

    expect(loaded).toEqual(state)
  })

  it('recovers to defaults when the stored value is corrupt JSON', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    expect(loadState()).toEqual(createInitialRootState())
    expect(consoleError).toHaveBeenCalled()
  })

  it('merges a partial/older stored payload over current defaults', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ connector: { name: 'Legacy' } }))

    const loaded = loadState()

    expect(loaded.connector).toEqual({ name: 'Legacy' })
    expect(loaded.endpoints).toEqual([])
    expect(loaded.ui).toEqual({ viewMode: 'admin' })
  })

  it('strips the OAuth2 session before persisting, so it never rehydrates', () => {
    const state = createInitialRootState()
    state.auth = {
      type: 'oauth2',
      tokenUrl: 'https://auth.example.com/token',
      clientId: 'client-123',
      clientSecret: 'secret-abc',
      scope: 'read',
      grantType: 'client_credentials',
      session: { accessToken: 'fake-token', expiresAt: '2026-01-01T00:05:00.000Z', simulated: true },
    }

    saveState(state)
    const loaded = loadState()

    expect(loaded.auth.type).toBe('oauth2')
    if (loaded.auth.type === 'oauth2') {
      expect(loaded.auth.session).toBeUndefined()
      expect(loaded.auth.clientId).toBe('client-123')
    }
  })

  it('degrades gracefully when localStorage.setItem throws (quota exceeded)', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    expect(() => saveState(stateWithConnectorName('Whatever'))).not.toThrow()
    expect(consoleError).toHaveBeenCalled()

    setItemSpy.mockRestore()
  })

  it('clearState removes the persisted value', () => {
    saveState(stateWithConnectorName('Temp'))
    clearState()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(loadState()).toEqual(createInitialRootState())
  })
})
