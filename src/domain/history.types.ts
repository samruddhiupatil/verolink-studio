import type { HttpMethod } from './endpoint.types'

export const MAX_HISTORY_ENTRIES = 10

/**
 * Browser `fetch()` cannot reliably distinguish a CORS block from DNS/connection
 * failure — both throw the same opaque TypeError — so those collapse into a
 * single honest "unreachable" bucket. Only a client-enforced timeout is a
 * reliably distinct failure mode. See DECISIONS.md for the rationale.
 */
export type RequestErrorKind = 'timeout' | 'unreachable'

export interface RequestHistoryEntry {
  id: string
  timestamp: string
  endpointId: string
  endpointLabel: string
  method: HttpMethod
  resolvedUrl: string
  requestHeaders: Record<string, string>
  requestBody?: string
  /** null when the request never got a response (network failure). */
  statusCode: number | null
  latencyMs: number
  responseBody?: string
  errorKind?: RequestErrorKind
  source: 'test-console' | 'outbound-submission'
}
