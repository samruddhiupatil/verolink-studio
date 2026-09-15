/**
 * VeroTX's canonical target schema (Section 5 of the spec) — the fixed set of
 * fields every connector ultimately maps inbound data onto.
 */
export const CANONICAL_FIELDS = [
  'vendor_id',
  'vendor_name',
  'vendor_email',
  'vendor_phone',
  'vendor_country',
  'vendor_status',
  'contract_start_date',
  'contract_end_date',
  'payment_terms',
  'category_code',
] as const

export type CanonicalFieldKey = (typeof CANONICAL_FIELDS)[number]
