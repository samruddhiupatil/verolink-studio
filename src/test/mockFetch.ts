import { vi } from 'vitest'

/**
 * Test helpers that configure the `global.fetch` stub installed by
 * `src/test/setup.ts` before every test. Keeping these here means
 * `executeRequest`-dependent tests (Sections 1, 4, 6) never hand-roll
 * Response mocking themselves.
 */

export function mockFetchResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): void {
  const status = init.status ?? 200
  const response = {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(init.headers ?? {}),
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response

  vi.mocked(fetch).mockResolvedValue(response)
}

export function mockFetchNetworkError(error: Error = new TypeError('Failed to fetch')): void {
  vi.mocked(fetch).mockRejectedValue(error)
}

/** Simulates fetch hanging until the AbortController in executeRequest fires. */
export function mockFetchAbortsOnSignal(): void {
  vi.mocked(fetch).mockImplementation(
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        const signal = init?.signal
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new DOMException('The operation was aborted.', 'AbortError')
            reject(err)
          })
        }
      }),
  )
}
