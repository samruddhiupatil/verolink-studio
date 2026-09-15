import type { ResponseSchemaField, SchemaFieldType } from '../../domain/endpoint.types'

type PathSegment = { type: 'key'; name: string } | { type: 'index'; index: number } | { type: 'wildcard' }

const SEGMENT_PATTERN = /([^.[\]]+)|\[(\*|\d+)\]/g

/**
 * Parses a minimal JSONPath subset sufficient for the spec's examples
 * ($.data[*].id, $.supplier.name): dot-separated keys, numeric array
 * indices in brackets, and a single [*] wildcard. Full JSONPath grammar
 * (filters, recursive descent, unions) is intentionally out of scope.
 */
export function parseJsonPath(path: string): PathSegment[] {
  const withoutRoot = path.replace(/^\$\.?/, '')
  const segments: PathSegment[] = []
  for (const match of withoutRoot.matchAll(SEGMENT_PATTERN)) {
    const [, key, bracket] = match
    if (key !== undefined) {
      segments.push({ type: 'key', name: key })
    } else if (bracket === '*') {
      segments.push({ type: 'wildcard' })
    } else {
      segments.push({ type: 'index', index: Number(bracket) })
    }
  }
  return segments
}

function resolveGet(current: unknown, segments: PathSegment[]): unknown {
  if (segments.length === 0) return current
  if (current === null || current === undefined) return undefined

  const [segment, ...rest] = segments
  if (segment.type === 'key') {
    if (typeof current !== 'object') return undefined
    return resolveGet((current as Record<string, unknown>)[segment.name], rest)
  }
  if (segment.type === 'index') {
    if (!Array.isArray(current)) return undefined
    return resolveGet(current[segment.index], rest)
  }
  // wildcard
  if (!Array.isArray(current)) return undefined
  return current.map((item) => resolveGet(item, rest))
}

/**
 * Reads a value out of `data` using a $.dot.path[*] style path. A `[*]`
 * segment fans out into an array of resolved values (one per array element);
 * a path with no wildcard resolves to a single value (or undefined if any
 * segment along the way is missing).
 */
export function getByPath(data: unknown, path: string): unknown {
  return resolveGet(data, parseJsonPath(path))
}

/**
 * Writes `value` into a clone of `target` at `path`, creating any missing
 * intermediate objects/arrays along the way. Returns a new object — the
 * input is never mutated, so callers (e.g. live Payload Preview) can safely
 * rebuild a payload by folding setByPath over a list of mappings.
 */
export function setByPath(
  target: Record<string, unknown> | undefined,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const segments = parseJsonPath(path)
  if (segments.some((segment) => segment.type === 'wildcard')) {
    throw new Error(`setByPath does not support wildcard segments: "${path}"`)
  }
  if (segments.length === 0) {
    throw new Error(`setByPath received an empty path: "${path}"`)
  }

  const root: Record<string, unknown> = target ? structuredClone(target) : {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = root

  segments.forEach((segment, i) => {
    const isLast = i === segments.length - 1
    const next = segments[i + 1]
    const key: string | number = segment.type === 'key' ? segment.name : (segment as Extract<PathSegment, { type: 'index' }>).index

    if (isLast) {
      cursor[key] = value
      return
    }

    const existing = cursor[key]
    const nextShouldBeArray = next.type === 'index'
    const existingIsUsable =
      existing !== null &&
      typeof existing === 'object' &&
      Array.isArray(existing) === nextShouldBeArray

    if (!existingIsUsable) {
      cursor[key] = nextShouldBeArray ? [] : {}
    }
    cursor = cursor[key]
  })

  return root
}

export interface SchemaFieldResolution {
  value: unknown
  /** True when the path resolved to null/undefined. */
  isMissing: boolean
  /** True when a resolved, non-missing value doesn't match the declared dataType. */
  typeMismatch: boolean
}

function matchesDeclaredType(value: unknown, dataType: SchemaFieldType): boolean {
  switch (dataType) {
    case 'String':
      return typeof value === 'string'
    case 'Number':
      return typeof value === 'number' && !Number.isNaN(value)
    case 'Boolean':
      return typeof value === 'boolean'
    case 'Date':
      return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    case 'Object':
      return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}

/**
 * Resolves one Section 3 response-schema field against a real response body,
 * reporting whether it was missing or type-mismatched so Section 5's field
 * tree can surface mapping problems instead of silently propagating bad data.
 */
export function resolveSchemaField(data: unknown, field: ResponseSchemaField): SchemaFieldResolution {
  const value = getByPath(data, field.jsonPath)
  const isMissing = value === null || value === undefined
  const typeMismatch = !isMissing && !matchesDeclaredType(value, field.dataType)
  return { value, isMissing, typeMismatch }
}
