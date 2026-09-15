import type { KeyValueRow } from '../../domain/endpoint.types'

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g

/** Extracts every unique {{variable_name}} placeholder found in a single string. */
export function extractVariableNamesFromString(template: string): string[] {
  const names = new Set<string>()
  for (const match of template.matchAll(VARIABLE_PATTERN)) {
    names.add(match[1])
  }
  return [...names]
}

/**
 * Per spec, {{variable}} placeholders can appear in an endpoint's path, its
 * header values, and its query param values — not just the path. Scans all
 * three and returns the deduplicated union, in first-seen order, so the Test
 * Console's dynamic variable-input form never misses one.
 */
export function extractEndpointVariableNames(endpoint: {
  path: string
  headers: KeyValueRow[]
  queryParams: KeyValueRow[]
}): string[] {
  const names = new Set<string>()
  for (const name of extractVariableNamesFromString(endpoint.path)) names.add(name)
  for (const header of endpoint.headers) {
    for (const name of extractVariableNamesFromString(header.value)) names.add(name)
  }
  for (const param of endpoint.queryParams) {
    for (const name of extractVariableNamesFromString(param.value)) names.add(name)
  }
  return [...names]
}

/**
 * Replaces every {{variable}} in `template` with its value from `values`.
 * A placeholder with no matching value is left unresolved in place (rather
 * than silently becoming "undefined") so a missing input is visible.
 */
export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(VARIABLE_PATTERN, (fullMatch, name: string) => {
    return Object.hasOwn(values, name) ? values[name] : fullMatch
  })
}
