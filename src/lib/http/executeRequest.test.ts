import { describe, expect, it, vi } from 'vitest'
import type { AuthConfig } from '../../domain/auth.types'
import { mockFetchAbortsOnSignal, mockFetchNetworkError, mockFetchResponse } from '../../test/mockFetch'
import { executeRequest } from './executeRequest'

const NO_AUTH: AuthConfig = { type: 'none' }

describe('executeRequest', () => {
  it('resolves a 2xx response and reports the status/body', async () => {
    mockFetchResponse({ id: 1, name: 'Leanne Graham' }, { status: 200 })

    const result = await executeRequest({
      endpoint: { method: 'GET', path: '/users/1', headers: [], queryParams: [] },
      baseUrl: 'https://jsonplaceholder.typicode.com',
      variableValues: {},
      auth: NO_AUTH,
    })

    expect(result.statusCode).toBe(200)
    expect(result.resolvedUrl).toBe('https://jsonplaceholder.typicode.com/users/1')
    expect(JSON.parse(result.responseBody ?? '{}')).toEqual({ id: 1, name: 'Leanne Graham' })
    expect(result.errorKind).toBeUndefined()
  })

  it('still resolves (does not throw) for a 4xx/5xx response', async () => {
    mockFetchResponse({ error: 'not found' }, { status: 404 })

    const result = await executeRequest({
      endpoint: { method: 'GET', path: '/users/999', headers: [], queryParams: [] },
      baseUrl: 'https://jsonplaceholder.typicode.com',
      variableValues: {},
      auth: NO_AUTH,
    })

    expect(result.statusCode).toBe(404)
    expect(result.errorKind).toBeUndefined()
  })

  it('classifies a rejected fetch (network/CORS/DNS) as errorKind "unreachable"', async () => {
    mockFetchNetworkError(new TypeError('Failed to fetch'))

    const result = await executeRequest({
      endpoint: { method: 'GET', path: '/users', headers: [], queryParams: [] },
      baseUrl: 'https://unreachable.invalid',
      variableValues: {},
      auth: NO_AUTH,
    })

    expect(result.statusCode).toBeNull()
    expect(result.errorKind).toBe('unreachable')
  })

  it('classifies our own abort-on-timeout as errorKind "timeout"', async () => {
    vi.useFakeTimers()
    mockFetchAbortsOnSignal()

    const promise = executeRequest({
      endpoint: { method: 'GET', path: '/slow', headers: [], queryParams: [] },
      baseUrl: 'https://slow.example.com',
      variableValues: {},
      auth: NO_AUTH,
      timeoutMs: 50,
    })

    await vi.advanceTimersByTimeAsync(50)
    const result = await promise

    expect(result.statusCode).toBeNull()
    expect(result.errorKind).toBe('timeout')
  })

  it('interpolates {{variables}} in the path before resolving the URL', async () => {
    mockFetchResponse({}, { status: 200 })

    const result = await executeRequest({
      endpoint: { method: 'GET', path: '/vendors/{{vendor_id}}', headers: [], queryParams: [] },
      baseUrl: 'https://api.example.com',
      variableValues: { vendor_id: '42' },
      auth: NO_AUTH,
    })

    expect(result.resolvedUrl).toBe('https://api.example.com/vendors/42')
  })

  it('merges endpoint query params with auth-injected ones', async () => {
    mockFetchResponse({}, { status: 200 })

    const result = await executeRequest({
      endpoint: {
        method: 'GET',
        path: '/vendors',
        headers: [],
        queryParams: [{ id: 'q1', key: 'region', value: 'us' }],
      },
      baseUrl: 'https://api.example.com',
      variableValues: {},
      auth: { type: 'apiKey', headerName: 'api_key', keyValue: 'secret', placement: 'query' },
    })

    const url = new URL(result.resolvedUrl)
    expect(url.searchParams.get('region')).toBe('us')
    expect(url.searchParams.get('api_key')).toBe('secret')
  })

  it('endpoint-configured headers win over auth-injected headers on key collision', async () => {
    mockFetchResponse({}, { status: 200 })

    const result = await executeRequest({
      endpoint: {
        method: 'GET',
        path: '/vendors',
        headers: [{ id: 'h1', key: 'Authorization', value: 'Custom explicit-value' }],
        queryParams: [],
      },
      baseUrl: 'https://api.example.com',
      variableValues: {},
      auth: { type: 'bearer', token: 'auth-token' },
    })

    expect(result.requestHeaders.Authorization).toBe('Custom explicit-value')
  })

  it('only includes a request body for methods that support one', async () => {
    mockFetchResponse({}, { status: 201 })

    const getResult = await executeRequest({
      endpoint: { method: 'GET', path: '/users', headers: [], queryParams: [], requestBody: '{"ignored":true}' },
      baseUrl: 'https://api.example.com',
      variableValues: {},
      auth: NO_AUTH,
    })
    expect(getResult.requestBody).toBeUndefined()

    const postResult = await executeRequest({
      endpoint: { method: 'POST', path: '/posts', headers: [], queryParams: [] },
      baseUrl: 'https://api.example.com',
      variableValues: {},
      auth: NO_AUTH,
      bodyOverride: '{"title":"Hi"}',
    })
    expect(postResult.requestBody).toBe('{"title":"Hi"}')
  })
})
