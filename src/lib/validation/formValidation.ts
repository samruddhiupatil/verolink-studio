import type { OutboundFormField } from '../../domain/outbound.types'

export interface FieldValidationError {
  fieldId: string
  message: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Client-side validation for a Section 6 outbound form submission — inline
 * per-field errors, never a generic alert (explicit spec requirement).
 * Toggle fields always carry a boolean value, so "required" has no meaningful
 * empty state for them and they're skipped.
 */
export function validateOutboundSubmission(
  fields: OutboundFormField[],
  values: Record<string, string>,
): FieldValidationError[] {
  const errors: FieldValidationError[] = []

  for (const field of fields) {
    if (field.fieldType === 'Toggle') continue

    const value = values[field.id]
    const isEmpty = value === undefined || value.trim() === ''

    if (field.required && isEmpty) {
      errors.push({ fieldId: field.id, message: `${field.label} is required.` })
      continue
    }
    if (!isEmpty && field.fieldType === 'Email' && !EMAIL_PATTERN.test(value)) {
      errors.push({ fieldId: field.id, message: `${field.label} must be a valid email address.` })
    }
  }

  return errors
}
