import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Switch } from '../../components/ui/Switch'
import type { OutboundFormField } from '../../domain/outbound.types'

interface OutboundFieldRendererProps {
  field: OutboundFormField
  value: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
}

/**
 * Renders one outbound form field as a real input. Shared by Section 6 Part
 * A's Live Form Preview (disabled, showing placeholders) and Part C's actual
 * user-facing form (interactive, with validation), so the preview is
 * guaranteed to look exactly like the real thing.
 */
export function OutboundFieldRenderer({ field, value, onChange, error, disabled }: OutboundFieldRendererProps) {
  const id = `outbound-field-${field.id}`
  const label = field.label || '(untitled field)'

  let control: React.ReactNode
  switch (field.fieldType) {
    case 'Text':
      control = (
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={field.placeholderOrDefault}
          hasError={Boolean(error)}
          disabled={disabled}
        />
      )
      break
    case 'Number':
      control = (
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={field.placeholderOrDefault}
          hasError={Boolean(error)}
          disabled={disabled}
        />
      )
      break
    case 'Email':
      control = (
        <Input
          id={id}
          type="email"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={field.placeholderOrDefault}
          hasError={Boolean(error)}
          disabled={disabled}
        />
      )
      break
    case 'Date':
      control = (
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          hasError={Boolean(error)}
          disabled={disabled}
        />
      )
      break
    case 'Dropdown':
      control = (
        <Select id={id} value={value} onChange={(event) => onChange?.(event.target.value)} disabled={disabled}>
          <option value="">Select…</option>
          {(field.dropdownOptions ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      )
      break
    case 'Toggle':
      control = <Switch id={id} checked={value === 'true'} onChange={(checked) => onChange?.(String(checked))} />
      break
  }

  return (
    <FormField label={label} htmlFor={id} required={field.required} error={error}>
      {control}
    </FormField>
  )
}
