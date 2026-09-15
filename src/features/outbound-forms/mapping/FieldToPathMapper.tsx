import { Input } from '../../../components/ui/Input'
import { TransformPicker } from '../../../components/ui/TransformPicker'
import type { TransformConfig } from '../../../domain/mapping.types'
import type { OutboundFormField, OutboundMappingEntry } from '../../../domain/outbound.types'
import styles from './OutboundMappingPage.module.css'

interface FieldToPathMapperProps {
  fields: OutboundFormField[]
  mappings: OutboundMappingEntry[]
  onChange: (mappings: OutboundMappingEntry[]) => void
}

function findEntry(mappings: OutboundMappingEntry[], fieldId: string): OutboundMappingEntry {
  return mappings.find((m) => m.formFieldId === fieldId) ?? { formFieldId: fieldId, targetJsonPath: '', transform: { type: 'none' } }
}

/** One row per Part A field: its target JSON path in the outbound body, plus a transform. */
export function FieldToPathMapper({ fields, mappings, onChange }: FieldToPathMapperProps) {
  function updateEntry(next: OutboundMappingEntry) {
    const exists = mappings.some((m) => m.formFieldId === next.formFieldId)
    onChange(exists ? mappings.map((m) => (m.formFieldId === next.formFieldId ? next : m)) : [...mappings, next])
  }

  if (fields.length === 0) {
    return <p className={styles.empty}>Add fields in the Form Builder above first.</p>
  }

  return (
    <div className={styles.mapperList}>
      {fields.map((field) => {
        const entry = findEntry(mappings, field.id)
        return (
          <div key={field.id} className={styles.mapperRow}>
            <span className={styles.fieldLabel}>{field.label || '(untitled)'}</span>
            <Input
              value={entry.targetJsonPath}
              onChange={(event) => updateEntry({ ...entry, targetJsonPath: event.target.value })}
              placeholder="$.supplier.name"
              mono
              aria-label={`Target path for ${field.label || '(untitled)'}`}
            />
            <TransformPicker
              value={entry.transform}
              onChange={(transform: TransformConfig) => updateEntry({ ...entry, transform })}
              label={`Transform for ${field.label || '(untitled)'}`}
            />
          </div>
        )
      })}
    </div>
  )
}
