import type { AuthConfig } from '../../domain/auth.types'

export interface AuthPreviewRow {
  label: string
  value: string
}

export interface AuthInjectionResult {
  headers: Record<string, string>
  queryParams: Record<string, string>
  redactedPreview: AuthPreviewRow[]
}

/**
 * Partially redacts a secret for display, e.g. "eyJhbGciOi...3kQ" -> "ey••••••••3kQ",
 * matching the spec's example format. Short secrets are fully masked rather
 * than leaking their real length via a variable-width mask.
 */
export function redactSecret(secret: string): string {
  if (!secret) return ''
  if (secret.length <= 6) return '•'.repeat(Math.max(secret.length, 3))
  const prefix = secret.slice(0, 2)
  const suffix = secret.slice(-3)
  return `${prefix}${'•'.repeat(8)}${suffix}`
}

function encodeBasicCredentials(username: string, password: string): string {
  return btoa(`${username}:${password}`)
}

const EMPTY_RESULT: AuthInjectionResult = { headers: {}, queryParams: {}, redactedPreview: [] }

/**
 * Pure function: AuthConfig -> the exact headers/query params that would be
 * injected into a request, plus a redacted preview for display. This is the
 * single source of truth both the Test Console (Section 4) and the outbound
 * form submission (Section 6 Part C) build requests from.
 */
export function buildAuthInjection(auth: AuthConfig): AuthInjectionResult {
  switch (auth.type) {
    case 'none':
      return EMPTY_RESULT

    case 'apiKey': {
      if (!auth.headerName) return EMPTY_RESULT
      const preview: AuthPreviewRow = {
        label: auth.placement === 'header' ? `Header: ${auth.headerName}` : `Query param: ${auth.headerName}`,
        value: redactSecret(auth.keyValue),
      }
      if (auth.placement === 'header') {
        return { headers: { [auth.headerName]: auth.keyValue }, queryParams: {}, redactedPreview: [preview] }
      }
      return { headers: {}, queryParams: { [auth.headerName]: auth.keyValue }, redactedPreview: [preview] }
    }

    case 'oauth2': {
      const token = auth.session?.accessToken
      if (!token) {
        return {
          headers: {},
          queryParams: {},
          redactedPreview: [{ label: 'Authorization', value: '(no token fetched yet)' }],
        }
      }
      return {
        headers: { Authorization: `Bearer ${token}` },
        queryParams: {},
        redactedPreview: [{ label: 'Authorization', value: `Bearer ${redactSecret(token)}` }],
      }
    }

    case 'basic': {
      if (!auth.username && !auth.password) return EMPTY_RESULT
      const encoded = encodeBasicCredentials(auth.username, auth.password)
      return {
        headers: { Authorization: `Basic ${encoded}` },
        queryParams: {},
        redactedPreview: [{ label: 'Authorization', value: `Basic ${redactSecret(encoded)}` }],
      }
    }

    case 'bearer': {
      if (!auth.token) return EMPTY_RESULT
      return {
        headers: { Authorization: `Bearer ${auth.token}` },
        queryParams: {},
        redactedPreview: [{ label: 'Authorization', value: `Bearer ${redactSecret(auth.token)}` }],
      }
    }

    case 'customHeaders': {
      const headers: Record<string, string> = {}
      const redactedPreview: AuthPreviewRow[] = []
      for (const row of auth.headers) {
        if (!row.name) continue
        headers[row.name] = row.value
        redactedPreview.push({ label: `Header: ${row.name}`, value: redactSecret(row.value) })
      }
      return { headers, queryParams: {}, redactedPreview }
    }
  }
}
