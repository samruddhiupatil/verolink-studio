import { describe, expect, it } from 'vitest'
import { flattenJson } from './flattenJson'

describe('flattenJson', () => {
  it('flattens nested object keys into dot paths', () => {
    const result = flattenJson({ name: 'Acme', address: { city: 'Austin', zip: '78701' } })
    expect(result).toEqual([
      { path: '$.name', value: 'Acme' },
      { path: '$.address.city', value: 'Austin' },
      { path: '$.address.zip', value: '78701' },
    ])
  })

  it('flattens array elements with numeric index paths', () => {
    const result = flattenJson({ tags: ['a', 'b'] })
    expect(result).toEqual([
      { path: '$.tags[0]', value: 'a' },
      { path: '$.tags[1]', value: 'b' },
    ])
  })

  it('caps flattened array elements at 5', () => {
    const result = flattenJson({ items: [1, 2, 3, 4, 5, 6, 7] })
    expect(result).toHaveLength(5)
    expect(result[4]).toEqual({ path: '$.items[4]', value: 5 })
  })

  it('treats a bare scalar as a single leaf at the root path', () => {
    expect(flattenJson('hello')).toEqual([{ path: '$', value: 'hello' }])
  })

  it('preserves null and boolean leaf values as-is', () => {
    const result = flattenJson({ active: true, note: null })
    expect(result).toEqual([
      { path: '$.active', value: true },
      { path: '$.note', value: null },
    ])
  })
})
