import { describe, expect, it } from 'vitest'
import { validateJsonText } from './jsonValidation'

describe('validateJsonText', () => {
  it('accepts well-formed JSON', () => {
    expect(validateJsonText('{"title":"Hi"}')).toEqual({ valid: true })
  })

  it('treats an empty body as valid (optional field)', () => {
    expect(validateJsonText('')).toEqual({ valid: true })
    expect(validateJsonText('   ')).toEqual({ valid: true })
  })

  it('reports an error for malformed JSON', () => {
    const result = validateJsonText('{"title": }')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('reports an error for a trailing comma', () => {
    const result = validateJsonText('{"a":1,}')
    expect(result.valid).toBe(false)
  })
})
