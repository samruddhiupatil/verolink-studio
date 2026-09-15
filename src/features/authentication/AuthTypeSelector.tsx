import { FormField } from '../../components/ui/FormField'
import { Select } from '../../components/ui/Select'
import type { AuthType } from '../../domain/auth.types'

const AUTH_TYPE_OPTIONS: { value: AuthType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'apiKey', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'customHeaders', label: 'Custom Header' },
]

export function AuthTypeSelector({ value, onChange }: { value: AuthType; onChange: (type: AuthType) => void }) {
  return (
    <FormField label="Auth Type" htmlFor="auth-type">
      <Select id="auth-type" value={value} onChange={(event) => onChange(event.target.value as AuthType)}>
        {AUTH_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>
  )
}
