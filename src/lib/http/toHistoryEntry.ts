import { nanoid } from 'nanoid'
import type { RequestHistoryEntry } from '../../domain/history.types'
import type { ExecuteRequestResult } from './executeRequest'

/**
 * Converts an executeRequest() result into a RequestHistoryEntry. Shared by
 * both the Test Console (Section 4) and outbound form submission (Section 6
 * Part C) so the two history sources are built identically, just tagged
 * with a different `source`.
 */
export function toHistoryEntry(
  result: ExecuteRequestResult,
  opts: { endpointId: string; endpointLabel: string; source: RequestHistoryEntry['source'] },
): RequestHistoryEntry {
  return {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    endpointId: opts.endpointId,
    endpointLabel: opts.endpointLabel,
    method: result.method,
    resolvedUrl: result.resolvedUrl,
    requestHeaders: result.requestHeaders,
    requestBody: result.requestBody,
    statusCode: result.statusCode,
    latencyMs: result.latencyMs,
    responseBody: result.responseBody,
    errorKind: result.errorKind,
    source: opts.source,
  }
}
