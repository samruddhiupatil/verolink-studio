import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  // Every test starts with a fresh fetch stub. Tests that need a real
  // response/rejection configure it via the helpers in `src/test/mockFetch.ts`
  // instead of re-declaring `global.fetch = vi.fn()` themselves.
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
