import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { CANONICAL_FIELDS } from '../../../domain/canonicalSchema'
import { OUTBOUND_FIELD_TYPES, type OutboundFieldType, type OutboundFormField } from '../../../domain/outbound.types'
import styles from './OutboundFormBuilderPage.module.css'

interface FormFieldEditorProps {
  field: OutboundFormField
  onChange: (field: OutboundFormField) => void
  onRemove: () => void
}

export function FormFieldEditor({ field, onChange, onRemove }: FormFieldEditorProps) {
  return (
    <div className={styles.fieldGrid}>
      <FormField label="Field Label" htmlFor={`field-label-${field.id}`}>
        <Input
          id={`field-label-${field.id}`}
          value={field.label}
          onChange={(event) => onChange({ ...field, label: event.target.value })}
          placeholder="e.g. Vendor Name"
        />
      </FormField>

      <FormField label="Field Type" htmlFor={`field-type-${field.id}`}>
        <Select
          id={`field-type-${field.id}`}
          value={field.fieldType}
          onChange={(event) => onChange({ ...field, fieldType: event.target.value as OutboundFieldType })}
        >
          {OUTBOUND_FIELD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Placeholder / Default Value" htmlFor={`field-placeholder-${field.id}`}>
        <Input
          id={`field-placeholder-${field.id}`}
          value={field.placeholderOrDefault ?? ''}
          onChange={(event) => onChange({ ...field, placeholderOrDefault: event.target.value })}
        />
      </FormField>

      <FormField label="VeroTX Canonical Field" htmlFor={`field-canonical-${field.id}`}>
        <Select
          id={`field-canonical-${field.id}`}
          value={field.canonicalField ?? ''}
          onChange={(event) =>
            onChange({ ...field, canonicalField: (event.target.value || undefined) as OutboundFormField['canonicalField'] })
          }
        >
          <option value="">— none —</option>
          {CANONICAL_FIELDS.map((canonicalField) => (
            <option key={canonicalField} value={canonicalField}>
              {canonicalField}
            </option>
          ))}
        </Select>
      </FormField>

      {field.fieldType === 'Dropdown' && (
        <div className={styles.gridFull}>
          <FormField label="Dropdown Options" htmlFor={`field-options-${field.id}`} hint="Comma-separated values">
            <Input
              id={`field-options-${field.id}`}
              value={(field.dropdownOptions ?? []).join(', ')}
              onChange={(event) =>
                onChange({
                  ...field,
                  dropdownOptions: event.target.value
                    .split(',')
                    .map((option) => option.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Option A, Option B, Option C"
            />
          </FormField>
        </div>
      )}

      <div className={styles.checkboxRow}>
        <label>
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) => onChange({ ...field, required: event.target.checked })}
          />{' '}
          Required
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label="Remove field"
        >
          ✕
        </Button>
      </div>
    </div>
  )
}
