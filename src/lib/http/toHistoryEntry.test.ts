import { describe, expect, it } from 'vitest'
import type { ExecuteRequestResult } from './executeRequest'
import { toHistoryEntry } from './toHistoryEntry'

describe('toHistoryEntry', () => {
  it('maps a successful executeRequest result into a history entry', () => {
    const result: ExecuteRequestResult = {
      method: 'GET',
      resolvedUrl: 'https://api.example.com/users/1',
      requestHeaders: { Authorization: 'Bearer x' },
      requestBody: undefined,
      latencyMs: 42,
      statusCode: 200,
      responseBody: '{"id":1}',
      errorKind: undefined,
    }

    const entry = toHistoryEntry(result, { endpointId: 'ep1', endpointLabel: 'Get User', source: 'test-console' })

    expect(entry).toMatchObject({
      endpointId: 'ep1',
      endpointLabel: 'Get User',
      method: 'GET',
      resolvedUrl: 'https://api.example.com/users/1',
      statusCode: 200,
      latencyMs: 42,
      responseBody: '{"id":1}',
      source: 'test-console',
    })
    expect(entry.id).toBeTruthy()
    expect(entry.timestamp).toBeTruthy()
  })

  it('preserves a null statusCode and errorKind for a failed request', () => {
    const result: ExecuteRequestResult = {
      method: 'POST',
      resolvedUrl: 'https://api.example.com/posts',
      requestHeaders: {},
      requestBody: '{}',
      latencyMs: 8000,
      statusCode: null,
      errorKind: 'timeout',
    }

    const entry = toHistoryEntry(result, { endpointId: 'ep2', endpointLabel: 'Create Post', source: 'outbound-submission' })

    expect(entry.statusCode).toBeNull()
    expect(entry.errorKind).toBe('timeout')
    expect(entry.source).toBe('outbound-submission')
  })

  it('generates a unique id for each call', () => {
    const result: ExecuteRequestResult = {
      method: 'GET',
      resolvedUrl: 'https://api.example.com/x',
      requestHeaders: {},
      latencyMs: 1,
      statusCode: 200,
    }
    const a = toHistoryEntry(result, { endpointId: 'e', endpointLabel: 'E', source: 'test-console' })
    const b = toHistoryEntry(result, { endpointId: 'e', endpointLabel: 'E', source: 'test-console' })
    expect(a.id).not.toBe(b.id)
  })
})
