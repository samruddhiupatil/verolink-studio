import { describe, expect, it } from 'vitest'
import type { OutboundFormField, OutboundMappingEntry } from '../../domain/outbound.types'
import { buildOutboundPayload } from './payloadConstruction'

describe('buildOutboundPayload', () => {
  it('matches the spec test scenario: Title/Body/Author ID -> $.title/$.body/$.userId', () => {
    const fields: OutboundFormField[] = [
      { id: 'title', order: 0, label: 'Title', fieldType: 'Text', required: true },
      { id: 'body', order: 1, label: 'Body', fieldType: 'Text', required: true },
      { id: 'authorId', order: 2, label: 'Author ID', fieldType: 'Number', required: true },
    ]
    const mappings: OutboundMappingEntry[] = [
      { formFieldId: 'title', targetJsonPath: '$.title', transform: { type: 'none' } },
      { formFieldId: 'body', targetJsonPath: '$.body', transform: { type: 'none' } },
      { formFieldId: 'authorId', targetJsonPath: '$.userId', transform: { type: 'none' } },
    ]
    const values = { title: 'My Post', body: 'Post body text', authorId: '7' }

    const payload = buildOutboundPayload(fields, mappings, values)

    expect(payload).toEqual({ title: 'My Post', body: 'Post body text', userId: 7 })
  })

  it('coerces a Number field to a real JSON number, not a string', () => {
    const fields: OutboundFormField[] = [{ id: 'qty', order: 0, label: 'Quantity', fieldType: 'Number', required: true }]
    const mappings: OutboundMappingEntry[] = [{ formFieldId: 'qty', targetJsonPath: '$.quantity', transform: { type: 'none' } }]

    const payload = buildOutboundPayload(fields, mappings, { qty: '42' })

    expect(payload.quantity).toBe(42)
    expect(typeof payload.quantity).toBe('number')
  })

  it('coerces a Toggle field to a real JSON boolean', () => {
    const fields: OutboundFormField[] = [{ id: 'active', order: 0, label: 'Active', fieldType: 'Toggle', required: false }]
    const mappings: OutboundMappingEntry[] = [{ formFieldId: 'active', targetJsonPath: '$.isActive', transform: { type: 'none' } }]

    expect(buildOutboundPayload(fields, mappings, { active: 'true' }).isActive).toBe(true)
    expect(buildOutboundPayload(fields, mappings, { active: 'false' }).isActive).toBe(false)
  })

  it('applies the configured transform before writing the value', () => {
    const fields: OutboundFormField[] = [{ id: 'name', order: 0, label: 'Name', fieldType: 'Text', required: true }]
    const mappings: OutboundMappingEntry[] = [
      { formFieldId: 'name', targetJsonPath: '$.supplier.name', transform: { type: 'uppercase' } },
    ]

    const payload = buildOutboundPayload(fields, mappings, { name: 'acme corp' })

    expect(payload).toEqual({ supplier: { name: 'ACME CORP' } })
  })

  it('builds a nested target path that does not exist yet', () => {
    const fields: OutboundFormField[] = [{ id: 'city', order: 0, label: 'City', fieldType: 'Text', required: false }]
    const mappings: OutboundMappingEntry[] = [
      { formFieldId: 'city', targetJsonPath: '$.supplier.address.city', transform: { type: 'none' } },
    ]

    const payload = buildOutboundPayload(fields, mappings, { city: 'Austin' })

    expect(payload).toEqual({ supplier: { address: { city: 'Austin' } } })
  })

  it('treats a missing submitted value as an empty string rather than throwing', () => {
    const fields: OutboundFormField[] = [{ id: 'notes', order: 0, label: 'Notes', fieldType: 'Text', required: false }]
    const mappings: OutboundMappingEntry[] = [{ formFieldId: 'notes', targetJsonPath: '$.notes', transform: { type: 'none' } }]

    expect(buildOutboundPayload(fields, mappings, {})).toEqual({ notes: '' })
  })
})
