import { describe, expect, it } from 'vitest'
import type { OutboundFormField } from '../../domain/outbound.types'
import { validateOutboundSubmission } from './formValidation'

function field(overrides: Partial<OutboundFormField>): OutboundFormField {
  return {
    id: 'f1',
    order: 0,
    label: 'Title',
    fieldType: 'Text',
    required: false,
    ...overrides,
  }
}

describe('validateOutboundSubmission', () => {
  it('matches the spec scenario: Title/Body/Author ID all required and filled passes', () => {
    const fields = [
      field({ id: 'title', label: 'Title', fieldType: 'Text', required: true }),
      field({ id: 'body', label: 'Body', fieldType: 'Text', required: true }),
      field({ id: 'authorId', label: 'Author ID', fieldType: 'Number', required: true }),
    ]
    const errors = validateOutboundSubmission(fields, { title: 'Hi', body: 'Some text', authorId: '7' })
    expect(errors).toEqual([])
  })

  it('reports a required error for each empty required field', () => {
    const fields = [
      field({ id: 'title', label: 'Title', required: true }),
      field({ id: 'body', label: 'Body', required: true }),
    ]
    const errors = validateOutboundSubmission(fields, { title: '', body: '   ' })
    expect(errors).toHaveLength(2)
    expect(errors[0]).toEqual({ fieldId: 'title', message: 'Title is required.' })
  })

  it('does not require an optional empty field', () => {
    const fields = [field({ id: 'notes', label: 'Notes', required: false })]
    const errors = validateOutboundSubmission(fields, {})
    expect(errors).toEqual([])
  })

  it('validates Email field format when a value is present', () => {
    const fields = [field({ id: 'email', label: 'Email', fieldType: 'Email', required: true })]
    expect(validateOutboundSubmission(fields, { email: 'not-an-email' })).toHaveLength(1)
    expect(validateOutboundSubmission(fields, { email: 'a@b.com' })).toEqual([])
  })

  it('skips Toggle fields entirely, even when marked required', () => {
    const fields = [field({ id: 'active', label: 'Active', fieldType: 'Toggle', required: true })]
    expect(validateOutboundSubmission(fields, {})).toEqual([])
  })
})
