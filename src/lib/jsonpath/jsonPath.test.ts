import { describe, expect, it } from 'vitest'
import type { ResponseSchemaField } from '../../domain/endpoint.types'
import { getByPath, resolveSchemaField, setByPath } from './jsonPath'

describe('getByPath', () => {
  it('reads a nested key path', () => {
    expect(getByPath({ supplier: { name: 'Acme' } }, '$.supplier.name')).toBe('Acme')
  })

  it('reads a top-level key', () => {
    expect(getByPath({ id: 1 }, '$.id')).toBe(1)
  })

  it('fans a [*] wildcard out into an array of resolved values', () => {
    const data = { data: [{ id: 1 }, { id: 2 }, { id: 3 }] }
    expect(getByPath(data, '$.data[*].id')).toEqual([1, 2, 3])
  })

  it('reads a specific numeric array index', () => {
    expect(getByPath({ items: ['a', 'b', 'c'] }, '$.items[1]')).toBe('b')
  })

  it('returns undefined when an intermediate segment is missing', () => {
    expect(getByPath({ supplier: {} }, '$.supplier.name')).toBeUndefined()
  })

  it('returns undefined when the root is null or undefined', () => {
    expect(getByPath(null, '$.id')).toBeUndefined()
    expect(getByPath(undefined, '$.id')).toBeUndefined()
  })

  it('returns undefined when a wildcard is applied to a non-array', () => {
    expect(getByPath({ data: {} }, '$.data[*].id')).toBeUndefined()
  })
})

describe('setByPath', () => {
  it('sets a root-level key on an empty object', () => {
    const result = setByPath({}, '$.title', 'Hello')
    expect(result).toEqual({ title: 'Hello' })
  })

  it('creates missing intermediate objects for a deep path', () => {
    const result = setByPath(undefined, '$.supplier.address.city', 'Austin')
    expect(result).toEqual({ supplier: { address: { city: 'Austin' } } })
  })

  it('overwrites an existing nested value without disturbing siblings', () => {
    const result = setByPath({ supplier: { name: 'Old', id: 7 } }, '$.supplier.name', 'New')
    expect(result).toEqual({ supplier: { name: 'New', id: 7 } })
  })

  it('creates an array when the next segment is a numeric index', () => {
    const result = setByPath(undefined, '$.items[0].label', 'First')
    expect(result).toEqual({ items: [{ label: 'First' }] })
  })

  it('does not mutate the input object', () => {
    const original = { title: 'Original' }
    const result = setByPath(original, '$.title', 'Changed')
    expect(original.title).toBe('Original')
    expect(result.title).toBe('Changed')
  })

  it('throws for a wildcard segment, which has no single write target', () => {
    expect(() => setByPath({}, '$.data[*].id', 1)).toThrow()
  })

  it('matches the spec test scenario: title/body/userId mapped independently', () => {
    let payload: Record<string, unknown> = {}
    payload = setByPath(payload, '$.title', 'My Post')
    payload = setByPath(payload, '$.body', 'Post body text')
    payload = setByPath(payload, '$.userId', 7)
    expect(payload).toEqual({ title: 'My Post', body: 'Post body text', userId: 7 })
  })
})

describe('resolveSchemaField', () => {
  const baseField: ResponseSchemaField = {
    id: 'f1',
    fieldName: 'email',
    jsonPath: '$.email',
    dataType: 'String',
    required: true,
  }

  it('reports a matching value as neither missing nor mismatched', () => {
    const result = resolveSchemaField({ email: 'a@b.com' }, baseField)
    expect(result).toEqual({ value: 'a@b.com', isMissing: false, typeMismatch: false })
  })

  it('reports a missing path as isMissing', () => {
    const result = resolveSchemaField({}, baseField)
    expect(result.isMissing).toBe(true)
    expect(result.typeMismatch).toBe(false)
  })

  it('reports a type mismatch when the resolved value does not match dataType', () => {
    const result = resolveSchemaField({ email: 12345 }, baseField)
    expect(result.isMissing).toBe(false)
    expect(result.typeMismatch).toBe(true)
  })

  it('validates Number, Boolean, Date, and Object types correctly', () => {
    expect(resolveSchemaField({ v: 42 }, { ...baseField, jsonPath: '$.v', dataType: 'Number' }).typeMismatch).toBe(false)
    expect(resolveSchemaField({ v: true }, { ...baseField, jsonPath: '$.v', dataType: 'Boolean' }).typeMismatch).toBe(false)
    expect(
      resolveSchemaField({ v: '2026-01-01' }, { ...baseField, jsonPath: '$.v', dataType: 'Date' }).typeMismatch,
    ).toBe(false)
    expect(
      resolveSchemaField({ v: { nested: true } }, { ...baseField, jsonPath: '$.v', dataType: 'Object' }).typeMismatch,
    ).toBe(false)
    expect(resolveSchemaField({ v: 'not-a-date' }, { ...baseField, jsonPath: '$.v', dataType: 'Date' }).typeMismatch).toBe(
      true,
    )
  })
})
