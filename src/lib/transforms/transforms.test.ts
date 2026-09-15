import { describe, expect, it } from 'vitest'
import { applyTransform } from './transforms'

describe('applyTransform', () => {
  it('none passes the value through unchanged', () => {
    expect(applyTransform('Hello World', { type: 'none' })).toBe('Hello World')
  })

  it('uppercase converts to upper case', () => {
    expect(applyTransform('hello', { type: 'uppercase' })).toBe('HELLO')
  })

  it('lowercase converts to lower case', () => {
    expect(applyTransform('HELLO', { type: 'lowercase' })).toBe('hello')
  })

  it('trim removes leading and trailing whitespace', () => {
    expect(applyTransform('  hello  ', { type: 'trim' })).toBe('hello')
  })

  it('dateFormatIsoToDMY converts an ISO date to DD/MM/YYYY', () => {
    expect(applyTransform('2026-01-15', { type: 'dateFormatIsoToDMY' })).toBe('15/01/2026')
  })

  it('dateFormatIsoToDMY converts a full ISO timestamp to DD/MM/YYYY', () => {
    expect(applyTransform('2026-01-15T10:30:00.000Z', { type: 'dateFormatIsoToDMY' })).toBe('15/01/2026')
  })

  it('dateFormatIsoToDMY returns the original string for an invalid date', () => {
    expect(applyTransform('not-a-date', { type: 'dateFormatIsoToDMY' })).toBe('not-a-date')
  })

  it('prefix prepends the configured arg', () => {
    expect(applyTransform('42', { type: 'prefix', arg: 'VEN-' })).toBe('VEN-42')
  })

  it('prefix with no arg behaves as a no-op', () => {
    expect(applyTransform('42', { type: 'prefix' })).toBe('42')
  })

  it('suffix appends the configured arg', () => {
    expect(applyTransform('42', { type: 'suffix', arg: '-USD' })).toBe('42-USD')
  })

  it('coerces a non-string source value (number) before transforming', () => {
    expect(applyTransform(42, { type: 'suffix', arg: '-USD' })).toBe('42-USD')
  })

  it('coerces a boolean source value before transforming', () => {
    expect(applyTransform(true, { type: 'uppercase' })).toBe('TRUE')
  })

  it('coerces null/undefined to an empty string rather than "null"/"undefined"', () => {
    expect(applyTransform(null, { type: 'uppercase' })).toBe('')
    expect(applyTransform(undefined, { type: 'trim' })).toBe('')
  })
})
