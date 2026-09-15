import { buildAuthInjection } from '../auth/buildAuthInjection'
import type { AuthConfig } from '../../domain/auth.types'
import { type HttpMethod, type KeyValueRow, methodHasBody } from '../../domain/endpoint.types'
import type { RequestErrorKind } from '../../domain/history.types'
import { interpolate } from '../interpolation/interpolateVariables'

const DEFAULT_TIMEOUT_MS = 10_000

export interface ExecuteRequestParams {
  endpoint: {
    method: HttpMethod
    path: string
    headers: KeyValueRow[]
    queryParams: KeyValueRow[]
    requestBody?: string
  }
  baseUrl: string
  variableValues: Record<string, string>
  auth: AuthConfig
  /** Overrides endpoint.requestBody — used by Section 6 Part C's constructed outbound payload. */
  bodyOverride?: string
  timeoutMs?: number
}

export interface ExecuteRequestResult {
  method: HttpMethod
  resolvedUrl: string
  requestHeaders: Record<string, string>
  requestBody?: string
  latencyMs: number
  /** null when the request never received a response (network failure). */
  statusCode: number | null
  responseBody?: string
  errorKind?: RequestErrorKind
}

function joinUrl(baseUrl: string, path: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, '')
  const trimmedPath = path.startsWith('/') ? path : `/${path}`
  return `${trimmedBase}${trimmedPath}`
}

/**
 * The single place `fetch()` is called from in the whole app. Both the Test
 * Console (Section 4) and the outbound form submission (Section 6 Part C)
 * call this so auth injection, timing, and error classification never get
 * reimplemented per call site.
 */
export async function executeRequest(params: ExecuteRequestParams): Promise<ExecuteRequestResult> {
  const { endpoint, baseUrl, variableValues, auth, bodyOverride, timeoutMs = DEFAULT_TIMEOUT_MS } = params
  const authInjection = buildAuthInjection(auth)

  const resolvedPath = interpolate(endpoint.path, variableValues)
  const url = new URL(joinUrl(baseUrl, resolvedPath))

  // Endpoint-configured params/headers win over auth-injected ones on key
  // collision — the admin explicitly configured them for this endpoint.
  const mergedParams: Record<string, string> = { ...authInjection.queryParams }
  for (const row of endpoint.queryParams) {
    if (!row.key) continue
    mergedParams[row.key] = interpolate(row.value, variableValues)
  }
  for (const [key, value] of Object.entries(mergedParams)) {
    url.searchParams.set(key, value)
  }

  const mergedHeaders: Record<string, string> = { ...authInjection.headers }
  for (const row of endpoint.headers) {
    if (!row.key) continue
    mergedHeaders[row.key] = interpolate(row.value, variableValues)
  }

  const hasBody = methodHasBody(endpoint.method)
  const requestBody = hasBody ? (bodyOverride ?? endpoint.requestBody) : undefined

  // Most JSON APIs (jsonplaceholder included) only parse the body if told it's
  // JSON — without this a POST/PUT/PATCH silently sends an unparsed body.
  if (requestBody && !Object.keys(mergedHeaders).some((key) => key.toLowerCase() === 'content-type')) {
    mergedHeaders['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

  let statusCode: number | null = null
  let responseBody: string | undefined
  let errorKind: RequestErrorKind | undefined

  const start = performance.now()
  try {
    const response = await fetch(url.toString(), {
      method: endpoint.method,
      headers: mergedHeaders,
      body: requestBody,
      signal: controller.signal,
    })
    statusCode = response.status
    responseBody = await response.text()
  } catch (error) {
    errorKind = error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'unreachable'
  } finally {
    clearTimeout(timeoutHandle)
  }
  const latencyMs = Math.round(performance.now() - start)

  return {
    method: endpoint.method,
    resolvedUrl: url.toString(),
    requestHeaders: mergedHeaders,
    requestBody,
    latencyMs,
    statusCode,
    responseBody,
    errorKind,
  }
}
