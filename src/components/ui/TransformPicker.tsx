import { TRANSFORM_TYPES, type TransformConfig, type TransformType } from '../../domain/mapping.types'
import { Input } from './Input'
import { Select } from './Select'
import styles from './TransformPicker.module.css'

const TRANSFORM_LABELS: Record<TransformType, string> = {
  none: 'None',
  uppercase: 'Uppercase',
  lowercase: 'Lowercase',
  trim: 'Trim',
  dateFormatIsoToDMY: 'Date Format (ISO → DD/MM/YYYY)',
  prefix: 'Prefix',
  suffix: 'Suffix',
}

function needsArg(type: TransformType): boolean {
  return type === 'prefix' || type === 'suffix'
}

interface TransformPickerProps {
  value: TransformConfig
  onChange: (value: TransformConfig) => void
  label?: string
}

/** Shared between Section 5 (field mapping) and Section 6 Part B (outbound mapping) — same six transforms. */
export function TransformPicker({ value, onChange, label = 'Transform' }: TransformPickerProps) {
  return (
    <div className={styles.row}>
      <Select
        aria-label={label}
        value={value.type}
        onChange={(event) => {
          const type = event.target.value as TransformType
          onChange({ type, arg: needsArg(type) ? value.arg : undefined })
        }}
      >
        {TRANSFORM_TYPES.map((type) => (
          <option key={type} value={type}>
            {TRANSFORM_LABELS[type]}
          </option>
        ))}
      </Select>
      {needsArg(value.type) && (
        <Input
          value={value.arg ?? ''}
          onChange={(event) => onChange({ ...value, arg: event.target.value })}
          placeholder={value.type === 'prefix' ? 'Prefix text' : 'Suffix text'}
          aria-label={value.type === 'prefix' ? 'Prefix text' : 'Suffix text'}
        />
      )}
    </div>
  )
}
