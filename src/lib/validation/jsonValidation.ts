export interface JsonValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates the Section 3 request-body textarea (JSON, shown only for
 * POST/PUT/PATCH). An empty/blank body is treated as valid since the field
 * is optional — an admin may configure an endpoint with no request body yet.
 */
export function validateJsonText(text: string): JsonValidationResult {
  if (!text.trim()) return { valid: true }
  try {
    JSON.parse(text)
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Invalid JSON' }
  }
}
