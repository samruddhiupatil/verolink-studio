import { describe, expect, it } from 'vitest'
import { isWellFormedUrl } from './urlValidation'

describe('isWellFormedUrl', () => {
  it('accepts a well-formed https URL', () => {
    expect(isWellFormedUrl('https://jsonplaceholder.typicode.com')).toBe(true)
  })

  it('accepts a well-formed http URL', () => {
    expect(isWellFormedUrl('http://localhost:3000')).toBe(true)
  })

  it('rejects a string with no protocol', () => {
    expect(isWellFormedUrl('not-a-url')).toBe(false)
  })

  it('rejects an empty or whitespace-only string', () => {
    expect(isWellFormedUrl('')).toBe(false)
    expect(isWellFormedUrl('   ')).toBe(false)
  })

  it('rejects a non-http(s) protocol', () => {
    expect(isWellFormedUrl('ftp://example.com')).toBe(false)
  })
})
