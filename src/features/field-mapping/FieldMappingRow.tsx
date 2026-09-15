import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { TransformPicker } from '../../components/ui/TransformPicker'
import { CANONICAL_FIELDS } from '../../domain/canonicalSchema'
import type { FieldMapping } from '../../domain/mapping.types'
import { applyTransform } from '../../lib/transforms/transforms'
import type { FlattenedField } from './flattenJson'
import styles from './FieldMappingPage.module.css'

interface FieldMappingRowProps {
  mapping: FieldMapping
  sourceFields: FlattenedField[]
  onChange: (mapping: FieldMapping) => void
  onRemove: () => void
}

export function FieldMappingRow({ mapping, sourceFields, onChange, onRemove }: FieldMappingRowProps) {
  const sourceField = sourceFields.find((f) => f.path === mapping.sourceJsonPath)
  const rawValue = sourceField?.value
  const transformedValue = applyTransform(rawValue, mapping.transform)

  return (
    <div className={styles.mappingRow}>
      <Select
        aria-label="Source field"
        value={mapping.sourceJsonPath}
        onChange={(event) => onChange({ ...mapping, sourceJsonPath: event.target.value })}
      >
        {sourceFields.map((field) => (
          <option key={field.path} value={field.path}>
            {field.path}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Canonical field"
        value={mapping.canonicalField}
        onChange={(event) => onChange({ ...mapping, canonicalField: event.target.value as FieldMapping['canonicalField'] })}
      >
        {CANONICAL_FIELDS.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </Select>

      <TransformPicker value={mapping.transform} onChange={(transform) => onChange({ ...mapping, transform })} />

      <div className={styles.actions}>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label="Remove mapping">
          ✕
        </Button>
      </div>

      <div className={styles.diffPreview}>
        <div className={styles.diffColumn}>
          <span className={styles.diffLabel}>Raw</span>
          <span className={styles.diffValue}>{String(rawValue ?? '')}</span>
        </div>
        <div className={styles.diffColumn}>
          <span className={styles.diffLabel}>Transformed</span>
          <span className={styles.diffValue}>{transformedValue}</span>
        </div>
      </div>
    </div>
  )
}
