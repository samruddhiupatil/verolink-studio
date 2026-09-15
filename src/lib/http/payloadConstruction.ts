import type { OutboundFieldType, OutboundFormField, OutboundMappingEntry } from '../../domain/outbound.types'
import { setByPath } from '../jsonpath/jsonPath'
import { applyTransform } from '../transforms/transforms'

/**
 * Numeric/Toggle form fields should end up as real JSON numbers/booleans in
 * the outbound payload (e.g. Author ID -> $.userId as 7, not "7"), not as
 * strings, so the constructed request body matches what a real API expects.
 */
function coerceForFieldType(value: string, fieldType?: OutboundFieldType): unknown {
  if (fieldType === 'Number') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }
  if (fieldType === 'Toggle') {
    return value === 'true'
  }
  return value
}

/**
 * Section 6 Part B/C — builds the outbound JSON request body by folding each
 * mapping's (transformed, type-coerced) value into the target JSON path.
 * Used both for Part B's live Payload Preview (with placeholder values) and
 * Part C's real submission (with values the end user typed in).
 */
export function buildOutboundPayload(
  fields: OutboundFormField[],
  mappings: OutboundMappingEntry[],
  values: Record<string, string>,
): Record<string, unknown> {
  const fieldsById = new Map(fields.map((field) => [field.id, field]))
  let payload: Record<string, unknown> = {}

  for (const mapping of mappings) {
    const field = fieldsById.get(mapping.formFieldId)
    const rawValue = values[mapping.formFieldId] ?? ''
    const transformed = applyTransform(rawValue, mapping.transform)
    const coerced = coerceForFieldType(transformed, field?.fieldType)
    payload = setByPath(payload, mapping.targetJsonPath, coerced)
  }

  return payload
}
