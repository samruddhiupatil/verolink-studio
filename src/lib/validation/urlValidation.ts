/** Section 1's Base URL field must be a well-formed http(s) URL. */
export function isWellFormedUrl(value: string): boolean {
  if (!value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
