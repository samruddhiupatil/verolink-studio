import { nanoid } from 'nanoid'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { SCHEMA_FIELD_TYPES, type ResponseSchemaField, type SchemaFieldType } from '../../domain/endpoint.types'
import styles from './ResponseSchemaMapper.module.css'

interface ResponseSchemaMapperProps {
  fields: ResponseSchemaField[]
  onChange: (fields: ResponseSchemaField[]) => void
}

/** Admin-specified expected response fields: field name, JSON path, data type, required flag. */
export function ResponseSchemaMapper({ fields, onChange }: ResponseSchemaMapperProps) {
  function updateField(id: string, patch: Partial<ResponseSchemaField>) {
    onChange(fields.map((field) => (field.id === id ? { ...field, ...patch } : field)))
  }

  function removeField(id: string) {
    onChange(fields.filter((field) => field.id !== id))
  }

  function addField() {
    onChange([...fields, { id: nanoid(), fieldName: '', jsonPath: '', dataType: 'String', required: false }])
  }

  return (
    <div className={styles.wrapper}>
      {fields.length === 0 && <p className={styles.empty}>No response fields defined yet.</p>}
      {fields.map((field) => (
        <div key={field.id} className={styles.row}>
          <Input
            value={field.fieldName}
            onChange={(event) => updateField(field.id, { fieldName: event.target.value })}
            placeholder="Field name"
            aria-label="Field name"
          />
          <Input
            value={field.jsonPath}
            onChange={(event) => updateField(field.id, { jsonPath: event.target.value })}
            placeholder="$.data[*].id"
            aria-label="JSON path"
            mono
          />
          <Select
            value={field.dataType}
            onChange={(event) => updateField(field.id, { dataType: event.target.value as SchemaFieldType })}
            aria-label="Data type"
          >
            {SCHEMA_FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <label className={styles.requiredLabel}>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(event) => updateField(field.id, { required: event.target.checked })}
            />
            Required
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={() => removeField(field.id)} aria-label="Remove field">
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addField}>
        + Add field
      </Button>
    </div>
  )
}
