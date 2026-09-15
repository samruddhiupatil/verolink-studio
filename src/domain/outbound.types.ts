import type { CanonicalFieldKey } from './canonicalSchema'
import type { TransformConfig } from './mapping.types'

export const OUTBOUND_FIELD_TYPES = ['Text', 'Number', 'Email', 'Date', 'Dropdown', 'Toggle'] as const
export type OutboundFieldType = (typeof OUTBOUND_FIELD_TYPES)[number]

export interface OutboundFormField {
  id: string
  order: number
  label: string
  fieldType: OutboundFieldType
  placeholderOrDefault?: string
  required: boolean
  /** Only meaningful when fieldType === 'Dropdown'. */
  dropdownOptions?: string[]
  canonicalField?: CanonicalFieldKey
}

export interface OutboundMappingEntry {
  formFieldId: string
  /** e.g. $.supplier.name */
  targetJsonPath: string
  transform: TransformConfig
}

export interface OutboundConfig {
  /** Must resolve to a POST/PUT/PATCH endpoint in the Section 3 library. */
  targetEndpointId?: string
  fields: OutboundFormField[]
  mappings: OutboundMappingEntry[]
}

export function createDefaultOutboundConfig(): OutboundConfig {
  return { fields: [], mappings: [] }
}
