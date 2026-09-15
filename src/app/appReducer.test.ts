import { describe, expect, it } from 'vitest'
import type { RequestHistoryEntry } from '../domain/history.types'
import { appReducer } from './appReducer'
import { createInitialRootState } from './initialState'

function historyEntry(id: string): RequestHistoryEntry {
  return {
    id,
    timestamp: '2026-01-01T00:00:00.000Z',
    endpointId: 'ep1',
    endpointLabel: 'Get Users',
    method: 'GET',
    resolvedUrl: 'https://api.example.com/users',
    requestHeaders: {},
    statusCode: 200,
    latencyMs: 50,
    source: 'test-console',
  }
}

describe('appReducer', () => {
  it('UPDATE_CONNECTOR merges into the existing connector config', () => {
    const state = createInitialRootState()
    const next = appReducer(state, { type: 'UPDATE_CONNECTOR', payload: { name: 'Vendor Sync' } })
    expect(next.connector.name).toBe('Vendor Sync')
    expect(next.connector.environment).toBe('Sandbox')
  })

  it('SET_AUTH replaces the whole auth object (discriminated union swap)', () => {
    const state = createInitialRootState()
    const next = appReducer(state, { type: 'SET_AUTH', payload: { type: 'bearer', token: 'abc' } })
    expect(next.auth).toEqual({ type: 'bearer', token: 'abc' })
  })

  it('ADD_ENDPOINT appends without mutating the original array', () => {
    const state = createInitialRootState()
    const endpoint = {
      id: 'ep1',
      label: 'Get Users',
      method: 'GET' as const,
      path: '/users',
      headers: [],
      queryParams: [],
      responseSchema: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const next = appReducer(state, { type: 'ADD_ENDPOINT', payload: endpoint })
    expect(next.endpoints).toEqual([endpoint])
    expect(state.endpoints).toEqual([])
  })

  it('DELETE_ENDPOINT removes only the matching endpoint', () => {
    const state = createInitialRootState()
    state.endpoints = [
      { id: 'a', label: 'A', method: 'GET', path: '/a', headers: [], queryParams: [], responseSchema: [], createdAt: '', updatedAt: '' },
      { id: 'b', label: 'B', method: 'GET', path: '/b', headers: [], queryParams: [], responseSchema: [], createdAt: '', updatedAt: '' },
    ]
    const next = appReducer(state, { type: 'DELETE_ENDPOINT', payload: { id: 'a' } })
    expect(next.endpoints.map((e) => e.id)).toEqual(['b'])
  })

  it('APPEND_HISTORY_ENTRY adds the newest entry to the front', () => {
    const state = createInitialRootState()
    state.history = [historyEntry('old')]
    const next = appReducer(state, { type: 'APPEND_HISTORY_ENTRY', payload: historyEntry('new') })
    expect(next.history.map((h) => h.id)).toEqual(['new', 'old'])
  })

  it('APPEND_HISTORY_ENTRY caps the log at MAX_HISTORY_ENTRIES (10)', () => {
    const state = createInitialRootState()
    state.history = Array.from({ length: 10 }, (_, i) => historyEntry(`h${i}`))
    const next = appReducer(state, { type: 'APPEND_HISTORY_ENTRY', payload: historyEntry('newest') })
    expect(next.history).toHaveLength(10)
    expect(next.history[0].id).toBe('newest')
    expect(next.history.at(-1)?.id).toBe('h8')
  })

  it('SET_VIEW_MODE toggles admin/user without touching other ui state', () => {
    const state = createInitialRootState()
    const next = appReducer(state, { type: 'SET_VIEW_MODE', payload: 'user' })
    expect(next.ui.viewMode).toBe('user')
  })

  it('SET_OUTBOUND_FIELDS replaces only the fields slice of outbound config', () => {
    const state = createInitialRootState()
    state.outbound.targetEndpointId = 'ep1'
    const fields = [{ id: 'f1', order: 0, label: 'Title', fieldType: 'Text' as const, required: true }]
    const next = appReducer(state, { type: 'SET_OUTBOUND_FIELDS', payload: fields })
    expect(next.outbound.fields).toEqual(fields)
    expect(next.outbound.targetEndpointId).toBe('ep1')
  })
})
