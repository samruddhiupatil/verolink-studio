import type { OutboundFormField, OutboundMappingEntry } from '../../../domain/outbound.types'
import { buildOutboundPayload } from '../../../lib/http/payloadConstruction'
import styles from './OutboundMappingPage.module.css'

interface PayloadPreviewPanelProps {
  fields: OutboundFormField[]
  mappings: OutboundMappingEntry[]
}

/** Live-recomputed JSON request body preview, using each field's placeholder/default as a stand-in value. */
export function PayloadPreviewPanel({ fields, mappings }: PayloadPreviewPanelProps) {
  const placeholderValues = Object.fromEntries(fields.map((field) => [field.id, field.placeholderOrDefault ?? '']))
  const payload = buildOutboundPayload(fields, mappings, placeholderValues)

  return <pre className={styles.payloadPre}>{JSON.stringify(payload, null, 2)}</pre>
}
