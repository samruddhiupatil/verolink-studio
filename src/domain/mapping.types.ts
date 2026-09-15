import type { CanonicalFieldKey } from './canonicalSchema'

export const TRANSFORM_TYPES = [
  'none',
  'uppercase',
  'lowercase',
  'trim',
  'dateFormatIsoToDMY',
  'prefix',
  'suffix',
] as const

export type TransformType = (typeof TRANSFORM_TYPES)[number]

export interface TransformConfig {
  type: TransformType
  /** Prefix/suffix text, only meaningful for those two transform types. */
  arg?: string
}

export function createDefaultTransform(): TransformConfig {
  return { type: 'none' }
}

/** Section 5 — maps one field from a test response onto a VeroTX canonical field. */
export interface FieldMapping {
  id: string
  sourceJsonPath: string
  canonicalField: CanonicalFieldKey
  transform: TransformConfig
}
