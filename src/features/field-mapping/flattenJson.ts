export interface FlattenedField {
  path: string
  value: string | number | boolean | null
}

/** Caps how many array elements get flattened so a large list response doesn't explode into thousands of rows. */
const MAX_ARRAY_ITEMS = 5

/**
 * Flattens a parsed JSON response into a flat list of (path, leaf value)
 * pairs for Section 5's source-field picker — e.g. { address: { city: 'X' } }
 * becomes [{ path: '$.address.city', value: 'X' }].
 */
export function flattenJson(data: unknown, prefix = '$'): FlattenedField[] {
  if (data === null || typeof data !== 'object') {
    return [{ path: prefix, value: data as FlattenedField['value'] }]
  }
  if (Array.isArray(data)) {
    return data.slice(0, MAX_ARRAY_ITEMS).flatMap((item, index) => flattenJson(item, `${prefix}[${index}]`))
  }
  return Object.entries(data).flatMap(([key, value]) => flattenJson(value, `${prefix}.${key}`))
}
