import { describe, expect, it } from 'vitest'
import type { AuthConfig } from '../../domain/auth.types'
import { buildAuthInjection, redactSecret } from './buildAuthInjection'

describe('redactSecret', () => {
  it('keeps a 2-char prefix and 3-char suffix, masking the middle with 8 bullets', () => {
    expect(redactSecret('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.3kQ')).toBe('ey••••••••3kQ')
  })

  it('fully masks short secrets rather than leaking their length', () => {
    expect(redactSecret('abc')).toBe('•••')
    expect(redactSecret('ab')).toBe('•••')
  })

  it('returns empty string for an empty secret', () => {
    expect(redactSecret('')).toBe('')
  })
})

describe('buildAuthInjection', () => {
  it('type "none" injects nothing', () => {
    const result = buildAuthInjection({ type: 'none' })
    expect(result).toEqual({ headers: {}, queryParams: {}, redactedPreview: [] })
  })

  it('apiKey placed in header injects a header and redacts the preview', () => {
    const auth: AuthConfig = { type: 'apiKey', headerName: 'X-Api-Key', keyValue: 'sk_live_abcdefgh', placement: 'header' }
    const result = buildAuthInjection(auth)
    expect(result.headers).toEqual({ 'X-Api-Key': 'sk_live_abcdefgh' })
    expect(result.queryParams).toEqual({})
    expect(result.redactedPreview).toEqual([{ label: 'Header: X-Api-Key', value: redactSecret('sk_live_abcdefgh') }])
  })

  it('apiKey placed in query injects a query param instead of a header', () => {
    const auth: AuthConfig = { type: 'apiKey', headerName: 'api_key', keyValue: 'sk_live_abcdefgh', placement: 'query' }
    const result = buildAuthInjection(auth)
    expect(result.headers).toEqual({})
    expect(result.queryParams).toEqual({ api_key: 'sk_live_abcdefgh' })
  })

  it('oauth2 with no fetched session injects nothing but flags it in the preview', () => {
    const auth: AuthConfig = {
      type: 'oauth2',
      tokenUrl: 'https://auth.example.com/token',
      clientId: 'id',
      clientSecret: 'secret',
      scope: '',
      grantType: 'client_credentials',
    }
    const result = buildAuthInjection(auth)
    expect(result.headers).toEqual({})
    expect(result.redactedPreview[0].value).toBe('(no token fetched yet)')
  })

  it('oauth2 with a session injects a Bearer header from the access token', () => {
    const auth: AuthConfig = {
      type: 'oauth2',
      tokenUrl: 'https://auth.example.com/token',
      clientId: 'id',
      clientSecret: 'secret',
      scope: '',
      grantType: 'client_credentials',
      session: { accessToken: 'simulated-token-1234567890', expiresAt: '2026-01-01T00:05:00.000Z', simulated: true },
    }
    const result = buildAuthInjection(auth)
    expect(result.headers.Authorization).toBe('Bearer simulated-token-1234567890')
    expect(result.redactedPreview[0].value.startsWith('Bearer si')).toBe(true)
  })

  it('basic auth injects a base64-encoded Authorization header', () => {
    const auth: AuthConfig = { type: 'basic', username: 'admin', password: 'hunter2' }
    const result = buildAuthInjection(auth)
    expect(result.headers.Authorization).toBe(`Basic ${btoa('admin:hunter2')}`)
  })

  it('bearer token injects a static Authorization header', () => {
    const auth: AuthConfig = { type: 'bearer', token: 'static-token-value' }
    const result = buildAuthInjection(auth)
    expect(result.headers.Authorization).toBe('Bearer static-token-value')
  })

  it('customHeaders injects every named row and skips rows with no name', () => {
    const auth: AuthConfig = {
      type: 'customHeaders',
      headers: [
        { id: '1', key: 'X-Trace-Id', value: 'trace-1' },
        { id: '2', key: '', value: 'ignored' },
        { id: '3', key: 'X-Env', value: 'sandbox' },
      ],
    }
    const result = buildAuthInjection(auth)
    expect(result.headers).toEqual({ 'X-Trace-Id': 'trace-1', 'X-Env': 'sandbox' })
    expect(result.redactedPreview).toHaveLength(2)
  })
})
