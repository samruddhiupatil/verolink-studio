import { describe, expect, it } from 'vitest'
import {
  extractEndpointVariableNames,
  extractVariableNamesFromString,
  interpolate,
} from './interpolateVariables'

describe('extractVariableNamesFromString', () => {
  it('finds a single variable', () => {
    expect(extractVariableNamesFromString('/vendors/{{vendor_id}}')).toEqual(['vendor_id'])
  })

  it('finds multiple distinct variables in one string', () => {
    expect(extractVariableNamesFromString('/vendors/{{vendor_id}}/orders/{{order_id}}')).toEqual([
      'vendor_id',
      'order_id',
    ])
  })

  it('deduplicates a variable that appears more than once', () => {
    expect(extractVariableNamesFromString('{{id}}-{{id}}')).toEqual(['id'])
  })

  it('returns an empty array when there are no placeholders', () => {
    expect(extractVariableNamesFromString('/users')).toEqual([])
  })

  it('tolerates whitespace inside the braces', () => {
    expect(extractVariableNamesFromString('/vendors/{{ vendor_id }}')).toEqual(['vendor_id'])
  })
})

describe('extractEndpointVariableNames', () => {
  it('scans path, header values, and query param values — not just the path', () => {
    const names = extractEndpointVariableNames({
      path: '/vendors/{{vendor_id}}',
      headers: [{ id: 'h1', key: 'X-Tenant', value: '{{tenant_id}}' }],
      queryParams: [{ id: 'q1', key: 'region', value: '{{region_code}}' }],
    })
    expect(names).toEqual(['vendor_id', 'tenant_id', 'region_code'])
  })

  it('deduplicates a variable shared across path and headers', () => {
    const names = extractEndpointVariableNames({
      path: '/vendors/{{id}}',
      headers: [{ id: 'h1', key: 'X-Id', value: '{{id}}' }],
      queryParams: [],
    })
    expect(names).toEqual(['id'])
  })

  it('returns an empty array for a fully static endpoint', () => {
    const names = extractEndpointVariableNames({ path: '/users', headers: [], queryParams: [] })
    expect(names).toEqual([])
  })
})

describe('interpolate', () => {
  it('substitutes every matching variable', () => {
    expect(interpolate('/vendors/{{vendor_id}}', { vendor_id: '42' })).toBe('/vendors/42')
  })

  it('leaves an unresolved placeholder in place when no value is supplied', () => {
    expect(interpolate('/vendors/{{vendor_id}}', {})).toBe('/vendors/{{vendor_id}}')
  })

  it('passes a template with no placeholders through unchanged', () => {
    expect(interpolate('/users', { unused: 'x' })).toBe('/users')
  })

  it('substitutes multiple distinct variables in one template', () => {
    expect(interpolate('/{{a}}/{{b}}', { a: '1', b: '2' })).toBe('/1/2')
  })
})
